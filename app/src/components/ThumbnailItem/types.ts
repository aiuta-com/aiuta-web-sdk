export type ThumbnailItemProps = {
  /** Image source URL */
  src: string
  /** Whether this thumbnail is currently active/selected */
  isActive: boolean
  /** Callback function when thumbnail is clicked */
  onClick: () => void
}
