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
  AiutaAnalyticsCallback,
  AiutaJwtCallback,
} from '@lib/config'

import Aiuta from './aiuta'

if (typeof window !== 'undefined') {
  ;(window as any).Aiuta = Aiuta
}
