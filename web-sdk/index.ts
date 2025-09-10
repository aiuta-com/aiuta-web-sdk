export { default as Aiuta } from './aiuta'
export type {
  AiutaConfiguration,
  AiutaAuth,
  AiutaApiKeyAuth,
  AiutaJwtAuth,
  AiutaUserInterface,
  AiutaFeatures,
  AiutaAnalytics,
  AiutaDebugSettings,
  AiutaIframePosition,
  AiutaAnalyticsCallback,
  AiutaJwtCallback,
} from '@shared/config'

import Aiuta from './aiuta'

if (typeof window !== 'undefined') {
  ;(window as any).Aiuta = Aiuta
}
