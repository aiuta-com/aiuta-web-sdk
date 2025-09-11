import React from 'react'

// redux
import { useAppSelector } from '@lib/redux/store'

// selectors
import { showAlertStatesSelector } from '@lib/redux/slices/alertSlice/selectors'

// components
import { SecondaryButton } from '../secondaryButton/secondaryButton'

// types
import { AlertTypes } from './types'

// styles
import styles from './alert.module.scss'

export const Alert = (props: AlertTypes) => {
  const { onClick } = props

  const showAlertStates = useAppSelector(showAlertStatesSelector)

  const { type, content, isShow, buttonText } = showAlertStates

  const hasCheckContentTyeps = typeof showAlertStates.content === 'string'

  const hasError = type === 'error'
  const hasFullWidth = onClick && typeof onClick === 'function'

  return (
    <div
      className={`${styles.alert} ${hasError ? styles['alert--error'] : ''} ${
        isShow ? styles['alert--active'] : ''
      }`}
    >
      <div
        className={`${styles.alert__content} ${!hasFullWidth ? styles['alert__content--full-width'] : ''}`}
      >
        {hasCheckContentTyeps ? <p>{content} </p> : content}
      </div>
      {hasFullWidth && (
        <SecondaryButton text={buttonText} classNames={styles.alert__button} onClick={onClick} />
      )}
    </div>
  )
}
