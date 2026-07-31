import React, { useEffect, useState } from 'react'
import {
  getAdminErrorMessage,
  getAdminMembers,
} from '../firebase/adminApi'
import styles from '../pages/Admin.module.scss'

const formatJoinDate = (value) => {
  if (!value) return '확인할 수 없음'

  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return '확인할 수 없음'

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

const AdminMembers = () => {
  const [members, setMembers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadMembers = async () => {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const memberList = await getAdminMembers()
        if (isMounted) setMembers(memberList)
      } catch (error) {
        if (isMounted) setErrorMessage(getAdminErrorMessage(error))
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadMembers()

    return () => {
      isMounted = false
    }
  }, [])

  if (isLoading) {
    return (
      <section className={styles.membersPanel}>
        <p className={styles.adminState} role='status'>회원 목록을 불러오는 중입니다...</p>
      </section>
    )
  }

  if (errorMessage) {
    return (
      <section className={styles.membersPanel}>
        <p className={styles.adminError} role='alert'>{errorMessage}</p>
      </section>
    )
  }

  return (
    <section className={styles.membersPanel}>
      <div className={styles.membersSummary}>
        <div>
          <span>MEMBERS</span>
          <h3>전체 회원</h3>
        </div>
        <strong>{members.length.toLocaleString('ko-KR')}명</strong>
      </div>

      {members.length === 0 ? (
        <p className={styles.adminState}>등록된 회원이 없습니다.</p>
      ) : (
        <div className={styles.tableScroll}>
          <table className={styles.membersTable}>
            <thead>
              <tr>
                <th scope='col'>닉네임</th>
                <th scope='col'>이메일</th>
                <th scope='col'>가입일</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td>{member.nickname || '닉네임 없음'}</td>
                  <td>{member.email || '이메일 없음'}</td>
                  <td>{formatJoinDate(member.createAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default AdminMembers
