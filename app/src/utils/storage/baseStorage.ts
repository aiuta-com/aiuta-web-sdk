/**
 * Base storage service with common localStorage functionality
 */
export abstract class BaseStorage {
  protected abstract readonly storageKey: string
  protected readonly maxItems: number = 20

  /**
   * Safely reads data from localStorage with error handling and SSR safety
   */
  protected safeRead<T>(fallback: T): T {
    if (typeof window === 'undefined') {
      return fallback
    }

    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : fallback
    } catch (error) {
      console.warn(`Failed to parse data from localStorage (key: ${this.storageKey}):`, error)
      return fallback
    }
  }

  /**
   * Safely writes data to localStorage with error handling and SSR safety
   */
  protected safeWrite<T>(data: T): void {
    if (typeof window === 'undefined') {
      return
    }

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data))
    } catch (error) {
      console.warn(`Failed to save data to localStorage (key: ${this.storageKey}):`, error)
    }
  }

  /**
   * Safely removes data from localStorage
   */
  protected safeRemove(): void {
    if (typeof window === 'undefined') {
      return
    }

    try {
      localStorage.removeItem(this.storageKey)
    } catch (error) {
      console.warn(`Failed to remove data from localStorage (key: ${this.storageKey}):`, error)
    }
  }

  /**
   * Adds item to the beginning of array and limits to maxItems
   * If item with same id already exists, removes it first (deduplication)
   */
  protected addToArrayAndLimit<T extends { id: string }>(currentArray: T[], newItem: T): T[] {
    // Remove existing item with same id to avoid duplicates
    const arrayWithoutDuplicate = currentArray.filter((item) => item.id !== newItem.id)

    // Add new item to the beginning
    const updatedArray = [newItem, ...arrayWithoutDuplicate]

    // Limit to maxItems
    if (updatedArray.length > this.maxItems) {
      updatedArray.splice(this.maxItems)
    }

    return updatedArray
  }
}
