import React, { ReactNode } from 'react'
import type { AiutaAppRpc } from '@lib/rpc'
import { useLoggerConfig } from '@/hooks/app/useLoggerConfig'
import { RpcContext } from './RpcContext'

interface RpcProviderProps {
  children: ReactNode
  rpc: AiutaAppRpc
}

export function RpcProvider({ children, rpc }: RpcProviderProps) {
  useLoggerConfig(rpc)

  return <RpcContext.Provider value={rpc}>{children}</RpcContext.Provider>
}
