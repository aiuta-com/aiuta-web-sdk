import React, { useEffect, useState } from 'react'
import { SecondaryButton, IconButton } from '@/components'
import { combineClassNames } from '@/utils'
import { useSelectionStrings } from '@/hooks'
import { SelectionSnackbarProps } from './types'
import { icons } from './icons'
import styles from './SelectionSnackbar.module.scss'

const ANIMATION_DURATION = 200

export const SelectionSnackbar = (props: SelectionSnackbarProps) => {
  const {
    isVisible,
    selectedCount,
    totalCount,
    onCancel,
    onSelectAll,
    onDelete,
    onDownload,
    className,
  } = props

  const { cancel, selectAll, unselectAll } = useSelectionStrings()
  const [shouldRender, setShouldRender] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Handle showing/hiding animation and DOM rendering
  useEffect(() => {
    if (isVisible && !shouldRender) {
      // Show: Add to DOM and start animation
      setShouldRender(true)
      // Force a reflow to ensure DOM is updated before animation
      setTimeout(() => {
        setIsAnimating(true)
      }, ANIMATION_DURATION / 2)
    } else if (!isVisible && shouldRender) {
      // Hide: Start animation out
      setIsAnimating(false)
      // Remove from DOM after animation completes
      setTimeout(() => {
        setShouldRender(false)
      }, ANIMATION_DURATION)
    }
  }, [isVisible, shouldRender])

  const containerClasses = combineClassNames(
    styles.selectionSnackbar,
    !isAnimating && styles.selectionSnackbar_hidden,
    className,
  )

  const isAllSelected = selectedCount === totalCount

  // Don't render if not needed
  if (!shouldRender) {
    return null
  }

  return (
    <div className={containerClasses}>
      <div className={styles.content}>
        <div className={styles.controls}>
          <SecondaryButton onClick={onCancel} classNames={styles.cancelButton}>
            {cancel}
          </SecondaryButton>
          <SecondaryButton onClick={onSelectAll} classNames={styles.selectAllButton}>
            {isAllSelected ? unselectAll : selectAll}
          </SecondaryButton>
        </div>

        <div className={styles.actions}>
          {onDelete && (
            <IconButton
              icon={icons.delete}
              label="Delete selected images"
              onClick={onDelete}
              size={24}
              viewBox="0 0 25 24"
              className={styles.actionIcon}
            />
          )}
          {onDownload && (
            <IconButton
              icon={icons.download}
              label="Download selected images"
              onClick={onDownload}
              size={24}
              viewBox="0 0 21 20"
              className={styles.actionIcon}
            />
          )}
        </div>
      </div>
    </div>
  )
}
