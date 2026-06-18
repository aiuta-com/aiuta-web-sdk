import { useEffect, useState } from 'react'

/**
 * Samples the image's bottom-most 1px row, used to render the fit-disclaimer
 * strip flush under the photo: it returns that row as a (1px-tall) data URL to
 * stretch behind the strip, the row's average color to tint the fill, and a
 * light/dark classification so the text picks a matching color.
 *
 * Results are cached per URL; any failure (CORS, decode) classifies as dark
 * with no strip image — the disclaimer's historical fallback look.
 */

export type ImageTone = 'dark' | 'light'

export interface ImageToneInfo {
  tone: ImageTone
  /** Average color of the sampled bottom row; null when sampling failed */
  averageColor: [number, number, number] | null
  /** The bottom 1px row as a data URL (width × 1), stretched behind the strip */
  stripUrl: string | null
}

const DARK_FALLBACK: ImageToneInfo = { tone: 'dark', averageColor: null, stripUrl: null }

// Average perceived luminance (0..1) above which the row counts as light (light
// fill + dark text). Lowered so mid-bright photo bottoms get the light variant.
const LIGHT_THRESHOLD = 0.7
// Horizontal resolution of the sampled bottom row: enough to keep a smooth
// gradient when stretched across the strip, small enough to stay cheap.
const STRIP_SAMPLE_WIDTH = 128

const toneCache = new Map<string, Promise<ImageToneInfo>>()

const computeTone = (url: string): Promise<ImageToneInfo> =>
  new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = url

    img.onload = () => {
      try {
        const width = img.naturalWidth || 1
        const height = img.naturalHeight || 1

        const sampleWidth = Math.max(1, Math.min(width, STRIP_SAMPLE_WIDTH))
        const canvas = document.createElement('canvas')
        canvas.width = sampleWidth
        canvas.height = 1
        // willReadFrequently: this canvas exists only to getImageData (read
        // back pixels), so hint the browser to keep it on the CPU
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) {
          resolve(DARK_FALLBACK)
          return
        }

        // Draw only the bottom-most 1px row, scaled to sampleWidth × 1
        ctx.drawImage(img, 0, height - 1, width, 1, 0, 0, sampleWidth, 1)

        const { data } = ctx.getImageData(0, 0, sampleWidth, 1)
        let r = 0
        let g = 0
        let b = 0
        const pixelCount = data.length / 4
        for (let i = 0; i < data.length; i += 4) {
          r += data[i]
          g += data[i + 1]
          b += data[i + 2]
        }
        r = Math.round(r / pixelCount)
        g = Math.round(g / pixelCount)
        b = Math.round(b / pixelCount)

        // Perceived luminance, Rec. 709 weights
        const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255

        let stripUrl: string | null = null
        try {
          stripUrl = canvas.toDataURL('image/png')
        } catch {
          // Tainted canvas (cross-origin) — fall back to a tinted/grey fill
          stripUrl = null
        }

        resolve({
          tone: luminance > LIGHT_THRESHOLD ? 'light' : 'dark',
          averageColor: [r, g, b],
          stripUrl,
        })
      } catch {
        // Tainted canvas or decode trouble — keep the default look
        resolve(DARK_FALLBACK)
      }
    }

    img.onerror = () => resolve(DARK_FALLBACK)
  })

/**
 * Returns null while the tone of the current url is still being computed,
 * so the consumer can hide the overlay instead of flashing a guess that
 * may flip a moment later. Failures resolve to the dark fallback.
 */
export const useImageTone = (url?: string | null): ImageToneInfo | null => {
  const [info, setInfo] = useState<ImageToneInfo | null>(null)

  useEffect(() => {
    setInfo(null)
    if (!url) return

    let cancelled = false

    let pending = toneCache.get(url)
    if (!pending) {
      pending = computeTone(url)
      toneCache.set(url, pending)
    }

    pending.then((resolved) => {
      if (!cancelled) setInfo(resolved)
    })

    return () => {
      cancelled = true
    }
  }, [url])

  return info
}
