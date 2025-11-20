export interface AiutaDebugSettings {
  /**
   * Enables detailed console logging for debugging
   */
  isLoggingEnabled: boolean

  /**
   * Forces localStorage adapter instead of IndexedDB for easier debugging
   * localStorage data is visible in DevTools → Application → Local Storage
   * Useful during development when you need to inspect/modify stored data
   */
  forceLocalStorage?: boolean
}
