import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { loadlocal, savelocal } from '../utils/localStorage'
import Modal from './Modal'
import styles from './ProductCard.module.scss'

const ProductCard = ({ product, onWishItem }) => {
  const [isLiked, setIsLiked] = useState(() => (
    loadlocal('wishlist', []).some((item) => String(item.id) === String(product.id))
  ))
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const discountPrice = Math.round(product.price * (1 - product.discountRate / 100))

  const changeWishlist = () => {
    const wishlist = loadlocal('wishlist', [])
    const nextLiked = !isLiked
    const wishlistWithoutProduct = wishlist.filter(
      (item) => String(item.id) !== String(product.id),
    )
    const updatedWishlist = nextLiked
      ? [...wishlistWithoutProduct, product]
      : wishlistWithoutProduct

    savelocal('wishlist', updatedWishlist)
    setIsLiked(nextLiked)
    onWishItem?.(product.id, nextLiked)
  }

  const addToCart = () => {
    const cart = loadlocal('cart', [])
    const existingItem = cart.find((item) => String(item.id) === String(product.id))
    const updatedCart = existingItem
      ? cart.map((item) => (
          String(item.id) === String(product.id)
            ? { ...item, quantity: (item.quantity || 0) + 1 }
            : item
        ))
      : [...cart, { ...product, price: discountPrice, quantity: 1 }]

    savelocal('cart', updatedCart)
    window.dispatchEvent(new Event('cart-updated'))
    setIsConfirmOpen(true)
  }

  return (
    <article className={styles.card}>
      <div className={styles.visual} data-color={product.color}>
        {product.badge && <span className={styles.badge}>{product.badge}</span>}
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
        {(product.rating || product.reviews) && (
          <div className={styles.meta}>
            {product.rating && <span>★ {product.rating}</span>}
            {product.reviews && <span>리뷰 {product.reviews}</span>}
          </div>
        )}
        <div className={styles.priceRow}>
          {product.discountRate > 0 && <span>{product.discountRate}%</span>}
          <strong className={styles.price}>{discountPrice.toLocaleString('ko-KR')}원</strong>
          {product.discountRate > 0 && <del>{product.price.toLocaleString('ko-KR')}원</del>}
        </div>
        <button
          className={styles.cartButton}
          type='button'
          onClick={addToCart}
        >
          장바구니 담기
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
