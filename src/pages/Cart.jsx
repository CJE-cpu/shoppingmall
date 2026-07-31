import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CartItem from '../components/CartItem'
import OrderSummary from '../components/OrderSummary'
import EmptyMessage from '../components/EmptyMessage'
import {
  clearUserCart,
  deleteUserCartItem,
  getCartErrorMessage,
  getUserCartItems,
  updateUserCartItemQuantity,
} from '../firebase/cartApi'
import { createOrder, getOrderErrorMessage } from '../firebase/orderApi'
import useAuthStore from '../store/authStore'
import styles from './Cart.module.scss'

const DELIVERY_MINIMUM = 50000
const DELIVERY_FEE = 3000

const Cart = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading)
  const [cartItem, setCartItem] = useState([])
  const [isCartLoading, setIsCartLoading] = useState(true)
  const [cartError, setCartError] = useState('')
  const [isOrdering, setIsOrdering] = useState(false)
  const [orderError, setOrderError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadCart = async () => {
      setIsCartLoading(true)
      setCartError('')

      try {
        const items = await getUserCartItems(user.uid)
        if (isMounted) setCartItem(items)
      } catch (error) {
        if (isMounted) setCartError(getCartErrorMessage(error))
      } finally {
        if (isMounted) setIsCartLoading(false)
      }
    }

    loadCart()

    return () => {
      isMounted = false
    }
  }, [user.uid])

  const clearCart = async () => {
    if (!window.confirm('장바구니 상품을 모두 삭제하시겠습니까?')) return

    setCartError('')

    try {
      await clearUserCart(user.uid)
      setCartItem([])
    } catch (error) {
      setCartError(getCartErrorMessage(error))
    }
  }

  const changeQuantity = async (productId, newQuantity) => {
    setCartError('')

    try {
      await updateUserCartItemQuantity({
        uid: user.uid,
        itemId: productId,
        quantity: newQuantity,
      })
      setCartItem((items) => items.map((item) => (
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )))
    } catch (error) {
      setCartError(getCartErrorMessage(error))
    }
  }

  const removeItem = async (productId) => {
    if (!window.confirm('이 상품을 장바구니에서 삭제하시겠습니까?')) return

    setCartError('')

    try {
      await deleteUserCartItem({ uid: user.uid, itemId: productId })
      setCartItem((items) => items.filter((item) => item.id !== productId))
    } catch (error) {
      setCartError(getCartErrorMessage(error))
    }
  }

  const subtotal = cartItem.reduce((total, item) => {
    const salePrice = item.price * (1 - (item.discountRate || 0) / 100)
    return total + Math.round(salePrice) * item.quantity
  }, 0)
  const deliveryFee = subtotal >= DELIVERY_MINIMUM ? 0 : DELIVERY_FEE
  const totalPrice = subtotal + deliveryFee
  const remainingForFreeDelivery = Math.max(DELIVERY_MINIMUM - subtotal, 0)

  const orderCart = async () => {
    setOrderError('')

    if (isAuthLoading) {
      setOrderError('로그인 상태를 확인하고 있습니다. 잠시 후 다시 시도해 주세요.')
      return
    }

    if (!user) {
      navigate('/login', { state: { from: '/cart' } })
      return
    }

    setIsOrdering(true)

    try {
      const orderItems = cartItem.map((item) => {
        const price = Math.round(item.price * (1 - (item.discountRate || 0) / 100))

        return {
          productId: String(item.id),
          name: item.name,
          quantity: item.quantity,
          price,
        }
      })

      await createOrder({
        userId: user.uid,
        items: orderItems,
        subtotal,
        deliveryFee,
        totalPrice,
      })
      await clearUserCart(user.uid)
      window.alert('주문이 완료되었습니다')
      setCartItem([])
      navigate('/mypage#orders')
    } catch (error) {
      setOrderError(getOrderErrorMessage(error))
    } finally {
      setIsOrdering(false)
    }
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

      {isCartLoading ? (
        <p role='status'>장바구니를 불러오는 중입니다...</p>
      ) : cartError ? (
        <p role='alert'>{cartError}</p>
      ) : cartItem.length === 0 ? (
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
            isOrdering={isOrdering}
            orderError={orderError}
          />
        </div>
      )}
    </main>
  )
}

export default Cart
