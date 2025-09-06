import { ReactElement } from 'react'

export type TryOnButtonTypes = {
  disabled?: boolean
  onClick: () => void
  isShowTryOnIcon?: boolean
  children: string | ReactElement
}
