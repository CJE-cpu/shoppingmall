import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from './firebase'

const noticesCollection = collection(db, 'notices')

const normalizeNotice = (noticeDocument) => ({
  id: noticeDocument.id,
  ...noticeDocument.data(),
})

export const getNotices = async () => {
  const noticeSnapshot = await getDocs(query(
    noticesCollection,
    orderBy('createAt', 'desc'),
  ))

  return noticeSnapshot.docs.map(normalizeNotice)
}

export const getNoticeById = async (noticeId) => {
  const noticeSnapshot = await getDoc(doc(db, 'notices', noticeId))
  return noticeSnapshot.exists() ? normalizeNotice(noticeSnapshot) : null
}

export const createNotice = async ({ title, content, authorUid }) => {
  const noticeDocument = await addDoc(noticesCollection, {
    title: title.trim(),
    content: content.trim(),
    authorUid,
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  })

  return noticeDocument.id
}

export const updateNotice = async ({ noticeId, title, content }) => {
  await updateDoc(doc(db, 'notices', noticeId), {
    title: title.trim(),
    content: content.trim(),
    updateAt: serverTimestamp(),
  })
}

export const deleteNotice = async (noticeId) => {
  await deleteDoc(doc(db, 'notices', noticeId))
}

export const formatNoticeDate = (value) => {
  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export const getNoticeErrorMessage = (error) => {
  const messages = {
    'permission-denied': '공지사항을 처리할 권한이 없습니다.',
    'firestore/permission-denied': '공지사항을 처리할 권한이 없습니다.',
    unavailable: '공지사항 서비스를 일시적으로 사용할 수 없습니다.',
    'firestore/unavailable': '공지사항 서비스를 일시적으로 사용할 수 없습니다.',
  }

  return messages[error?.code]
    ?? '공지사항을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'
}
