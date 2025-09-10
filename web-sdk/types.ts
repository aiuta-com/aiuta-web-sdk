export interface FullScreenModalData {
  activeImage: {
    id: string
    url: string
  }
  images: Array<{
    id: string
    url: string
  }>
  modalType?: string
}

export interface ShareModalData {
  imageUrl: string
}

export interface FullscreenModalIframeConfig {
  id: string
  src: string
  styles: {
    position: string
    top: string
    left: string
    width: string
    height: string
    zIndex: string
    border: string
    background: string
  }
  allow: string
}
