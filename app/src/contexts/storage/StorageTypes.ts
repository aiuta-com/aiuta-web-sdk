import type { IStorageBackend } from '@/utils/storage/backends/IStorageBackend'

export interface StorageContextValue {
  backend: IStorageBackend
}

