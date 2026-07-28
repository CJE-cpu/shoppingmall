import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './MainBanner.module.scss'

const MainBanner = () => {
  const [banners, setBanners] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  useEffect(()=>{
    const loadBanners = async() => {
      const res = await fetch('/data/banners.json')
      const bannerData = await res.json()
      setBanners(bannerData)
    }

    loadBanners()
  }, [])

  useEffect(() => {
    if(banners.length === 0){
      return undefined
    }
    const timer = setInterval(() => {
      setCurrentIndex((idx) => {
        if(idx === banners.length - 1){
          return 0
        }
        return idx + 1
      })
    }, 4000)

    return () => clearInterval(timer)
  }, [banners.length])

  if(banners.length === 0){
    return <section className={styles.loading}>배너를 불러오는 중입니다</section>
  }
  const currentBanner = banners[currentIndex]

  const onprev = () => {
    if(currentIndex === 0){
      setCurrentIndex(banners.length-1)
    }else{
      setCurrentIndex(currentIndex-1)
    }
  }
  const onnext = () => {
    if(currentIndex === banners.length-1){
      setCurrentIndex(0)
    }else{
      setCurrentIndex(currentIndex+1)
    }
  }
  return (
    <section className={styles.banner}>
      <img key={currentBanner.id} src={currentBanner.image} alt=''/>
      <div className={styles.overlay}>
        <div className={styles.textBox}>
          <p>{currentBanner.eyebrow}</p>
          <h1>{currentBanner.title}</h1>
          <p>{currentBanner.description}</p>
          <Link to='/products'>상품 보러가기 <img src='/img/banner/banner-arrow.png' alt='' /></Link>
        </div>
        <button className={`${styles.arrow} ${styles.prev}`} onClick={onprev} aria-label='이전 배너'><img src='/img/banner/banner-arrow.png' alt='' /></button>
        <button className={`${styles.arrow} ${styles.next}`} onClick={onnext} aria-label='다음 배너'><img src='/img/banner/banner-arrow.png' alt='' /></button>
        <div className={styles.numbers}>
          <p>{currentIndex+1}/{banners.length}</p>
        </div>
      </div>
    </section>
  )
}

export default MainBanner
