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
    // Legacy single-boolean key from before per-mode onboarding; never read
    // (completion was deliberately reset for everyone), removed on clear.
    ONBOARDING_LEGACY: 'onboarding',
    ONBOARDING_MODES: 'onboarding-modes',
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

  async deleteUploadedImages(images: InputImage[]): Promise<InputImage[]> {
    const ids = new Set(images.map((img) => img.id))
    const current = await this.getInputImages()
    const updated = current.filter((img) => !ids.has(img.id))
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

  async deleteGeneratedImages(images: GeneratedImage[]): Promise<GeneratedImage[]> {
    const ids = new Set(images.map((img) => img.id))
    const current = await this.getGeneratedImages()
    const updated = current.filter((img) => !ids.has(img.id))
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

  async getOnboardingCompletedModes(): Promise<Record<string, boolean>> {
    return (await this.adapter.getItem<Record<string, boolean>>(this.KEYS.ONBOARDING_MODES)) || {}
  }

  async setOnboardingModeCompleted(mode: string): Promise<void> {
    const current = await this.getOnboardingCompletedModes()
    await this.adapter.setItem(this.KEYS.ONBOARDING_MODES, { ...current, [mode]: true })
  }

  async clearOnboarding(): Promise<void> {
    await this.adapter.removeItem(this.KEYS.ONBOARDING_MODES)
    await this.adapter.removeItem(this.KEYS.ONBOARDING_LEGACY)
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
