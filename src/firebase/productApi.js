import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from 'firebase/firestore'
import { db } from './firebase'

let productCatalogPromise
const MARKET_PRICE_UPDATED_AT = new Date('2026-07-30T23:59:59+09:00').getTime()

const getProductCatalog = async () => {
  if (!productCatalogPromise) {
    productCatalogPromise = fetch('/data/products.json')
      .then((response) => {
        if (!response.ok) throw new Error('product-catalog-load-failed')
        return response.json()
      })
      .catch(() => [])
  }

  return productCatalogPromise
}

const applyCatalogPrice = (product, catalogProduct) => {
  if (!catalogProduct || product.legacyId == null) return product

  const wasUpdatedAfterMarketPricing = getCreatedTime(product.updateAt)
    > MARKET_PRICE_UPDATED_AT

  if (wasUpdatedAfterMarketPricing) return product

  return {
    ...product,
    price: Number(catalogProduct.price) || product.price,
  }
}

const enrichProductDetail = async (product) => {
  if (!product) return null

  const needsDescription = !product.description.trim()

  const catalog = await getProductCatalog()
  const legacyId = product.legacyId ?? product.id
  const catalogProduct = catalog.find((item) => String(item.id) === String(legacyId))

  if (!catalogProduct) return product

  const catalogImages = Array.isArray(catalogProduct.images)
    ? catalogProduct.images.filter(Boolean)
    : []
  const images = [...new Set([
    product.image,
    ...product.images,
    ...catalogImages,
  ].filter(Boolean))]

  return applyCatalogPrice({
    ...product,
    images,
    description: needsDescription
      ? catalogProduct.description ?? ''
      : product.description,
  }, catalogProduct)
}

const getCreatedTime = (value) => {
  if (!value) return 0
  if (typeof value.toMillis === 'function') return value.toMillis()

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

export const normalizeProduct = (productDocument) => {
  const data = productDocument.data()

  return {
    id: productDocument.id,
    ...data,
    name: data.name ?? '',
    brand: data.brand ?? '',
    category: data.category ?? '',
    categoryValue: data.categoryValue ?? '',
    price: Number(data.price) || 0,
    discountRate: Number(data.discountRate) || 0,
    stock: Number(data.stock) || 0,
    image: data.image ?? '',
    images: Array.isArray(data.images) ? data.images : [data.image].filter(Boolean),
    description: data.description ?? '',
    isRecommended: data.isRecommended === true,
  }
}

export const getProducts = async () => {
  const productSnapshot = await getDocs(collection(db, 'products'))
  const catalog = await getProductCatalog()
  const catalogById = new Map(catalog.map((product) => [String(product.id), product]))

  return productSnapshot.docs
    .map(normalizeProduct)
    .map((product) => applyCatalogPrice(
      product,
      catalogById.get(String(product.legacyId)),
    ))
    .sort((a, b) => {
      const aOrder = Number.isFinite(a.sortOrder) ? a.sortOrder : Number.MAX_SAFE_INTEGER
      const bOrder = Number.isFinite(b.sortOrder) ? b.sortOrder : Number.MAX_SAFE_INTEGER

      return aOrder - bOrder || getCreatedTime(b.createAt) - getCreatedTime(a.createAt)
    })
}

export const getRecommendedProducts = async () => {
  const products = await getProducts()
  return products.filter((product) => product.isRecommended)
}

export const getProductById = async (productId) => {
  const productSnapshot = await getDoc(doc(db, 'products', productId))
  if (productSnapshot.exists()) {
    return enrichProductDetail(normalizeProduct(productSnapshot))
  }

  const legacyId = Number(productId)
  if (!Number.isInteger(legacyId)) return null

  const legacySnapshot = await getDocs(query(
    collection(db, 'products'),
    where('legacyId', '==', legacyId),
    limit(1),
  ))

  return legacySnapshot.empty
    ? null
    : enrichProductDetail(normalizeProduct(legacySnapshot.docs[0]))
}

export const getProductErrorMessage = (error) => {
  const messages = {
    'permission-denied': '상품 정보를 확인할 권한이 없습니다.',
    'firestore/permission-denied': '상품 정보를 확인할 권한이 없습니다.',
    unavailable: '상품 서비스를 일시적으로 사용할 수 없습니다.',
    'firestore/unavailable': '상품 서비스를 일시적으로 사용할 수 없습니다.',
  }

  return messages[error?.code]
    ?? '상품 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
}
