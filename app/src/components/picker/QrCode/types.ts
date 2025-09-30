import { ChangeEvent } from 'react'

export type QrCodeProps = {
  url: string
  onFileUpload: (event: ChangeEvent<HTMLInputElement>) => void
}
