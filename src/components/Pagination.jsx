import React from 'react'
import styles from './Pagination.module.scss'

const Pagination = ({ current, total, onChange }) => {
  return (
    <nav className={styles.pagination} aria-label='페이지 이동'><button type='button' disabled={current === 1} onClick={() => onChange(current - 1)}>‹</button>{Array.from({ length: total }, (_, index) => index + 1).map((page) => <button type='button' key={page} className={current === page ? styles.active : ''} onClick={() => onChange(page)}>{page}</button>)}<button type='button' disabled={current === total} onClick={() => onChange(current + 1)}>›</button></nav>
  )
}

export default Pagination
