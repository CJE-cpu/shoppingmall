import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './SearchBox.module.scss'

const SearchBox = ({ initialValue = '' }) => {
  const [searchKeyword, setSearchKeyword] = useState(initialValue)
  const navigate = useNavigate()

  useEffect(() => {
    setSearchKeyword(initialValue)
  }, [initialValue])

  const submitSearch = (event) => {
    event.preventDefault()
    const keyword = searchKeyword.trim()
    if (!keyword) return
    navigate(`/search/${encodeURIComponent(keyword)}`)
  }

  return (
    <form className={styles.searchForm} onSubmit={submitSearch} role='search'>
      <input
        type='search'
        className={styles.searchInput}
        value={searchKeyword}
        onChange={(event) => setSearchKeyword(event.target.value)}
        placeholder='필요한 자동차용품을 검색해 보세요'
        aria-label='상품 검색'
      />
      <button className={styles.searchButton} type='submit' aria-label='검색'>
        <svg viewBox='0 0 24 24' aria-hidden='true'>
          <circle cx='10.8' cy='10.8' r='6.3' />
          <path d='m15.5 15.5 4 4' />
        </svg>
        <span className={styles.buttonText}>검색</span>
      </button>
    </form>
  )
}

export default SearchBox
