/**
 * Combines multiple class names into a single string, filtering out falsy values
 *
 * @param classes - Array of class names (strings, undefined, null, false)
 * @returns Combined class name string with spaces
 *
 * @example
 * combineClassNames('base', condition && 'conditional', undefined, 'always')
 * // Returns: "base conditional always"
 *
 * @example
 * combineClassNames(styles.button, isActive && styles.active, className)
 * // Returns: "button active custom-class" (if isActive is true and className is provided)
 */
export const combineClassNames = (...classes: (string | undefined | null | false)[]): string => {
  return classes
    .filter(Boolean) // Remove falsy values (undefined, null, false, empty strings)
    .join(' ') // Join with spaces
    .trim() // Remove leading/trailing spaces
}
