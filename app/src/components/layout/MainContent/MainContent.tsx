import React from 'react'
import styles from './MainContent.module.scss'

interface MainContentProps {
  children: React.ReactNode
}

/**
 * Main content area that takes all space between PageBar and PoweredBy
 */
export const MainContent = ({ children }: MainContentProps) => {
  return <main className={styles.mainContent}>{children}</main>
}
