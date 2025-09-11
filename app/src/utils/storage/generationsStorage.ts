import type { GeneratedImage } from '@lib/models'
import { BaseStorage } from './baseStorage'

/**
 * Storage service for managing AI-generated images
 */
export class GenerationsStorage extends BaseStorage {
  protected readonly storageKey = 'aiutaGenerationsHistory'

  /**
   * Gets all generated images from localStorage
   */
  static getGeneratedImages(): GeneratedImage[] {
    const instance = new this()
    return instance.safeRead<GeneratedImage[]>([])
  }

  /**
   * Saves generated images to localStorage
   */
  static saveGeneratedImages(images: GeneratedImage[]): void {
    const instance = new this()
    instance.safeWrite(images)
  }

  /**
   * Adds a new generated image to the beginning of the list
   * Automatically limits to maxItems
   */
  static addGeneratedImage(image: GeneratedImage): GeneratedImage[] {
    const instance = new this()
    const currentImages = instance.safeRead<GeneratedImage[]>([])
    const updatedImages = instance.addToArrayAndLimit(currentImages, image)

    instance.safeWrite(updatedImages)
    return updatedImages
  }

  /**
   * Removes a generated image by id
   */
  static removeGeneratedImage(imageId: string): GeneratedImage[] {
    const instance = new this()
    const currentImages = instance.safeRead<GeneratedImage[]>([])
    const updatedImages = currentImages.filter((img) => img.id !== imageId)

    instance.safeWrite(updatedImages)
    return updatedImages
  }

  /**
   * Clears all generated images
   */
  static clearGeneratedImages(): void {
    const instance = new this()
    instance.safeRemove()
  }
}
