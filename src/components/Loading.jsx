import React from 'react'
import styles from './Loading.module.scss'

const Loading = () => {
  return (
    <div className={styles.loading} role='status' aria-live='polite'>
      <span aria-hidden='true' />
      <p>페이지를 불러오는 중입니다...</p>
    </div>
  )
}

export default Loading
