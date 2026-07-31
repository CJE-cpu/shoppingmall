import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCartErrorMessage, saveUserCartItem } from '../firebase/cartApi'
import {
  deleteUserWishlistItem,
  getWishlistErrorMessage,
  hasUserWishlistItem,
  saveUserWishlistItem,
} from '../firebase/wishlistApi'
import useAuthStore from '../store/authStore'
import Modal from './Modal'
import styles from './ProductCard.module.scss'

const ProductCard = ({ product, onWishItem }) => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [isLiked, setIsLiked] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const discountPrice = Math.round(product.price * (1 - (product.discountRate || 0) / 100))
  const isSoldOut = product.stock === 0

  useEffect(() => {
    let isMounted = true

    if (!user) {
      setIsLiked(false)
      return undefined
    }

    hasUserWishlistItem({ uid: user.uid, productId: product.id })
      .then((isSaved) => {
        if (isMounted) setIsLiked(isSaved)
      })
      .catch(() => {
        if (isMounted) setIsLiked(false)
      })

    return () => {
      isMounted = false
    }
  }, [product.id, user])

  const changeWishlist = async () => {
    if (!user) {
      navigate('/login', { state: { from: '/wishlist' } })
      return
    }

    const nextLiked = !isLiked

    try {
      if (nextLiked) {
        await saveUserWishlistItem({ uid: user.uid, product })
      } else {
        await deleteUserWishlistItem({ uid: user.uid, itemId: String(product.id) })
      }

      setIsLiked(nextLiked)
      onWishItem?.(product.id, nextLiked)
    } catch (error) {
      window.alert(getWishlistErrorMessage(error))
    }
  }

  const addToCart = async () => {
    if (isSoldOut) {
      window.alert('품절된 상품은 장바구니에 담을 수 없습니다.')
      return
    }

    if (!user) {
      navigate('/login', { state: { from: `/products/${product.id}` } })
      return
    }

    try {
      await saveUserCartItem({ uid: user.uid, product })
      setIsConfirmOpen(true)
    } catch (error) {
      window.alert(getCartErrorMessage(error))
    }
  }

  return (
    <article className={styles.card}>
      <div className={styles.visual} data-color={product.color}>
        {product.badge && <span className={styles.badge}>{product.badge}</span>}
        {isSoldOut && <span className={styles.soldOutBadge}>품절</span>}
        {product.image
          ? <img className={styles.productImage} src={product.image} alt={product.name} />
          : <span className={styles.productIcon} aria-hidden='true'>{product.icon}</span>}
        <Link
          className={styles.visualLink}
          to={`/products/${product.id}`}
          aria-label={`${product.name} 상세보기`}
        />
        <button
          className={styles.wish}
          type='button'
          aria-label={`${product.name} ${isLiked ? '찜 해제' : '찜하기'}`}
          aria-pressed={isLiked}
          onClick={changeWishlist}
        >
          <img
            src={isLiked ? '/img/icon/wishlist-active.png' : '/img/icon/wishlist.png'}
            alt=''
            aria-hidden='true'
          />
        </button>
      </div>
      <div className={styles.info}>
        <p className={styles.brand}>{product.brand}</p>
        <Link className={styles.name} to={`/products/${product.id}`}>{product.name}</Link>
        <div className={styles.meta}>
          {product.rating && <span>★ {product.rating}</span>}
          {product.reviews && <span>리뷰 {product.reviews}</span>}
        </div>
        <div className={styles.priceRow}>
          {product.discountRate > 0 && <span>{product.discountRate}%</span>}
          <strong className={styles.price}>{discountPrice.toLocaleString('ko-KR')}원</strong>
          {product.discountRate > 0 && <del>{product.price.toLocaleString('ko-KR')}원</del>}
        </div>
        <button
          className={styles.cartButton}
          type='button'
          onClick={addToCart}
          disabled={isSoldOut}
        >
          {isSoldOut ? '품절' : '장바구니 담기'}
        </button>
      </div>
      <Modal
        isOpen={isConfirmOpen}
        title='장바구니에 담았습니다'
        onClose={() => setIsConfirmOpen(false)}
      >
        <div className={styles.cartConfirmation}>
          <div className={styles.confirmProduct}>
            <img src={product.image} alt='' />
            <div>
              <strong>{product.name}</strong>
              <span>{discountPrice.toLocaleString('ko-KR')}원 · 1개</span>
            </div>
          </div>
          <div className={styles.confirmActions}>
            <button type='button' onClick={() => setIsConfirmOpen(false)}>계속 쇼핑</button>
            <Link to='/cart'>장바구니로 이동</Link>
          </div>
        </div>
      </Modal>
    </article>
  )
}

export default ProductCard
