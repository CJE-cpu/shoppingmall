import React, { useEffect, useState } from 'react'
import {
  getAdminDashboardErrorMessage,
  getAdminDashboardStats,
} from '../firebase/adminApi'
import styles from '../pages/Admin.module.scss'

const DASHBOARD_CARDS = [
  { key: 'members', label: '전체 회원', unit: '명' },
  { key: 'products', label: '등록 상품', unit: '개' },
  { key: 'lowStockProducts', label: '품절·재고 부족', unit: '개' },
  { key: 'notices', label: '등록 공지', unit: '건' },
]

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    getAdminDashboardStats()
      .then((dashboardStats) => {
        if (isMounted) setStats(dashboardStats)
      })
      .catch((error) => {
        if (isMounted) setErrorMessage(getAdminDashboardErrorMessage(error))
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  if (isLoading) {
    return <p className={styles.dashboardState} role='status'>대시보드 정보를 불러오는 중입니다...</p>
  }

  if (errorMessage) {
    return <p className={`${styles.dashboardState} ${styles.adminError}`} role='alert'>{errorMessage}</p>
  }

  return (
    <div className={styles.summaryGrid}>
      {DASHBOARD_CARDS.map((card) => (
        <article key={card.key} className={styles.summaryCard}>
          <span>{card.label}</span>
          <strong>
            {(stats?.[card.key] ?? 0).toLocaleString('ko-KR')}
            <small>{card.unit}</small>
          </strong>
        </article>
      ))}
    </div>
  )
}

export default AdminDashboard
