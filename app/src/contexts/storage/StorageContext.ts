import { createContext } from 'react'
import type { StorageContextValue } from './StorageTypes'

export const StorageContext = createContext<StorageContextValue | null>(null)

