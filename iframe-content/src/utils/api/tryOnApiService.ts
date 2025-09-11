export interface EndpointData {
  skuId: string
  apiKey: string
  userId?: string
}

export interface UploadedImage {
  id: string
  url: string
}

export interface GenerationResult {
  status: 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'ABORTED' | 'PENDING'
  generated_images?: UploadedImage[]
  operation_id?: string
  error?: string
}

export interface OperationResponse {
  operation_id?: string
  error?: string
}

export class TryOnApiService {
  private static readonly BASE_URL = 'https://web-sdk.aiuta.com/api'

  static async uploadImage(
    file: File,
    endpointData: EndpointData,
  ): Promise<UploadedImage & { owner_type?: string; error?: string }> {
    const hasUserId = typeof endpointData.userId === 'string' && endpointData.userId.length > 0
    const headers: Record<string, string> = {
      'Content-Type': file.type,
      'X-Filename': file.name,
    }

    if (hasUserId) {
      headers['userid'] = endpointData.userId!
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
    const response = await fetch(`${this.BASE_URL}/sku-image-operation`, {
      method: 'POST',
      body: JSON.stringify({ ...endpointData, operation_id: operationId }),
    })

    if (!response.ok) {
      throw new Error('Failed to get generation result')
    }

    return response.json()
  }
}
