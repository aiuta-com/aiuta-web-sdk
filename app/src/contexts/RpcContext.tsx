import React, { createContext, useContext, ReactNode } from 'react'
import type { AiutaAppRpc } from '@lib/rpc'
import { useLoggerConfig } from '@/hooks'

export const RpcContext = createContext<AiutaAppRpc | undefined>(undefined)

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

/**
 * Creates a simple RPC stub for standalone mode
 */
function createRpcStub(): AiutaAppRpc {
  const handler: ProxyHandler<any> = {
    get(_, prop) {
      // For nested objects (like rpc.sdk, rpc.config), return another proxy
      if (prop === 'sdk' || prop === 'config') {
        return createRpcStub()
      }

      // For all other properties, return a no-op function
      return () => Promise.resolve()
    },
  }

  return new Proxy({}, handler) as AiutaAppRpc
}

export function useRpc(): AiutaAppRpc {
  const context = useContext(RpcContext)
  if (context === undefined) {
    // Return simple stub for standalone mode
    return createRpcStub()
  }
  // Return real RPC when available
  return context
}
