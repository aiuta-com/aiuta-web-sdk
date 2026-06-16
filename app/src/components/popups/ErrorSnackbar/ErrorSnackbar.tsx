import React, { useEffect, useState } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/store'
import {
  isErrorSnackbarVisibleSelector,
  hideErrorSnackbar,
} from '@/store/slices/errorSnackbarSlice'
import { SecondaryButton, Icon } from '@/components'
import { combineClassNames } from '@/utils'
import { useSwipeGesture, useErrorStrings } from '@/hooks'
import { ErrorSnackbarProps } from './types'
import { icons } from './icons'
import styles from './ErrorSnackbar.module.scss'

const AUTO_HIDE_DELAY = 15000
const ANIMATION_DURATION = 200

export const ErrorSnackbar = (props: ErrorSnackbarProps) => {
  const { onRetry, className, open, message, onClose } = props
  const dispatch = useAppDispatch()

  const { defaultErrorMessage, tryAgainButton } = useErrorStrings()
  const sliceVisible = useAppSelector(isErrorSnackbarVisibleSelector)
  const [shouldRender, setShouldRender] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Controlled mode (open prop) overrides the global error slice
  const isControlled = open !== undefined
  const isVisible = isControlled ? open : sliceVisible
  const text = message ?? defaultErrorMessage

  const dismiss = () => {
    if (isControlled) {
      onClose?.()
    } else {
      dispatch(hideErrorSnackbar())
    }
  }

  const hasRetry = onRetry && typeof onRetry === 'function'

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

  // Auto-hide after delay
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        if (isControlled) {
          onClose?.()
        } else {
          dispatch(hideErrorSnackbar())
        }
      }, AUTO_HIDE_DELAY)

      return () => clearTimeout(timer)
    }
  }, [isVisible, isControlled, onClose, dispatch])

  // Handle swipe down and tap to dismiss
  const handleDismiss = () => {
    dismiss()
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
    !isAnimating && styles.errorSnackbar_hidden,
    className,
  )

  const messageClasses = combineClassNames('aiuta-label-subtle', styles.message)

  const handleButtonClick = (e: React.MouseEvent) => {
    // Prevent dismissing when clicking on the retry button
    e.stopPropagation()
    onRetry?.()
  }

  // Don't render if not needed
  if (!shouldRender) {
    return null
  }

  return (
    <div className={containerClasses}>
      <div className={styles.content} {...swipeHandlers} onClick={handleDismiss}>
        <Icon icon={icons.warning} size={36} viewBox="0 0 36 36" className={styles.icon} />
        <div className={messageClasses}>
          <p>
            {text.split('\n').map((line, index) => (
              <React.Fragment key={index}>
                {line}
                {index < text.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        </div>
        {hasRetry && (
          <SecondaryButton compact classNames={styles.retryButton} onClick={handleButtonClick}>
            {tryAgainButton}
          </SecondaryButton>
        )}
      </div>
    </div>
  )
}
