import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  runTransaction,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'

export const getUserCartItems = async (uid) => {
  const cartSnapshot = await getDocs(collection(db, 'carts', uid, 'items'))

  return cartSnapshot.docs.map((cartDocument) => {
    const item = cartDocument.data()

    return {
      id: cartDocument.id,
      ...item,
      name: item.name ?? item.productName ?? '상품 정보 없음',
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
    }
  })
}

export const saveUserCartItem = async ({ uid, product, quantity = 1 }) => {
  const itemRef = doc(db, 'carts', uid, 'items', String(product.id))
  const price = Math.round(product.price * (1 - (product.discountRate || 0) / 100))

  await runTransaction(db, async (transaction) => {
    const itemSnapshot = await transaction.get(itemRef)
    const currentQuantity = itemSnapshot.exists()
      ? Number(itemSnapshot.data().quantity) || 0
      : 0

    if (itemSnapshot.exists()) {
      transaction.update(itemRef, { quantity: currentQuantity + quantity })
      return
    }

    transaction.set(itemRef, {
      productId: String(product.id),
      image: product.image ?? '',
      name: product.name,
      price,
      quantity,
    })
  })
}

export const deleteUserCartItem = async ({ uid, itemId }) => {
  await deleteDoc(doc(db, 'carts', uid, 'items', itemId))
}

export const updateUserCartItemQuantity = async ({ uid, itemId, quantity }) => {
  await updateDoc(doc(db, 'carts', uid, 'items', itemId), { quantity })
}

export const clearUserCart = async (uid) => {
  const cartSnapshot = await getDocs(collection(db, 'carts', uid, 'items'))
  const batch = writeBatch(db)

  cartSnapshot.docs.forEach((cartDocument) => {
    batch.delete(cartDocument.ref)
  })

  await batch.commit()
}

export const getCartErrorMessage = (error) => {
  const messages = {
    'permission-denied': '장바구니를 확인할 권한이 없습니다.',
    'firestore/permission-denied': '장바구니를 확인할 권한이 없습니다.',
    'unavailable': '장바구니 서비스를 일시적으로 이용할 수 없습니다.',
    'firestore/unavailable': '장바구니 서비스를 일시적으로 이용할 수 없습니다.',
  }

  return messages[error?.code]
    ?? '장바구니 정보를 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'
}
