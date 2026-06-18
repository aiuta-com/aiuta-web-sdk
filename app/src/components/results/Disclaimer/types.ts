export interface DisclaimerProps {
  /** Additional CSS class name for the container */
  className?: string
  /**
   * - `plain`: a centered footnote at the bottom of the screen, below the
   *   action tiles (desktop, Figma 12340-33737).
   * - `strip`: a full-width strip flush under the photo (mobile), its
   *   background the photo's stretched bottom row, tinted for legibility.
   */
  variant?: 'plain' | 'strip'
  /**
   * Tone of the photo bottom for the `strip` variant: a light row gets dark
   * text. Defaults to dark.
   */
  tone?: 'dark' | 'light'
  /**
   * Average color of the photo's bottom row; the `strip` variant tints its
   * fill with it so the text stays legible over the stretched row.
   */
  tint?: [number, number, number] | null
  /**
   * The photo's bottom 1px row as a data URL; stretched behind the `strip`
   * variant so it reads as a continuation of the photo.
   */
  stripUrl?: string | null
}
