export interface FeedbackProps {
  /** Additional CSS class name for the container */
  className?: string
  /** URL of the current generated image being shown */
  generatedImageUrl: string
  /**
   * Button appearance: blurred FAB circles (mobile) or plain icons with a
   * drop shadow laid right over the image (desktop, Figma)
   */
  variant?: 'fab' | 'plain'
}

export type FeedbackType = 'positive' | 'negative'
