import React, { useEffect } from 'react'
import styles from './Modal.module.scss'

const Modal = ({ isOpen, title, children, onClose }) => {
  useEffect(() => {
    if (!isOpen) return undefined

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className={styles.backdrop} role='presentation' onMouseDown={onClose}>
      <section
        className={styles.modal}
        role='dialog'
        aria-modal='true'
        aria-labelledby='modal-title'
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className={styles.closeButton} type='button' onClick={onClose} aria-label='닫기'>
          ×
        </button>
        <h2 id='modal-title'>{title}</h2>
        {children}
      </section>
    </div>
  )
}

export default Modal
