import React from 'react'
import styles from './OrderSummary.module.scss'

const OrderSummary = ({
  subtotal,
  deliveryFee,
  totalPrice,
  remainingForFreeDelivery,
  deliveryMinimum,
  onOrder,
  isOrdering = false,
  orderError = '',
}) => {
  const progress = Math.min((subtotal / deliveryMinimum) * 100, 100)

  return (
    <aside className={styles.orderSummary}>
      <h2>결제 예정 금액</h2>
      <dl>
        <div>
          <dt>상품 금액</dt>
          <dd>{subtotal.toLocaleString()}원</dd>
        </div>
        <div>
          <dt>배송비</dt>
          <dd>{deliveryFee === 0 ? <em>무료</em> : `${deliveryFee.toLocaleString()}원`}</dd>
        </div>
      </dl>

      <div className={styles.total}>
        <span>총 결제금액</span>
        <strong>{totalPrice.toLocaleString()}원</strong>
      </div>

      <div className={styles.deliveryNotice}>
        <div className={styles.progressTrack} aria-hidden='true'>
          <span style={{ width: `${progress}%` }} />
        </div>
        <p>
          {remainingForFreeDelivery === 0
            ? '무료배송 혜택이 적용되었어요'
            : `${remainingForFreeDelivery.toLocaleString()}원 더 담으면 무료배송`}
        </p>
      </div>

      {orderError && <p className={styles.orderError} role='alert'>{orderError}</p>}
      <button type='button' onClick={onOrder} disabled={isOrdering}>
        {isOrdering ? '주문 처리 중...' : `${cartItemLabel(totalPrice)} 주문하기`}
      </button>
      <p className={styles.helper}>배송비는 주문 단계에서 최종 확인됩니다.</p>
    </aside>
  )
}

const cartItemLabel = (totalPrice) => `${totalPrice.toLocaleString()}원`

export default OrderSummary
