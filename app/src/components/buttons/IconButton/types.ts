import type { IconProps } from '@/components/buttons/Icon'

export interface IconButtonProps extends IconProps {
  // Button-specific props
  label: string
  onClick?: () => void
}
