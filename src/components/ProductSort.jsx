import React from 'react'
import styles from './ProductSort.module.scss'

const ProductSort = ({ count = 0, value = 'recommended', onChange, hasRatings = false }) => {
  return (
    <div className={styles.sort}>
      <p>총 <strong>{count}</strong>개의 상품</p>
      <label>
        <span>정렬</span>
        <select value={value} onChange={(event) => onChange(event.target.value)}>
          <option value='recommended'>추천순</option>
          {hasRatings && <option value='rating'>평점순</option>}
          <option value='low'>낮은 가격순</option>
          <option value='high'>높은 가격순</option>
        </select>
      </label>
    </div>
  )
}

export default ProductSort
