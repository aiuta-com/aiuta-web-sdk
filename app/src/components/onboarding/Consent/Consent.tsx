import React from 'react'
import { Checkbox } from '@/components'
import { ConsentProps } from './types'
import styles from './Consent.module.scss'

export const Consent = ({ isChecked, onCheckChange, className }: ConsentProps) => {
  const containerClasses = [styles.consent, className].filter(Boolean).join(' ')

  return (
    <div className={containerClasses}>
      <h2 className={`aiuta-title-l ${styles.title}`}>Consent</h2>
      <h3 className={`aiuta-label-regular ${styles.description}`}>
        In order to try on items digitally, you agree to allow Aiuta to process your photo. Your
        data will be processed according to the Aiuta{' '}
        <a
          href="https://aiuta.com/legal/terms-of-service.html"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          Terms&nbsp;of&nbsp;Use
        </a>
      </h3>
      <Checkbox
        labelText="I agree to allow Aiuta to process my photo"
        checked={isChecked}
        onChange={onCheckChange}
      />
    </div>
  )
}
