import React from 'react'
import ProductCard from './ProductCard'
import styles from './ProductList.module.scss'

const ProductList = ({
  products = [],
  onWishItem,
  emptyTitle = '조건에 맞는 상품이 없어요',
  emptyDescription = '다른 카테고리나 필터 조건을 선택해 보세요.',
}) => {
  if (products.length === 0) {
    return (
      <div className={styles.empty}>
        <span aria-hidden='true'>
          <svg viewBox='0 0 24 24'>
            <circle cx='10.5' cy='10.5' r='6.2' />
            <path d='m15.2 15.2 4.3 4.3' />
          </svg>
        </span>
        <strong>{emptyTitle}</strong>
        <p>{emptyDescription}</p>
      </div>
    )
  }

  return (
    <div className={styles.grid}>
      {products.map((item) => (
        <ProductCard key={item.id} product={item} onWishItem={onWishItem} />
      ))}
    </div>
  )
}

export default ProductList
