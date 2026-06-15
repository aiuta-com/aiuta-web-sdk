import React, { useEffect, useMemo, useRef } from 'react'
import QRCodeStyling, { type Options } from 'qr-code-styling'
import { QrCodeProps } from './types'
import styles from './QrCode.module.scss'

// Helper function to convert any CSS color to hex format
const getColorHex = (cssColor: string): string => {
  const div = document.createElement('div')
  div.style.color = cssColor
  document.body.appendChild(div)
  const computedColor = getComputedStyle(div).color
  document.body.removeChild(div)

  // Convert rgb(r, g, b) to hex
  const match = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (match) {
    const r = parseInt(match[1])
    const g = parseInt(match[2])
    const b = parseInt(match[3])
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }

  // If already hex or fallback
  return cssColor.startsWith('#') ? cssColor : '#000000'
}

// Blend two hex colors: ratio of `a` over (1 - ratio) of `b`
const mixHex = (a: string, b: string, ratio: number): string => {
  const channel = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16)
  const mixed = [0, 1, 2].map((i) =>
    Math.round(channel(a, i) * ratio + channel(b, i) * (1 - ratio))
      .toString(16)
      .padStart(2, '0'),
  )
  return `#${mixed.join('')}`
}

// The QR fills the SVG edge-to-edge: library margin quantizes to a whole
// module (jumps straight to ~17px), and any size that isn't a multiple of the
// module count leaves a centering remainder. 200 divides cleanly for our
// payload so the modules sit flush; the quiet zone is then added as an exact
// 8px container padding in the same background color.
const SIZE = 200
const MARGIN = 0

export const QrCode = ({ url }: Omit<QrCodeProps, 'onFileUpload'>) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const qrRef = useRef<QRCodeStyling | null>(null)

  // Colors from CSS variables (re-read each render so theme overrides apply)
  const rootStyle = getComputedStyle(document.documentElement)
  const primaryColor = rootStyle.getPropertyValue('--aiuta-color-primary').trim() || 'black'
  const borderColor = rootStyle.getPropertyValue('--aiuta-color-border').trim() || '#e5e5ea'
  const backgroundColor = rootStyle.getPropertyValue('--aiuta-color-background').trim() || '#ffffff'

  const darkColor = getColorHex(primaryColor)
  // Exactly the drag-over fill of the drop zone — color-mix(border 40%,
  // transparent) composited over the widget background — as an opaque hex,
  // since the QR renderer can't take a translucent color
  const lightColor = mixHex(getColorHex(borderColor), getColorHex(backgroundColor), 0.4)

  const options: Options = useMemo(
    () => ({
      width: SIZE,
      height: SIZE,
      type: 'svg',
      data: url,
      margin: MARGIN,
      image: './aiuta.svg',
      qrOptions: { errorCorrectionLevel: 'M' },
      // Merged modules with rounded outer corners, including the perimeter
      dotsOptions: { type: 'extra-rounded', color: darkColor },
      // Round finder eyes: circular outer ring + circular center dot
      cornersSquareOptions: { type: 'dot', color: darkColor },
      cornersDotOptions: { type: 'dot', color: darkColor },
      backgroundOptions: { color: lightColor },
      imageOptions: { crossOrigin: 'anonymous', imageSize: 0.6, margin: 4, hideBackgroundDots: true },
    }),
    [url, darkColor, lightColor],
  )

  // Create the instance once and append it; drop it on unmount so a remount
  // (e.g. React strict mode) doesn't leave a duplicate SVG behind
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const qr = new QRCodeStyling(options)
    qrRef.current = qr
    qr.append(container)

    return () => {
      qrRef.current = null
      container.replaceChildren()
    }
    // Created once with the initial options; later changes go through the
    // update effect below, so options is intentionally not a dependency here
  }, [])

  // Re-render on data/color changes
  useEffect(() => {
    qrRef.current?.update(options)
  }, [options])

  // Background matches the QR's own backgroundOptions so the padding reads as
  // a seamless quiet zone around the modules
  return <div className={styles.qrCode} style={{ backgroundColor: lightColor }} ref={containerRef} />
}
