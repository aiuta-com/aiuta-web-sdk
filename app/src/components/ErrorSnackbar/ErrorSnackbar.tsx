import React from 'react'

// redux
import { useAppSelector } from '@/store/store'

// selectors
import { showErrorSnackbarStatesSelector } from '@/store/slices/errorSnackbarSlice/selectors'

// components
import { SecondaryButton } from '@/components/secondaryButton/secondaryButton'

// types
import { ErrorSnackbarProps } from './types'

// styles
import styles from './ErrorSnackbar.module.scss'

export const ErrorSnackbar = (props: ErrorSnackbarProps) => {
  const { onRetry } = props

  const showErrorSnackbarStates = useAppSelector(showErrorSnackbarStatesSelector)

  const { type, content, isShow, buttonText } = showErrorSnackbarStates

  const isContentString = typeof content === 'string'
  const hasError = type === 'error'
  const hasButton = onRetry && typeof onRetry === 'function'

  return (
    <div
      className={`${styles.errorSnackbar} ${hasError ? styles.errorSnackbarError : ''} ${
        isShow ? styles.errorSnackbarActive : ''
      }`}
    >
      <div className={`${styles.content} ${!hasButton ? styles.contentFullWidth : ''}`}>
        {isContentString ? <p>{content}</p> : content}
      </div>
      {hasButton && (
        <SecondaryButton text={buttonText} classNames={styles.button} onClick={onRetry} />
      )}
    </div>
  )
}
