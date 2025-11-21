import type { InputImage, GeneratedImage } from '@lib/models'
import type { PredefinedModelCategory } from '@/utils/api'

/**
 * Cached data structure for predefined models
 */
export interface PredefinedModelsCache {
  categories: PredefinedModelCategory[]
  etag: string | null
}

/**
 * Unified storage backend interface
 * Can be implemented as Backend API or Local Storage (IndexedDB/localStorage)
 * All methods are async to support both local and remote storage
 */
export interface IStorageBackend {
  // ===== Uploads (Input Images) =====

  /**
   * Gets all uploaded images
   */
  getInputImages(): Promise<InputImage[]>

  /**
   * Adds a new uploaded image
   * @returns Updated list of all images
   */
  addInputImage(image: InputImage): Promise<InputImage[]>

  /**
   * Removes an uploaded image by id
   * @returns Updated list of all images
   */
  removeInputImage(imageId: string): Promise<InputImage[]>

  /**
   * Clears all uploaded images
   */
  clearInputImages(): Promise<void>

  // ===== Generations (Generated Images) =====

  /**
   * Gets all generated images
   */
  getGeneratedImages(): Promise<GeneratedImage[]>

  /**
   * Adds a new generated image
   * @returns Updated list of all images
   */
  addGeneratedImage(image: GeneratedImage): Promise<GeneratedImage[]>

  /**
   * Removes a generated image by id
   * @returns Updated list of all images
   */
  removeGeneratedImage(imageId: string): Promise<GeneratedImage[]>

  /**
   * Clears all generated images
   */
  clearGeneratedImages(): Promise<void>

  // ===== Consent =====

  /**
   * Gets obtained consent IDs
   */
  getConsentIds(): Promise<string[]>

  /**
   * Adds new consent IDs
   */
  addConsentIds(consentIds: string[]): Promise<void>

  /**
   * Checks if a specific consent has been obtained
   */
  hasConsent(consentId: string): Promise<boolean>

  /**
   * Clears all consent data
   */
  clearConsents(): Promise<void>

  // ===== Onboarding =====

  /**
   * Gets onboarding completion status
   */
  getOnboardingCompleted(): Promise<boolean>

  /**
   * Sets onboarding completion status
   */
  setOnboardingCompleted(completed: boolean): Promise<void>

  /**
   * Clears onboarding status
   */
  clearOnboarding(): Promise<void>

  // ===== Predefined Models =====

  /**
   * Loads cached predefined models
   */
  getPredefinedModels(): Promise<PredefinedModelsCache | null>

  /**
   * Saves predefined models and ETag
   */
  savePredefinedModels(categories: PredefinedModelCategory[], etag: string | null): Promise<void>

  /**
   * Clears cached predefined models
   */
  clearPredefinedModels(): Promise<void>
}
