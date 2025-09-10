import type { AiutaAuth, AiutaJwtCallback } from '@shared/config'

export default class AuthManager {
  private getJwt?: AiutaJwtCallback
  private apiKey?: string
  private userId?: string

  constructor(auth: AiutaAuth) {
    if ('apiKey' in auth) {
      this.apiKey = auth.apiKey
    } else {
      this.userId = auth.subscriptionId
      this.getJwt = auth.getJwt
    }
  }

  getUserId = () => this.userId
  getApiKey = () => this.apiKey

  async getToken(uploaded_image_id: string, productId: string) {
    if (this.getJwt)
      return await this.getJwt({
        uploaded_image_id,
        product_id: productId,
      })
    throw new Error('Aiuta SDK is not initialized with JWT Auth')
  }
}
