import { useContext } from 'react'
import type { IStorageBackend } from '@/utils/storage/backends/IStorageBackend'
import { StorageContext } from './StorageContext'

/**
 * Hook to access storage backend
 * @throws Error if used outside StorageProvider
 */
export function useStorageBackend(): IStorageBackend {
  const context = useContext(StorageContext)
  if (!context) {
    throw new Error('useStorageBackend must be used within StorageProvider')
  }
  return context.backend
}
