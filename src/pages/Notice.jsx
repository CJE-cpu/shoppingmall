import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  formatNoticeDate,
  getNoticeErrorMessage,
  getNotices,
} from '../firebase/noticeApi'
import Pagination from '../components/Pagination'
import styles from './Notice.module.scss'

const NOTICES_PER_PAGE = 10

const Notice = () => {
  const [notices, setNotices] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const totalPages = Math.ceil(notices.length / NOTICES_PER_PAGE)
  const pageStart = (currentPage - 1) * NOTICES_PER_PAGE
  const visibleNotices = notices.slice(pageStart, pageStart + NOTICES_PER_PAGE)

  useEffect(() => {
    let isMounted = true

    getNotices()
      .then((noticeList) => {
        if (isMounted) setNotices(noticeList)
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
  }, [])

  return (
    <main className={styles.page}>
      <header className={styles.heading}>
        <span>NOTICE</span>
        <h1>공지사항</h1>
        <p>Drive Market의 새로운 소식과 이용 안내를 확인해 주세요.</p>
      </header>

      <section className={styles.noticePanel}>
        <div className={styles.listHeader}>
          <span>번호</span>
          <span>제목</span>
          <span>등록일</span>
        </div>

        {isLoading ? (
          <p className={styles.state} role='status'>공지사항을 불러오는 중입니다...</p>
        ) : errorMessage ? (
          <p className={styles.error} role='alert'>{errorMessage}</p>
        ) : notices.length === 0 ? (
          <p className={styles.state}>등록된 공지사항이 없습니다.</p>
        ) : (
          <>
            <ol className={styles.noticeList}>
              {visibleNotices.map((notice, index) => (
                <li key={notice.id}>
                  <span>{notices.length - pageStart - index}</span>
                  <Link to={`/notice/${notice.id}`}>{notice.title}</Link>
                  <time>{formatNoticeDate(notice.createAt)}</time>
                </li>
              ))}
            </ol>
            {totalPages > 1 && (
              <Pagination
                current={currentPage}
                total={totalPages}
                onChange={setCurrentPage}
              />
            )}
          </>
        )}
      </section>
    </main>
  )
}

export default Notice
