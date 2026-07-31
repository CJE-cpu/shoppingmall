import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  deleteUserCartItem,
  getCartErrorMessage,
  getUserCartItems,
} from '../firebase/cartApi'
import { getOrderErrorMessage, getUserOrders } from '../firebase/orderApi'
import {
  getOrCreateUserProfile,
  getUserErrorMessage,
  updateUserNickname,
  updateUserPassword,
} from '../firebase/userApi'
import {
  deleteUserWishlistItem,
  getUserWishlistItems,
  getWishlistErrorMessage,
} from '../firebase/wishlistApi'
import useAuthStore from '../store/authStore'
import styles from './MyPage.module.scss'

const MY_PAGE_SECTIONS = [
  {
    id: 'member-information',
    number: '01',
    title: '회원 정보',
    description: '가입한 회원 정보를 확인할 수 있는 영역입니다.',
  },
  {
    id: 'member-edit',
    number: '02',
    title: '회원 정보 수정',
    description: '닉네임과 회원 정보를 관리할 수 있는 영역입니다.',
  },
  {
    id: 'orders',
    number: '03',
    title: '주문 내역',
    description: '주문한 상품과 배송 상태를 확인할 수 있는 영역입니다.',
    emptyMessage: '주문 내역 데이터는 아직 연결되지 않았습니다.',
  },
  {
    id: 'cart',
    number: '04',
    title: '장바구니',
    description: '장바구니에 담은 상품을 확인할 수 있는 영역입니다.',
    emptyMessage: '장바구니 데이터는 아직 연결되지 않았습니다.',
  },
  {
    id: 'wishlist',
    number: '05',
    title: '찜한 상품',
    description: '관심 상품을 모아 확인할 수 있는 영역입니다.',
    emptyMessage: '찜한 상품 데이터는 아직 연결되지 않았습니다.',
  },
]

const formatJoinDate = (value) => {
  if (!value) return '확인할 수 없음'

  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return '확인할 수 없음'

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const MyPage = () => {
  const user = useAuthStore((state) => state.user)
  const [profile, setProfile] = useState(null)
  const [isProfileLoading, setIsProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState('')
  const [nickname, setNickname] = useState('')
  const [nicknameMessage, setNicknameMessage] = useState('')
  const [isNicknameSubmitting, setIsNicknameSubmitting] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    passwordConfirm: '',
  })
  const [passwordMessage, setPasswordMessage] = useState('')
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false)
  const [orders, setOrders] = useState([])
  const [isOrdersLoading, setIsOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState('')
  const [cartItems, setCartItems] = useState([])
  const [isCartLoading, setIsCartLoading] = useState(true)
  const [cartError, setCartError] = useState('')
  const [deletingCartItemId, setDeletingCartItemId] = useState('')
  const [wishlistItems, setWishlistItems] = useState([])
  const [isWishlistLoading, setIsWishlistLoading] = useState(true)
  const [wishlistError, setWishlistError] = useState('')
  const [deletingWishlistItemId, setDeletingWishlistItemId] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadProfile = async () => {
      setIsProfileLoading(true)
      setProfileError('')

      try {
        const userProfile = await getOrCreateUserProfile(user)
        if (!isMounted) return

        setProfile(userProfile)
        setNickname(userProfile.nickname ?? '')
      } catch (error) {
        if (isMounted) setProfileError(getUserErrorMessage(error))
      } finally {
        if (isMounted) setIsProfileLoading(false)
      }
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [user])

  useEffect(() => {
    let isMounted = true

    const loadOrders = async () => {
      setIsOrdersLoading(true)
      setOrdersError('')

      try {
        const userOrders = await getUserOrders(user.uid)
        if (isMounted) setOrders(userOrders)
      } catch (error) {
        if (isMounted) setOrdersError(getOrderErrorMessage(error))
      } finally {
        if (isMounted) setIsOrdersLoading(false)
      }
    }

    loadOrders()

    return () => {
      isMounted = false
    }
  }, [user.uid])

  useEffect(() => {
    let isMounted = true

    const loadWishlistItems = async () => {
      setIsWishlistLoading(true)
      setWishlistError('')

      try {
        const userWishlistItems = await getUserWishlistItems(user.uid)
        if (isMounted) setWishlistItems(userWishlistItems)
      } catch (error) {
        if (isMounted) setWishlistError(getWishlistErrorMessage(error))
      } finally {
        if (isMounted) setIsWishlistLoading(false)
      }
    }

    loadWishlistItems()

    return () => {
      isMounted = false
    }
  }, [user.uid])

  useEffect(() => {
    let isMounted = true

    const loadCartItems = async () => {
      setIsCartLoading(true)
      setCartError('')

      try {
        const userCartItems = await getUserCartItems(user.uid)
        if (isMounted) setCartItems(userCartItems)
      } catch (error) {
        if (isMounted) setCartError(getCartErrorMessage(error))
      } finally {
        if (isMounted) setIsCartLoading(false)
      }
    }

    loadCartItems()

    return () => {
      isMounted = false
    }
  }, [user.uid])

  const submitNickname = async (event) => {
    event.preventDefault()
    const nextNickname = nickname.trim()
    setNicknameMessage('')

    if (nextNickname.length < 2 || nextNickname.length > 20) {
      setNicknameMessage('닉네임은 2자 이상 20자 이하로 입력해 주세요.')
      return
    }

    setIsNicknameSubmitting(true)

    try {
      await updateUserNickname({ uid: user.uid, nickname: nextNickname })
      setProfile((current) => ({ ...current, nickname: nextNickname }))
      setNickname(nextNickname)
      setNicknameMessage('닉네임이 변경되었습니다.')
    } catch (error) {
      setNicknameMessage(getUserErrorMessage(error))
    } finally {
      setIsNicknameSubmitting(false)
    }
  }

  const changePasswordForm = (event) => {
    const { name, value } = event.target
    setPasswordForm((current) => ({ ...current, [name]: value }))
  }

  const submitPassword = async (event) => {
    event.preventDefault()
    setPasswordMessage('')

    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage('새 비밀번호는 6자 이상 입력해 주세요.')
      return
    }

    if (passwordForm.newPassword !== passwordForm.passwordConfirm) {
      setPasswordMessage('새 비밀번호가 서로 일치하지 않습니다.')
      return
    }

    setIsPasswordSubmitting(true)

    try {
      await updateUserPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      setPasswordForm({ currentPassword: '', newPassword: '', passwordConfirm: '' })
      setPasswordMessage('비밀번호가 변경되었습니다.')
    } catch (error) {
      setPasswordMessage(getUserErrorMessage(error))
    } finally {
      setIsPasswordSubmitting(false)
    }
  }

  const removeCartItem = async (item) => {
    if (!window.confirm(`${item.name} 상품을 장바구니에서 삭제하시겠습니까?`)) return

    setCartError('')
    setDeletingCartItemId(item.id)

    try {
      await deleteUserCartItem({ uid: user.uid, itemId: item.id })
      setCartItems((current) => current.filter((cartItem) => cartItem.id !== item.id))
    } catch (error) {
      setCartError(getCartErrorMessage(error))
    } finally {
      setDeletingCartItemId('')
    }
  }

  const cartTotalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  )

  const removeWishlistItem = async (item) => {
    if (!window.confirm(`${item.name} 상품을 찜 목록에서 삭제하시겠습니까?`)) return

    setWishlistError('')
    setDeletingWishlistItemId(item.id)

    try {
      await deleteUserWishlistItem({ uid: user.uid, itemId: item.id })
      setWishlistItems((current) => current.filter(
        (wishlistItem) => wishlistItem.id !== item.id,
      ))
    } catch (error) {
      setWishlistError(getWishlistErrorMessage(error))
    } finally {
      setDeletingWishlistItemId('')
    }
  }

  const wishlistTotalPrice = wishlistItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  )

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <p>MY DRIVE</p>
        <h1>마이페이지</h1>
        <span>회원 정보와 쇼핑 활동을 한곳에서 관리하세요.</span>
      </header>

      <nav className={styles.sectionNav} aria-label='마이페이지 메뉴'>
        {MY_PAGE_SECTIONS.map((section) => (
          <a key={section.id} href={`#${section.id}`}>{section.title}</a>
        ))}
      </nav>

      <div className={styles.content}>
        <section className={styles.panel} id='member-information'>
          <header className={styles.panelHeading}>
            <span>01</span>
            <div>
              <h2>회원 정보</h2>
              <p>가입한 회원 정보를 확인할 수 있는 영역입니다.</p>
            </div>
          </header>

          {isProfileLoading ? (
            <p className={styles.stateMessage} role='status'>회원 정보를 불러오는 중입니다...</p>
          ) : profileError ? (
            <p className={styles.errorMessage} role='alert'>{profileError}</p>
          ) : (
            <dl className={styles.profileList}>
              <div><dt>닉네임</dt><dd>{profile.nickname}</dd></div>
              <div><dt>이메일</dt><dd>{profile.email}</dd></div>
              <div><dt>가입일</dt><dd>{formatJoinDate(profile.createAt)}</dd></div>
            </dl>
          )}
        </section>

        <section className={styles.panel} id='member-edit'>
          <header className={styles.panelHeading}>
            <span>02</span>
            <div>
              <h2>회원 정보 수정</h2>
              <p>닉네임과 비밀번호를 안전하게 변경할 수 있습니다.</p>
            </div>
          </header>

          <div className={styles.editGrid}>
            <form className={styles.editForm} onSubmit={submitNickname}>
              <div className={styles.formHeading}>
                <h3>닉네임 변경</h3>
                <p>2자 이상 20자 이하로 입력해 주세요.</p>
              </div>
              <label>
                <span>닉네임</span>
                <input
                  type='text'
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  minLength='2'
                  maxLength='20'
                  disabled={isProfileLoading || Boolean(profileError)}
                  required
                />
              </label>
              {nicknameMessage && <p className={styles.formMessage} role='status'>{nicknameMessage}</p>}
              <button type='submit' disabled={isNicknameSubmitting || isProfileLoading || Boolean(profileError)}>
                {isNicknameSubmitting ? '변경 중...' : '닉네임 변경'}
              </button>
            </form>

            <form className={styles.editForm} onSubmit={submitPassword}>
              <div className={styles.formHeading}>
                <h3>비밀번호 변경</h3>
                <p>본인 확인을 위해 현재 비밀번호를 입력해 주세요.</p>
              </div>
              <label>
                <span>현재 비밀번호</span>
                <input
                  type='password'
                  name='currentPassword'
                  value={passwordForm.currentPassword}
                  onChange={changePasswordForm}
                  autoComplete='current-password'
                  required
                />
              </label>
              <label>
                <span>새 비밀번호</span>
                <input
                  type='password'
                  name='newPassword'
                  value={passwordForm.newPassword}
                  onChange={changePasswordForm}
                  autoComplete='new-password'
                  minLength='6'
                  required
                />
              </label>
              <label>
                <span>새 비밀번호 확인</span>
                <input
                  type='password'
                  name='passwordConfirm'
                  value={passwordForm.passwordConfirm}
                  onChange={changePasswordForm}
                  autoComplete='new-password'
                  minLength='6'
                  required
                />
              </label>
              {passwordMessage && <p className={styles.formMessage} role='status'>{passwordMessage}</p>}
              <button type='submit' disabled={isPasswordSubmitting}>
                {isPasswordSubmitting ? '변경 중...' : '비밀번호 변경'}
              </button>
            </form>
          </div>
        </section>

        <section className={styles.panel} id='orders'>
          <header className={styles.panelHeading}>
            <span>03</span>
            <div>
              <h2>주문 내역</h2>
              <p>주문한 상품과 주문 정보를 확인할 수 있습니다.</p>
            </div>
          </header>

          {isOrdersLoading ? (
            <p className={styles.stateMessage} role='status'>주문 내역을 불러오는 중입니다...</p>
          ) : ordersError ? (
            <p className={styles.errorMessage} role='alert'>{ordersError}</p>
          ) : orders.length === 0 ? (
            <div className={styles.emptyOrders}>
              <span aria-hidden='true'>◇</span>
              <p>아직 주문 내역이 없습니다</p>
              <Link to='/products'>상품 목록으로 이동</Link>
            </div>
          ) : (
            <div className={styles.orderList}>
              {orders.map((order) => (
                <article className={styles.orderItem} key={order.id}>
                  <div className={styles.orderMeta}>
                    <span>주문일</span>
                    <strong>{formatJoinDate(order.createAt)}</strong>
                  </div>
                  <div className={styles.orderProducts}>
                    {order.items.map((item, index) => (
                      <div key={`${order.id}-${index}`}>
                        <span>
                          <small>상품명</small>
                          <strong>{item.name}</strong>
                        </span>
                        <span>
                          <small>수량</small>
                          <strong>{item.quantity.toLocaleString('ko-KR')}개</strong>
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className={styles.orderTotal}>
                    <span>주문 금액</span>
                    <strong>{order.totalPrice.toLocaleString('ko-KR')}원</strong>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className={styles.panel} id='cart'>
          <header className={styles.panelHeading}>
            <span>04</span>
            <div>
              <h2>장바구니</h2>
              <p>Firestore 장바구니에 담긴 상품을 확인할 수 있습니다.</p>
            </div>
          </header>

          {isCartLoading ? (
            <p className={styles.stateMessage} role='status'>장바구니를 불러오는 중입니다...</p>
          ) : cartError ? (
            <p className={styles.errorMessage} role='alert'>{cartError}</p>
          ) : cartItems.length === 0 ? (
            <div className={styles.emptyCart}>
              <span aria-hidden='true'>◇</span>
              <p>장바구니가 비어 있습니다</p>
              <Link to='/cart'>장바구니 페이지로 이동</Link>
            </div>
          ) : (
            <div className={styles.cartContent}>
              <div className={styles.cartList}>
                {cartItems.map((item) => (
                  <article className={styles.cartRow} key={item.id}>
                    <div>
                      <small>상품명</small>
                      <strong>{item.name}</strong>
                    </div>
                    <div>
                      <small>가격</small>
                      <strong>{item.price.toLocaleString('ko-KR')}원</strong>
                    </div>
                    <div>
                      <small>수량</small>
                      <strong>{item.quantity.toLocaleString('ko-KR')}개</strong>
                    </div>
                    <div>
                      <small>상품별 금액</small>
                      <strong>{(item.price * item.quantity).toLocaleString('ko-KR')}원</strong>
                    </div>
                    <button
                      type='button'
                      onClick={() => removeCartItem(item)}
                      disabled={deletingCartItemId === item.id}
                    >
                      {deletingCartItemId === item.id ? '삭제 중...' : '삭제'}
                    </button>
                  </article>
                ))}
              </div>
              <div className={styles.cartTotal}>
                <span>전체 합계 금액</span>
                <strong>{cartTotalPrice.toLocaleString('ko-KR')}원</strong>
                <Link to='/cart'>장바구니 페이지로 이동</Link>
              </div>
            </div>
          )}
        </section>

        <section className={styles.panel} id='wishlist'>
          <header className={styles.panelHeading}>
            <span>05</span>
            <div>
              <h2>찜한 상품</h2>
              <p>Firestore 찜 목록에 저장된 관심 상품을 확인할 수 있습니다.</p>
            </div>
          </header>

          {isWishlistLoading ? (
            <p className={styles.stateMessage} role='status'>찜 목록을 불러오는 중입니다...</p>
          ) : wishlistError ? (
            <p className={styles.errorMessage} role='alert'>{wishlistError}</p>
          ) : wishlistItems.length === 0 ? (
            <div className={styles.emptyWishlist}>
              <span aria-hidden='true'>◇</span>
              <p>아직 찜한 상품이 없습니다</p>
              <Link to='/products'>상품 목록으로 이동</Link>
            </div>
          ) : (
            <div className={styles.wishlistContent}>
              <div className={styles.wishlistList}>
                {wishlistItems.map((item) => (
                  <article className={styles.wishlistRow} key={item.id}>
                    <div className={styles.wishlistImage}>
                      {item.image ? (
                        <img src={item.image} alt={item.name} />
                      ) : (
                        <span>이미지 없음</span>
                      )}
                    </div>
                    <div className={styles.wishlistName}>
                      <small>상품명</small>
                      <strong>{item.name}</strong>
                    </div>
                    <div>
                      <small>가격</small>
                      <strong>{item.price.toLocaleString('ko-KR')}원</strong>
                    </div>
                    <div>
                      <small>수량</small>
                      <strong>{item.quantity.toLocaleString('ko-KR')}개</strong>
                    </div>
                    <div>
                      <small>상품별 금액</small>
                      <strong>{(item.price * item.quantity).toLocaleString('ko-KR')}원</strong>
                    </div>
                    <button
                      type='button'
                      onClick={() => removeWishlistItem(item)}
                      disabled={deletingWishlistItemId === item.id}
                    >
                      {deletingWishlistItemId === item.id ? '삭제 중...' : '삭제'}
                    </button>
                  </article>
                ))}
              </div>
              <div className={styles.wishlistTotal}>
                <span>전체 합계 금액</span>
                <strong>{wishlistTotalPrice.toLocaleString('ko-KR')}원</strong>
                <Link to='/products'>상품 목록으로 이동</Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default MyPage
