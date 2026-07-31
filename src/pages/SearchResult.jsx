import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProductList from '../components/ProductList'
import ProductSort from '../components/ProductSort'
import SearchBox from '../components/SearchBox'
import { getProducts } from '../firebase/productApi'
import styles from './SearchResult.module.scss'

const SearchResult = () => {
  const { keyword = '' } = useParams()
  const [searchResult, setSearchResult] = useState([])
  const [sort, setSort] = useState('recommended')
  const [isLoading, setIsLoading] = useState(true)
  const decodedKeyword = decodeURIComponent(keyword).trim()

  useEffect(() => {
    const searchProducts = async () => {
      setIsLoading(true)

      try {
        const productData = await getProducts()
        const normalizedKeyword = decodedKeyword.toLowerCase()

        const results = productData.filter((item) => (
          item.name.toLowerCase().includes(normalizedKeyword)
          || item.category.toLowerCase().includes(normalizedKeyword)
          || item.brand?.toLowerCase().includes(normalizedKeyword)
        ))

        setSearchResult(results)
        setSort('recommended')
      } catch {
        setSearchResult([])
      } finally {
        setIsLoading(false)
      }
    }

    searchProducts()
  }, [decodedKeyword])

  const sortedResults = useMemo(() => (
    [...searchResult].sort((a, b) => {
      const aPrice = a.price * (1 - (a.discountRate || 0) / 100)
      const bPrice = b.price * (1 - (b.discountRate || 0) / 100)
      if (sort === 'low') return aPrice - bPrice
      if (sort === 'high') return bPrice - aPrice
      return 0
    })
  ), [searchResult, sort])

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>SEARCH RESULTS</p>
        <h1><span>‘{decodedKeyword}’</span> 검색 결과</h1>
        <p className={styles.summary}>
          {isLoading
            ? '상품을 찾고 있어요.'
            : searchResult.length > 0
              ? <>총 <strong>{searchResult.length}</strong>개의 상품을 찾았습니다.</>
              : '일치하는 상품을 찾지 못했습니다.'}
        </p>
        <div className={styles.searchBox}>
          <SearchBox initialValue={decodedKeyword} />
        </div>
      </header>

      <section className={styles.results} aria-label={`${decodedKeyword} 검색 결과`}>
        {!isLoading && searchResult.length > 0 && (
          <ProductSort count={sortedResults.length} value={sort} onChange={setSort} />
        )}

        {isLoading ? (
          <div className={styles.loading} aria-live='polite'>
            <span />
            <p>검색 결과를 불러오는 중입니다.</p>
          </div>
        ) : (
          <ProductList
            products={sortedResults}
            emptyTitle='검색 결과가 없어요'
            emptyDescription='검색어의 철자를 확인하거나 다른 키워드로 검색해 보세요.'
          />
        )}

        {!isLoading && searchResult.length === 0 && (
          <div className={styles.emptyActions}>
            <Link to='/products'>전체 상품 보기</Link>
          </div>
        )}
      </section>
    </main>
  )
}

export default SearchResult
