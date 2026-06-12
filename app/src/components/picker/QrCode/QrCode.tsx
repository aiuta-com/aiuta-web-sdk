import React from 'react'
import { useQRCode } from 'next-qrcode'
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

export const QrCode = ({ url }: Omit<QrCodeProps, 'onFileUpload'>) => {
  const { Canvas } = useQRCode()

  // Get CSS variables values and convert to hex
  const rootStyle = getComputedStyle(document.documentElement)
  const primaryColor = rootStyle.getPropertyValue('--aiuta-color-primary').trim() || 'black'
  const borderColor = rootStyle.getPropertyValue('--aiuta-color-border').trim() || '#e5e5ea'
  const backgroundColor = rootStyle.getPropertyValue('--aiuta-color-background').trim() || '#ffffff'

  const darkColor = getColorHex(primaryColor)
  // Exactly the drag-over fill of the drop zone — color-mix(border 40%,
  // transparent) composited over the widget background — as an opaque hex,
  // since the QR renderer can't take a translucent color
  const lightColor = mixHex(getColorHex(borderColor), getColorHex(backgroundColor), 0.4)

  return (
    <div className={styles.qrCode}>
      <Canvas
        text={url}
        logo={{
          options: { width: 50 },
          src: './aiuta.svg',
        }}
        options={{
          errorCorrectionLevel: 'M',
          width: 200,
          margin: 6,
          color: {
            dark: darkColor,
            light: lightColor,
          },
        }}
      />
    </div>
  )
}
