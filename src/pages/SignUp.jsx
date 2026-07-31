import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import styles from './SignUp.module.scss'

const SignUp = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '',
    nickname: '',
    password: '',
    passwordConfirm: '',
  })
  const signup = useAuthStore((state) => state.signup)
  const clearError = useAuthStore((state) => state.clearError)
  const storeErrorMessage = useAuthStore((state) => state.error)
  const isSubmitting = useAuthStore((state) => state.loading)
  const [validationError, setValidationError] = useState('')
  const errorMessage = validationError || storeErrorMessage

  useEffect(() => {
    clearError()
  }, [clearError])

  const changeForm = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const submitSignUp = async (event) => {
    event.preventDefault()
    setValidationError('')
    clearError()

    if (form.nickname.trim().length < 2) {
      setValidationError('닉네임은 2자 이상 입력해 주세요.')
      return
    }

    if (form.password.length < 6) {
      setValidationError('비밀번호는 6자 이상 입력해 주세요.')
      return
    }

    if (form.password !== form.passwordConfirm) {
      setValidationError('비밀번호가 서로 일치하지 않습니다.')
      return
    }

    try {
      const user = await signup(
        form.email.trim(),
        form.password,
        form.nickname.trim(),
      )
      if (user) navigate('/login')
    } catch {
      // 한글 오류 메시지는 Store에서 관리한다.
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.authCard}>
        <div className={styles.heading}>
          <p>JOIN DRIVE MARKET</p>
          <h1>회원가입</h1>
          <span>간단한 정보 입력으로 회원 혜택을 시작하세요.</span>
        </div>

        <form className={styles.form} onSubmit={submitSignUp}>
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
            <span>닉네임</span>
            <input
              type='text'
              name='nickname'
              value={form.nickname}
              onChange={changeForm}
              placeholder='2자 이상 입력해 주세요'
              autoComplete='nickname'
              minLength='2'
              maxLength='20'
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
              placeholder='6자 이상 입력해 주세요'
              autoComplete='new-password'
              minLength='6'
              required
            />
          </label>

          <label>
            <span>비밀번호 확인</span>
            <input
              type='password'
              name='passwordConfirm'
              value={form.passwordConfirm}
              onChange={changeForm}
              placeholder='비밀번호를 다시 입력해 주세요'
              autoComplete='new-password'
              minLength='6'
              required
            />
          </label>

          {errorMessage && (
            <p className={styles.errorMessage} role='alert'>{errorMessage}</p>
          )}

          <button className={styles.submitButton} type='submit' disabled={isSubmitting}>
            {isSubmitting ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <p className={styles.switchLink}>
          이미 회원이신가요? <Link to='/login'>로그인</Link>
        </p>
      </section>
    </main>
  )
}

export default SignUp
