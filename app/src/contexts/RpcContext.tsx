import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react'
import type { AiutaRpcApp } from '@lib/rpc'
import { useLoggerConfig } from '@/hooks'

const RpcContext = createContext<AiutaRpcApp | null | undefined>(undefined)

interface RpcProviderProps {
  children: ReactNode
  rpc: AiutaRpcApp | null
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

export function useRpc(): AiutaRpcApp | null {
  const context = useContext(RpcContext)
  if (context === undefined) {
    throw new Error('useRpc must be used within a RpcProvider')
  }
  return context
}

// Hook that automatically runs callback when RPC becomes available
export function useRpcEffect(
  callback: (rpc: AiutaRpcApp) => void | Promise<void>,
  deps: React.DependencyList = [],
) {
  const rpc = useRpc()

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
  const rpc = useRpc()
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

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
  const rpc = useRpc()

  return useCallback(
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
        // For nested objects (like rpc.sdk), return the real object directly
        if (typeof value === 'object' && value !== null) {
          return value
        }
        return value
      }

      // If RPC is not available, return a proxy for nested objects
      if (prop === 'sdk' || prop === 'configuration') {
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
  const rpc = useRpc()
  return useMemo(() => createRpcProxy(rpc), [rpc])
}
