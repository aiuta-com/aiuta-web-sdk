import { createContext } from 'react'
import type { AlertContextValue, AlertStateContextValue } from './AlertTypes'

export const AlertContext = createContext<AlertContextValue | null>(null)
export const AlertStateContext = createContext<AlertStateContextValue | null>(null)

