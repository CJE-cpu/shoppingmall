import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from './firebase'
import { getProducts } from './productApi'

const LOW_STOCK_THRESHOLD = 5

export const getAdminDashboardStats = async () => {
  const [
    membersSnapshot,
    productsSnapshot,
    lowStockSnapshot,
    noticesSnapshot,
  ] = await Promise.all([
    getCountFromServer(collection(db, 'users')),
    getCountFromServer(collection(db, 'products')),
    getCountFromServer(query(
      collection(db, 'products'),
      where('stock', '<=', LOW_STOCK_THRESHOLD),
    )),
    getCountFromServer(collection(db, 'notices')),
  ])

  return {
    members: membersSnapshot.data().count,
    products: productsSnapshot.data().count,
    lowStockProducts: lowStockSnapshot.data().count,
    notices: noticesSnapshot.data().count,
  }
}

export const getAdminDashboardErrorMessage = (error) => {
  const messages = {
    'permission-denied': '대시보드 정보를 조회할 관리자 권한이 없습니다.',
    'firestore/permission-denied': '대시보드 정보를 조회할 관리자 권한이 없습니다.',
    unavailable: '대시보드 서비스를 일시적으로 사용할 수 없습니다.',
    'firestore/unavailable': '대시보드 서비스를 일시적으로 사용할 수 없습니다.',
  }

  return messages[error?.code]
    ?? '대시보드 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
}

export const getAdminMembers = async () => {
  const membersQuery = query(
    collection(db, 'users'),
    orderBy('createAt', 'desc'),
  )
  const membersSnapshot = await getDocs(membersQuery)

  return membersSnapshot.docs.map((memberDocument) => ({
    id: memberDocument.id,
    ...memberDocument.data(),
  }))
}

const normalizeProductInput = (product) => {
  const image = product.image.trim()
  const detailImages = Array.isArray(product.images) ? product.images.slice(1) : []

  return {
    name: product.name.trim(),
    brand: product.brand?.trim() || 'Drive Market',
    category: product.category.trim(),
    categoryValue: product.categoryValue.trim(),
    price: Number(product.price),
    discountRate: Number(product.discountRate),
    stock: Number(product.stock),
    image,
    images: [image, ...detailImages],
    description: product.description.trim(),
    isRecommended: product.isRecommended === true,
  }
}

export const getAdminProducts = getProducts

const MAX_RECOMMENDED_PRODUCTS = 4

const validateRecommendationLimit = async () => {
  const recommendedSnapshot = await getDocs(query(
    collection(db, 'products'),
    where('isRecommended', '==', true),
  ))

  if (recommendedSnapshot.size >= MAX_RECOMMENDED_PRODUCTS) {
    throw new Error('recommended-product-limit')
  }
}

export const createAdminProduct = async (product) => {
  if (product.isRecommended === true) {
    await validateRecommendationLimit()
  }

  const productDocument = await addDoc(collection(db, 'products'), {
    ...normalizeProductInput(product),
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  })

  return productDocument.id
}

export const updateAdminProduct = async ({ productId, product }) => {
  if (product.isRecommended === true) {
    const productSnapshot = await getDoc(doc(db, 'products', productId))
    const wasRecommended = productSnapshot.exists()
      && productSnapshot.data().isRecommended === true

    if (!wasRecommended) {
      await validateRecommendationLimit()
    }
  }

  await updateDoc(doc(db, 'products', productId), {
    ...normalizeProductInput(product),
    updateAt: serverTimestamp(),
  })
}

export const updateAdminProductRecommendation = async ({
  productId,
  isRecommended,
}) => {
  if (isRecommended) {
    await validateRecommendationLimit()
  }

  await updateDoc(doc(db, 'products', productId), {
    isRecommended,
    updateAt: serverTimestamp(),
  })
}

export const updateAdminProductStock = async ({ productId, stock }) => {
  if (!Number.isInteger(stock) || stock < 0) {
    throw new Error('invalid-product-stock')
  }

  await updateDoc(doc(db, 'products', productId), {
    stock,
    updateAt: serverTimestamp(),
  })
}

export const deleteAdminProduct = async (productId) => {
  await deleteDoc(doc(db, 'products', productId))
}

export const getAdminProductErrorMessage = (error) => {
  const messages = {
    'permission-denied': '상품을 관리할 관리자 권한이 없습니다.',
    'firestore/permission-denied': '상품을 관리할 관리자 권한이 없습니다.',
    unavailable: '상품 관리 서비스를 일시적으로 사용할 수 없습니다.',
    'firestore/unavailable': '상품 관리 서비스를 일시적으로 사용할 수 없습니다.',
  }

  if (error?.message === 'invalid-product-stock') {
    return '재고는 0 이상의 정수만 입력할 수 있습니다.'
  }

  if (error?.message === 'recommended-product-limit') {
    return '추천상품은 최대 4개까지만 설정할 수 있습니다.'
  }

  return messages[error?.code]
    ?? '상품 정보를 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'
}

export const getAdminErrorMessage = (error) => {
  const messages = {
    'permission-denied': '전체 회원을 조회할 관리자 권한이 없습니다.',
    'firestore/permission-denied': '전체 회원을 조회할 관리자 권한이 없습니다.',
    unavailable: '회원 관리 서비스를 일시적으로 사용할 수 없습니다.',
    'firestore/unavailable': '회원 관리 서비스를 일시적으로 사용할 수 없습니다.',
  }

  return messages[error?.code]
    ?? '회원 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
}
