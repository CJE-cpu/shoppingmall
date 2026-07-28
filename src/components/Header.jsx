import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import SearchBox from './SearchBox'
import { useCategories } from '../hooks/useProducts'
import styles from './Header.module.scss'

const Header = () => {
  const { categories } = useCategories()

  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <Link className={styles.logo} to='/' aria-label='Drive Market 홈'>
          <img src='../public/img/logo/drive-market-logo-primary.png' className={styles.logoMark} alt=''/>
        </Link>
        <SearchBox />
        <nav className={styles.utilityNav} aria-label='사용자 메뉴'>
          <Link to='/login'>로그인</Link>
          <Link to='/signup'>회원가입</Link>
          <Link to='/wishlist'>찜</Link>
          <Link className={styles.cartLink} to='/cart'>장바구니</Link>
        </nav>
      </div>
      <nav className={styles.categoryNav} aria-label='상품 카테고리'>
        {categories.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            end={item.path === '/products'}
            className={({ isActive }) => isActive ? styles.active : undefined}
          >
            {item.name}
          </NavLink>
        ))}
        <NavLink to='/notice' className={({ isActive }) => isActive ? styles.active : undefined}>공지사항</NavLink>
      </nav>
    </header>
  )
}

export default Header
