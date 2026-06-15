import { AiutaAuth } from './auth'
import { AiutaUserInterface } from './userInterface'
import { AiutaFeatures } from './features'
import { AiutaModes } from './modes'
import { AiutaAnalytics } from './analytics'
import { AiutaDebugSettings } from './debug'

export interface AiutaConfiguration {
  auth: AiutaAuth
  userInterface?: AiutaUserInterface
  features?: AiutaFeatures
  modes?: AiutaModes
  analytics?: AiutaAnalytics
  debugSettings?: AiutaDebugSettings
}
