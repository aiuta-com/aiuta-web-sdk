import { HTMLAttributes } from 'react'

export interface RemoteImageProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  /** Image source URL */
  src: string
  /** Alt text for accessibility */
  alt: string
  /** Image shape size - determines border radius, null for no additional classes */
  shape: 'L' | 'M' | 'S' | 'XS' | null
  /** Additional CSS class name */
  className?: string
  /** Loading behavior */
  loading?: 'lazy' | 'eager'
  /** Callback when image loads successfully */
  onLoad?: () => void
  /** Callback when image fails to load */
  onError?: () => void
}
