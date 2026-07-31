import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import styles from './Login.module.scss'

const Login = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const login = useAuthStore((state) => state.login)
  const clearError = useAuthStore((state) => state.clearError)
  const errorMessage = useAuthStore((state) => state.error)
  const isSubmitting = useAuthStore((state) => state.loading)

  useEffect(() => {
    clearError()
  }, [clearError])

  const changeForm = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const submitLogin = async (event) => {
    event.preventDefault()
    clearError()

    try {
      const user = await login(form.email.trim(), form.password)
      if (user) navigate('/')
    } catch {
      // 한글 오류 메시지는 Store에서 관리한다.
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.authCard}>
        <div className={styles.heading}>
          <p>WELCOME BACK</p>
          <h1>로그인</h1>
          <span>드라이브 마켓의 다양한 상품을 만나보세요.</span>
        </div>

        <form className={styles.form} onSubmit={submitLogin}>
          <label>
            <span>이메일</span>
            <input
              type='email'
              name='email'
              value={form.email}
              onChange={changeForm}
              placeholder='example@email.com'
              autoComplete='email'
              required
            />
          </label>

          <label>
            <span>비밀번호</span>
            <input
              type='password'
              name='password'
              value={form.password}
              onChange={changeForm}
              placeholder='비밀번호를 입력해 주세요'
              autoComplete='current-password'
              required
            />
          </label>

          {errorMessage && (
            <p className={styles.errorMessage} role='alert'>{errorMessage}</p>
          )}

          <button className={styles.submitButton} type='submit' disabled={isSubmitting}>
            {isSubmitting ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className={styles.switchLink}>
          아직 회원이 아니신가요? <Link to='/signup'>회원가입</Link>
        </p>
      </section>
    </main>
  )
}

export default Login
