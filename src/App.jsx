import React, { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import AdminRoute from './components/AdminRoute'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Cart from './pages/Cart'
import WishList from './pages/Wishlist'
import MyPage from './pages/MyPage'
import Admin from './pages/Admin'

import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import SearchResult from './pages/SearchResult'
import Notice from './pages/Notice'
import NoticeDetail from './pages/NoticeDetail'
import NotFound from './pages/NotFound'
import useAuthStore from './store/authStore'

const App = () => {
  const initializeAuth = useAuthStore((state) => state.initializeAuth)

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return (
    <div>
      <Header />
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
        <Route path='/products/:category' element={<Products />} />
        <Route path='/search/:keyword' element={<SearchResult />} />
        <Route path='*' element={<NotFound />} />
        <Route path='/products' element={<Products />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App
