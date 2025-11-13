import React, { useMemo } from 'react'
import { RemoteImage } from '@/components'
import { combineClassNames } from '@/utils'
import { usePredefinedModels, usePredefinedModelsStrings } from '@/hooks'
import type { ModelsButtonProps } from './types'
import styles from './ModelsButton.module.scss'

export const ModelsButton = ({ onClick, className }: ModelsButtonProps) => {
  const { categories, isLoaded } = usePredefinedModels()
  const { predefinedModelsTitle } = usePredefinedModelsStrings()

  // Get preview models: 1st from cat1, 1st from cat2, 3rd from cat1
  const previewModels = useMemo(() => {
    if (!isLoaded || categories.length === 0) {
      return [null, null, null] // Always return 3 slots
    }

    const firstCategory = categories[0]
    const secondCategory = categories[1] || categories[0] // Fallback to first if only one category

    return [
      firstCategory.models[0] || null, // 1st from first category
      secondCategory.models[0] || null, // 1st from second category (or first if only one)
      firstCategory.models[2] || firstCategory.models[1] || firstCategory.models[0] || null, // 3rd from first category (with fallbacks)
    ]
  }, [categories, isLoaded])

  return (
    <button
      className={combineClassNames(styles.modelsButton, className)}
      onClick={onClick}
      type="button"
    >
      <div className={styles.previews}>
        {previewModels.map((model, index) => (
          <div
            key={model?.id || `placeholder-${index}`}
            className={styles.preview}
            data-index={index}
          >
            {model && <RemoteImage src={model.url} alt="Model" shape={null} />}
          </div>
        ))}
      </div>
      <p className={combineClassNames('aiuta-button-s', styles.label)}>{predefinedModelsTitle}</p>
    </button>
  )
}
