import React from 'react'
import { Icon } from '@/components'
import { combineClassNames } from '@/utils'
import { useDisclaimerStrings, useDisclaimer } from '@/hooks'
import { DisclaimerProps } from './types'
import { icons } from './icons'
import styles from './Disclaimer.module.scss'

export const Disclaimer = ({ className, overlay = false }: DisclaimerProps) => {
  const { fitDisclaimerTitle } = useDisclaimerStrings()
  const { showDisclaimer } = useDisclaimer()

  return (
    <div
      className={combineClassNames(
        styles.disclaimer,
        overlay && styles.disclaimer_overlay,
        className,
      )}
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
