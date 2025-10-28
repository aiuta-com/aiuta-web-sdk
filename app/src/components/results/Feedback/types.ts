export interface FeedbackProps {
  /** Additional CSS class name for the container */
  className?: string
  /** URL of the current generated image being shown */
  generatedImageUrl: string
}

export type FeedbackType = 'positive' | 'negative'
