export interface RemoteImageProps {
  /** Image source URL */
  src: string
  /** Alt text for accessibility */
  alt: string
  /** Image shape size - determines border radius */
  shape: 'L' | 'M'
  /** Additional CSS class name */
  className?: string
  /** Loading behavior */
  loading?: 'lazy' | 'eager'
  /** Callback when image loads successfully */
  onLoad?: () => void
  /** Callback when image fails to load */
  onError?: () => void
}
