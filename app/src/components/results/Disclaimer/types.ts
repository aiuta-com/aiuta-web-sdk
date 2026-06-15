export interface DisclaimerProps {
  /** Additional CSS class name for the container */
  className?: string
  /**
   * Render as a translucent strip laid over the bottom edge of the image
   * (desktop results, Figma) instead of the inline icon + text row
   */
  overlay?: boolean
  /**
   * Tone of the image area under the overlay strip: a light bottom gets the
   * light strip with dark text (Figma 12764-35836). Defaults to dark.
   */
  tone?: 'dark' | 'light'
  /**
   * Average color of the image bottom; the light variant tints its fill
   * with it so the strip blends into the photo
   */
  tint?: [number, number, number] | null
}
