declare const __QR_API_URL__: string

export interface QrUploadResult {
  id: string
  url: string
  owner_type: 'user' | 'scanning'
  error?: string
}

export interface QrEndpointData {
  subscriptionId?: string
  apiKey: string
  skuId: string
}

export class QrApiService {
  private static readonly BASE_URL = __QR_API_URL__

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
}
