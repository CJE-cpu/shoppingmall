import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import styles from './ProtectedRoute.module.scss'

const AdminRoute = ({ children }) => {
  const {
    user,
    isAdmin,
    isAuthLoading,
    isRoleLoading,
    roleError,
  } = useAuth()
  const location = useLocation()

  if (isAuthLoading || (user && isRoleLoading)) {
    return (
      <div className={styles.loading} role='status'>
        <span aria-hidden='true' />
        <p>관리자 권한 확인 중입니다...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to='/login' replace state={{ from: location.pathname }} />
  }

  if (roleError || !isAdmin) {
    return <Navigate to='/' replace />
  }

  return children
}

export default AdminRoute
