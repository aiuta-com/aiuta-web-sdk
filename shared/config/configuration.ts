import { AiutaAuth } from './auth'
import { AiutaUserInterface } from './userInterface'
import { AiutaFeatures } from './features'
import { AiutaAnalytics } from './analytics'
import { AiutaDebugSettings } from './debug'

export interface AiutaConfiguration {
  auth: AiutaAuth
  userInterface?: AiutaUserInterface
  features?: AiutaFeatures
  analytics?: AiutaAnalytics
  debugSettings?: AiutaDebugSettings
}
