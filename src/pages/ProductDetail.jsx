import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Modal from '../components/Modal'
import QuantityControl from '../components/QuantityControl'
import { getCartErrorMessage, saveUserCartItem } from '../firebase/cartApi'
import { createOrder, getOrderErrorMessage } from '../firebase/orderApi'
import { getProductById } from '../firebase/productApi'
import {
  deleteUserWishlistItem,
  getWishlistErrorMessage,
  hasUserWishlistItem,
  saveUserWishlistItem,
} from '../firebase/wishlistApi'
import useAuthStore from '../store/authStore'
import { DELIVERY_MINIMUM } from '../hooks/delivery'
import styles from './ProductDetail.module.scss'

const CATEGORY_FEATURES = {
  domestic: ['차량 구조를 고려한 맞춤 설계', '일상 주행에 적합한 편의성과 내구성', '구매 전 차종과 연식을 확인해 주세요'],
  imported: ['수입차의 디자인과 규격을 고려한 설계', '기존 인테리어와 자연스럽게 어울리는 마감', '차량별 호환 여부 확인 후 장착을 권장합니다'],
  tuning: ['주행 성능과 드레스업을 함께 고려한 구성', '내구성이 우수한 자동차 전용 소재', '안전을 위해 전문 장착점 이용을 권장합니다'],
  diecast: ['차량의 특징을 살린 정교한 디테일', '전시와 수집에 적합한 컴팩트 사이즈', '작은 부품이 포함될 수 있어 취급에 주의해 주세요'],
  interior: ['운전자 중심의 간편한 사용성', '차량 실내에 자연스럽게 어울리는 디자인', '설치 위치를 깨끗이 정리한 뒤 사용해 주세요'],
  exterior: ['차량 외부 환경을 고려한 견고한 소재', '보관과 사용이 편리한 실용적인 구성', '사용 전 제품의 고정 상태를 확인해 주세요'],
}

const DELIVERY_FEE = 3000

const ProductDetail = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const user = useAuthStore((state) => state.user)
  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [isliked, setIsLiked] = useState(false)
  const [isWishlistUpdating, setIsWishlistUpdating] = useState(false)
  const [selectedImage, setSelectedImage] = useState('')
  const [isCartModalOpen, setIsCartModalOpen] = useState(false)
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false)
  const [isBuying, setIsBuying] = useState(false)

  useEffect(()=>{
    const loadPro = async () => {
      try {
        setIsLoading(true)
        const selectProduct = await getProductById(id)

        setProduct(selectProduct || null)
        setSelectedImage(selectProduct?.image || '')
        const saved = selectProduct && user
          ? await hasUserWishlistItem({
              uid: user.uid,
              productId: selectProduct.id,
            }).catch(() => false)
          : false
        setIsLiked(saved)
        setQuantity(1)
      } catch {
        setProduct(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadPro()
  }, [id, user])

  if(isLoading){
    return <p className={styles.stateMessage}>상품을 불러오는 중입니다...</p>
  }
  if(!product){
    return  (
      <div className={styles.stateMessage}>
        <p>상품을 확인할 수 없습니다</p>
        <Link to='/products'>상품 목록으로 이동</Link>
      </div>
    )
  }
  const discountRate = Number(product.discountRate) || 0
  const discountPrice = Math.round(product.price * (1 - discountRate / 100))
  const totalPrice = discountPrice * quantity
  const buyDeliveryFee = totalPrice >= DELIVERY_MINIMUM ? 0 : DELIVERY_FEE
  const buyTotalPrice = totalPrice + buyDeliveryFee
  const isSoldOut = product.stock === 0
  const productImages = product.images?.length ? product.images : [product.image]
  const galleryImages = [product.image].filter(Boolean)
  const detailImages = productImages.filter((image) => image && image !== product.image)
  const productFeatures = CATEGORY_FEATURES[product.categoryValue] || CATEGORY_FEATURES.interior

  const addTocart = async () => {
    if (isSoldOut) {
      window.alert('품절된 상품은 장바구니에 담을 수 없습니다.')
      return
    }

    if (!user) {
      navigate('/login', { state: { from: `/products/${product.id}` } })
      return
    }

    try {
      await saveUserCartItem({ uid: user.uid, product, quantity })
      setIsCartModalOpen(true)
    } catch (error) {
      window.alert(getCartErrorMessage(error))
    }
  }

  const buyNow = () => {
    if (isSoldOut) {
      window.alert('품절된 상품은 구매할 수 없습니다.')
      return
    }

    if (!user) {
      navigate('/login', { state: { from: `/products/${product.id}` } })
      return
    }

    setIsBuyModalOpen(true)
  }

  const confirmBuyNow = async () => {
    if (isBuying) return

    setIsBuying(true)

    try {
      await createOrder({
        userId: user.uid,
        items: [{
          productId: String(product.id),
          name: product.name,
          quantity,
          price: discountPrice,
        }],
        subtotal: totalPrice,
        deliveryFee: buyDeliveryFee,
        totalPrice: buyTotalPrice,
      })
      setIsBuyModalOpen(false)
      window.alert('주문이 완료되었습니다.')
      navigate('/mypage#orders')
    } catch (error) {
      window.alert(getOrderErrorMessage(error))
    } finally {
      setIsBuying(false)
    }
  }

  const changeWishlist = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/products/${product.id}` } })
      return
    }

    if (isWishlistUpdating) return

    const nextLiked = !isliked
    setIsLiked(nextLiked)
    setIsWishlistUpdating(true)

    try {
      if (nextLiked) {
        await saveUserWishlistItem({ uid: user.uid, product })
      } else {
        await deleteUserWishlistItem({ uid: user.uid, itemId: String(product.id) })
      }
    } catch (error) {
      setIsLiked(!nextLiked)
      window.alert(getWishlistErrorMessage(error))
    } finally {
      setIsWishlistUpdating(false)
    }
  }
  const scrollTop = () => {
    window.scrollTo({
      top:0,
      behavior: 'smooth'
    })
  }
  return (
    <section className={styles.productDetail}>
      <button
        type='button'
        className={styles.topBtn}
        onClick={scrollTop}
        aria-label='페이지 맨 위로 이동'
      >
        TOP
      </button>
      <Link className={styles.backLink} to='/products'>
        <img src='/img/banner/banner-arrow.png' alt='' aria-hidden='true' />
        상품목록
      </Link>
      <div className={styles.productArea}>
        <div className={styles.galleryArea}>
          <div className={styles.imageArea}>
            <img src={selectedImage || product.image} alt={product.name}/>
          </div>
          {galleryImages.length > 1 && (
            <div className={styles.thumbnails} aria-label='상품 이미지 갤러리'>
              {galleryImages.map((image, index) => (
                <button
                  key={image}
                  type='button'
                  className={styles.thumbnailItem}
                  data-active={selectedImage === image}
                  onClick={() => setSelectedImage(image)}
                  aria-label={`${index + 1}번째 상품 이미지 크게 보기`}
                  aria-pressed={selectedImage === image}
                >
                  <img src={image} alt={`${product.name} ${index + 1}번째 이미지`} />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className={styles.infoArea}>
          <div className={styles.productMeta}>
            {product.badge && <span className={styles.productBadge}>{product.badge}</span>}
            <span>{product.category}</span>
            <span>{product.brand}</span>
            <span>상품번호 {String(product.id).padStart(4, '0')}</span>
          </div>
          <h2>{product.name}</h2>
          {(product.rating || product.reviews) && (
            <div className={styles.reviewSummary} aria-label='상품 평가'>
              {product.rating && (
                <span>
                  <b aria-hidden='true'>★</b>
                  <strong>{product.rating}</strong>
                  <span className={styles.a11yText}>점</span>
                </span>
              )}
              {product.reviews > 0 && <span>리뷰 {product.reviews.toLocaleString('ko-KR')}개</span>}
            </div>
          )}
          <p>{product.description}</p>
        </div>
        <div className={styles.priceArea}>
          <div className={styles.priceMeta}>
            <span>{discountRate > 0 ? `${discountRate}% 할인` : '정상가'}</span>
            <del data-visible={discountRate > 0}>
              {discountRate > 0 ? `${product.price.toLocaleString()}원` : '\u00a0'}
            </del>
          </div>
          <strong>{discountPrice.toLocaleString()}원</strong>
        </div>
        <div className={styles.deliveryArea}>
          <span>배송비</span>
          <strong>
            {DELIVERY_FEE.toLocaleString()}원
            <small>({DELIVERY_MINIMUM.toLocaleString()}원 이상 무료배송)</small>
          </strong>
        </div>
        <div className={styles.quantityArea}>
          <span>수량</span>
          <QuantityControl
            quantity={quantity}
            setQuantity={setQuantity}
            maxQuantity={product.stock}
            disabled={isSoldOut}
          />
          <small className={isSoldOut ? styles.soldOutText : undefined}>
            {isSoldOut ? '품절' : `재고 ${product.stock}개`}
          </small>
        </div>
        <div className={styles.totalArea}>
          <span>총 상품금액</span>
          <strong>{isSoldOut ? '구매 불가' : `${totalPrice.toLocaleString()}원`}</strong>
        </div>
        <div className={styles.actionArea}>
          <button type='button' onClick={addTocart} disabled={isSoldOut}>
            {isSoldOut ? '품절' : '장바구니'}
          </button>
          <button
            type='button'
            onClick={buyNow}
            disabled={isSoldOut || isBuying}
          >
            {isSoldOut ? '구매 불가' : isBuying ? '주문 중...' : '바로 구매'}
          </button>
          <button
            className={styles.wishlistButton}
            type='button'
            onClick={changeWishlist}
            aria-label={isliked ? '찜 해제' : '찜하기'}
            aria-pressed={isliked}
          >
            <img
              src={isliked ? '/img/icon/wishlist-active.png' : '/img/icon/wishlist.png'}
              alt=''
              aria-hidden='true'
            />
          </button>
        </div>
      </div>
      <section className={styles.detailContent}>
        <nav className={styles.detailNav} aria-label='상품 상세 정보 메뉴'>
          <a href='#product-information'>상품상세정보</a>
          <a href='#purchase-guide'>상품구매안내</a>
          <a href='#delivery-guide'>배송·교환안내</a>
        </nav>

        <div className={styles.descriptionSection} id='product-information'>
          <p className={styles.sectionEyebrow}>{product.brand} PRODUCT GUIDE</p>
          <h2>{product.name}</h2>
          <p className={styles.descriptionLead}>{product.description}</p>

          <div className={styles.featureGrid}>
            {productFeatures.map((feature, index) => (
              <article key={feature}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <p>{feature}</p>
              </article>
            ))}
          </div>

          {detailImages.length > 0 && (
            <div className={styles.detailGallery}>
              {detailImages.map((image, index) => (
                <figure className={styles.detailVisual} key={image}>
                  <div className={styles.detailImageFrame}>
                    <img
                      src={image}
                      alt={`${product.name} 상세 이미지 ${index + 1}`}
                      loading='lazy'
                      decoding='async'
                    />
                  </div>
                  <figcaption>
                    <span>DETAIL {String(index + 1).padStart(2, '0')}</span>
                    <strong>
                      {index === 0
                        ? '제품의 소재와 마감을 자세히 확인해 보세요.'
                        : '실제 사용 모습과 주요 특징을 확인해 보세요.'}
                    </strong>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>

        <div className={styles.purchaseGuide} id='purchase-guide'>
          <div>
            <p className={styles.sectionEyebrow}>PRODUCT INFORMATION</p>
            <h2>상품 정보</h2>
          </div>
          <dl className={styles.productSpecs}>
            <div><dt>상품명</dt><dd>{product.name}</dd></div>
            <div><dt>브랜드</dt><dd>{product.brand}</dd></div>
            <div><dt>분류</dt><dd>{product.category}</dd></div>
            <div><dt>상품번호</dt><dd>{String(product.id).padStart(4, '0')}</dd></div>
            <div><dt>판매가</dt><dd>{discountPrice.toLocaleString('ko-KR')}원</dd></div>
            <div><dt>재고</dt><dd>{isSoldOut ? '품절' : `${product.stock.toLocaleString('ko-KR')}개`}</dd></div>
            {(product.rating || product.reviews) && (
              <div>
                <dt>상품평</dt>
                <dd>
                  {product.rating ? `평점 ${product.rating}` : ''}
                  {product.rating && product.reviews ? ' · ' : ''}
                  {product.reviews ? `리뷰 ${product.reviews.toLocaleString('ko-KR')}개` : ''}
                </dd>
              </div>
            )}
            <div><dt>배송방법</dt><dd>택배</dd></div>
            <div>
              <dt>배송비</dt>
              <dd>{DELIVERY_FEE.toLocaleString('ko-KR')}원 ({DELIVERY_MINIMUM.toLocaleString('ko-KR')}원 이상 무료)</dd>
            </div>
            <div><dt>배송기간</dt><dd>결제 완료 후 1~3영업일</dd></div>
          </dl>
        </div>

        <div className={styles.deliveryGuide} id='delivery-guide'>
          <article>
            <span>DELIVERY</span>
            <h3>배송 안내</h3>
            <p>전국 택배 배송을 기본으로 하며, 도서·산간 지역은 추가 배송비가 발생할 수 있습니다.</p>
            <p>주문 상품의 재고나 장착 품목의 준비 상황에 따라 출고가 다소 지연될 수 있습니다.</p>
          </article>
          <article>
            <span>RETURN & EXCHANGE</span>
            <h3>교환 및 반품 안내</h3>
            <p>상품 수령 후 7일 이내에 교환 또는 반품을 신청할 수 있습니다.</p>
            <p>장착·사용 흔적이 있거나 고객 과실로 상품 가치가 훼손된 경우 처리가 제한될 수 있습니다.</p>
          </article>
        </div>
      </section>
      <Modal
        isOpen={isCartModalOpen}
        title='장바구니에 담았습니다'
        onClose={() => setIsCartModalOpen(false)}
      >
        <div className={styles.cartConfirmation}>
          <div className={styles.confirmProduct}>
            <img src={selectedImage || product.image} alt='' />
            <div>
              <strong>{product.name}</strong>
              <span>
                {discountPrice.toLocaleString()}원 · {quantity}개
              </span>
              <b>합계 {(discountPrice * quantity).toLocaleString()}원</b>
            </div>
          </div>
          <div className={styles.confirmActions}>
            <button type='button' onClick={() => setIsCartModalOpen(false)}>계속 쇼핑</button>
            <Link to='/cart'>장바구니로 이동</Link>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isBuyModalOpen}
        title='구매 내용을 확인해 주세요'
        onClose={() => {
          if (!isBuying) setIsBuyModalOpen(false)
        }}
      >
        <div className={styles.purchaseConfirmation}>
          <div className={styles.purchaseProduct}>
            <img src={selectedImage || product.image} alt='' />
            <div>
              <span>{product.category}</span>
              <strong>{product.name}</strong>
              <small>{discountPrice.toLocaleString('ko-KR')}원 · {quantity}개</small>
            </div>
          </div>

          <dl className={styles.purchaseSummary}>
            <div>
              <dt>상품 금액</dt>
              <dd>{totalPrice.toLocaleString('ko-KR')}원</dd>
            </div>
            <div>
              <dt>배송비</dt>
              <dd>{buyDeliveryFee === 0 ? '무료' : `${buyDeliveryFee.toLocaleString('ko-KR')}원`}</dd>
            </div>
            <div>
              <dt>총 결제금액</dt>
              <dd>{buyTotalPrice.toLocaleString('ko-KR')}원</dd>
            </div>
          </dl>

          <p className={styles.purchaseNotice}>
            구매하기를 누르면 주문이 접수되고 상품 재고가 차감됩니다.
          </p>

          <div className={styles.purchaseActions}>
            <button
              type='button'
              onClick={() => setIsBuyModalOpen(false)}
              disabled={isBuying}
            >
              취소
            </button>
            <button type='button' onClick={confirmBuyNow} disabled={isBuying}>
              {isBuying ? '주문 처리 중...' : '구매하기'}
            </button>
          </div>
        </div>
      </Modal>
    </section>
  )
}

export default ProductDetail
