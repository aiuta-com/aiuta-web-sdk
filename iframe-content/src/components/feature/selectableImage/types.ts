export enum VariantEnum {
  'history' = 'history',
  'previously' = 'previously',
}

export type SelectableImageTypes = {
  src: string
  imageId: string
  classNames?: string
  isShowTrashIcon?: boolean
  variant: keyof typeof VariantEnum
  onClick?: () => void
  onDelete?: (imageId: string) => void
}
