import { createContext } from 'react'
import type { LoggerContextType } from './LoggerTypes'

export const LoggerContext = createContext<LoggerContextType | null>(null)

