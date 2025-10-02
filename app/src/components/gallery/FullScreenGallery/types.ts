export type ImageType = {
  id: string
  url: string
}

export type ModalTypes = 'uploads' | 'generations'

export interface FullScreenModalData {
  activeImage: ImageType
  images?: Array<ImageType>
  modalType?: ModalTypes
}
