/**
 * Storage adapter interface
 * Provides unified async API for different storage backends (IndexedDB, localStorage)
 *
 * Each adapter is responsible for serialization:
 * - IndexedDBAdapter: stores objects directly via structured clone
 * - LocalStorageAdapter: serializes to JSON strings
 */
export interface IStorageAdapter {
  /**
   * Maximum number of items to keep in arrays (uploads, generations)
   * Different adapters have different capacity limits:
   * - IndexedDB: 100 items (larger capacity)
   * - localStorage: 20 items (limited by 5-10MB browser limit)
   */
  readonly maxItems: number
  /**
   * Retrieves item from storage
   * @param key - Storage key
   * @returns Promise resolving to stored value or null if not found
   */
  getItem<T>(key: string): Promise<T | null>

  /**
   * Stores item in storage
   * @param key - Storage key
   * @param value - Value to store (adapter handles serialization)
   */
  setItem<T>(key: string, value: T): Promise<void>

  /**
   * Removes item from storage
   * @param key - Storage key
   */
  removeItem(key: string): Promise<void>
}
