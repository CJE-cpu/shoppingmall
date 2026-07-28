import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductList from '../components/ProductList'
import { loadlocal, savelocal } from '../utils/localStorage'
import styles from './Wishlist.module.scss'

const Wishlist = () => {
  const [wishItems, setWishItems] = useState(() => loadlocal('wishlist', []))

  useEffect(() => {
    savelocal('wishlist', wishItems)
  }, [wishItems])

  const changeWish = (productId, isLiked) => {
    if (!isLiked) {
      setWishItems((items) => items.filter(
        (item) => String(item.id) !== String(productId),
      ))
    }
  }

  const clearWishlist = () => {
    if (window.confirm('찜한 상품을 모두 삭제하시겠습니까?')) {
      setWishItems([])
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.heading}>
        <div>
          <p>MY FAVORITES</p>
          <h1>찜 목록</h1>
        </div>
        <span>관심 상품 <strong>{wishItems.length}</strong>개</span>
      </header>

      {wishItems.length === 0 ? (
        <section className={styles.empty}>
          <div className={styles.heartIcon} aria-hidden='true'>
            <svg viewBox='0 0 24 24'>
              <path d='M20.8 5.8a5.3 5.3 0 0 0-7.5 0L12 7.1l-1.3-1.3a5.3 5.3 0 0 0-7.5 7.5L12 22l8.8-8.7a5.3 5.3 0 0 0 0-7.5Z' />
            </svg>
          </div>
          <strong>아직 찜한 상품이 없어요</strong>
          <p>마음에 드는 상품의 하트를 눌러 나만의 목록을 만들어보세요.</p>
          <Link to='/products'>상품 둘러보기</Link>
        </section>
      ) : (
        <section className={styles.content} aria-label='찜한 상품 목록'>
          <div className={styles.toolbar}>
            <p>
              저장한 상품은 이 브라우저에서 계속 확인할 수 있어요.
            </p>
            <button type='button' onClick={clearWishlist}>전체 삭제</button>
          </div>
          <ProductList products={wishItems} onWishItem={changeWish} />
        </section>
      )}
    </main>
  )
}

export default Wishlist
