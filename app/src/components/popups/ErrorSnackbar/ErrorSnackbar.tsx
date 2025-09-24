import React from 'react'
import { useAppSelector } from '@/store/store'
import { errorSnackbarSelector } from '@/store/slices/errorSnackbarSlice/selectors'
import { SecondaryButton } from '@/components'
import { ErrorSnackbarProps } from './types'
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
