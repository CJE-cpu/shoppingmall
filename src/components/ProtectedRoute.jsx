import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import styles from './ProtectedRoute.module.scss'

const ProtectedRoute = ({ children }) => {
  const { user, isAuthLoading } = useAuth()
  const location = useLocation()

  if (isAuthLoading) {
    return (
      <div className={styles.loading} role='status'>
        <span aria-hidden='true' />
        <p>인증 상태 확인 중입니다...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to='/login' replace state={{ from: location.pathname }} />
  }

  return children
}

export default ProtectedRoute
