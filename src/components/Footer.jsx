import React from 'react'
import { Link } from 'react-router-dom'
import styles from './Footer.module.scss'

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.main}>
          <div className={styles.brand}>
            <Link to='/' className={styles.logo} aria-label='DRIVE MARKET 홈으로 이동'>
              <img src='/img/logo/drive-market-logo-reversed.png' alt='DRIVE MARKET' />
            </Link>
            <p>
              자동차를 위한 좋은 선택.<br />
              드라이브 마켓에서 나만의 카 라이프를 완성하세요.
            </p>
          </div>

          <nav className={styles.menu} aria-label='푸터 쇼핑 메뉴'>
            <h2>SHOP</h2>
            <Link to='/products'>전체상품</Link>
            <Link to='/wishlist'>찜 목록</Link>
            <Link to='/cart'>장바구니</Link>
          </nav>

          <nav className={styles.menu} aria-label='푸터 고객지원 메뉴'>
            <h2>SUPPORT</h2>
            <Link to='/notice'>공지사항</Link>
            <Link to='/login'>로그인</Link>
            <Link to='/signup'>회원가입</Link>
          </nav>

          <div className={styles.contact}>
            <h2>CUSTOMER CENTER</h2>
            <a className={styles.phone} href='tel:15880000'>1588-0000</a>
            <p>평일 09:00 – 18:00</p>
            <p>주말 및 공휴일 휴무</p>
          </div>
        </div>

        <div className={styles.company}>
          <div className={styles.policy}>
            <span>이용약관</span>
            <strong>개인정보처리방침</strong>
            <span>사업자정보확인</span>
          </div>
          <p>
            드라이브마켓 · 대표 홍길동 · 사업자등록번호 000-00-00000 · 통신판매업 신고 제2026-서울-0000호
          </p>
          <p>서울특별시 강남구 테헤란로 00 · help@drivemarket.co.kr</p>
        </div>

        <div className={styles.bottom}>
          <small>© 2026 DRIVE MARKET. All rights reserved.</small>
          <span>Drive better, live better.</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
