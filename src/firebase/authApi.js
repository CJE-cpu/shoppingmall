import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { auth } from './firebase'

export const signUp = async (email, password, nickname) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const { user } = userCredential

  await updateProfile(user, { displayName: nickname })

  return user
}

export const login = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return userCredential.user
}

export const signOutUser = () => signOut(auth)

export const observeAuthState = (callback) => onAuthStateChanged(auth, callback)

export const getAuthErrorMessage = (error) => {
  const messages = {
    'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
    'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않습니다.',
    'auth/invalid-email': '올바른 이메일 주소를 입력해 주세요.',
    'auth/missing-password': '비밀번호를 입력해 주세요.',
    'auth/network-request-failed': '네트워크 연결을 확인한 뒤 다시 시도해 주세요.',
    'auth/operation-not-allowed': '이메일/비밀번호 로그인이 활성화되지 않았습니다.',
    'auth/too-many-requests': '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
    'auth/user-disabled': '사용이 중지된 계정입니다.',
    'auth/weak-password': '비밀번호는 6자 이상 입력해 주세요.',
  }

  return messages[error?.code] ?? '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'
}
