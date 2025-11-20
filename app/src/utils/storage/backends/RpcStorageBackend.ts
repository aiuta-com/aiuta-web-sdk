/* eslint-disable @typescript-eslint/no-unused-vars */
import type { InputImage, GeneratedImage } from '@lib/models'
import type { PredefinedModelCategory } from '@/utils/api'
import type {
  IStorageBackend,
  PredefinedModelsCache,
} from '@/utils/storage/backends/IStorageBackend'

/**
 * RPC storage backend implementation
 * Communicates with parent SDK via RPC to get/store data from integrating side
 *
 * Data flow:
 * App → RpcStorageBackend → SDK (via RPC) → Integrating side storage
 *
 * TODO: Implement RPC calls when backend storage API is ready
 */
export class RpcStorageBackend implements IStorageBackend {
  // private readonly rpc: AiutaAppRpc

  constructor() {
    // TODO: Pass RPC instance when implementing
    // this.rpc = rpc
  }

  // ===== Uploads =====

  async getInputImages(): Promise<InputImage[]> {
    // TODO: Implement RPC call
    // return await this.rpc.sdk.storage.getUploads()
    throw new Error('RpcStorageBackend not implemented yet')
  }

  async addInputImage(_image: InputImage): Promise<InputImage[]> {
    throw new Error('RpcStorageBackend not implemented yet')
  }

  async removeInputImage(_imageId: string): Promise<InputImage[]> {
    throw new Error('RpcStorageBackend not implemented yet')
  }

  async clearInputImages(): Promise<void> {
    throw new Error('RpcStorageBackend not implemented yet')
  }

  // ===== Generations =====

  async getGeneratedImages(): Promise<GeneratedImage[]> {
    throw new Error('RpcStorageBackend not implemented yet')
  }

  async addGeneratedImage(_image: GeneratedImage): Promise<GeneratedImage[]> {
    throw new Error('RpcStorageBackend not implemented yet')
  }

  async removeGeneratedImage(_imageId: string): Promise<GeneratedImage[]> {
    throw new Error('RpcStorageBackend not implemented yet')
  }

  async clearGeneratedImages(): Promise<void> {
    throw new Error('RpcStorageBackend not implemented yet')
  }

  // ===== Consent =====

  async getConsentIds(): Promise<string[]> {
    throw new Error('RpcStorageBackend not implemented yet')
  }

  async addConsentIds(_consentIds: string[]): Promise<void> {
    throw new Error('RpcStorageBackend not implemented yet')
  }

  async hasConsent(_consentId: string): Promise<boolean> {
    throw new Error('RpcStorageBackend not implemented yet')
  }

  async clearConsents(): Promise<void> {
    throw new Error('RpcStorageBackend not implemented yet')
  }

  // ===== Onboarding =====

  async getOnboardingCompleted(): Promise<boolean> {
    throw new Error('RpcStorageBackend not implemented yet')
  }

  async setOnboardingCompleted(_completed: boolean): Promise<void> {
    throw new Error('RpcStorageBackend not implemented yet')
  }

  async clearOnboarding(): Promise<void> {
    throw new Error('RpcStorageBackend not implemented yet')
  }

  // ===== Predefined Models =====

  async getPredefinedModels(): Promise<PredefinedModelsCache | null> {
    throw new Error('RpcStorageBackend not implemented yet')
  }

  async savePredefinedModels(
    _categories: PredefinedModelCategory[],
    _etag: string | null,
  ): Promise<void> {
    throw new Error('RpcStorageBackend not implemented yet')
  }

  async clearPredefinedModels(): Promise<void> {
    throw new Error('RpcStorageBackend not implemented yet')
  }
}
