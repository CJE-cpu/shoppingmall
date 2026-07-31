import useAuthStore from '../store/authStore'

const useAuth = () => {
  const user = useAuthStore((state) => state.user)
  const role = useAuthStore((state) => state.role)
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading)
  const isRoleLoading = useAuthStore((state) => state.isRoleLoading)
  const roleError = useAuthStore((state) => state.roleError)
  return {
    user,
    role,
    isAdmin: role === 'admin',
    isAuthLoading,
    isRoleLoading,
    roleError,
  }
}

export default useAuth
