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

  if (isJPEG) {
    orientation = readExifOrientation(view) ?? 1

    // Special handling for Live Photos - they may not need rotation
    const fileName = (file as File).name || ''
    const isLivePhoto = fileName.includes('IMG_') && fileName.includes('.jpeg')

    console.log('EXIF Debug:', {
      isJPEG,
      orientation,
      fileSize: file.size,
      fileType: file.type,
      fileName,
      isLivePhoto,
    })

    // For Live Photos, try skipping orientation fix
    if (isLivePhoto) {
      console.log('Live Photo detected - skipping orientation fix, using orientation = 1')
      orientation = 1 // Force no rotation for Live Photos
    }
  }

  // 2) Create bitmap WITHOUT auto-orientation to handle rotation ourselves
  const bitmap = await createBitmapNoAutoOrientation(file)

  // 3) Calculate final dimensions considering 90° rotations
  let srcW = bitmap.width
  let srcH = bitmap.height
  const swapWH = [5, 6, 7, 8].includes(orientation)
  let dstW = swapWH ? srcH : srcW
  let dstH = swapWH ? srcW : srcH

  console.log('Dimensions Debug:', {
    orientation,
    srcW,
    srcH,
    swapWH,
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

  // 5) Draw on canvas with proper transformation
  const canvas = getCanvas(dstW, dstH)
  const ctx = canvas.getContext('2d')!
  applyOrientationTransform(ctx, orientation, dstW, dstH)

  // If scaling - account for source vs result difference
  const drawW = swapWH ? Math.round(srcH * scale) : Math.round(srcW * scale)
  const drawH = swapWH ? Math.round(srcW * scale) : Math.round(srcH * scale)

  // High quality smoothing for downscaling
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  ctx.drawImage(bitmap as any, 0, 0, srcW, srcH, 0, 0, drawW, drawH)

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
 * Create ImageBitmap without auto-orientation; fallback via <img>
 */
async function createBitmapNoAutoOrientation(file: Blob): Promise<ImageBitmap | HTMLImageElement> {
  // For Live Photos and problematic files, prefer <img> element
  const fileName = (file as File).name || ''
  const isLivePhoto = fileName.includes('IMG_') && fileName.includes('.jpeg')

  if (isLivePhoto) {
    console.log('Detected Live Photo, using <img> element for more predictable behavior')
    const url = URL.createObjectURL(file)
    const img = await loadImage(url)
    URL.revokeObjectURL(url)
    console.log('Created img element for Live Photo', { width: img.width, height: img.height })
    return img
  }

  const supportsImageBitmap = 'createImageBitmap' in window
  if (supportsImageBitmap) {
    try {
      // Try with imageOrientation: 'none' first
      const bitmap = await createImageBitmap(file, {
        imageOrientation: 'none',
      } as ImageBitmapOptions)
      console.log('Created bitmap with imageOrientation: none', {
        width: bitmap.width,
        height: bitmap.height,
      })
      return bitmap
    } catch (error) {
      console.log('Failed to create bitmap with imageOrientation: none, trying default:', error)
      try {
        // Fallback: try without imageOrientation option
        const bitmap = await createImageBitmap(file)
        console.log('Created bitmap with default options', {
          width: bitmap.width,
          height: bitmap.height,
        })
        return bitmap
      } catch {
        // fallback to <img> below
      }
    }
  }
  // Fallback via <img>: browser MAY already apply orientation during decode
  console.log('Using <img> fallback for bitmap creation')
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

/**
 * Apply transformation for EXIF orientation
 */
function applyOrientationTransform(
  ctx: CanvasRenderingContext2D,
  orientation: number,
  w: number,
  h: number,
) {
  console.log('Applying orientation transform:', { orientation, w, h })

  switch (orientation) {
    case 2: // flip X
      ctx.translate(w, 0)
      ctx.scale(-1, 1)
      break
    case 3: // 180°
      ctx.translate(w, h)
      ctx.rotate(Math.PI)
      break
    case 4: // flip Y
      ctx.translate(0, h)
      ctx.scale(1, -1)
      break
    case 5: // transpose: rotate 90° CW + flip X
      ctx.rotate(0.5 * Math.PI)
      ctx.scale(1, -1)
      break
    case 6: // 90° CW - try reverse rotation
      ctx.rotate(-0.5 * Math.PI) // Changed from 0.5 to -0.5
      ctx.translate(-w, 0) // Changed translate
      break
    case 7: // transverse: rotate 90° CW + flip Y
      ctx.rotate(0.5 * Math.PI)
      ctx.translate(w, -h)
      ctx.scale(-1, 1)
      break
    case 8: // 90° CCW
      ctx.rotate(-0.5 * Math.PI)
      ctx.translate(-w, 0)
      break
    default: // 1 — no changes
      break
  }
}
