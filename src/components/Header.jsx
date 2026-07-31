import React, { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import SearchBox from './SearchBox'
import useAuthStore from '../store/authStore'
import useAuth from '../hooks/useAuth'
import { useCategories } from '../hooks/useProducts'
import styles from './Header.module.scss'

const Header = () => {
  const { categories } = useCategories()
  const {
    user,
    isAdmin,
    isAuthLoading,
    isRoleLoading,
  } = useAuth()
  const signOut = useAuthStore((state) => state.logout)
  const clearAuthError = useAuthStore((state) => state.clearError)
  const [logoutError, setLogoutError] = useState('')

  const logout = async () => {
    if (!window.confirm('로그아웃하시겠습니까?')) return

    setLogoutError('')
    clearAuthError()

    try {
      await signOut()
    } catch {
      setLogoutError(
        useAuthStore.getState().error
          || '로그아웃하지 못했습니다. 잠시 후 다시 시도해 주세요.',
      )
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <Link className={styles.logo} to='/' aria-label='Drive Market 홈'>
          <img src='/img/logo/drive-market-logo-primary.png' className={styles.logoMark} alt=''/>
        </Link>
        <SearchBox />
        <nav className={styles.utilityNav} aria-label='사용자 메뉴'>
          {!isAuthLoading && (
            user ? (
              <>
                <span className={styles.userName}>{user.displayName || user.email}님</span>
                <Link to='/mypage'>마이페이지</Link>
                {!isRoleLoading && isAdmin && <Link to='/admin'>관리자</Link>}
                <button type='button' onClick={logout}>로그아웃</button>
              </>
            ) : (
              <>
                <Link to='/login'>로그인</Link>
                <Link to='/signup'>회원가입</Link>
              </>
            )
          )}
          <Link to='/wishlist'>찜</Link>
          <Link className={styles.cartLink} to='/cart'>장바구니</Link>
        </nav>
        {logoutError && <p className={styles.authError} role='alert'>{logoutError}</p>}
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
