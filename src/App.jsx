import React, { lazy, Suspense, useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import AdminRoute from './components/AdminRoute'
import ProtectedRoute from './components/ProtectedRoute'
import Loading from './components/Loading'
import useAuthStore from './store/authStore'

const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const SignUp = lazy(() => import('./pages/SignUp'))
const Cart = lazy(() => import('./pages/Cart'))
const WishList = lazy(() => import('./pages/Wishlist'))
const MyPage = lazy(() => import('./pages/MyPage'))
const Admin = lazy(() => import('./pages/Admin'))
const Products = lazy(() => import('./pages/Products'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const SearchResult = lazy(() => import('./pages/SearchResult'))
const Notice = lazy(() => import('./pages/Notice'))
const NoticeDetail = lazy(() => import('./pages/NoticeDetail'))
const NotFound = lazy(() => import('./pages/NotFound'))

const App = () => {
  const initializeAuth = useAuthStore((state) => state.initializeAuth)

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return (
    <div>
      <Header />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<SignUp />} />
        <Route
          path='/cart'
          element={(
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          )}
        />
        <Route
          path='/wishlist'
          element={(
            <ProtectedRoute>
              <WishList />
            </ProtectedRoute>
          )}
        />
        <Route
          path='/mypage'
          element={(
            <ProtectedRoute>
              <MyPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path='/admin/*'
          element={(
            <AdminRoute>
              <Admin />
            </AdminRoute>
          )}
        />
        <Route path='/notice' element={<Notice />} />
        <Route path='/notice/:id' element={<NoticeDetail />} />
        <Route path='/products/:id' element={<ProductDetail />} />
        <Route path='/products/category/:category' element={<Products />} />
        <Route path='/search/:keyword' element={<SearchResult />} />
        <Route path='*' element={<NotFound />} />
        <Route path='/products' element={<Products />} />
        </Routes>
      </Suspense>
      <Footer />
    </div>
  )
}

export default App
