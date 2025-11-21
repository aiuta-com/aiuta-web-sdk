import { IStorageAdapter } from './IStorageAdapter'
import { IndexedDBAdapter } from './IndexedDBAdapter'
import { LocalStorageAdapter } from './LocalStorageAdapter'

/**
 * Creates storage adapter with automatic fallback
 * Tries IndexedDB first, falls back to localStorage if unavailable
 *
 * @param storageKey - Unique identifier for storage (apiKey or subscriptionId)
 * @param forceLocalStorage - If true, forces localStorage (useful for debugging)
 * @returns Promise resolving to initialized storage adapter
 */
export async function createStorageAdapter(
  storageKey: string,
  forceLocalStorage?: boolean,
): Promise<IStorageAdapter> {
  const hashedKey = storageKey.toLowerCase()

  // Force localStorage if debug flag is set
  if (forceLocalStorage) {
    return new LocalStorageAdapter(hashedKey)
  }

  // Try IndexedDB first
  try {
    const indexedDBAdapter = new IndexedDBAdapter(hashedKey)
    await indexedDBAdapter.init()
    return indexedDBAdapter
  } catch {
    // Fallback to localStorage if IndexedDB unavailable
    return new LocalStorageAdapter(hashedKey)
  }
}
