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
  /**
   * Cross-fade when switching between already-loaded images. Default true.
   * When false, the first image still fades in (from empty), but later swaps
   * are instant (the previous image is held until the new one is decoded, then
   * replaced without a fade) — avoids flicker when the source changes rapidly.
   */
  crossFade?: boolean
  /** Callback when image loads successfully */
  onLoad?: () => void
  /** Callback when image fails to load */
  onError?: () => void
}
