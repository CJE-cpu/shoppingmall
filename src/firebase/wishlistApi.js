import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'

export const getUserWishlistItems = async (uid) => {
  const wishlistSnapshot = await getDocs(collection(db, 'wishlists', uid, 'items'))

  return wishlistSnapshot.docs.map((wishlistDocument) => {
    const item = wishlistDocument.data()

    return {
      id: wishlistDocument.id,
      ...item,
      image: item.image ?? '',
      name: item.name ?? item.productName ?? '상품 정보 없음',
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
    }
  })
}

export const hasUserWishlistItem = async ({ uid, productId }) => {
  const itemSnapshot = await getDoc(doc(db, 'wishlists', uid, 'items', String(productId)))
  return itemSnapshot.exists()
}

export const saveUserWishlistItem = async ({ uid, product }) => {
  const price = Math.round(product.price * (1 - (product.discountRate || 0) / 100))

  await setDoc(doc(db, 'wishlists', uid, 'items', String(product.id)), {
    productId: String(product.id),
    image: product.image ?? '',
    name: product.name,
    price,
    quantity: 1,
    createAt: serverTimestamp(),
  })
}

export const deleteUserWishlistItem = async ({ uid, itemId }) => {
  await deleteDoc(doc(db, 'wishlists', uid, 'items', itemId))
}

export const clearUserWishlist = async (uid) => {
  const wishlistSnapshot = await getDocs(collection(db, 'wishlists', uid, 'items'))
  const batch = writeBatch(db)

  wishlistSnapshot.docs.forEach((wishlistDocument) => {
    batch.delete(wishlistDocument.ref)
  })

  await batch.commit()
}

export const getWishlistErrorMessage = (error) => {
  const messages = {
    'permission-denied': '찜 목록을 확인할 권한이 없습니다.',
    'firestore/permission-denied': '찜 목록을 확인할 권한이 없습니다.',
    'unavailable': '찜 목록 서비스를 일시적으로 이용할 수 없습니다.',
    'firestore/unavailable': '찜 목록 서비스를 일시적으로 이용할 수 없습니다.',
  }

  return messages[error?.code]
    ?? '찜 목록을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'
}
