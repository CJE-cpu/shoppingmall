import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Modal from '../components/Modal'
import QuantityControl from '../components/QuantityControl'
import { DELIVERY_MINIMUM } from '../hooks/delivery'
import { savelocal, loadlocal } from '../utils/localStorage'
import styles from './ProductDetail.module.scss'

const ProductDetail = () => {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [isliked, setIsLiked] = useState(false)
  const [selectedImage, setSelectedImage] = useState('')
  const [isCartModalOpen, setIsCartModalOpen] = useState(false)

  useEffect(()=>{
    const loadPro = async () => {
      try {
        setIsLoading(true)
        const res = await fetch('/data/products.json')
        if (!res.ok) throw new Error('상품 정보를 불러오지 못했습니다.')

        const proData = await res.json()
        const selectProduct = proData.find((item) => id === String(item.id))

        setProduct(selectProduct || null)
        setSelectedImage(selectProduct?.image || '')
        setIsLiked(
          loadlocal('wishlist', []).some((item) => String(item.id) === String(selectProduct?.id)),
        )
        setQuantity(1)
      } catch {
        setProduct(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadPro()
  }, [id])

  if(isLoading){
    return <p className={styles.stateMessage}>상품을 불러오는 중입니다...</p>
  }
  if(!product){
    return  (
      <div className={styles.stateMessage}>
        <p>상품을 확인할 수 없습니다</p>
        <Link to='/products'>상품 목록으로 이동</Link>
      </div>
    )
  }
  const discountPrice = Math.round(product.price * (1 - product.discountRate / 100))
  const totalPrice = discountPrice * quantity
  const galleryImages = product.images?.length ? product.images : [product.image]

  const addTocart = () => {
    const saveCart = window.localStorage.getItem('cart')
    // 로컬에 저장된 긴 문자열을 배열로 전환
    const cart = saveCart ? JSON.parse(saveCart) : []
    // 장바구니 아이템과 상세페이지 아이템이 동일한 아이템인가
    const findItem = cart.find((item)=>String(item.id) === String(product.id))

    // 새롭게 추가되는 아이템 만들기
    const newItem = {...product, price:discountPrice, quantity}

    // 수량만 더할건지, 새 상품 목록이 추가될건지
    const updateCart = findItem ?
    cart.map((item)=>(
      String(item.id) === String(product.id) ?
      {...item, quantity : item.quantity + quantity} // 수량증가
      : item // 그렇지 않으면 원래 상품목록
    ))
    : [...cart, newItem]
    // 로컬스토리지 cart라는 저장소(키)에 updateCart에 내용을 문자열(json)로 저장
    window.localStorage.setItem('cart', JSON.stringify(updateCart))
    window.dispatchEvent(new Event('cart-updated'))
    setIsCartModalOpen(true)
  }

  const changeWishlist = () => {
    const wishlist = loadlocal('wishlist', [])
    const nextLiked = !isliked
    const updatedWishlist = nextLiked
      ? [...wishlist.filter((item) => String(item.id) !== String(product.id)), product]
      : wishlist.filter((item) => String(item.id) !== String(product.id))

    savelocal('wishlist', updatedWishlist)
    setIsLiked(nextLiked)
  }
  return (
    <section className={styles.productDetail}>
      <Link className={styles.backLink} to='/products'>
        <img src='/img/banner/banner-arrow.png' alt='' aria-hidden='true' />
        상품목록
      </Link>
      <div className={styles.productArea}>
        <div className={styles.galleryArea}>
          <div className={styles.imageArea}>
            <img src={selectedImage || product.image} alt={product.name}/>
          </div>
          {galleryImages.length > 1 && (
            <div className={styles.thumbnails} aria-label='상품 이미지 갤러리'>
              {galleryImages.map((image, index) => (
                <button
                  key={image}
                  type='button'
                  className={styles.thumbnailItem}
                  data-active={selectedImage === image}
                  onClick={() => setSelectedImage(image)}
                  aria-label={`${index + 1}번째 상품 이미지 크게 보기`}
                  aria-pressed={selectedImage === image}
                >
                  <img src={image} alt={`${product.name} ${index + 1}번째 이미지`} />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className={styles.infoArea}>
          <div className={styles.productMeta}>
            <span>{product.category}</span>
            <span>{product.brand}</span>
            <span>상품번호 {String(product.id).padStart(4, '0')}</span>
          </div>
          <h2>{product.name}</h2>
          <p>{product.description}</p>
        </div>
        <div className={styles.priceArea}>
          <div className={styles.priceMeta}>
            <span>{product.discountRate > 0 ? `${product.discountRate}% 할인` : '정상가'}</span>
            <del data-visible={product.discountRate > 0}>
              {product.discountRate > 0 ? `${product.price.toLocaleString()}원` : '\u00a0'}
            </del>
          </div>
          <strong>{discountPrice.toLocaleString()}원</strong>
        </div>
        <div className={styles.deliveryArea}>
          <span>배송비</span>
          <strong>{DELIVERY_MINIMUM.toLocaleString()}원 이상 무료배송</strong>
        </div>
        <div className={styles.quantityArea}>
          <span>수량</span>
          <QuantityControl quantity={quantity} setQuantity={setQuantity} maxQuantity={product.stock} />
          <small>재고 {product.stock}개</small>
        </div>
        <div className={styles.totalArea}>
          <span>총 상품금액</span>
          <strong>{totalPrice.toLocaleString()}원</strong>
        </div>
        <div className={styles.actionArea}>
          <button type='button' onClick={addTocart}>장바구니</button>
          <button type='button'>바로 구매</button>
          <button
            className={styles.wishlistButton}
            type='button'
            onClick={changeWishlist}
            aria-label={isliked ? '찜 해제' : '찜하기'}
            aria-pressed={isliked}
          >
            <img
              src={isliked ? '/img/icon/wishlist-active.png' : '/img/icon/wishlist.png'}
              alt=''
              aria-hidden='true'
            />
          </button>
        </div>
      </div>
      <Modal
        isOpen={isCartModalOpen}
        title='장바구니에 담았습니다'
        onClose={() => setIsCartModalOpen(false)}
      >
        <div className={styles.cartConfirmation}>
          <div className={styles.confirmProduct}>
            <img src={selectedImage || product.image} alt='' />
            <div>
              <strong>{product.name}</strong>
              <span>
                {discountPrice.toLocaleString()}원 · {quantity}개
              </span>
              <b>합계 {(discountPrice * quantity).toLocaleString()}원</b>
            </div>
          </div>
          <div className={styles.confirmActions}>
            <button type='button' onClick={() => setIsCartModalOpen(false)}>계속 쇼핑</button>
            <Link to='/cart'>장바구니로 이동</Link>
          </div>
        </div>
      </Modal>
    </section>
  )
}

export default ProductDetail
