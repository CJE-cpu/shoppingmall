import React from 'react'
import { Link } from 'react-router-dom'
import styles from './EmptyMessage.module.scss'

const EmptyMessage = ({
  image,
  title = '장바구니가 비어 있습니다',
  description = '마음에 드는 상품을 장바구니에 담아보세요.',
  link,
  linkText,
}) => {
  return (
    <div className={styles.emptyMessage}>
      {image && <img src={image} alt='' aria-hidden='true' />}
      <strong>{title}</strong>
      <p>{description}</p>
      {link && linkText && <Link to={link}>{linkText}</Link>}
    </div>
  )
}

export default EmptyMessage
