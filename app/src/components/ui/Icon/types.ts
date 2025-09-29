export interface IconProps {
  // Icon source - either inline SVG path or external URL or full SVG content
  icon: string

  // Basic props
  className?: string
  alt?: string

  // Optional customization
  size?: number
  viewBox?: string
}
