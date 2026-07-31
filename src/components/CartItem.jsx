import React from 'react'
import { Link } from 'react-router-dom'
import QuantityControl from './QuantityControl'
import styles from './CartItem.module.scss'

const CartItem = ({ item, onChangeQuantity, onRemove }) => {
  const discountRate = item.discountRate || 0
  const discountPrice = Math.round(item.price * (1 - discountRate / 100))
  const totalPrice = discountPrice * item.quantity

  return (
    <article className={styles.cartItem}>
      <Link className={styles.imageArea} to={`/products/${item.id}`}>
        <img src={item.image} alt={item.name} />
      </Link>

      <div className={styles.info}>
        <small>{item.category}</small>
        <Link to={`/products/${item.id}`}>{item.name}</Link>
        <div className={styles.unitPrice}>
          <strong>{discountPrice.toLocaleString()}원</strong>
          {discountRate > 0 && <del>{item.price.toLocaleString()}원</del>}
        </div>
      </div>

      <div className={styles.quantity}>
        <span>수량</span>
        <QuantityControl
          quantity={item.quantity}
          setQuantity={(newQuantity) => onChangeQuantity(item.id, newQuantity)}
          maxQuantity={item.stock ?? 99}
        />
      </div>

      <div className={styles.itemTotal}>
        <span>상품 금액</span>
        <strong>{totalPrice.toLocaleString()}원</strong>
      </div>

      <button
        className={styles.removeButton}
        type='button'
        onClick={() => onRemove(item.id)}
        aria-label={`${item.name} 삭제`}
      >
        <svg viewBox='0 0 24 24' aria-hidden='true'>
          <path d='M6 6l12 12M18 6 6 18' />
        </svg>
      </button>
    </article>
  )
}

export default CartItem
