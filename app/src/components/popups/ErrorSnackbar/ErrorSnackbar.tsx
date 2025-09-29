import React, { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/store'
import {
  isErrorSnackbarVisibleSelector,
  hideErrorSnackbar,
} from '@/store/slices/errorSnackbarSlice'
import { SecondaryButton, Icon } from '@/components'
import { combineClassNames } from '@/utils'
import { useSwipeGesture } from '@/hooks'
import { ErrorSnackbarProps } from './types'
import { icons } from './icons'
import styles from './ErrorSnackbar.module.scss'

const AUTO_HIDE_DELAY = 15000

export const ErrorSnackbar = (props: ErrorSnackbarProps) => {
  const { onRetry, className } = props
  const dispatch = useAppDispatch()

  const isVisible = useAppSelector(isErrorSnackbarVisibleSelector)

  const hasRetry = onRetry && typeof onRetry === 'function'

  // Auto-hide after delay
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        dispatch(hideErrorSnackbar())
      }, AUTO_HIDE_DELAY)

      return () => clearTimeout(timer)
    }
  }, [isVisible, dispatch])

  // Handle swipe down and tap to dismiss
  const handleDismiss = () => {
    dispatch(hideErrorSnackbar())
  }

  const swipeHandlers = useSwipeGesture(
    ({ direction }) => {
      if (direction === 'down') {
        handleDismiss()
      }
    },
    { delta: 20 },
  ) // Lower delta for more sensitive swipe

  const containerClasses = combineClassNames(
    styles.errorSnackbar,
    isVisible && styles.errorSnackbar_visible,
    className,
  )

  const messageClasses = combineClassNames('aiuta-label-subtle', styles.message)

  const handleButtonClick = (e: React.MouseEvent) => {
    // Prevent dismissing when clicking on the retry button
    e.stopPropagation()
    onRetry?.()
  }

  return (
    <div className={containerClasses}>
      <div className={styles.content} {...swipeHandlers} onClick={handleDismiss}>
        <Icon icon={icons.warning} size={36} viewBox="0 0 36 36" className={styles.icon} />
        <div className={messageClasses}>
          <p>
            Something went wrong.
            <br />
            Please try again later
          </p>
        </div>
        {hasRetry && (
          <SecondaryButton
            text="Try Again"
            classNames={styles.retryButton}
            onClick={handleButtonClick}
          />
        )}
      </div>
    </div>
  )
}
