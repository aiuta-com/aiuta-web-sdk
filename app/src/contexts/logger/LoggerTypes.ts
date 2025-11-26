import type { Logger } from '@lib/logger'

export interface ReactLogger extends Logger {
  infoOnce(message?: any, ...optionalParams: any[]): void
  debugOnce(message?: any, ...optionalParams: any[]): void
}

export interface LoggerContextType {
  logger: ReactLogger
  setEnabled: (enabled: boolean) => void
  enabled: boolean
}
