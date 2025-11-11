import type { PredefinedModelCategory } from '@/utils/api'
import { BaseStorage } from './baseStorage'

/**
 * Cached data structure for predefined models
 */
interface PredefinedModelsCache {
  categories: PredefinedModelCategory[]
  etag: string | null
}

/**
 * Storage service for managing predefined models with ETag caching
 */
export class PredefinedModelsStorage extends BaseStorage {
  protected readonly storageKey = 'aiutaPredefinedModels'

  /**
   * Loads cached predefined models from localStorage
   * @returns Cached data or null if not found
   */
  static load(): PredefinedModelsCache | null {
    const instance = new this()
    const cached = instance.safeRead<PredefinedModelsCache | null>(null)
    return cached
  }

  /**
   * Saves predefined models and ETag to localStorage
   * @param categories List of model categories
   * @param etag ETag for cache validation
   */
  static save(categories: PredefinedModelCategory[], etag: string | null): void {
    const instance = new this()
    const cacheData: PredefinedModelsCache = {
      categories,
      etag,
    }
    instance.safeWrite(cacheData)
  }

  /**
   * Clears cached predefined models
   */
  static clear(): void {
    const instance = new this()
    instance.safeRemove()
  }
}
