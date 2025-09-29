import React from 'react'

export interface CrossFadeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Image source URL */
  src: string
  /** Alt text for accessibility */
  alt: string
  /** Custom className for the container */
  className?: string
  /** Loading strategy */
  loading?: 'lazy' | 'eager'
  /** Callback when image loads successfully */
  onLoad?: () => void
  /** Callback when image fails to load */
  onError?: () => void
}
