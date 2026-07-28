import React, { useEffect, useState } from 'react'
import { savelocal, loadlocal } from '../utils/localStorage'
import CartItem from '../components/CartItem'
import OrderSummary from '../components/OrderSummary'
import EmptyMessage from '../components/EmptyMessage'
import styles from './Cart.module.scss'

const DELIVERY_MINIMUM = 50000
const DELIVERY_FEE = 3000

const Cart = () => {
  const [cartItem, setCartItem] = useState(() => loadlocal('cart', []))

  useEffect(() => {
    savelocal('cart', cartItem)
  }, [cartItem])

  const clearCart = () => {
    if (window.confirm('장바구니 상품을 모두 삭제하시겠습니까?')) {
      setCartItem([])
    }
  }

  const changeQuantity = (productId, newQuantity) => {
    setCartItem((items) => items.map((item) => (
      item.id === productId ? { ...item, quantity: newQuantity } : item
    )))
  }

  const removeItem = (productId) => {
    setCartItem((items) => items.filter((item) => item.id !== productId))
  }

  const subtotal = cartItem.reduce((total, item) => {
    const salePrice = item.price * (1 - (item.discountRate || 0) / 100)
    return total + Math.round(salePrice) * item.quantity
  }, 0)
  const deliveryFee = subtotal >= DELIVERY_MINIMUM ? 0 : DELIVERY_FEE
  const totalPrice = subtotal + deliveryFee
  const remainingForFreeDelivery = Math.max(DELIVERY_MINIMUM - subtotal, 0)

  const orderCart = () => {
    window.alert('주문 페이지는 다음 단계에서 연결됩니다.')
  }

  return (
    <main className={styles.cart}>
      <header className={styles.heading}>
        <div>
          <p>SHOPPING BAG</p>
          <h1>장바구니</h1>
        </div>
        <span>담은 상품 <strong>{cartItem.length}</strong>개</span>
      </header>

      {cartItem.length === 0 ? (
        <EmptyMessage
          image='/img/empty/empty-cart.png'
          title='장바구니가 비어 있어요'
          description='마음에 드는 상품을 장바구니에 담아보세요.'
          link='/products'
          linkText='상품 보러 가기'
        />
      ) : (
        <div className={styles.cartLayout}>
          <section className={styles.itemSection} aria-labelledby='cart-items-title'>
            <div className={styles.itemHeader}>
              <strong id='cart-items-title'>장바구니 상품</strong>
              <button type='button' onClick={clearCart}>전체 삭제</button>
            </div>
            <div className={styles.itemList}>
              {cartItem.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onChangeQuantity={changeQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>
          </section>
          <OrderSummary
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            totalPrice={totalPrice}
            remainingForFreeDelivery={remainingForFreeDelivery}
            deliveryMinimum={DELIVERY_MINIMUM}
            onOrder={orderCart}
          />
        </div>
      )}
    </main>
  )
}

export default Cart
