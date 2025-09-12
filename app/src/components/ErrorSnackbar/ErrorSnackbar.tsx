import React from 'react'

// redux
import { useAppSelector } from '@/store/store'

// selectors
import { errorSnackbarSelector } from '@/store/slices/errorSnackbarSlice/selectors'

// components
import { SecondaryButton } from '@/components/secondaryButton/secondaryButton'

// types
import { ErrorSnackbarProps } from './types'

// styles
import styles from './ErrorSnackbar.module.scss'

export const ErrorSnackbar = (props: ErrorSnackbarProps) => {
  const { onRetry } = props

  const { isVisible, errorMessage, retryButtonText } = useAppSelector(errorSnackbarSelector)

  const hasRetry = onRetry && typeof onRetry === 'function'

  return (
    <div className={`${styles.errorSnackbar} ${isVisible ? styles.errorSnackbarActive : ''}`}>
      <div className={`${styles.errorMessage} ${!hasRetry ? styles.errorMessageFullWidth : ''}`}>
        <p>{errorMessage}</p>
      </div>
      {hasRetry && (
        <SecondaryButton
          text={retryButtonText}
          classNames={styles.tryAgainButton}
          onClick={onRetry}
        />
      )}
    </div>
  )
}
