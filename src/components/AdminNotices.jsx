import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  createNotice,
  deleteNotice,
  formatNoticeDate,
  getNoticeErrorMessage,
  getNotices,
  updateNotice,
} from '../firebase/noticeApi'
import useAuthStore from '../store/authStore'
import styles from '../pages/Admin.module.scss'

const EMPTY_FORM = { title: '', content: '' }

const AdminNotices = () => {
  const user = useAuthStore((state) => state.user)
  const [notices, setNotices] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const loadNotices = async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      setNotices(await getNotices())
    } catch (error) {
      setErrorMessage(getNoticeErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadNotices()
  }, [])

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setEditingId('')
  }

  const submitNotice = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      if (editingId) {
        await updateNotice({ noticeId: editingId, ...form })
        setSuccessMessage('공지사항이 수정되었습니다.')
      } else {
        await createNotice({ ...form, authorUid: user.uid })
        setSuccessMessage('공지사항이 등록되었습니다.')
      }

      resetForm()
      await loadNotices()
    } catch (error) {
      setErrorMessage(getNoticeErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const startEditing = (notice) => {
    setEditingId(notice.id)
    setForm({ title: notice.title, content: notice.content })
    setErrorMessage('')
    setSuccessMessage('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const removeNotice = async (notice) => {
    if (!window.confirm(`"${notice.title}" 공지사항을 삭제하시겠습니까?`)) return

    setErrorMessage('')
    setSuccessMessage('')

    try {
      await deleteNotice(notice.id)
      setNotices((current) => current.filter((item) => item.id !== notice.id))
      if (editingId === notice.id) resetForm()
      setSuccessMessage('공지사항이 삭제되었습니다.')
    } catch (error) {
      setErrorMessage(getNoticeErrorMessage(error))
    }
  }

  return (
    <div className={styles.noticeManagement}>
      <section className={styles.noticeFormPanel}>
        <div className={styles.managementHeading}>
          <div>
            <span>NOTICE FORM</span>
            <h3>{editingId ? '공지사항 수정' : '공지사항 작성'}</h3>
          </div>
          {editingId && <button type='button' onClick={resetForm}>수정 취소</button>}
        </div>

        <form className={styles.noticeForm} onSubmit={submitNotice}>
          <label>
            <span>제목</span>
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({
                ...current,
                title: event.target.value,
              }))}
              maxLength='100'
              required
            />
          </label>
          <label>
            <span>내용</span>
            <textarea
              value={form.content}
              onChange={(event) => setForm((current) => ({
                ...current,
                content: event.target.value,
              }))}
              rows='10'
              required
            />
          </label>

          {(errorMessage || successMessage) && (
            <p
              className={errorMessage ? styles.formError : styles.formSuccess}
              role={errorMessage ? 'alert' : 'status'}
            >
              {errorMessage || successMessage}
            </p>
          )}

          <button className={styles.submitButton} type='submit' disabled={isSubmitting}>
            {isSubmitting ? '저장 중...' : editingId ? '공지사항 수정' : '공지사항 등록'}
          </button>
        </form>
      </section>

      <section className={styles.noticeListPanel}>
        <div className={styles.managementHeading}>
          <div>
            <span>NOTICES</span>
            <h3>공지사항 목록</h3>
          </div>
          <strong>{notices.length.toLocaleString('ko-KR')}건</strong>
        </div>

        {isLoading ? (
          <p className={styles.adminState} role='status'>공지사항을 불러오는 중입니다...</p>
        ) : notices.length === 0 ? (
          <p className={styles.adminState}>등록된 공지사항이 없습니다.</p>
        ) : (
          <div className={styles.adminNoticeList}>
            {notices.map((notice) => (
              <article key={notice.id}>
                <div>
                  <Link to={`/notice/${notice.id}`}>{notice.title}</Link>
                  <time>{formatNoticeDate(notice.createAt)}</time>
                </div>
                <div className={styles.noticeActions}>
                  <button type='button' onClick={() => startEditing(notice)}>수정</button>
                  <button type='button' onClick={() => removeNotice(notice)}>삭제</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default AdminNotices
