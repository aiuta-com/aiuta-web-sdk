import { useEffect, useState } from 'react'

/**
 * Classifies the bottom band of an image as light or dark, so overlays laid
 * over it (the fit disclaimer strip) can pick a matching appearance, and
 * exposes the band's average color for tinted fills.
 *
 * Samples the bottom ~5% of the image into a tiny canvas and averages the
 * perceived luminance. Results are cached per URL; any failure (CORS,
 * decode) classifies as dark — the strip's historical default.
 */

export type ImageTone = 'dark' | 'light'

export interface ImageToneInfo {
  tone: ImageTone
  /** Average color of the sampled band; null when sampling failed */
  averageColor: [number, number, number] | null
}

const DARK_FALLBACK: ImageToneInfo = { tone: 'dark', averageColor: null }

// Average perceived luminance (0..1) above which the band counts as light.
// Deliberately high: when in doubt the strip must stay in the dark variant —
// dark text was showing up on fairly dark photo bottoms with a lower value.
const LIGHT_THRESHOLD = 0.82
// The disclaimer strip is ~20px over a ~600px image — the bottom 5% band
const BAND_FRACTION = 0.05
// Downsample target: averaging needs very few pixels
const SAMPLE_WIDTH = 32
const SAMPLE_HEIGHT = 4

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

        const canvas = document.createElement('canvas')
        canvas.width = SAMPLE_WIDTH
        canvas.height = SAMPLE_HEIGHT
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(DARK_FALLBACK)
          return
        }

        const bandHeight = Math.max(1, Math.round(height * BAND_FRACTION))
        ctx.drawImage(
          img,
          0,
          height - bandHeight,
          width,
          bandHeight,
          0,
          0,
          SAMPLE_WIDTH,
          SAMPLE_HEIGHT,
        )

        const { data } = ctx.getImageData(0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT)
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

        resolve({
          tone: luminance > LIGHT_THRESHOLD ? 'light' : 'dark',
          averageColor: [r, g, b],
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
