import React from 'react'
import { combineClassNames } from '@/utils'
import styles from './LoaderRing.module.scss'

interface LoaderRingProps {
  className?: string
}

/**
 * Figma ic_24/loader: a ring arc whose tail fades along the circle, with a
 * rounded cap at the head. Shared by the try-on status and the QR upload
 * progress row.
 */
export const LoaderRing = ({ className }: LoaderRingProps) => (
  <span className={combineClassNames(styles.ring, className)} aria-hidden="true" />
)
