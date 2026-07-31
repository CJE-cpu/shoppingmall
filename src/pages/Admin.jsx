import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import AdminDashboard from '../components/AdminDashboard'
import AdminMembers from '../components/AdminMembers'
import AdminNotices from '../components/AdminNotices'
import AdminProducts from '../components/AdminProducts'
import styles from './Admin.module.scss'

const ADMIN_MENUS = [
  {
    id: 'dashboard',
    label: '대시보드',
    path: '/admin',
    description: '쇼핑몰 운영 현황을 한눈에 확인합니다.',
  },
  {
    id: 'members',
    label: '회원관리',
    path: '/admin/members',
    description: '가입 회원과 회원별 권한 정보를 관리합니다.',
  },
  {
    id: 'products',
    label: '상품관리(재고관리)',
    path: '/admin/products',
    description: '상품 정보와 판매 가능한 재고를 관리합니다.',
  },
  {
    id: 'notices',
    label: '공지사항 관리',
    path: '/admin/notices',
    description: '쇼핑몰 공지사항을 작성하고 관리합니다.',
  },
]

const Admin = () => {
  const location = useLocation()
  const activeMenu = ADMIN_MENUS.find((menu) => menu.path === location.pathname)
    ?? ADMIN_MENUS[0]
  const isDashboard = activeMenu.id === 'dashboard'

  return (
    <main className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeading}>
          <span>ADMIN</span>
          <h1>관리자 페이지</h1>
          <p>Drive Market 운영 관리</p>
        </div>

        <nav className={styles.menu} aria-label='관리자 메뉴'>
          {ADMIN_MENUS.map((menu) => (
            <NavLink
              key={menu.id}
              to={menu.path}
              end={menu.path === '/admin'}
              className={({ isActive }) => isActive ? styles.active : undefined}
            >
              {menu.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.accountNotice}>
          <strong>관리자 계정 관리</strong>
          <p>닉네임과 비밀번호 변경은 마이페이지에서 관리할 수 있습니다.</p>
          <NavLink to='/mypage'>마이페이지 이동</NavLink>
        </div>
      </aside>

      <section className={styles.content}>
        <header className={styles.contentHeading}>
          <div>
            <span>ADMINISTRATION</span>
            <h2>{activeMenu.label}</h2>
            <p>{activeMenu.description}</p>
          </div>
        </header>

        {isDashboard ? (
          <>
            <AdminDashboard />

            <section className={styles.guidePanel}>
              <span>QUICK GUIDE</span>
              <h3>관리 메뉴 안내</h3>
              <div>
                {ADMIN_MENUS.slice(1).map((menu) => (
                  <NavLink key={menu.id} to={menu.path}>
                    <strong>{menu.label}</strong>
                    <p>{menu.description}</p>
                  </NavLink>
                ))}
              </div>
            </section>
          </>
        ) : activeMenu.id === 'members' ? (
          <AdminMembers />
        ) : activeMenu.id === 'products' ? (
          <AdminProducts />
        ) : activeMenu.id === 'notices' ? (
          <AdminNotices />
        ) : (
          <section className={styles.emptyPanel}>
            <span>{activeMenu.label}</span>
            <h3>관리 기능 준비 영역</h3>
            <p>
              관리자 접근 권한과 기본 레이아웃이 연결되었습니다.
              실제 데이터 조회와 등록·수정·삭제 기능은 다음 단계에서 연결할 수 있습니다.
            </p>
          </section>
        )}
      </section>
    </main>
  )
}

export default Admin
