export type DeletableImageProps = {
  src: string
  imageId: string
  classNames?: string
  onClick?: () => void
  onDelete?: (imageId: string) => void
}
