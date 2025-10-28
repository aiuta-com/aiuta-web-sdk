import React from 'react'
import { Icon } from '@/components'
import { combineClassNames } from '@/utils'
import { useDisclaimerStrings } from '@/hooks'
import { DisclaimerProps } from './types'
import { icons } from './icons'
import styles from './Disclaimer.module.scss'

export const Disclaimer = ({ className }: DisclaimerProps) => {
  const { fitDisclaimerTitle } = useDisclaimerStrings()

  return (
    <div className={combineClassNames(styles.disclaimer, className)}>
      <Icon icon={icons.info} size={13} className={styles.icon} />
      <span className={combineClassNames('aiuta-label-disclaimer', styles.text)}>
        {fitDisclaimerTitle}
      </span>
    </div>
  )
}
