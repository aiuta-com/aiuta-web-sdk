/**
 * Convert camelCase to kebab-case
 */
export const camelToKebab = (str: string): string => {
  return str
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '')
}

/**
 * BEM (Block Element Modifier) class name generator for CSS modules
 * Generates consistent CSS class names following BEM methodology with aiuta- prefix
 */
export const generateScopedName = (name: string, filename: string): string => {
  const componentMatch = filename.match(/([^/]+)\.module\.(css|scss)$/)
  const componentName = componentMatch ? componentMatch[1] : 'component'

  const kebabComponent = camelToKebab(componentName)
  const kebabClassName = camelToKebab(name)

  // If class name matches component name (main block), return just the block
  if (kebabClassName === kebabComponent) {
    return `aiuta-${kebabComponent}`
  }

  // Check if this is a modifier of the main component with _ prefix
  // e.g., selectionSnackbar_visible -> selectionSnackbar + visible (modifier)
  const componentCamelCase = componentName.charAt(0).toLowerCase() + componentName.slice(1)
  if (name.startsWith(`${componentCamelCase}_`)) {
    const modifier = name.substring(`${componentCamelCase}_`.length)
    const kebabModifier = camelToKebab(modifier)
    return `aiuta-${kebabComponent}--${kebabModifier}`
  }

  // Check if this is a modifier with _ prefix
  // e.g., container_active -> container + active (modifier)
  if (name.includes('_')) {
    const [baseClass, modifier] = name.split('_', 2)
    const kebabBaseClass = camelToKebab(baseClass)
    const kebabModifier = camelToKebab(modifier)

    return `aiuta-${kebabComponent}__${kebabBaseClass}--${kebabModifier}`
  }

  // Regular element
  return `aiuta-${kebabComponent}__${kebabClassName}`
}
