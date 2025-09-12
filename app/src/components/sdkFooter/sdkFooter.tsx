import React from 'react'
import { useAppSelector } from '@/store/store'
import { isMobileSelector, isShowFooterSelector } from '@/store/slices/configSlice/selectors'
import styles from './sdkFooter.module.scss'
import { useEffect, useState } from 'react'

export const SdkFooter = () => {
  const [pathName, setPathName] = useState('')

  useEffect(() => {
    setPathName(window.location.pathname)
  }, [])

  const isMobile = useAppSelector(isMobileSelector)
  const isShowFooter = useAppSelector(isShowFooterSelector)

  const iasNavigatePath =
    pathName === '/view' ||
    pathName === '/history' ||
    pathName === '/previously' ||
    pathName === '/generated'

  const iasNavigateMobilePath = pathName === '/history' || pathName === '/previously'

  return !isMobile ? (
    <footer className={`${styles.footer} ${iasNavigatePath ? styles.hideFooter : ''} `}>
      <p className={styles.linkingText}>
        Powered{' '}
        <a target="_blank" href="https://www.aiuta.com/">
          by Aiuta
        </a>
      </p>
    </footer>
  ) : isMobile && isShowFooter ? (
    <footer className={`${styles.footer} ${iasNavigateMobilePath ? styles.hideFooter : ''}`}>
      <p className={styles.linkingText}>
        Powered{' '}
        <a target="_blank" href="https://www.aiuta.com/">
          by Aiuta
        </a>
      </p>
    </footer>
  ) : (
    <></>
  )
}
