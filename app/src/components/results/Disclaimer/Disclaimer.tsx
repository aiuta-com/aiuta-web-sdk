import React, { useCallback } from 'react'
import { Icon } from '@/components'
import { combineClassNames } from '@/utils'
import { useDisclaimerStrings } from '@/hooks'
import { useAlert } from '@/contexts'
import { DisclaimerProps } from './types'
import { icons } from './icons'
import styles from './Disclaimer.module.scss'

export const Disclaimer = ({ className }: DisclaimerProps) => {
  const { fitDisclaimerTitle, fitDisclaimerDescription, fitDisclaimerCloseButton } =
    useDisclaimerStrings()
  const { showAlert } = useAlert()

  const handleClick = useCallback(() => {
    showAlert(fitDisclaimerDescription, fitDisclaimerCloseButton)
  }, [showAlert, fitDisclaimerDescription, fitDisclaimerCloseButton])

  return (
    <div
      className={combineClassNames(styles.disclaimer, className)}
      onClick={handleClick}
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
