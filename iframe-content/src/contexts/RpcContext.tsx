import React, { createContext, useContext, ReactNode, useEffect } from 'react'
import type { AiutaRpcApp } from '@shared/rpc'

interface RpcContextType {
  rpc: AiutaRpcApp | null
}

const RpcContext = createContext<RpcContextType | undefined>(undefined)

interface RpcProviderProps {
  children: ReactNode
  rpcApp: AiutaRpcApp | null
}

export function RpcProvider({ children, rpcApp }: RpcProviderProps) {
  return <RpcContext.Provider value={{ rpc: rpcApp }}>{children}</RpcContext.Provider>
}

export function useRpc(): RpcContextType {
  const context = useContext(RpcContext)
  if (context === undefined) {
    throw new Error('useRpc must be used within a RpcProvider')
  }
  return context
}

// Convenience hook for direct access
export function useRpcApp(): AiutaRpcApp | null {
  const { rpc } = useRpc()
  return rpc
}

// Hook that automatically runs callback when RPC becomes available
export function useRpcEffect(
  callback: (rpc: AiutaRpcApp) => void | Promise<void>,
  deps: React.DependencyList = [],
) {
  const rpc = useRpcApp()

  useEffect(() => {
    if (rpc) {
      callback(rpc)
    }
  }, [rpc, ...deps])
}

// Hook for RPC calls with automatic retry and error handling
export function useRpcCall<T>(
  call: (rpc: AiutaRpcApp) => Promise<T>,
  deps: React.DependencyList = [],
): { data: T | null; loading: boolean; error: Error | null } {
  const rpc = useRpcApp()
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  useEffect(() => {
    if (!rpc) return

    setLoading(true)
    setError(null)

    call(rpc)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [rpc, ...deps])

  return { data, loading, error }
}

/**
 * Hook for simple RPC method calls without return handling
 * Automatically handles rpc availability and error logging
 */
export function useRpcMethod() {
  const rpc = useRpcApp()

  return React.useCallback(
    (method: (rpc: AiutaRpcApp) => Promise<any> | any) => {
      if (!rpc) {
        console.warn('[RPC] Method called but RPC not available')
        return
      }

      try {
        const result = method(rpc)
        if (result && typeof result.catch === 'function') {
          result.catch(console.error)
        }
      } catch (error) {
        console.error('[RPC] Method call failed:', error)
      }
    },
    [rpc],
  )
}

/**
 * Creates a proxy RPC object that automatically waits for RPC to be available
 */
function createRpcProxy(rpc: AiutaRpcApp | null): AiutaRpcApp {
  const handler: ProxyHandler<any> = {
    get(_, prop) {
      // If RPC is available, use the real object
      if (rpc) {
        const value = (rpc as any)[prop]
        if (typeof value === 'function') {
          return value.bind(rpc)
        }
        // For nested objects (like rpc.sdk), create nested proxy
        if (typeof value === 'object' && value !== null) {
          return createRpcProxy(value)
        }
        return value
      }

      // If RPC is not available, return a proxy for nested objects
      if (prop === 'sdk' || prop === 'config') {
        return createRpcProxy(null)
      }

      // For methods, return a function that warns and does nothing
      return (...args: any[]) => {
        console.warn(`[RPC] Method ${String(prop)} called but RPC not available`, args)
        return Promise.resolve()
      }
    },
  }

  return new Proxy({}, handler) as AiutaRpcApp
}

/**
 * Hook that returns an always-available RPC object
 * Methods will automatically wait for RPC or warn if unavailable
 */
export function useRpcProxy(): AiutaRpcApp {
  const rpc = useRpcApp()
  return React.useMemo(() => createRpcProxy(rpc), [rpc])
}
