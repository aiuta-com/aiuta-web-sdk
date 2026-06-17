import React from 'react'
import { combineClassNames } from '@/utils'
import { LoaderRing } from '@/components/indicators/LoaderRing'
import styles from './Loader.module.scss'

interface LoaderProps {
  /** White ring for dark backgrounds (default draws in the primary color) */
  onDark?: boolean
  className?: string
}

/**
 * Centered LoaderRing overlay that fills its positioned parent. Shared by the
 * image picker (processing), the try-on preview, and the fullscreen viewer.
 */
export const Loader = ({ onDark, className }: LoaderProps) => (
  <div className={combineClassNames(styles.loader, onDark && styles.loader_onDark, className)}>
    <LoaderRing />
  </div>
)
