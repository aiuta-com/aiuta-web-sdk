import React from 'react'
import { useAppSelector } from '@/store/store'
import { isMobileSelector } from '@/store/slices/appSlice'
import { CheckboxLabel } from '@/components'
import { ConsentTypes } from './types'
import styles from './consent.module.scss'

export const Consent = (props: ConsentTypes) => {
  const { isChecked, setIsChecked } = props

  const isMobile = useAppSelector(isMobileSelector)

  return (
    <div className={`${styles.consentContent} ${isMobile ? styles.consentContentMobile : ''}`}>
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
        onChange={setIsChecked}
      />
    </div>
  )
}
