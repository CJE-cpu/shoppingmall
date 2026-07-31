import { create } from 'zustand'
import {
  getAuthErrorMessage,
  login as loginWithEmail,
  observeAuthState,
  signOutUser,
  signUp as signUpWithEmail,
} from '../firebase/authApi'
import {
  createUserProfile,
  getUser,
  getUserErrorMessage,
} from '../firebase/userApi'

let unsubscribeAuth = null

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: false,
  error: '',
  role: null,
  isAuthLoading: true,
  isRoleLoading: true,
  roleError: '',
  clearError: () => set({ error: '' }),
  login: async (email, password) => {
    if (get().loading) return null

    set({ loading: true, error: '' })

    try {
      const user = await loginWithEmail(email, password)
      const profile = await getUser(user.uid)
      set({
        user,
        profile,
        role: profile?.role ?? null,
        isRoleLoading: false,
      })
      return user
    } catch (error) {
      const message = error?.code?.startsWith('auth/')
        ? getAuthErrorMessage(error)
        : getUserErrorMessage(error)
      set({ error: message })
      throw error
    } finally {
      set({ loading: false })
    }
  },
  signup: async (email, password, nickname) => {
    if (get().loading) return null

    set({ loading: true, error: '' })

    try {
      const user = await signUpWithEmail(email, password, nickname)
      await createUserProfile({
        uid: user.uid,
        email: user.email,
        nickname,
      })
      await getUser(user.uid)
      await signOutUser()
      set({
        user: null,
        profile: null,
        role: null,
        isAuthLoading: false,
        isRoleLoading: false,
      })
      return user
    } catch (error) {
      const message = error?.code?.startsWith('auth/')
        ? getAuthErrorMessage(error)
        : getUserErrorMessage(error)
      set({ error: message })
      throw error
    } finally {
      set({ loading: false })
    }
  },
  logout: async () => {
    set({ error: '' })

    try {
      await signOutUser()
    } catch (error) {
      set({ error: getAuthErrorMessage(error) })
      throw error
    }
  },
  initializeAuth: () => {
    if (unsubscribeAuth) return unsubscribeAuth

    unsubscribeAuth = observeAuthState(async (user) => {
      if (!user) {
        get().clearUser()
        return
      }

      get().setUser(user)

      try {
        const profile = await getUser(user.uid)
        if (useAuthStore.getState().user?.uid === user.uid) {
          set({
            profile,
            role: profile?.role ?? null,
            isRoleLoading: false,
            roleError: '',
          })
        }
      } catch {
        if (useAuthStore.getState().user?.uid === user.uid) {
          get().setRoleError('사용자 권한을 확인하지 못했습니다.')
        }
      }
    })

    return unsubscribeAuth
  },
  setUser: (user) => set((state) => {
    const isSameUser = state.user?.uid === user.uid

    return {
      user,
      profile: isSameUser ? state.profile : null,
      isAuthLoading: false,
      role: isSameUser ? state.role : null,
      isRoleLoading: isSameUser ? state.isRoleLoading : true,
      roleError: '',
    }
  }),
  setRole: (role) => set({
    role,
    isRoleLoading: false,
    roleError: '',
  }),
  setRoleError: (message) => set({
    role: null,
    isRoleLoading: false,
    roleError: message,
  }),
  clearUser: () => set({
    user: null,
    profile: null,
    role: null,
    isAuthLoading: false,
    isRoleLoading: false,
    roleError: '',
  }),
}))

export default useAuthStore
