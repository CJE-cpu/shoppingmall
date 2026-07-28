import React from 'react'
import styles from './QuantityControl.module.scss'

const QuantityControl = ({ quantity, setQuantity, maxQuantity }) => {
  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1)
  }

  const increaseQuantity = () => {
    if (quantity < maxQuantity) setQuantity(quantity + 1)
  }

  return (
    <div className={styles.quantityControl}>
      <button
        type='button'
        onClick={decreaseQuantity}
        disabled={quantity === 1}
        aria-label='수량 줄이기'
      >
        −
      </button>
      <span aria-label={`수량 ${quantity}개`}>{quantity}</span>
      <button
        type='button'
        onClick={increaseQuantity}
        disabled={quantity === maxQuantity}
        aria-label='수량 늘리기'
      >
        +
      </button>
    </div>
  )
}

export default QuantityControl
