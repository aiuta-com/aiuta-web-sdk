import { useContext } from 'react'
import type { ShareContextType } from './ShareTypes'
import { ShareContext } from './ShareContext'

export function useShare(): ShareContextType {
  const context = useContext(ShareContext)
  if (!context) {
    throw new Error('useShare must be used within a ShareProvider')
  }
  return context
}
