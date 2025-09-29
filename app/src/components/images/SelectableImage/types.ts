export type SelectableImageProps = {
  src: string
  imageId: string
  classNames?: string
  onClick?: () => void
  galleryType?: 'generations' | 'uploads'
}
