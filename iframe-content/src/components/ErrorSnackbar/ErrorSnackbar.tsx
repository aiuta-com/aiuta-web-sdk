import React from 'react'

// redux
import { useAppSelector } from '@lib/redux/store'

// selectors
import { showErrorSnackbarStatesSelector } from '@lib/redux/slices/errorSnackbarSlice/selectors'

// components
import { SecondaryButton } from '../secondaryButton/secondaryButton'

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
      className={`${styles.snackbar} ${hasError ? styles['snackbar--error'] : ''} ${
        isShow ? styles['snackbar--active'] : ''
      }`}
    >
      <div
        className={`${styles.snackbar__content} ${!hasButton ? styles['snackbar__content--full-width'] : ''}`}
      >
        {isContentString ? <p>{content}</p> : content}
      </div>
      {hasButton && (
        <SecondaryButton text={buttonText} classNames={styles.snackbar__button} onClick={onRetry} />
      )}
    </div>
  )
}
