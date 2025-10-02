export interface SocialButtonProps {
  /** SVG icon content */
  icon: string
  /** Button title/label */
  title: string
  /** Link href for social sharing */
  href?: string
  /** Click handler */
  onClick?: () => void
  /** Additional CSS class */
  className?: string
}
