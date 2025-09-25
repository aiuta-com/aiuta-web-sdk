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

export const QrCode = ({ url }: Omit<QrCodeProps, 'onFileUpload'>) => {
  const { Canvas } = useQRCode()

  // Get CSS variables values and convert to hex
  const primaryColor =
    getComputedStyle(document.documentElement).getPropertyValue('--aiuta-color-primary').trim() ||
    'black'
  const neutralColor =
    getComputedStyle(document.documentElement).getPropertyValue('--aiuta-color-neutral').trim() ||
    '#F2F2F7'

  const darkColor = getColorHex(primaryColor)
  const lightColor = getColorHex(neutralColor)

  return (
    <div className={styles.qrCode}>
      <Canvas
        text={url}
        logo={{
          options: { width: 50 },
          src: './icons/aiutaLogo.svg',
        }}
        options={{
          errorCorrectionLevel: 'M',
          width: 220,
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
