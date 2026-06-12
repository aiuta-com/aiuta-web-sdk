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

const getPixelAt = (ctx: CanvasRenderingContext2D, x: number, y: number): Uint8ClampedArray =>
  ctx.getImageData(x, y, 1, 1).data

// #f3f3f3 — the plain card background a (semi)transparent pixel blends into
const CARD_BG = 243

const toCornerColor = (pixel: Uint8ClampedArray): string => {
  // getImageData returns non-premultiplied RGBA, so the blend is plain JS —
  // no need to re-draw and resample the canvas
  const alpha = (pixel[3] ?? 0) / 255
  const blended: [number, number, number] = [
    (pixel[0] ?? 0) * alpha + CARD_BG * (1 - alpha),
    (pixel[1] ?? 0) * alpha + CARD_BG * (1 - alpha),
    (pixel[2] ?? 0) * alpha + CARD_BG * (1 - alpha),
  ]
  return rgbToString(...lightenColor(blended, 0.05))
}

// Resolves to null when the image has no color at the corners to derive a
// gradient from (a transparent-background packshot)
const getGradient = (url: string): Promise<string | null> =>
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

        const pixels = [
          getPixelAt(ctx, xLeft, yTop),
          getPixelAt(ctx, xRight, yTop),
          getPixelAt(ctx, xLeft, yBottom),
          getPixelAt(ctx, xRight, yBottom),
        ]

        // All four corners fully transparent — the plain card background is
        // already the right look, no gradient needed
        if (pixels.every((pixel) => (pixel[3] ?? 0) === 0)) {
          resolve(null)
          return
        }

        const [tl, tr, bl, br] = pixels.map(toCornerColor)

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
