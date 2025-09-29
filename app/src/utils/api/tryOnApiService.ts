export interface EndpointData {
  skuId: string
  apiKey: string
  subscriptionId?: string
}

import type { Image, InputImage, GeneratedImage } from '@lib/models'

export type { Image, InputImage, GeneratedImage }

export interface GenerationResult {
  status: 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'ABORTED' | 'PENDING'
  generated_images?: GeneratedImage[]
  operation_id?: string
  error?: string
}

export interface OperationResponse {
  operation_id?: string
  error?: string
}

export class TryOnApiService {
  private static readonly BASE_URL = 'https://1web-sdk.aiuta.com/api'

  static async uploadImage(
    file: File,
    endpointData: EndpointData,
  ): Promise<InputImage & { owner_type?: string; error?: string }> {
    const hasSubscriptionId =
      typeof endpointData.subscriptionId === 'string' && endpointData.subscriptionId.length > 0
    const headers: Record<string, string> = {
      'Content-Type': file.type,
      'X-Filename': file.name,
    }

    if (hasSubscriptionId) {
      headers['userid'] = endpointData.subscriptionId!
    } else {
      headers['keys'] = endpointData.apiKey
    }

    const response = await fetch(`${this.BASE_URL}/upload-image`, {
      method: 'POST',
      headers,
      body: file,
    })

    return response.json()
  }

  static async createOperation(
    uploadedImageId: string,
    endpointData: EndpointData,
    jwtToken?: string,
  ): Promise<OperationResponse> {
    const body: any = {
      uploaded_image_id: uploadedImageId,
      ...endpointData,
    }

    if (jwtToken) {
      body.jwtToken = jwtToken
    }

    const response = await fetch(`${this.BASE_URL}/create-operation-id`, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(JSON.stringify(errorData))
    }

    return response.json()
  }

  static async getGenerationResult(
    operationId: string,
    endpointData: EndpointData,
  ): Promise<GenerationResult> {
    // Create request body like original code, but transform subscriptionId to userId
    const body: any = {
      ...endpointData,
      operation_id: operationId,
    }

    // Transform subscriptionId to userId for API compatibility
    if (endpointData.subscriptionId) {
      body.userId = endpointData.subscriptionId
      delete body.subscriptionId
    }

    const response = await fetch(`${this.BASE_URL}/sku-image-operation`, {
      method: 'POST',
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error('Failed to get generation result')
    }

    return response.json()
  }
}
