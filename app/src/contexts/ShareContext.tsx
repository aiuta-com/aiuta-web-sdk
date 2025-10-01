import React, { createContext, useContext, ReactNode } from 'react'
import { useModalShare } from '@/hooks'

interface ShareContextType {
  modalData: { imageUrl: string } | null
  isOpen: boolean
  openShareModal: (imageUrl: string) => void
  closeShareModal: () => void
}

const ShareContext = createContext<ShareContextType | null>(null)

interface ShareProviderProps {
  children: ReactNode
}

export const ShareProvider = ({ children }: ShareProviderProps) => {
  const shareModal = useModalShare()

  return <ShareContext.Provider value={shareModal}>{children}</ShareContext.Provider>
}

export const useShare = (): ShareContextType => {
  const context = useContext(ShareContext)
  if (!context) {
    throw new Error('useShare must be used within a ShareProvider')
  }
  return context
}
