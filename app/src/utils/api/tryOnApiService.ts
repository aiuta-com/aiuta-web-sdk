import type { Image, InputImage, GeneratedImage } from '@lib/models'

export type { Image, InputImage, GeneratedImage }

declare const __TRY_ON_API_URL__: string

/**
 * Authentication parameters for API requests
 */
export interface ApiAuthParams {
  apiKey?: string
  subscriptionId?: string
}

export type AbortReason =
  | 'NO_PEOPLE_DETECTED'
  | 'TOO_MANY_PEOPLE_DETECTED'
  | 'CHILD_DETECTED'
  | string // Allow for future extensions

export interface GenerationResult {
  status: 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'ABORTED' | 'PENDING'
  generated_images?: GeneratedImage[]
  operation_id?: string
  error?: string
  abort_reason?: AbortReason
}

export interface OperationResponse {
  operation_id?: string
  error?: string
}

/**
 * Predefined model category with associated models
 */
export interface PredefinedModelCategory {
  category: string
  models: InputImage[]
}

/**
 * Response from getPredefinedModels API call
 */
export interface PredefinedModelsResponse {
  categories: PredefinedModelCategory[] | null
  etag: string | null
  notModified: boolean
}

export class TryOnApiService {
  private static readonly BASE_URL = __TRY_ON_API_URL__

  /**
   * Add authentication headers to request
   */
  private static addAuthHeaders(headers: Record<string, string>, auth: ApiAuthParams): void {
    if (auth.apiKey) {
      headers['x-api-key'] = auth.apiKey
    } else if (auth.subscriptionId) {
      headers['x-user-id'] = auth.subscriptionId
    }
  }

  static async uploadImage(
    file: File,
    auth: ApiAuthParams,
  ): Promise<InputImage & { owner_type?: string; error?: string }> {
    const formData = new FormData()
    formData.append('image_data', file)

    const headers: Record<string, string> = {}
    this.addAuthHeaders(headers, auth)

    const response = await fetch(`${this.BASE_URL}/uploaded_images`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }))
      return { id: '', url: '', error: errorData.error || 'Upload failed' }
    }

    return response.json()
  }

  static async createOperation(
    uploadedImageId: string,
    productIds: string[],
    auth: ApiAuthParams,
    jwtToken?: string,
  ): Promise<OperationResponse> {
    const body = {
      uploaded_image_id: uploadedImageId,
      sku_ids: productIds,
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (jwtToken) {
      headers['Authorization'] = `Bearer ${jwtToken}`
    } else {
      this.addAuthHeaders(headers, auth)
    }

    const response = await fetch(`${this.BASE_URL}/sku_images_operations`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Operation creation failed' }))
      throw new Error(JSON.stringify(errorData))
    }

    return response.json()
  }

  static async getGenerationResult(
    operationId: string,
    auth: ApiAuthParams,
  ): Promise<GenerationResult> {
    const headers: Record<string, string> = {}
    this.addAuthHeaders(headers, auth)

    const response = await fetch(`${this.BASE_URL}/sku_images_operations/${operationId}`, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error('Failed to get generation result')
    }

    return response.json()
  }

  /**
   * Get predefined models with ETag caching support
   * @param auth Authentication parameters
   * @param ifNoneMatch ETag from previous request for cache validation
   * @returns Object with categories, etag, and notModified flag
   * @throws Error if request fails
   */
  static async getPredefinedModels(
    auth: ApiAuthParams,
    ifNoneMatch?: string | null,
  ): Promise<PredefinedModelsResponse> {
    const headers: Record<string, string> = {}
    this.addAuthHeaders(headers, auth)

    // Add If-None-Match header for cache validation
    if (ifNoneMatch) {
      headers['If-None-Match'] = ifNoneMatch
    }

    const response = await fetch(`${this.BASE_URL}/predefined_try_on_models`, {
      method: 'GET',
      headers,
    })

    // Handle 304 Not Modified - use cached data
    if (response.status === 304) {
      return {
        categories: null,
        etag: ifNoneMatch || null,
        notModified: true,
      }
    }

    if (!response.ok) {
      throw new Error(`Failed to get predefined models: ${response.status} ${response.statusText}`)
    }

    // Extract ETag from response headers
    const etag = response.headers.get('ETag') || response.headers.get('etag') || null

    // Parse response body
    const categories: PredefinedModelCategory[] = await response.json()

    return {
      categories,
      etag,
      notModified: false,
    }
  }
}
