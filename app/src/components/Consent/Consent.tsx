import React from 'react'
import { useAppSelector } from '@/store/store'
import { isMobileSelector } from '@/store/slices/appSlice'
import { CheckboxLabel } from '@/components'
import { ConsentProps } from './types'
import styles from './Consent.module.scss'

export const Consent = ({ isChecked, onCheckChange, className }: ConsentProps) => {
  const isMobile = useAppSelector(isMobileSelector)

  const containerClasses = [
    styles.consentContent,
    isMobile ? styles.consentContent_mobile : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={containerClasses}>
      <div className={styles.consentTilesBox}>
        <h2>Consent</h2>
        <h3>
          In order to try on items digitally, you agree to allow Aiuta to process your photo. Your
          data will be processed according to the{' '}
          <a
            href="https://aiuta.com/legal/terms-of-service.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms of Use
          </a>
        </h3>
      </div>
      <CheckboxLabel
        labelText="I agree to allow Aiuta to process my photo"
        checked={isChecked}
        onChange={onCheckChange}
      />
    </div>
  )
}
