import React, { createContext, useContext, ReactNode } from 'react'
import type { AiutaAppRpc } from '@lib/rpc'
import { useLoggerConfig } from '@/hooks'

const RpcContext = createContext<AiutaAppRpc | undefined>(undefined)

interface RpcProviderProps {
  children: ReactNode
  rpc: AiutaAppRpc
}

export function RpcProvider({ children, rpc }: RpcProviderProps) {
  return (
    <RpcContext.Provider value={rpc}>
      <RpcLoggerConfigWrapper>{children}</RpcLoggerConfigWrapper>
    </RpcContext.Provider>
  )
}

function RpcLoggerConfigWrapper({ children }: { children: React.ReactNode }) {
  useLoggerConfig()
  return <>{children}</>
}

export function useRpc(): AiutaAppRpc {
  const context = useContext(RpcContext)
  if (context === undefined) {
    throw new Error('useRpc must be used within a RpcProvider')
  }
  return context
}
