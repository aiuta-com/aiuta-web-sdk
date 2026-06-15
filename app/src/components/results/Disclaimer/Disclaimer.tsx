import React from 'react'
import { Icon } from '@/components'
import { combineClassNames } from '@/utils'
import { useDisclaimerStrings, useDisclaimer } from '@/hooks'
import { DisclaimerProps } from './types'
import { icons } from './icons'
import styles from './Disclaimer.module.scss'

export const Disclaimer = ({
  className,
  overlay = false,
  tone = 'dark',
  tint = null,
}: DisclaimerProps) => {
  const { fitDisclaimerTitle } = useDisclaimerStrings()
  const { showDisclaimer } = useDisclaimer()

  // Both variants tint their fill with the photo's bottom color, shifted
  // away from the text color (darkened under white text, lightened under
  // dark) — a tint at the photo's own brightness would drown the text.
  // 0.35 is enough for the worst case, a mid-grey photo bottom.
  const TINT_SHIFT = 0.35
  const isLight = overlay && tone === 'light'
  const shiftChannel = (value: number) =>
    Math.round(isLight ? value + (255 - value) * TINT_SHIFT : value * (1 - TINT_SHIFT))
  const tintStyle =
    overlay && tint
      ? {
          backgroundColor: `rgba(${shiftChannel(tint[0])}, ${shiftChannel(tint[1])}, ${shiftChannel(tint[2])}, 0.64)`,
        }
      : undefined

  return (
    <div
      className={combineClassNames(
        styles.disclaimer,
        overlay && styles.disclaimer_overlay,
        isLight && styles.disclaimer_overlayLight,
        className,
      )}
      style={tintStyle}
      onClick={showDisclaimer}
      role="button"
      tabIndex={0}
    >
      {!overlay && <Icon icon={icons.info} size={13} className={styles.icon} />}
      <span className={combineClassNames('aiuta-label-footnote', styles.text)}>
        {fitDisclaimerTitle}
      </span>
    </div>
  )
}
