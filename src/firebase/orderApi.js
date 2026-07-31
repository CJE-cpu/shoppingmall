import {
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { db } from './firebase'
import { getProductById } from './productApi'

const getCreatedTime = (value) => {
  if (!value) return 0
  if (typeof value.toMillis === 'function') return value.toMillis()

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

const normalizeOrderItems = (order) => {
  if (Array.isArray(order.items) && order.items.length > 0) {
    return order.items.map((item) => ({
      name: item.name ?? item.productName ?? '상품 정보 없음',
      quantity: Number(item.quantity) || 1,
    }))
  }

  return [{
    name: order.productName ?? order.name ?? '상품 정보 없음',
    quantity: Number(order.quantity) || 1,
  }]
}

export const createOrder = async ({
  userId,
  items,
  subtotal,
  deliveryFee,
  totalPrice,
}) => {
  const resolvedItems = await Promise.all(items.map(async (item) => {
    const quantity = Number(item.quantity)
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error('invalid-order-quantity')
    }

    const product = await getProductById(String(item.productId))
    if (!product) {
      throw new Error('order-product-not-found')
    }

    return {
      ...item,
      productId: product.id,
      name: product.name,
      quantity,
    }
  }))
  const orderRef = doc(collection(db, 'orders'))
  const productRefs = resolvedItems.map((item) => doc(db, 'products', item.productId))

  await runTransaction(db, async (transaction) => {
    const productSnapshots = await Promise.all(
      productRefs.map((productRef) => transaction.get(productRef)),
    )

    productSnapshots.forEach((productSnapshot, index) => {
      if (!productSnapshot.exists()) {
        throw new Error('order-product-not-found')
      }

      const currentStock = Number(productSnapshot.data().stock)
      const orderQuantity = resolvedItems[index].quantity

      if (!Number.isInteger(currentStock) || currentStock < orderQuantity) {
        throw new Error('insufficient-product-stock')
      }
    })

    productSnapshots.forEach((productSnapshot, index) => {
      transaction.update(productSnapshot.ref, {
        stock: productSnapshot.data().stock - resolvedItems[index].quantity,
        updateAt: serverTimestamp(),
      })
    })

    transaction.set(orderRef, {
      userId,
      items: resolvedItems,
      subtotal,
      deliveryFee,
      totalPrice,
      createAt: serverTimestamp(),
    })
  })

  return orderRef.id
}

export const getUserOrders = async (uid) => {
  const orderQuery = query(
    collection(db, 'orders'),
    where('userId', '==', uid),
  )
  const orderSnapshot = await getDocs(orderQuery)

  return orderSnapshot.docs
    .map((orderDocument) => {
      const order = orderDocument.data()

      return {
        id: orderDocument.id,
        ...order,
        items: normalizeOrderItems(order),
        totalPrice: Number(order.totalPrice ?? order.totalAmount ?? order.amount) || 0,
      }
    })
    .sort((a, b) => getCreatedTime(b.createAt) - getCreatedTime(a.createAt))
}

export const getOrderErrorMessage = (error) => {
  const messages = {
    'permission-denied': '주문 내역을 확인할 권한이 없습니다.',
    'firestore/permission-denied': '주문 내역을 확인할 권한이 없습니다.',
    'unavailable': '주문 서비스를 일시적으로 이용할 수 없습니다.',
    'firestore/unavailable': '주문 서비스를 일시적으로 이용할 수 없습니다.',
  }

  const customMessages = {
    'invalid-order-quantity': '주문 수량이 올바르지 않습니다.',
    'order-product-not-found': '주문하려는 상품을 찾을 수 없습니다.',
    'insufficient-product-stock': '재고가 부족한 상품이 있습니다. 상품 수량을 다시 확인해 주세요.',
  }

  return customMessages[error?.message] ?? messages[error?.code]
    ?? '주문을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'
}
