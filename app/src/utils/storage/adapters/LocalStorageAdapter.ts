import { IStorageAdapter } from './IStorageAdapter'

/**
 * LocalStorage adapter implementation
 * Serializes objects to JSON strings for localStorage compatibility
 * Wraps localStorage API with Promise-based interface for consistency
 * Adds prefix to all keys for data isolation
 */
export class LocalStorageAdapter implements IStorageAdapter {
  readonly maxItems = 20 // localStorage is limited to 5-10MB (keep fewer items)

  private readonly prefix: string

  // Old keys from before the migration to hashed prefixes (cleanup on init)
  private static readonly OLD_KEYS = [
    'aiutaGenerationsHistory',
    'aiutaObtainedConsentIds',
    'aiutaOnboardingCompleted',
    'aiutaPredefinedModels',
    'aiutaUploadsHistory',
  ] as const

  /**
   * @param hashedKey - Hashed storage key (already processed by createStorageAdapter)
   */
  constructor(hashedKey: string) {
    this.prefix = hashedKey
  }

  /**
   * Removes old localStorage keys from before the migration
   * Should be called once during app initialization
   */
  static cleanupOldKeys(): void {
    if (typeof window === 'undefined') {
      return
    }

    try {
      LocalStorageAdapter.OLD_KEYS.forEach((key) => {
        if (localStorage.getItem(key) !== null) {
          localStorage.removeItem(key)
        }
      })
    } catch {
      // Silently ignore cleanup errors (not critical)
    }
  }

  private getFullKey(key: string): string {
    return `aiuta-${this.prefix}-${key}`
  }

  async getItem<T>(key: string): Promise<T | null> {
    if (typeof window === 'undefined') {
      return null
    }

    try {
      const stored = localStorage.getItem(this.getFullKey(key))
      return stored ? JSON.parse(stored) : null
    } catch {
      // Return null on error (data may be corrupted)
      return null
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    if (typeof window === 'undefined') {
      return
    }

    try {
      localStorage.setItem(this.getFullKey(key), JSON.stringify(value))
    } catch {
      // Silently ignore (may hit quota limit)
    }
  }

  async removeItem(key: string): Promise<void> {
    if (typeof window === 'undefined') {
      return
    }

    try {
      localStorage.removeItem(this.getFullKey(key))
    } catch {
      // Silently ignore
    }
  }
}
