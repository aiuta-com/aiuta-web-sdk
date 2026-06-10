import { useCallback, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

/**
 * Derives a soft corner-color radial gradient from a product image and exposes it
 * as a background style for catalog cards. Ported from the marketing demo.
 */

const rgbToString = (r: number, g: number, b: number): string =>
  `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max)

const lightenColor = (
  [r, g, b]: [number, number, number],
  amount = 0.15,
): [number, number, number] => [
  r + (255 - r) * amount,
  g + (255 - g) * amount,
  b + (255 - b) * amount,
]

const getColorAt = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
): [number, number, number] => {
  const data = ctx.getImageData(x, y, 1, 1).data
  return lightenColor([data[0] ?? 0, data[1] ?? 0, data[2] ?? 0], 0.05)
}

const getGradient = (url: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = url

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas not supported'))
          return
        }

        const width = img.width || 1
        const height = img.height || 1
        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)

        const maxX = width - 1
        const maxY = height - 1
        const offsetX = Math.round(width * 0.01)
        const offsetY = Math.round(height * 0.01)

        const xLeft = clamp(offsetX, 0, maxX)
        const xRight = clamp(maxX - offsetX, 0, maxX)
        const yTop = clamp(offsetY, 0, maxY)
        const yBottom = clamp(maxY - offsetY, 0, maxY)

        const tl = rgbToString(...getColorAt(ctx, xLeft, yTop))
        const tr = rgbToString(...getColorAt(ctx, xRight, yTop))
        const bl = rgbToString(...getColorAt(ctx, xLeft, yBottom))
        const br = rgbToString(...getColorAt(ctx, xRight, yBottom))

        resolve(
          [
            `radial-gradient(circle at left top, ${tl} 0, ${tl} 35%, transparent 65%)`,
            `radial-gradient(circle at right top, ${tr} 0, ${tr} 35%, transparent 65%)`,
            `radial-gradient(circle at left bottom, ${bl} 0, ${bl} 35%, transparent 65%)`,
            `radial-gradient(circle at right bottom, ${br} 0, ${br} 35%, transparent 65%)`,
          ].join(', '),
        )
      } catch (e) {
        reject(e instanceof Error ? e : new Error('Failed to read image data'))
      }
    }

    img.onerror = () => reject(new Error('Image failed to load'))
  })

export const useImageGradient = () => {
  const [gradients, setGradients] = useState<Record<string, string>>({})
  const seen = useRef(new Set<string>())

  const initGradient = useCallback(async (skuId: string, url: string): Promise<void> => {
    if (!url || seen.current.has(skuId)) return
    seen.current.add(skuId)

    try {
      const gradient = await getGradient(url)
      if (gradient) setGradients((prev) => ({ ...prev, [skuId]: gradient }))
    } catch {
      // Cross-origin / decode failures fall back to the plain card background.
      seen.current.delete(skuId)
    }
  }, [])

  const getBgStyle = useCallback(
    (skuId: string): CSSProperties => {
      const gradient = gradients[skuId]
      return gradient
        ? { backgroundImage: gradient, backgroundColor: '#f3f3f3' }
        : { backgroundColor: '#f3f3f3' }
    },
    [gradients],
  )

  return { getBgStyle, initGradient }
}
