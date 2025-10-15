import { useEffect } from 'react'
import { useRpc } from '@/contexts'
import { useLogger } from '@/contexts'

/**
 * Removes common leading whitespace from all lines (dedent)
 */
function dedent(text: string): string {
  const lines = text.split('\n')

  // Find minimum indentation (excluding empty lines)
  const nonEmptyLines = lines.filter((line) => line.trim().length > 0)
  if (nonEmptyLines.length === 0) return text.trim()

  const minIndent = Math.min(
    ...nonEmptyLines.map((line) => {
      const match = line.match(/^(\s*)/)
      return match ? match[1].length : 0
    }),
  )

  // Remove the common indentation from all lines
  const dedented = lines.map((line) => line.slice(minIndent)).join('\n')

  return '\n' + dedented.trim() + '\n'
}

/**
 * Hook for applying custom CSS content from RPC configuration
 * Injects CSS as a <style> tag with highest priority
 * This is a synchronous operation - styles are applied immediately
 */
export const useCustomCss = () => {
  const rpc = useRpc()
  const logger = useLogger()
  const customCss = rpc.config?.userInterface?.theme?.customCss

  useEffect(() => {
    if (!customCss) {
      return
    }

    try {
      const style = document.createElement('style')
      style.textContent = dedent(customCss)

      document.head.appendChild(style)

      logger.info('Custom CSS injected', { length: customCss.length })

      return () => {
        if (document.head.contains(style)) {
          document.head.removeChild(style)
        }
      }
    } catch (error) {
      logger.error('Failed to inject custom CSS', error)
    }
  }, [customCss, logger])
}
