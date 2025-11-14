import React, { useRef, useEffect, useCallback } from 'react'
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
  const isScrollingProgrammaticallyRef = useRef(false)
  const isScrollingManuallyRef = useRef(false)
  const rafRef = useRef<number | null>(null)
  const manualScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Find and select the card closest to center
  const selectCenterCard = useCallback(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const containerRect = container.getBoundingClientRect()
    const centerX = containerRect.left + containerRect.width / 2

    let closestCard: HTMLElement | null = null
    let minDistance = Infinity

    // Find the card closest to center
    Array.from(container.children).forEach((child) => {
      if (child instanceof HTMLElement) {
        const cardRect = child.getBoundingClientRect()
        const cardCenterX = cardRect.left + cardRect.width / 2
        const distance = Math.abs(cardCenterX - centerX)

        if (distance < minDistance) {
          minDistance = distance
          closestCard = child
        }
      }
    })

    // Select the closest card
    if (closestCard) {
      const cardIndex = Array.from(container.children).indexOf(closestCard)
      if (cardIndex >= 0 && cardIndex < models.length) {
        const model = models[cardIndex]
        if (model.id !== selectedModelId) {
          onModelSelect(model)
        }
      }
    }
  }, [models, selectedModelId, onModelSelect])

  // Handle scroll - select card in real-time with throttle
  const handleScroll = useCallback(() => {
    // Ignore programmatic scrolls
    if (isScrollingProgrammaticallyRef.current) return

    // Mark as manual scrolling
    isScrollingManuallyRef.current = true

    // Clear previous timeout
    if (manualScrollTimeoutRef.current) {
      clearTimeout(manualScrollTimeoutRef.current)
    }

    // Reset manual scrolling flag after scroll ends
    manualScrollTimeoutRef.current = setTimeout(() => {
      isScrollingManuallyRef.current = false
    }, 150)

    // Cancel previous RAF
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }

    // Throttle with requestAnimationFrame
    rafRef.current = requestAnimationFrame(() => {
      selectCenterCard()
    })
  }, [selectCenterCard])

  // Cleanup RAF and timeouts
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      if (manualScrollTimeoutRef.current) {
        clearTimeout(manualScrollTimeoutRef.current)
      }
    }
  }, [])

  // Auto-scroll to selected model
  useEffect(() => {
    // Don't auto-scroll if user is manually scrolling
    if (isScrollingManuallyRef.current) return

    if (selectedRef.current && containerRef.current) {
      const container = containerRef.current
      const selected = selectedRef.current

      // Calculate center position
      const containerWidth = container.offsetWidth
      const selectedLeft = selected.offsetLeft
      const selectedWidth = selected.offsetWidth

      // Scroll to center the selected card
      const scrollPosition = selectedLeft - containerWidth / 2 + selectedWidth / 2

      isScrollingProgrammaticallyRef.current = true

      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth',
      })

      // Reset flag after scroll completes
      setTimeout(() => {
        isScrollingProgrammaticallyRef.current = false
      }, 500)
    }
  }, [selectedModelId])

  return (
    <div
      ref={containerRef}
      className={combineClassNames(styles.modelsList, className)}
      data-scrollable
      onScroll={handleScroll}
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
