import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
} from 'firebase/auth'
import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { auth, db } from './firebase'

const getDefaultNickname = (user) => {
  const nickname = user.displayName?.trim()
    || user.email?.split('@')[0]?.trim()
    || '신규회원'

  return nickname.length >= 2 ? nickname.slice(0, 20) : '신규회원'
}

export const getUserRole = async (uid) => {
  const userSnapshot = await getDoc(doc(db, 'users', uid))

  if (!userSnapshot.exists()) return null

  return userSnapshot.data().role ?? null
}

export const getUser = async (uid) => {
  const userSnapshot = await getDoc(doc(db, 'users', uid))

  if (!userSnapshot.exists()) return null

  return {
    id: userSnapshot.id,
    ...userSnapshot.data(),
  }
}

export const createUserProfile = ({ uid, email, nickname }) => setDoc(
  doc(db, 'users', uid),
  {
    email,
    nickname,
    role: 'user',
    createAt: serverTimestamp(),
  },
)

export const getOrCreateUserProfile = async (user) => {
  const userRef = doc(db, 'users', user.uid)

  await runTransaction(db, async (transaction) => {
    const userSnapshot = await transaction.get(userRef)

    if (userSnapshot.exists()) return

    transaction.set(userRef, {
      email: user.email,
      nickname: getDefaultNickname(user),
      role: 'user',
      createAt: serverTimestamp(),
    })
  })

  const userSnapshot = await getDoc(userRef)

  if (!userSnapshot.exists()) throw new Error('user-profile-create-failed')

  return {
    id: userSnapshot.id,
    ...userSnapshot.data(),
  }
}

export const updateUserNickname = async ({ uid, nickname }) => {
  await updateDoc(doc(db, 'users', uid), { nickname })

  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: nickname })
  }
}

export const updateUserPassword = async ({ currentPassword, newPassword }) => {
  const currentUser = auth.currentUser

  if (!currentUser?.email) {
    throw new Error('auth-user-not-found')
  }

  const credential = EmailAuthProvider.credential(currentUser.email, currentPassword)
  await reauthenticateWithCredential(currentUser, credential)
  await updatePassword(currentUser, newPassword)
}

export const getUserErrorMessage = (error) => {
  const messages = {
    'auth/invalid-credential': '현재 비밀번호가 올바르지 않습니다.',
    'auth/network-request-failed': '네트워크 연결을 확인한 뒤 다시 시도해 주세요.',
    'auth/requires-recent-login': '보안을 위해 다시 로그인한 후 비밀번호를 변경해 주세요.',
    'auth/too-many-requests': '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
    'auth/weak-password': '새 비밀번호는 6자 이상 입력해 주세요.',
    'permission-denied': '회원 정보에 접근할 권한이 없습니다.',
    'firestore/permission-denied': '회원 정보에 접근할 권한이 없습니다.',
    'user-profile-not-found': '저장된 회원 정보를 찾을 수 없습니다.',
    'user-profile-create-failed': '기본 회원 정보를 생성하지 못했습니다.',
    'auth-user-not-found': '로그인 사용자 정보를 확인할 수 없습니다.',
  }

  return messages[error?.code] ?? messages[error?.message]
    ?? '회원 정보를 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'
}
