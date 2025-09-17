import React from 'react'
import { TryOnAnimatorProps } from './types'
import styles from './TryOnAnimator.module.scss'

export const TryOnAnimator = ({ imageUrl, isAnimating, className }: TryOnAnimatorProps) => {
  return (
    <div
      className={`
        ${styles.tryOnAnimator}
        ${isAnimating ? styles.tryOnAnimator_animating : ''}
        ${className || ''}
      `}
    >
      <img
        src={imageUrl}
        width={280}
        height={460}
        loading="lazy"
        alt="Try-on image"
        className={styles.image}
      />
    </div>
  )
}
