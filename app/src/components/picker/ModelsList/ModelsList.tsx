import React, { useRef, useEffect } from 'react'
import { RemoteImage } from '@/components'
import { combineClassNames } from '@/utils'
import type { ModelsListProps } from './types'
import styles from './ModelsList.module.scss'

export const ModelsList = ({
  models,
  selectedModelId,
  onModelSelect,
  className,
}: ModelsListProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to selected model
  useEffect(() => {
    if (selectedRef.current && containerRef.current) {
      const container = containerRef.current
      const selected = selectedRef.current

      // Calculate center position
      const containerWidth = container.offsetWidth
      const selectedLeft = selected.offsetLeft
      const selectedWidth = selected.offsetWidth

      // Scroll to center the selected card
      const scrollPosition = selectedLeft - containerWidth / 2 + selectedWidth / 2

      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth',
      })
    }
  }, [selectedModelId])

  return (
    <div
      ref={containerRef}
      className={combineClassNames(styles.modelsList, className)}
      data-scrollable
    >
      {models.map((model) => {
        const isSelected = model.id === selectedModelId

        return (
          <div
            key={model.id}
            ref={isSelected ? selectedRef : null}
            className={combineClassNames(
              styles.modelCard,
              isSelected ? styles.modelCard_selected : '',
            )}
            onClick={() => onModelSelect(model)}
          >
            <RemoteImage src={model.url} alt="Model" shape="XS" />
          </div>
        )
      })}
    </div>
  )
}
