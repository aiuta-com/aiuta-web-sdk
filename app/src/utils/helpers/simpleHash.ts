/**
 * Generates a simple hash from a string
 * Used for creating short, deterministic identifiers from API keys
 * Not cryptographically secure, but sufficient for database naming
 */
export function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36) // Base36 for shorter strings
}
