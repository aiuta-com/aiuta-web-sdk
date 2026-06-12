import fs from 'fs'

/**
 * CSS class prefix for BEM naming
 */
const CSS_PREFIX = 'aiuta'

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
 * Supports @block annotation to override block name for all classes in file
 */
export const generateScopedName = (name: string, filename: string): string => {
  const componentMatch = filename.match(/([^/]+)\.module\.(css|scss)$/)
  const componentName = componentMatch ? componentMatch[1] : 'component'

  // Try to read block name from file annotation
  let blockName = componentName
  try {
    const fileContent = fs.readFileSync(filename, 'utf-8')
    const blockMatch = fileContent.match(/\/\*\s*@block\s+([^\s]+)\s*\*\//)
    if (blockMatch) {
      blockName = blockMatch[1]
    }
  } catch {
    // Fallback to componentName if can't read file
  }

  const kebabBlock = camelToKebab(blockName)
  const kebabClassName = camelToKebab(name)
  const componentCamelCase = componentName.charAt(0).toLowerCase() + componentName.slice(1)

  // Check if this is a modifier with _ prefix
  if (name.includes('_')) {
    // Everything after the first _ is the modifier: split('_', 2) would
    // silently drop extra segments and collide names like foo_bar_baz
    // with foo_bar (prefer camelCase modifiers, e.g. foo_barBaz)
    const separatorIndex = name.indexOf('_')
    const baseClass = name.slice(0, separatorIndex)
    const modifier = name.slice(separatorIndex + 1).replace(/_/g, '-')
    const kebabModifier = camelToKebab(modifier)

    // If base class matches component name, it's a block modifier
    if (baseClass === componentCamelCase) {
      return `${CSS_PREFIX}-${kebabBlock}--${kebabModifier}`
    }

    // Otherwise it's an element modifier
    const kebabBaseClass = camelToKebab(baseClass)
    return `${CSS_PREFIX}-${kebabBlock}__${kebabBaseClass}--${kebabModifier}`
  }

  // If class matches component name, it's the main block
  if (name === componentCamelCase) {
    return `${CSS_PREFIX}-${kebabBlock}`
  }

  // Regular element
  return `${CSS_PREFIX}-${kebabBlock}__${kebabClassName}`
}
