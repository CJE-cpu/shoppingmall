import React, { useEffect, useState } from 'react'
import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminProductErrorMessage,
  getAdminProducts,
  updateAdminProduct,
  updateAdminProductRecommendation,
  updateAdminProductStock,
} from '../firebase/adminApi'
import styles from '../pages/Admin.module.scss'

const EMPTY_FORM = {
  name: '',
  category: '',
  categoryValue: '',
  price: '',
  discountRate: '0',
  stock: '',
  image: '',
  description: '',
  isRecommended: false,
}

const LOW_STOCK_THRESHOLD = 5
const MAX_RECOMMENDED_PRODUCTS = 4

const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [updatingRecommendationId, setUpdatingRecommendationId] = useState('')
  const [updatingStockId, setUpdatingStockId] = useState('')
  const [stockDrafts, setStockDrafts] = useState({})
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const loadProducts = async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const productList = await getAdminProducts()
      setProducts(productList)
      setStockDrafts(Object.fromEntries(
        productList.map((product) => [product.id, String(product.stock)]),
      ))
    } catch (error) {
      setErrorMessage(getAdminProductErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const changeForm = (event) => {
    const { name, value, checked, type } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setEditingId('')
    setSuccessMessage('')
  }

  const editProduct = (product) => {
    setEditingId(product.id)
    setForm({
      name: product.name,
      category: product.category,
      categoryValue: product.categoryValue,
      price: String(product.price),
      discountRate: String(product.discountRate),
      stock: String(product.stock),
      image: product.image,
      description: product.description,
      isRecommended: product.isRecommended,
      brand: product.brand,
      images: product.images,
    })
    setErrorMessage('')
    setSuccessMessage('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const submitProduct = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const stock = Number(form.stock)
    if (!Number.isInteger(stock) || stock < 0) {
      setErrorMessage('재고는 0 이상의 정수만 입력할 수 있습니다.')
      return
    }

    const currentProduct = products.find((product) => product.id === editingId)
    const recommendedCount = products.filter((product) => product.isRecommended).length
    const addsRecommendation = form.isRecommended
      && (!editingId || currentProduct?.isRecommended !== true)

    if (addsRecommendation && recommendedCount >= MAX_RECOMMENDED_PRODUCTS) {
      setErrorMessage('추천상품은 최대 4개까지만 설정할 수 있습니다.')
      return
    }

    setIsSubmitting(true)

    try {
      if (editingId) {
        await updateAdminProduct({ productId: editingId, product: form })
        setSuccessMessage('상품이 수정되었습니다.')
      } else {
        await createAdminProduct(form)
        setSuccessMessage('상품이 등록되었습니다.')
      }

      setForm(EMPTY_FORM)
      setEditingId('')
      await loadProducts()
    } catch (error) {
      setErrorMessage(getAdminProductErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const removeProduct = async (product) => {
    if (!window.confirm(`${product.name} 상품을 삭제하시겠습니까?`)) return

    setErrorMessage('')
    setSuccessMessage('')

    try {
      await deleteAdminProduct(product.id)
      setProducts((current) => current.filter((item) => item.id !== product.id))
      if (editingId === product.id) resetForm()
      setSuccessMessage('상품이 삭제되었습니다.')
    } catch (error) {
      setErrorMessage(getAdminProductErrorMessage(error))
    }
  }

  const toggleRecommendation = async (product) => {
    const nextRecommended = !product.isRecommended

    if (
      nextRecommended
      && products.filter((item) => item.isRecommended).length >= MAX_RECOMMENDED_PRODUCTS
    ) {
      setErrorMessage('추천상품은 최대 4개까지만 설정할 수 있습니다.')
      setSuccessMessage('')
      return
    }

    setUpdatingRecommendationId(product.id)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await updateAdminProductRecommendation({
        productId: product.id,
        isRecommended: nextRecommended,
      })
      setProducts((current) => current.map((item) => (
        item.id === product.id
          ? { ...item, isRecommended: nextRecommended }
          : item
      )))
      setSuccessMessage(
        nextRecommended
          ? '추천상품으로 설정되었습니다.'
          : '추천상품에서 해제되었습니다.',
      )
    } catch (error) {
      setErrorMessage(getAdminProductErrorMessage(error))
    } finally {
      setUpdatingRecommendationId('')
    }
  }

  const changeStockDraft = (product, value) => {
    setStockDrafts((current) => ({ ...current, [product.id]: value }))
    setErrorMessage('')
    setSuccessMessage('')

    if (value === '') return

    const nextStock = Number(value)
    if (!/^\d+$/.test(value) || !Number.isInteger(nextStock) || nextStock < 0) {
      setErrorMessage('재고는 0 이상의 정수만 입력할 수 있습니다.')
    }
  }

  const saveStock = async (product) => {
    const value = stockDrafts[product.id] ?? String(product.stock)
    const nextStock = Number(value)

    if (!/^\d+$/.test(value) || !Number.isInteger(nextStock) || nextStock < 0) {
      setStockDrafts((current) => ({
        ...current,
        [product.id]: String(product.stock),
      }))
      setErrorMessage('재고는 0 이상의 정수만 입력할 수 있습니다.')
      return
    }

    if (nextStock === product.stock) return

    setUpdatingStockId(product.id)

    try {
      await updateAdminProductStock({ productId: product.id, stock: nextStock })
      setProducts((current) => current.map((item) => (
        item.id === product.id ? { ...item, stock: nextStock } : item
      )))
      setSuccessMessage(`${product.name} 재고가 ${nextStock}개로 변경되었습니다.`)
    } catch (error) {
      setStockDrafts((current) => ({
        ...current,
        [product.id]: String(product.stock),
      }))
      setErrorMessage(getAdminProductErrorMessage(error))
    } finally {
      setUpdatingStockId('')
    }
  }

  return (
    <div className={styles.productManagement}>
      <section className={styles.productFormPanel}>
        <div className={styles.managementHeading}>
          <div>
            <span>PRODUCT FORM</span>
            <h3>{editingId ? '상품 수정' : '상품 등록'}</h3>
          </div>
          {editingId && <button type='button' onClick={resetForm}>수정 취소</button>}
        </div>

        <form className={styles.productForm} onSubmit={submitProduct}>
          <label>
            <span>상품명</span>
            <input name='name' value={form.name} onChange={changeForm} required />
          </label>
          <label>
            <span>카테고리명</span>
            <input name='category' value={form.category} onChange={changeForm} required />
          </label>
          <label>
            <span>카테고리 값</span>
            <input name='categoryValue' value={form.categoryValue} onChange={changeForm} required />
          </label>
          <label>
            <span>가격</span>
            <input name='price' type='number' min='0' value={form.price} onChange={changeForm} required />
          </label>
          <label>
            <span>할인율</span>
            <input name='discountRate' type='number' min='0' max='100' value={form.discountRate} onChange={changeForm} required />
          </label>
          <label>
            <span>재고</span>
            <input name='stock' type='number' min='0' step='1' value={form.stock} onChange={changeForm} required />
          </label>
          <label className={styles.fullField}>
            <span>이미지 경로 또는 URL</span>
            <input name='image' value={form.image} onChange={changeForm} placeholder='/img/products/example.png' required />
          </label>
          <label className={styles.fullField}>
            <span>설명</span>
            <textarea name='description' value={form.description} onChange={changeForm} rows='4' required />
          </label>
          <label className={`${styles.fullField} ${styles.checkboxField}`}>
            <input name='isRecommended' type='checkbox' checked={form.isRecommended} onChange={changeForm} />
            <span>추천상품으로 표시</span>
          </label>

          {(errorMessage || successMessage) && (
            <p className={errorMessage ? styles.formError : styles.formSuccess} role={errorMessage ? 'alert' : 'status'}>
              {errorMessage || successMessage}
            </p>
          )}

          <button className={styles.submitButton} type='submit' disabled={isSubmitting}>
            {isSubmitting ? '저장 중...' : editingId ? '상품 수정' : '상품 등록'}
          </button>
        </form>
      </section>

      <section className={styles.productListPanel}>
        <div className={styles.managementHeading}>
          <div>
            <span>PRODUCTS</span>
            <h3>상품 및 재고 목록</h3>
          </div>
          <strong>
            추천 {products.filter((product) => product.isRecommended).length}/{MAX_RECOMMENDED_PRODUCTS}
            {' · '}
            전체 {products.length.toLocaleString('ko-KR')}개
          </strong>
        </div>

        {isLoading ? (
          <p className={styles.adminState} role='status'>상품 목록을 불러오는 중입니다...</p>
        ) : products.length === 0 ? (
          <p className={styles.adminState}>등록된 상품이 없습니다.</p>
        ) : (
          <div className={styles.adminProductList}>
            {products.map((product) => (
              <article key={product.id}>
                <div className={styles.adminProductImage}>
                  {product.image ? <img src={product.image} alt={product.name} /> : <span>이미지 없음</span>}
                </div>
                <div className={styles.adminProductInfo}>
                  <strong>{product.name}</strong>
                  <small>{product.category}</small>
                  <p>
                    {product.price.toLocaleString('ko-KR')}원
                    {product.isRecommended && <b>추천</b>}
                  </p>
                </div>
                <div className={styles.stockControl}>
                  <label>
                    <span>현재 재고</span>
                    <input
                      type='number'
                      min='0'
                      step='1'
                      inputMode='numeric'
                      value={stockDrafts[product.id] ?? String(product.stock)}
                      onChange={(event) => changeStockDraft(product, event.target.value)}
                      onBlur={() => saveStock(product)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') event.currentTarget.blur()
                      }}
                      disabled={updatingStockId === product.id}
                      aria-label={`${product.name} 재고 수량`}
                    />
                  </label>
                  <span
                    className={
                      product.stock === 0
                        ? styles.soldOutStatus
                        : product.stock <= LOW_STOCK_THRESHOLD
                          ? styles.lowStockStatus
                          : styles.normalStockStatus
                    }
                  >
                    {updatingStockId === product.id
                      ? '저장 중'
                      : product.stock === 0
                        ? '품절'
                        : product.stock <= LOW_STOCK_THRESHOLD
                          ? '재고 부족'
                          : '재고 정상'}
                  </span>
                </div>
                <div className={styles.productActions}>
                  <button
                    type='button'
                    className={product.isRecommended ? styles.recommendedButton : undefined}
                    onClick={() => toggleRecommendation(product)}
                    disabled={updatingRecommendationId === product.id}
                  >
                    {updatingRecommendationId === product.id
                      ? '변경 중...'
                      : product.isRecommended ? '추천 해제' : '추천'}
                  </button>
                  <button type='button' onClick={() => editProduct(product)}>수정</button>
                  <button type='button' onClick={() => removeProduct(product)}>삭제</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default AdminProducts
