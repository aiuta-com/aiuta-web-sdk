export type DeletableImageProps = {
  src: string
  imageId: string
  classNames?: string
  showTrashIcon?: boolean
  onClick?: () => void
  onDelete?: (imageId: string) => void
}

export type DeletionButtonProps = {
  showTrashIcon?: boolean
  onDelete: () => void
}
