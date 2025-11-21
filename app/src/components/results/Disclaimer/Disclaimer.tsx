import React from 'react'
import { Icon } from '@/components'
import { combineClassNames } from '@/utils'
import { useDisclaimerStrings, useDisclaimer } from '@/hooks'
import { DisclaimerProps } from './types'
import { icons } from './icons'
import styles from './Disclaimer.module.scss'

export const Disclaimer = ({ className }: DisclaimerProps) => {
  const { fitDisclaimerTitle } = useDisclaimerStrings()
  const { showDisclaimer } = useDisclaimer()

  return (
    <div
      className={combineClassNames(styles.disclaimer, className)}
      onClick={showDisclaimer}
      role="button"
      tabIndex={0}
    >
      <Icon icon={icons.info} size={13} className={styles.icon} />
      <span className={combineClassNames('aiuta-label-disclaimer', styles.text)}>
        {fitDisclaimerTitle}
      </span>
    </div>
  )
}
