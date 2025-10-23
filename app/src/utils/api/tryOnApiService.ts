export interface EndpointData {
  skuId: string
  apiKey: string
  subscriptionId?: string
}

import type { Image, InputImage, GeneratedImage } from '@lib/models'

export type { Image, InputImage, GeneratedImage }

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

export class TryOnApiService {
  private static readonly BASE_URL = 'https://api.aiuta.com/digital-try-on/v1'

  static async uploadImage(
    file: File,
    endpointData: EndpointData,
  ): Promise<InputImage & { owner_type?: string; error?: string }> {
    const formData = new FormData()
    formData.append('image_data', file)

    const headers: Record<string, string> = {}

    if (endpointData.apiKey) {
      headers['x-api-key'] = endpointData.apiKey
    } else if (endpointData.subscriptionId) {
      headers['x-user-id'] = endpointData.subscriptionId
    }

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
    endpointData: EndpointData,
    jwtToken?: string,
  ): Promise<OperationResponse> {
    const body: any = {
      uploaded_image_id: uploadedImageId,
      sku_id: endpointData.skuId,
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (jwtToken) {
      headers['Authorization'] = `Bearer ${jwtToken}`
    } else if (endpointData.apiKey) {
      headers['x-api-key'] = endpointData.apiKey
    } else if (endpointData.subscriptionId) {
      headers['x-user-id'] = endpointData.subscriptionId
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
    endpointData: EndpointData,
  ): Promise<GenerationResult> {
    const headers: Record<string, string> = {}

    // Choose auth method based on available credentials
    if (endpointData.apiKey) {
      headers['x-api-key'] = endpointData.apiKey
    } else if (endpointData.subscriptionId) {
      headers['x-user-id'] = endpointData.subscriptionId
    }

    const response = await fetch(`${this.BASE_URL}/sku_images_operations/${operationId}`, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error('Failed to get generation result')
    }

    return response.json()
  }
}
