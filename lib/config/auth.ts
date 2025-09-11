export type AiutaAuth = AiutaApiKeyAuth | AiutaJwtAuth

export interface AiutaApiKeyAuth {
  apiKey: string
}

export interface AiutaJwtAuth {
  subscriptionId: string
  getJwt: AiutaJwtCallback
}

export type AiutaJwtCallback = (params: Record<string, string>) => string | Promise<string>
