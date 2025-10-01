/**
 * Image processing utility
 *
 * Resizes and converts images while preserving quality.
 * Сorrects EXIF orientation by drawing through canvas.
 */

export type ProcessedImage = {
  blob: Blob
  mime: string
  objectUrl: string
}

export type ProcessOptions = {
  /** Output format ('image/jpeg' | 'image/png' | 'image/webp'), default 'image/jpeg' */
  outputMime?: string
  /** JPEG/WebP quality: 0..1, default 0.92 */
  quality?: number
  /** Limit maximum side (for downscaling), 0 = no limit */
  maxSide?: number
}

type CanvasDrawParams = {
  srcW: number
  srcH: number
  dstW: number
  dstH: number
}

/**
 * Main function: takes File/Blob with image, returns processed Blob
 * Always returns a valid result - falls back to original file if processing fails
 */
export async function resizeAndConvertImage(
  file: Blob,
  opts: ProcessOptions = {},
): Promise<ProcessedImage> {
  const outputMime = opts.outputMime ?? 'image/jpeg'
  const quality = opts.quality ?? 0.92
  const maxSide = opts.maxSide ?? 1500

  // Helper function to return original file
  const returnOriginal = (reason?: string): ProcessedImage => {
    if (reason) {
      console.warn('Falling back to original file:', reason)
    }
    const objectUrl = URL.createObjectURL(file)

    return {
      blob: file,
      mime: file.type,
      objectUrl,
    }
  }

  try {
    const img = await createImageElement(file)
    const targetDimensions = calculateTargetDimensions(img, maxSide)

    console.log('Processing image:', {
      from: { width: img.width, height: img.height },
      to: targetDimensions,
    })

    const drawParams: CanvasDrawParams = {
      srcW: img.width,
      srcH: img.height,
      dstW: targetDimensions.width,
      dstH: targetDimensions.height,
    }

    return await processOnCanvas(img, drawParams, outputMime, quality)
  } catch (error) {
    return returnOriginal(`Processing failed: ${error}`)
  }
}

/* ===================== DIMENSIONS ===================== */

/**
 * Calculate target dimensions for image processing
 * Returns original dimensions if no resize needed, or scaled dimensions if resize required
 */
function calculateTargetDimensions(
  img: HTMLImageElement,
  maxSide: number,
): { width: number; height: number } {
  // No resize limit specified
  if (maxSide <= 0) {
    return { width: img.width, height: img.height }
  }

  const maxCurrent = Math.max(img.width, img.height)

  // Image is already smaller than limit
  if (maxCurrent <= maxSide) {
    return { width: img.width, height: img.height }
  }

  // Calculate scale and return resized dimensions
  const scale = maxSide / maxCurrent
  return {
    width: Math.round(img.width * scale),
    height: Math.round(img.height * scale),
  }
}

/* ===================== CANVAS PROCESSING ===================== */

/**
 * Core canvas processing: draw image + create blob + generate URL
 * This is where EXIF orientation correction actually happens
 */
async function processOnCanvas(
  img: HTMLImageElement,
  params: CanvasDrawParams,
  outputMime: string,
  quality: number,
): Promise<ProcessedImage> {
  const { srcW, srcH, dstW, dstH } = params

  // Create canvas with target dimensions
  const canvas = document.createElement('canvas')
  canvas.width = dstW
  canvas.height = dstH
  const ctx = canvas.getContext('2d')!

  // Configure high quality rendering for resizing
  if (dstW !== srcW || dstH !== srcH) {
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
  }

  // Draw image - this applies EXIF orientation correction automatically
  ctx.drawImage(img, 0, 0, srcW, srcH, 0, 0, dstW, dstH)

  // Convert canvas to blob with specified format and quality
  const blob: Blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b!), outputMime, quality),
  )

  // Create object URL for preview and return complete result
  const objectUrl = URL.createObjectURL(blob)
  return { blob, mime: blob.type || outputMime, objectUrl }
}

/* ===================== IMAGE ELEMENT ===================== */

/**
 * Create image element from blob - browser reads EXIF data and prepares for orientation correction
 * Actual orientation correction happens when drawing to canvas
 */
async function createImageElement(file: Blob): Promise<HTMLImageElement> {
  console.log('Creating <img> element - browser will prepare EXIF orientation data')

  const url = URL.createObjectURL(file)

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = (e) => reject(e)
      image.src = url
    })

    console.log('Created img element', { width: img.width, height: img.height })
    return img
  } finally {
    URL.revokeObjectURL(url)
  }
}
