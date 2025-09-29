import type { IconProps } from '@/components/ui/Icon'

export interface IconButtonProps extends IconProps {
  // Button-specific props
  label: string
  onClick?: () => void
}
