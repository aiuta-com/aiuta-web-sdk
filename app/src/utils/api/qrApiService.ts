export interface QrUploadResult {
  id: string
  url: string
  owner_type: 'user' | 'scanning'
  error?: string
}

export interface QrEndpointData {
  userId?: string
  apiKey: string
  skuId: string
}

export class QrApiService {
  private static readonly BASE_URL = 'https://web-sdk.aiuta.com/api'

  /**
   * Upload image file to server
   */
  static async uploadImage(file: File, endpointData: QrEndpointData): Promise<QrUploadResult> {
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

  /**
   * Upload photo via QR token
   */
  static async uploadQrPhoto(token: string, uploadResult: QrUploadResult): Promise<void> {
    await fetch(`${this.BASE_URL}/upload-qr-photo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        ...uploadResult,
      }),
    })
  }

  /**
   * Set QR token status to "scanning"
   */
  static async setQrScanning(token: string): Promise<void> {
    await fetch(`${this.BASE_URL}/upload-qr-photo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: '',
        url: '',
        token,
        type: 'scanning',
      }),
    })
  }

  /**
   * Get uploaded photo by QR token
   */
  static async getQrPhoto(token: string): Promise<QrUploadResult> {
    const response = await fetch(`${this.BASE_URL}/get-photo?token=${token}`)
    return response.json()
  }

  /**
   * Delete QR token after successful upload
   */
  static async deleteQrToken(token: string): Promise<void> {
    const response = await fetch(`${this.BASE_URL}/delete-qr-token?token=${token}`)
    await response.json()
  }

  /**
   * Generate QR URL for scanning
   */
  static generateQrUrl(token: string, endpointData: QrEndpointData): string {
    const hasUserId = endpointData.userId && endpointData.userId.length > 0
    const params = hasUserId ? `userId=${endpointData.userId}` : `apiKey=${endpointData.apiKey}`

    return `https://static.aiuta.com/sdk/v0/index.html#/qr/${token}?${params}`
  }
}
