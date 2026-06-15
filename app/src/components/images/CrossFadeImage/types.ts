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
  /**
   * Fitting strategy:
   * - 'cover' — fill the container, cropping whatever is needed (default)
   * - 'smart' — never crop the height: cover only while the width crop stays
   *   under ~half, otherwise contain over a blurred backdrop of the same image
   */
  fit?: 'cover' | 'smart'
  /** Callback when image loads successfully */
  onLoad?: () => void
  /** Callback when image fails to load */
  onError?: () => void
}
