/**
 * Image orientation fixing utility
 *
 * Fixes EXIF orientation issues that cause images to appear rotated
 * when uploaded from mobile devices. Reads EXIF data, applies proper
 * rotation/flipping, and returns a corrected image blob.
 */

// Result types
export type FixedImage = {
  blob: Blob
  objectUrl: string
  width: number // final image width (after rotation)
  height: number // final image height (after rotation)
  mime: string // actual MIME type of the resulting blob
}

export type FixOptions = {
  /** Output format ('image/jpeg' | 'image/png' | 'image/webp'), default 'image/jpeg' */
  outputMime?: string
  /** JPEG/WebP quality: 0..1, default 0.92 */
  quality?: number
  /** Limit maximum side (for downscaling), 0 = no limit */
  maxSide?: number
}

/**
 * Main function: takes File/Blob with image, returns Blob with fixed orientation
 */
export async function fixImageOrientation(file: Blob, opts: FixOptions = {}): Promise<FixedImage> {
  const outputMime = opts.outputMime ?? 'image/jpeg'
  const quality = opts.quality ?? 0.92
  const maxSide = opts.maxSide ?? 1500

  // 1) Read ArrayBuffer for EXIF parsing (JPEG only)
  const buf = await file.arrayBuffer()
  const view = new DataView(buf)

  const isJPEG = view.getUint16(0) === 0xffd8
  let orientation = 1 // default

  // Read EXIF for debugging, but let browser handle orientation automatically
  if (isJPEG) {
    orientation = readExifOrientation(view) ?? 1
    console.log('EXIF Debug (browser will handle automatically):', {
      isJPEG,
      orientation,
      fileSize: file.size,
      fileType: file.type,
      fileName: (file as File).name || 'unknown',
    })
  }

  // 2) Create image element - let browser handle EXIF orientation automatically
  const img = await createImageElement(file)

  // 3) Use image dimensions as-is (browser already applied EXIF orientation)
  let srcW = img.width
  let srcH = img.height
  let dstW = srcW
  let dstH = srcH

  console.log('Image dimensions (browser handled EXIF):', {
    srcW,
    srcH,
    dstW,
    dstH,
  })

  // 4) Downscale by maxSide (if specified)
  let scale = 1
  if (maxSide > 0) {
    const maxCurrent = Math.max(dstW, dstH)
    if (maxCurrent > maxSide) scale = maxSide / maxCurrent
  }
  dstW = Math.round(dstW * scale)
  dstH = Math.round(dstH * scale)

  // 5) Draw on canvas WITHOUT any rotation (browser already handled it)
  const canvas = getCanvas(dstW, dstH)
  const ctx = canvas.getContext('2d')!

  // High quality smoothing for downscaling
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  // Draw image as-is - no transformations needed
  ctx.drawImage(img, 0, 0, srcW, srcH, 0, 0, dstW, dstH)

  const blob: Blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b!), outputMime, quality),
  )

  const objectUrl = URL.createObjectURL(blob)
  return { blob, objectUrl, width: dstW, height: dstH, mime: blob.type || outputMime }
}

/* ===================== HELPER FUNCTIONS ===================== */

/**
 * Parse EXIF Orientation (0x0112) from JPEG APP1 / TIFF
 */
function readExifOrientation(view: DataView): number | undefined {
  let offset = 2 // skip SOI (FFD8)
  const length = view.byteLength

  while (offset < length) {
    const marker = view.getUint16(offset)
    offset += 2
    if (marker === 0xffe1) {
      // APP1
      const size = view.getUint16(offset) // segment size
      offset += 2

      // Check "Exif\0\0" signature
      if (view.getUint32(offset) === 0x45786966 && view.getUint16(offset + 4) === 0x0000) {
        const tiffStart = offset + 6
        const little = view.getUint16(tiffStart) === 0x4949 // 'II'
        const get16 = (o: number) => (little ? view.getUint16(o, true) : view.getUint16(o, false))
        const get32 = (o: number) => (little ? view.getUint32(o, true) : view.getUint32(o, false))

        if (get16(tiffStart + 2) !== 0x002a) return // TIFF magic
        const ifd0Offset = get32(tiffStart + 4)
        const ifd0Start = tiffStart + ifd0Offset

        const numEntries = get16(ifd0Start)
        for (let i = 0; i < numEntries; i++) {
          const entry = ifd0Start + 2 + i * 12
          const tag = get16(entry)
          if (tag === 0x0112) {
            // Orientation
            const value = get16(entry + 8)
            return value // 1..8
          }
        }
      }
      // If not EXIF, jump to next segment
      offset += size - 2
    } else if ((marker & 0xff00) !== 0xff00) {
      // Invalid marker
      break
    } else if (marker === 0xffda) {
      // SOS - image data follows
      break
    } else {
      // Other segments (APP0, APP2, DQT, etc.)
      const size = view.getUint16(offset)
      offset += size
    }
  }
  return undefined
}

/**
 * Create image element - let browser handle EXIF orientation automatically
 */
async function createImageElement(file: Blob): Promise<HTMLImageElement> {
  console.log('Using <img> element - let browser handle EXIF automatically')
  const url = URL.createObjectURL(file)
  const img = await loadImage(url)
  URL.revokeObjectURL(url)
  console.log('Created img element', { width: img.width, height: img.height })
  return img
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = (e) => reject(e)
    img.src = url
  })
}

function getCanvas(w: number, h: number): HTMLCanvasElement {
  // OffscreenCanvas would give performance boost, but not available everywhere
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  return canvas
}
