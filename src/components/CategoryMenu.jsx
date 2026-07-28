import React from 'react'
import { Link } from 'react-router-dom'
import { useCategories } from '../hooks/useProducts'
import styles from './CategoryMenu.module.scss'

const CategoryMenu = () => {
  const { categories, isLoading } = useCategories()
  const items = categories.filter((item) => item.path !== '/products')

  if (isLoading) {
    return <div className={styles.skeleton} aria-label='카테고리를 불러오는 중' />
  }

  return (
    <div className={styles.grid}>
      {items.map((item, index) => (
        <Link className={styles.card} to={item.path} key={item.id}>
          <img src={item.image} alt='' />
          <span className={styles.shade} />
          <span className={styles.number}>{String(index + 1).padStart(2, '0')}</span>
          <span className={styles.info}>
            <strong>{item.name}</strong>
            <small>
              상품 둘러보기
              <b><img src='/img/banner/banner-arrow.png' alt='' /></b>
            </small>
          </span>
        </Link>
      ))}
    </div>
  )
}

export default CategoryMenu
