import dayjs from 'dayjs'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface Logger {
  debug(message?: any, ...optionalParams: any[]): void
  info(message?: any, ...optionalParams: any[]): void
  warn(message?: any, ...optionalParams: any[]): void
  error(message?: any, ...optionalParams: any[]): void
  setEnabled(enabled: boolean): void
  isEnabled(): boolean
}

export function createLogger(component: string, initialEnabled = false): Logger {
  const getPrefix = (level: string) => {
    const timestamp = dayjs().format('HH:mm:ss.SSS')
    return `[${timestamp}] ${level.toUpperCase()} (${component})`
  }

  let enabled = initialEnabled

  return {
    debug: (message?: any, ...optionalParams: any[]) => {
      if (!enabled) return
      console.debug(getPrefix('debug'), message, ...optionalParams)
    },
    info: (message?: any, ...optionalParams: any[]) => {
      if (!enabled) return
      console.info(getPrefix('info'), message, ...optionalParams)
    },
    warn: (message?: any, ...optionalParams: any[]) => {
      if (!enabled) return
      console.warn(getPrefix('warn'), message, ...optionalParams)
    },
    error: (message?: any, ...optionalParams: any[]) => {
      if (!enabled) return
      console.error(getPrefix('error'), message, ...optionalParams)
    },
    setEnabled: (newEnabled: boolean) => {
      enabled = newEnabled
    },
    isEnabled: () => enabled,
  }
}
