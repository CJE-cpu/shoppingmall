import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  formatNoticeDate,
  getNoticeById,
  getNoticeErrorMessage,
} from '../firebase/noticeApi'
import styles from './NoticeDetail.module.scss'

const NoticeDetail = () => {
  const { id } = useParams()
  const [notice, setNotice] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    getNoticeById(id)
      .then((noticeData) => {
        if (isMounted) setNotice(noticeData)
      })
      .catch((error) => {
        if (isMounted) setErrorMessage(getNoticeErrorMessage(error))
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [id])

  if (isLoading) {
    return <p className={styles.state} role='status'>공지사항을 불러오는 중입니다...</p>
  }

  if (errorMessage) {
    return <p className={`${styles.state} ${styles.error}`} role='alert'>{errorMessage}</p>
  }

  if (!notice) {
    return (
      <div className={styles.state}>
        <p>존재하지 않는 공지사항입니다.</p>
        <Link to='/notice'>목록으로 이동</Link>
      </div>
    )
  }

  return (
    <main className={styles.page}>
      <article className={styles.notice}>
        <header>
          <span>NOTICE</span>
          <h1>{notice.title}</h1>
          <time>{formatNoticeDate(notice.createAt)}</time>
        </header>
        <div className={styles.content}>{notice.content}</div>
        <Link className={styles.listLink} to='/notice'>목록으로</Link>
      </article>
    </main>
  )
}

export default NoticeDetail
