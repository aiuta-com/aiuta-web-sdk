import React from 'react'
import { combineClassNames } from '@/utils'
import { useDisclaimerStrings, useDisclaimer } from '@/hooks'
import { DisclaimerProps } from './types'
import styles from './Disclaimer.module.scss'

export const Disclaimer = ({
  className,
  variant = 'plain',
  tone = 'dark',
  tint = null,
  stripUrl = null,
}: DisclaimerProps) => {
  const { fitDisclaimerTitle } = useDisclaimerStrings()
  const { showDisclaimer } = useDisclaimer()

  const isStrip = variant === 'strip'
  const isLight = isStrip && tone === 'light'

  // The strip tints its fill with the photo's bottom color, shifted away from
  // the text color (darkened under white text, lightened under dark) — a tint at
  // the photo's own brightness would drown the text. 0.35 covers the worst case,
  // a mid-grey photo bottom.
  const TINT_SHIFT = 0.35
  // Opacity of the tint layer over the stretched photo row — kept light so the
  // strip reads as a continuation of the photo, just enough for legible text.
  const TINT_ALPHA = 0.4
  const shiftChannel = (value: number) =>
    Math.round(isLight ? value + (255 - value) * TINT_SHIFT : value * (1 - TINT_SHIFT))

  let stripStyle: React.CSSProperties | undefined
  if (isStrip) {
    const tintRgba = tint
      ? `rgba(${shiftChannel(tint[0])}, ${shiftChannel(tint[1])}, ${shiftChannel(tint[2])}, ${TINT_ALPHA})`
      : null
    // The stretched bottom row sits under a flat tint layer (a same-stop
    // gradient); the .scss grey fallback shows only when neither is available.
    const layers = [
      tintRgba ? `linear-gradient(${tintRgba}, ${tintRgba})` : null,
      stripUrl ? `url("${stripUrl}")` : null,
    ].filter(Boolean)
    stripStyle = layers.length
      ? { backgroundImage: layers.join(', '), backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }
      : undefined
  }

  return (
    <div
      className={combineClassNames(
        styles.disclaimer,
        isStrip ? styles.disclaimer_strip : styles.disclaimer_plain,
        isLight && styles.disclaimer_stripLight,
        className,
      )}
      style={stripStyle}
      onClick={showDisclaimer}
      role="button"
      tabIndex={0}
    >
      <span className={combineClassNames('aiuta-label-footnote', styles.text)}>
        {fitDisclaimerTitle}
      </span>
    </div>
  )
}
