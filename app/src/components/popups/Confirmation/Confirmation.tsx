import React from 'react'
import { combineClassNames } from '@/utils'
import { ConfirmationProps } from './types'
import styles from './Confirmation.module.scss'

/**
 * Delete confirmation dialog (Figma): a white card with a question and two
 * buttons — a primary "Keep" (left) and a destructive "Delete" (right).
 */
export const Confirmation = ({
  isVisible,
  message,
  leftButtonText,
  rightButtonText,
  onLeftClick,
  onRightClick,
}: ConfirmationProps) => {
  if (!isVisible) return null

  return (
    <div
      className={styles.confirmation}
      // Clicking the dimmed backdrop (not the card) keeps the items
      onClick={(e) => {
        if (e.target === e.currentTarget) onLeftClick()
      }}
    >
      <div className={styles.modalContent}>
        <p className={styles.text}>{message}</p>
        <div className={styles.buttonsLine}>
          <button
            type="button"
            className={combineClassNames(styles.button, styles.keepButton)}
            onClick={onLeftClick}
          >
            {leftButtonText}
          </button>
          <button
            type="button"
            className={combineClassNames(styles.button, styles.deleteButton)}
            onClick={onRightClick}
          >
            {rightButtonText}
          </button>
        </div>
      </div>
    </div>
  )
}
