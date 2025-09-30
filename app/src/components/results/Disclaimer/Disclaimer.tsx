import React from 'react'
import { Icon } from '@/components'
import { combineClassNames } from '@/utils'
import { DisclaimerProps } from './types'
import { icons } from './icons'
import styles from './Disclaimer.module.scss'

export const Disclaimer = ({ className }: DisclaimerProps) => {
  return (
    <div className={combineClassNames(styles.disclaimer, className)}>
      <Icon icon={icons.info} size={13} className={styles.icon} />
      <span className={combineClassNames('aiuta-label-disclaimer', styles.text)}>
        Results may vary from real-life fit
      </span>
    </div>
  )
}
