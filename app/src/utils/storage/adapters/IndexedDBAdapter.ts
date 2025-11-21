import { IStorageAdapter } from './IStorageAdapter'

/**
 * IndexedDB adapter implementation
 * Stores objects directly using structured clone algorithm
 * Provides better performance and storage capacity compared to localStorage
 */
export class IndexedDBAdapter implements IStorageAdapter {
  readonly maxItems = 100 // IndexedDB can store more items (larger capacity)

  private db: IDBDatabase | null = null
  private readonly dbName: string
  private readonly storeName = 'web-sdk'
  private readonly version = 1

  /**
   * @param hashedKey - Hashed storage key (already processed by createStorageAdapter)
   */
  constructor(hashedKey: string) {
    this.dbName = `aiuta-${hashedKey}`
  }

  /**
   * Initializes IndexedDB connection
   * Must be called before using the adapter
   * @throws Error if IndexedDB is not available or initialization fails
   */
  async init(): Promise<void> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      throw new Error('IndexedDB is not available')
    }

    return new Promise((resolve, reject) => {
      let request: IDBOpenDBRequest

      try {
        // indexedDB.open can throw synchronous errors in some browsers/modes
        // (e.g. Safari Private Browsing, Firefox with IndexedDB disabled)
        request = indexedDB.open(this.dbName, this.version)
      } catch (error) {
        reject(new Error(`Failed to open IndexedDB: ${error}`))
        return
      }

      request.onerror = () => {
        reject(new Error(`Failed to open IndexedDB: ${request.error}`))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        try {
          const db = (event.target as IDBOpenDBRequest).result
          if (!db.objectStoreNames.contains(this.storeName)) {
            db.createObjectStore(this.storeName)
          }
        } catch (error) {
          // If createObjectStore fails, reject the promise
          reject(new Error(`Failed to create object store: ${error}`))
        }
      }
    })
  }

  async getItem<T>(key: string): Promise<T | null> {
    if (!this.db) {
      throw new Error('IndexedDB not initialized. Call init() first.')
    }

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(key)

      request.onsuccess = () => {
        resolve(request.result ?? null)
      }

      request.onerror = () => {
        resolve(null) // Return null on error
      }
    })
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    if (!this.db) {
      throw new Error('IndexedDB not initialized. Call init() first.')
    }

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.put(value, key) // Stores object directly via structured clone

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        resolve() // Silently ignore
      }
    })
  }

  async removeItem(key: string): Promise<void> {
    if (!this.db) {
      throw new Error('IndexedDB not initialized. Call init() first.')
    }

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(key)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        resolve() // Silently ignore
      }
    })
  }
}
