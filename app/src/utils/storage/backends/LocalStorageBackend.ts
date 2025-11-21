import type { InputImage, GeneratedImage } from '@lib/models'
import type { PredefinedModelCategory } from '@/utils/api'
import type {
  IStorageBackend,
  PredefinedModelsCache,
} from '@/utils/storage/backends/IStorageBackend'
import type { IStorageAdapter } from '@/utils/storage/adapters/IStorageAdapter'
import { addToArrayAndLimit } from '@/utils/helpers'

/**
 * Local storage backend implementation using IndexedDB/localStorage
 * Implements IStorageBackend interface using storage adapter
 * All data operations go directly through the adapter
 *
 * Max items limit is determined by the adapter:
 * - IndexedDB: 100 items (larger capacity)
 * - localStorage: 20 items (limited space)
 */
export class LocalStorageBackend implements IStorageBackend {
  private readonly adapter: IStorageAdapter

  // Storage keys
  private readonly KEYS = {
    UPLOADS: 'uploads',
    GENERATIONS: 'generations',
    CONSENT: 'consents',
    ONBOARDING: 'onboarding',
    PREDEFINED_MODELS: 'models',
  } as const

  constructor(adapter: IStorageAdapter) {
    this.adapter = adapter
  }

  // ===== Uploads =====

  async getInputImages(): Promise<InputImage[]> {
    return (await this.adapter.getItem<InputImage[]>(this.KEYS.UPLOADS)) || []
  }

  async addInputImage(image: InputImage): Promise<InputImage[]> {
    const current = await this.getInputImages()
    const updated = addToArrayAndLimit(current, image, this.adapter.maxItems)
    await this.adapter.setItem(this.KEYS.UPLOADS, updated)
    return updated
  }

  async removeInputImage(imageId: string): Promise<InputImage[]> {
    const current = await this.getInputImages()
    const updated = current.filter((img) => img.id !== imageId)
    await this.adapter.setItem(this.KEYS.UPLOADS, updated)
    return updated
  }

  async clearInputImages(): Promise<void> {
    await this.adapter.removeItem(this.KEYS.UPLOADS)
  }

  // ===== Generations =====

  async getGeneratedImages(): Promise<GeneratedImage[]> {
    return (await this.adapter.getItem<GeneratedImage[]>(this.KEYS.GENERATIONS)) || []
  }

  async addGeneratedImage(image: GeneratedImage): Promise<GeneratedImage[]> {
    const current = await this.getGeneratedImages()
    const updated = addToArrayAndLimit(current, image, this.adapter.maxItems)
    await this.adapter.setItem(this.KEYS.GENERATIONS, updated)
    return updated
  }

  async removeGeneratedImage(imageId: string): Promise<GeneratedImage[]> {
    const current = await this.getGeneratedImages()
    const updated = current.filter((img) => img.id !== imageId)
    await this.adapter.setItem(this.KEYS.GENERATIONS, updated)
    return updated
  }

  async clearGeneratedImages(): Promise<void> {
    await this.adapter.removeItem(this.KEYS.GENERATIONS)
  }

  // ===== Consent =====

  async getConsentIds(): Promise<string[]> {
    return (await this.adapter.getItem<string[]>(this.KEYS.CONSENT)) || []
  }

  async addConsentIds(consentIds: string[]): Promise<void> {
    await this.adapter.setItem(this.KEYS.CONSENT, consentIds)
  }

  async hasConsent(consentId: string): Promise<boolean> {
    const ids = await this.getConsentIds()
    return ids.includes(consentId)
  }

  async clearConsents(): Promise<void> {
    await this.adapter.removeItem(this.KEYS.CONSENT)
  }

  // ===== Onboarding =====

  async getOnboardingCompleted(): Promise<boolean> {
    return (await this.adapter.getItem<boolean>(this.KEYS.ONBOARDING)) || false
  }

  async setOnboardingCompleted(completed: boolean): Promise<void> {
    await this.adapter.setItem(this.KEYS.ONBOARDING, completed)
  }

  async clearOnboarding(): Promise<void> {
    await this.adapter.removeItem(this.KEYS.ONBOARDING)
  }

  // ===== Predefined Models =====

  async getPredefinedModels(): Promise<PredefinedModelsCache | null> {
    return await this.adapter.getItem<PredefinedModelsCache>(this.KEYS.PREDEFINED_MODELS)
  }

  async savePredefinedModels(
    categories: PredefinedModelCategory[],
    etag: string | null,
  ): Promise<void> {
    const cache: PredefinedModelsCache = { categories, etag }
    await this.adapter.setItem(this.KEYS.PREDEFINED_MODELS, cache)
  }

  async clearPredefinedModels(): Promise<void> {
    await this.adapter.removeItem(this.KEYS.PREDEFINED_MODELS)
  }
}
