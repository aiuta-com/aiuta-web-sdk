import { MouseEvent } from 'react'

export type ViewImageTypes = {
  url: string
  className?: string
  imgUnoptimazed?: boolean
  isStartGeneration: boolean
  generatedImageUrl?: string
  isShowChangeImageBtn: boolean
  onChange?: () => void
  onClick?: (event: MouseEvent<HTMLImageElement>) => void
}
