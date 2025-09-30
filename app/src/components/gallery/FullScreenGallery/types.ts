export type ImageType = {
  id: string
  url: string
}

export type ModalTypes = 'history' | 'previously'

export interface FullScreenModalData {
  activeImage: ImageType
  images?: Array<ImageType>
  modalType?: ModalTypes
}
