import React from 'react'
import { useAppSelector } from '@/store/store'
import { isMobileSelector } from '@/store/slices/appSlice'
import { hasFooterSelector } from '@/store/slices/appSlice'
import styles from './sdkFooter.module.scss'
import { useEffect, useState } from 'react'

export const SdkFooter = () => {
  const [pathName, setPathName] = useState('')

  useEffect(() => {
    setPathName(window.location.pathname)
  }, [])

  const isMobile = useAppSelector(isMobileSelector)
  const isShowFooter = useAppSelector(hasFooterSelector)

  const iasNavigatePath =
    pathName === '/view' ||
    pathName === '/generations-history' ||
    pathName === '/uploads-history' ||
    pathName === '/results'

  const iasNavigateMobilePath =
    pathName === '/generations-history' || pathName === '/uploads-history'

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
