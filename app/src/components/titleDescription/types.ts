type TextAlignTypes = 'left' | 'center' | 'right'

export type TitleDescriptionTypes = {
  title: string
  className?: string
  description?: string
  textAlign?: TextAlignTypes
  link?: {
    url: string
    text: string
  }
}
