import React from 'react'
// redux
import { useAppSelector } from '@lib/redux/store'

// selectors
import { isMobileSelector } from '@lib/redux/slices/configSlice/selectors'

// components
import { TitleDescription } from '@/components/feature'
import { CheckboxLabel } from '@/components/feature/checkboxLabel/checkboxLabel'

// types
import { ConsentTypes } from './types'

// styles
import styles from './consent.module.scss'

export const Consent = (props: ConsentTypes) => {
  const { setIsChecked } = props

  const isMobile = useAppSelector(isMobileSelector)

  return (
    <div className={`${styles.consentContent} ${isMobile ? styles.consentContentMobile : ''}`}>
      <TitleDescription
        title="Consent"
        textAlign="left"
        description="In order to try on items digitally, you agree to allow Aiuta to process your photo. Your data will be processed according to the "
        link={{ text: 'Terms of Use', url: 'https://aiuta.com/legal/terms-of-service.html' }}
        className={styles.consentTilesBox}
      />
      <CheckboxLabel
        labelText="I agree to allow Aiuta to process my photo"
        onClick={setIsChecked}
      />
    </div>
  )
}
