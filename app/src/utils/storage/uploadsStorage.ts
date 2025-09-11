import type { InputImage } from '@lib/models'
import { BaseStorage } from './baseStorage'

/**
 * Storage service for managing uploaded/input images
 */
export class UploadsStorage extends BaseStorage {
  protected readonly storageKey = 'aiutaUploadsHistory'

  /**
   * Gets all input images from localStorage
   */
  static getInputImages(): InputImage[] {
    const instance = new this()
    return instance.safeRead<InputImage[]>([])
  }

  /**
   * Saves input images to localStorage
   */
  static saveInputImages(images: InputImage[]): void {
    const instance = new this()
    instance.safeWrite(images)
  }

  /**
   * Adds a new input image to the beginning of the list
   * Automatically limits to maxItems
   */
  static addInputImage(image: InputImage): InputImage[] {
    const instance = new this()
    const currentImages = instance.safeRead<InputImage[]>([])
    const updatedImages = instance.addToArrayAndLimit(currentImages, image)

    instance.safeWrite(updatedImages)
    return updatedImages
  }

  /**
   * Removes an input image by id
   */
  static removeInputImage(imageId: string): InputImage[] {
    const instance = new this()
    const currentImages = instance.safeRead<InputImage[]>([])
    const updatedImages = currentImages.filter((img) => img.id !== imageId)

    instance.safeWrite(updatedImages)
    return updatedImages
  }

  /**
   * Clears all input images
   */
  static clearInputImages(): void {
    const instance = new this()
    instance.safeRemove()
  }
}
