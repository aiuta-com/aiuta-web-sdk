import React, { useEffect, useState, ReactNode } from 'react'
import type { StorageContextValue } from './StorageTypes'
import { LocalStorageBackend } from '@/utils/storage/backends/LocalStorageBackend'
import { LocalStorageAdapter } from '@/utils/storage/adapters/LocalStorageAdapter'
import { createStorageAdapter } from '@/utils/storage/adapters/createStorageAdapter'
import { useRpc } from '../rpc/useRpc'
import { StorageContext } from './StorageContext'

interface StorageProviderProps {
  children: ReactNode
}

/**
 * Storage provider that manages storage backend and isolation by apiKey/subscriptionId
 * Automatically creates appropriate storage backend (Local or Backend API)
 * and ensures data isolation between different API credentials
 */
export function StorageProvider({ children }: StorageProviderProps) {
  const rpc = useRpc()
  const [contextValue, setContextValue] = useState<StorageContextValue | null>(null)

  useEffect(() => {
    // Wait for RPC to be initialized first
    if (!rpc) {
      return
    }

    // Cleanup old localStorage keys from before migration (once per app lifecycle)
    LocalStorageAdapter.cleanupOldKeys()

    // Create storage key from API credentials for data isolation
    // Config validation ensures we always have valid auth at this point
    const auth = rpc.config.auth
    const storageKey = 'apiKey' in auth ? auth.apiKey : auth.subscriptionId

    // Get debug settings
    const forceLocalStorage = rpc.config.debugSettings?.forceLocalStorage ?? false

    // Initialize storage backend
    let mounted = true

    // TODO: Check if backend storage is configured, then use BackendStorageAdapter
    // For now, always use LocalStorageBackend
    createStorageAdapter(storageKey, forceLocalStorage).then((adapter) => {
      if (mounted) {
        const backend = new LocalStorageBackend(adapter)
        setContextValue({ backend })
      }
    })

    return () => {
      mounted = false
    }
  }, [rpc])

  // Don't render children until storage is ready
  if (!contextValue) {
    return null
  }

  return <StorageContext.Provider value={contextValue}>{children}</StorageContext.Provider>
}
