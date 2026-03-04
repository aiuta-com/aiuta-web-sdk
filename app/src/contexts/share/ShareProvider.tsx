import React, { ReactNode } from 'react'
import { useModalShare } from '@/hooks/results/useModalShare'
import { ShareContext } from './ShareContext'

interface ShareProviderProps {
  children: ReactNode
}

export function ShareProvider({ children }: ShareProviderProps) {
  const shareModal = useModalShare()

  return <ShareContext.Provider value={shareModal}>{children}</ShareContext.Provider>
}
