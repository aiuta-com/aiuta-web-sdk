/**
 * Utility functions for Aiuta RPC system
 */

/**
 * Generate random identifier using crypto.randomUUID or fallback
 */
export const rand = () => crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)

/**
 * Extract all function paths from an object recursively
 * @param obj - Object to scan for functions
 * @param prefix - Current path prefix
 * @returns Array of dot-separated function paths
 *
 * @example
 * extractFunctionPaths({ auth: { getToken: () => {} } }) // ['auth.getToken']
 */
export function extractFunctionPaths(obj: unknown, prefix = ''): string[] {
  if (!obj || typeof obj !== 'object') return []
  const out: string[] = []
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (typeof v === 'function') out.push(key)
    else if (v && typeof v === 'object') out.push(...extractFunctionPaths(v, key))
  }
  return out
}

/**
 * Safely clone an object using JSON serialization
 * @param v - Value to clone
 * @returns Cloned value or null if serialization fails
 */
export function jsonSafeClone<T>(v: T): T | null {
  try {
    return JSON.parse(JSON.stringify(v ?? null))
  } catch (error) {
    console.warn('JSON serialization failed:', error)
    return null
  }
}

/**
 * Set a value at a specific path in an object
 * @param obj - Target object
 * @param path - Dot-separated path
 * @param value - Value to set
 *
 * @example
 * setByPath({}, 'auth.getToken', fn) // { auth: { getToken: fn } }
 */
export function setByPath(obj: Record<string, any>, path: string, value: any) {
  const parts = path.split('.')
  let cur = obj
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]]) cur[parts[i]] = {}
    cur = cur[parts[i]]
  }
  cur[parts[parts.length - 1]] = value
}
