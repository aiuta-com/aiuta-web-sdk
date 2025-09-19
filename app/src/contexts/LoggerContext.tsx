import React, { createContext, useContext, useState, useRef, useEffect, useMemo } from 'react'
import { createLogger, type Logger } from '@lib/logger'

export interface ReactLogger extends Logger {
  infoOnce(message?: any, ...optionalParams: any[]): void
  debugOnce(message?: any, ...optionalParams: any[]): void
}

interface LoggerContextType {
  logger: ReactLogger
  setEnabled: (enabled: boolean) => void
  enabled: boolean
}

interface BufferedMessage {
  level: 'debug' | 'info' | 'warn' | 'error'
  message?: any
  optionalParams: any[]
  timestamp: number
}

const LoggerContext = createContext<LoggerContextType | null>(null)

interface LoggerProviderProps {
  children: React.ReactNode
  component: string
  initialEnabled?: boolean
}

export const LoggerProvider = ({
  children,
  component,
  initialEnabled = false,
}: LoggerProviderProps) => {
  const [baseLogger] = useState(() => createLogger(component, initialEnabled))
  const [enabled, setEnabled] = useState(initialEnabled)
  const [loggedMessages] = useState(() => new Set<string>())
  const bufferedMessages = useRef<BufferedMessage[]>([])
  const bufferTimeout = useRef<NodeJS.Timeout | null>(null)

  // Sync enabled state with logger and replay buffered messages
  useEffect(() => {
    baseLogger.setEnabled(enabled)

    if (enabled && bufferedMessages.current.length > 0) {
      // Replay buffered messages
      bufferedMessages.current.forEach(({ level, message, optionalParams }) => {
        baseLogger[level](message, ...optionalParams)
      })
      bufferedMessages.current = []

      // Clear timeout since we used the buffer
      if (bufferTimeout.current) {
        clearTimeout(bufferTimeout.current)
        bufferTimeout.current = null
      }
    }
  }, [baseLogger, enabled])

  // Start buffer cleanup timeout when logger is first created (disabled)
  useEffect(() => {
    if (!enabled && !bufferTimeout.current) {
      bufferTimeout.current = setTimeout(() => {
        bufferedMessages.current = []
        bufferTimeout.current = null
      }, 5000) // Clear buffer after 5 seconds
    }

    return () => {
      if (bufferTimeout.current) {
        clearTimeout(bufferTimeout.current)
      }
    }
  }, [enabled])

  // Create buffering wrapper for logger methods
  const createBufferingMethod =
    (level: 'debug' | 'info' | 'warn' | 'error') =>
    (message?: any, ...optionalParams: any[]) => {
      if (baseLogger.isEnabled()) {
        baseLogger[level](message, ...optionalParams)
      } else {
        // Buffer the message when logger is disabled
        bufferedMessages.current.push({
          level,
          message,
          optionalParams,
          timestamp: Date.now(),
        })
      }
    }

  // Create React logger with deduplication and buffering methods
  const reactLogger: ReactLogger = useMemo(
    () => ({
      debug: createBufferingMethod('debug'),
      info: createBufferingMethod('info'),
      warn: createBufferingMethod('warn'),
      error: createBufferingMethod('error'),
      setEnabled: baseLogger.setEnabled,
      isEnabled: baseLogger.isEnabled,
      infoOnce: (message?: any, ...optionalParams: any[]) => {
        const key = `info:${JSON.stringify(message)}:${JSON.stringify(optionalParams)}`
        if (loggedMessages.has(key)) return
        loggedMessages.add(key)

        if (baseLogger.isEnabled()) {
          baseLogger.info(message, ...optionalParams)
        } else {
          // Buffer the message when logger is disabled
          bufferedMessages.current.push({
            level: 'info',
            message,
            optionalParams,
            timestamp: Date.now(),
          })
        }
      },
      debugOnce: (message?: any, ...optionalParams: any[]) => {
        const key = `debug:${JSON.stringify(message)}:${JSON.stringify(optionalParams)}`
        if (loggedMessages.has(key)) return
        loggedMessages.add(key)

        if (baseLogger.isEnabled()) {
          baseLogger.debug(message, ...optionalParams)
        } else {
          // Buffer the message when logger is disabled
          bufferedMessages.current.push({
            level: 'debug',
            message,
            optionalParams,
            timestamp: Date.now(),
          })
        }
      },
    }),
    [baseLogger, loggedMessages],
  )

  return (
    <LoggerContext.Provider value={{ logger: reactLogger, setEnabled, enabled }}>
      {children}
    </LoggerContext.Provider>
  )
}

export const useLogger = () => {
  const context = useContext(LoggerContext)
  if (!context) {
    throw new Error('useLogger must be used within a LoggerProvider')
  }
  return context.logger
}

export const useLoggerControl = () => {
  const context = useContext(LoggerContext)
  if (!context) {
    throw new Error('useLoggerControl must be used within a LoggerProvider')
  }
  return { setEnabled: context.setEnabled, enabled: context.enabled }
}
