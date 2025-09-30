import React from 'react'
import styles from './Spinner.module.scss'

interface SpinnerProps {
  isVisible: boolean
}

export const Spinner = ({ isVisible }: SpinnerProps) => {
  return (
    <svg
      viewBox="0 0 16 18"
      className={`${styles.spinner} ${isVisible ? styles.spinnerVisible : ''}`}
    >
      <path
        className={styles.path}
        fill="none"
        strokeWidth="2"
        d="M7.21487 1.2868C7.88431 0.9044 8.73031 0.9044 9.39974 1.2868L9.40283 1.28856L14.4613 4.20761C15.1684 4.598 15.5746 5.33558 15.5746 6.11465V8.99996V11.8853C15.5746 12.6507 15.1632 13.3848 14.4617 13.7721L9.37973 16.7132C8.71029 17.0956 7.86428 17.0956 7.19485 16.7132L7.19088 16.7109L2.11279 13.772C1.40602 13.3816 1 12.6441 1 11.8653V8.98995V6.11465C1 5.31458 1.44381 4.59039 2.10827 4.21051L7.21487 1.2868Z"
      />
    </svg>
  )
}
