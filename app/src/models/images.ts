import type { InputImage } from '@lib/models'

/**
 * New image represents a locally selected image from user's device.
 * This is an image that has been selected but not yet uploaded to the server.
 * It contains the File object and a local object URL for preview purposes.
 */
export interface NewImage {
  file: File
  localUrl: string // Object URL created by URL.createObjectURL() for preview
}

/**
 * Union type representing any image that can be used for try-on.
 * Can be either:
 * - InputImage: Already uploaded to server (has id and url)
 * - NewImage: Selected from device but not yet uploaded (has file and localUrl)
 */
export type TryOnImage = InputImage | NewImage

/**
 * Type guard to check if an image is a NewImage (local, not yet uploaded)
 */
export function isNewImage(image: TryOnImage | null | undefined): image is NewImage {
  return image !== null && image !== undefined && 'file' in image
}

/**
 * Type guard to check if an image is an InputImage (already uploaded to server)
 */
export function isInputImage(image: TryOnImage | null | undefined): image is InputImage {
  return image !== null && image !== undefined && 'id' in image && 'url' in image
}
