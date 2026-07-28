import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './Home.module.scss'
import MainBanner from '../components/MainBanner'
import CategoryMenu from '../components/CategoryMenu'

const Home = () => {
  const [products, setProducts] = useState([])

  useEffect(() => {
    fetch('/data/products.json')
      .then((response) => response.json())
      .then(setProducts)
      .catch(() => setProducts([]))
  }, [])

  return (
    <main className={styles.home}>
      <MainBanner />

      <section className={styles.section}>
        <div className={styles.heading}>
          <div><p>SHOP BY CATEGORY</p><h2>차량과 취향에 맞춰 찾아보세요</h2></div>
          <Link to='/products'>전체보기 <img src='/img/banner/banner-arrow.png' alt='' /></Link>
        </div>
        <CategoryMenu />
      </section>

      <section className={`${styles.section} ${styles.recommend}`}>
        <div className={styles.heading}>
          <div><p>DRIVER'S CHOICE</p><h2>지금 추천하는 자동차용품</h2><span className={styles.subtitle}>드라이버들의 평가와 구매 데이터를 바탕으로 골랐어요</span></div>
          <Link to='/products'>추천상품 전체보기 <img src='/img/banner/banner-arrow.png' alt='' /></Link>
        </div>
        <div className={styles.productGrid}>
          {products.slice(0, 8).map((product, index) => {
            const salePrice = Math.round(product.price * (100 - product.discountRate) / 100)
            return (
              <article className={styles.product} key={product.id}>
                <Link className={styles.visual} to={`/products/${product.id}`}>
                  <img src={product.image} alt='' />
                  <span className={styles.rank}>{String(index + 1).padStart(2, '0')}</span>
                  {product.discountRate > 0 && <b>{product.discountRate}%</b>}
                </Link>
                <div className={styles.productInfo}>
                  <small>{product.category}</small>
                  <Link className={styles.productName} to={`/products/${product.id}`}>{product.name}</Link>
                  <p>{product.discountRate > 0 && <del>{product.price.toLocaleString()}원</del>}<strong>{salePrice.toLocaleString()}원</strong></p>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className={styles.benefits}>
        <div><b>✓</b><span><strong>검증된 자동차용품</strong><small>안전과 품질을 꼼꼼히 확인했어요</small></span></div>
        <div><b>↻</b><span><strong>차종별 구매 상담</strong><small>내 차에 맞는 제품을 안내해드려요</small></span></div>
        <div><b>◇</b><span><strong>안전 포장 배송</strong><small>파손 걱정 없이 안전하게 보내드려요</small></span></div>
      </section>
    </main>
  )
}

export default Home
