import { createContext } from 'react'
import type { ShareContextType } from './ShareTypes'

export const ShareContext = createContext<ShareContextType | null>(null)

