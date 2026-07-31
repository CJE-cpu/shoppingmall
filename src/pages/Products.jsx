import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import Pagination from '../components/Pagination'
import ProductFilter from '../components/ProductFilter'
import ProductList from '../components/ProductList'
import ProductSort from '../components/ProductSort'
import { getProductErrorMessage, getProducts } from '../firebase/productApi'
import { useCategories } from '../hooks/useProducts'
import styles from './Products.module.scss'

const PRODUCTS_PER_PAGE = 12

const Products = () => {
  const { category } = useParams()
  const { categories } = useCategories()
  const productSectionRef = useRef(null)
  const [products, setProducts] = useState([])
  const [brands, setBrands] = useState([])
  const [priceRange, setPriceRange] = useState('all')
  const [sort, setSort] = useState('recommended')
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const loadProducts = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      setProducts(await getProducts())
    } catch (error) {
      setProducts([])
      setErrorMessage(getProductErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  useEffect(() => {
    setBrands([])
    setPriceRange('all')
    setSort('recommended')
  }, [category])

  const currentCategory = categories.find((item) => item.path.endsWith(`/${category}`))
  const pageTitle = currentCategory?.name ?? '전체상품'
  const brandOptions = [...new Set(products.map((item) => item.brand).filter(Boolean))]
  const hasRatings = products.some((item) => typeof item.rating === 'number')

  const filteredProducts = useMemo(() => {
    let result = category
      ? products.filter((item) => item.categoryValue === category)
      : products

    if (brands.length) {
      result = result.filter((item) => brands.includes(item.brand))
    }

    if (priceRange === 'under100') result = result.filter((item) => item.price < 100000)
    if (priceRange === '100to300') result = result.filter((item) => item.price >= 100000 && item.price <= 300000)
    if (priceRange === 'over300') result = result.filter((item) => item.price > 300000)

    return [...result].sort((a, b) => {
      if (sort === 'low') return a.price - b.price
      if (sort === 'high') return b.price - a.price
      if (sort === 'rating') return (b.rating ?? 0) - (a.rating ?? 0)
      return (b.reviews ?? 0) - (a.reviews ?? 0)
    })
  }, [brands, category, priceRange, products, sort])

  useEffect(() => {
    setCurrentPage(1)
  }, [brands, category, priceRange, sort])

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  const pageStart = (currentPage - 1) * PRODUCTS_PER_PAGE
  const visibleProducts = filteredProducts.slice(
    pageStart,
    pageStart + PRODUCTS_PER_PAGE,
  )

  const changePage = (page) => {
    setCurrentPage(page)
    productSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const resetFilters = () => {
    setBrands([])
    setPriceRange('all')
  }

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>PRODUCTS</p>
        <h1>{pageTitle}</h1>
        <p>차량에 꼭 맞는 상품을 한눈에 살펴보세요.</p>
      </header>

      <div className={styles.content}>
        <aside className={styles.sidebar}>
          <ProductFilter
            brands={brands}
            brandOptions={brandOptions}
            priceRange={priceRange}
            onBrandsChange={setBrands}
            onPriceChange={setPriceRange}
            onReset={resetFilters}
          />
        </aside>

        <section ref={productSectionRef} className={styles.products} aria-label={`${pageTitle} 상품 목록`}>
          <ProductSort count={filteredProducts.length} value={sort} onChange={setSort} hasRatings={hasRatings} />
          {isLoading ? (
            <p className={styles.state} role='status'>상품을 불러오는 중입니다...</p>
          ) : errorMessage ? (
            <div className={`${styles.state} ${styles.error}`} role='alert'>
              <p>{errorMessage}</p>
              <button type='button' onClick={loadProducts}>다시 시도</button>
            </div>
          ) : (
            <>
              <ProductList products={visibleProducts} />
              {totalPages > 1 && (
                <Pagination
                  current={currentPage}
                  total={totalPages}
                  onChange={changePage}
                />
              )}
            </>
          )}
        </section>
      </div>
    </main>
  )
}

export default Products
