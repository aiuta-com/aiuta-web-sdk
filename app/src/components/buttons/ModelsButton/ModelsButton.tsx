import React from 'react'
import { combineClassNames } from '@/utils'
import { usePredefinedModelsStrings } from '@/hooks'
import type { ModelsButtonProps } from './types'
import styles from './ModelsButton.module.scss'

// Static preview images
const PREVIEW_IMAGES = [
  './images/image-picker-model-1.png',
  './images/image-picker-model-2.png',
  './images/image-picker-model-3.png',
]

export const ModelsButton = ({ onClick, className }: ModelsButtonProps) => {
  const { predefinedModelsTitle } = usePredefinedModelsStrings()

  return (
    <button
      className={combineClassNames(styles.modelsButton, className)}
      onClick={onClick}
      type="button"
    >
      <div className={styles.previews}>
        {PREVIEW_IMAGES.map((src, index) => (
          <div key={index} className={styles.preview} data-index={index}>
            <img src={src} alt="Model" loading="lazy" draggable={false} />
          </div>
        ))}
      </div>
      <p className={combineClassNames('aiuta-button-s', styles.label)}>{predefinedModelsTitle}</p>
    </button>
  )
}
