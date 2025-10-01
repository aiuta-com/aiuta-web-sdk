import React from 'react'
import { Icon } from '@/components'
import { combineClassNames } from '@/utils'
import { SocialButtonProps } from './types'
import styles from './SocialButton.module.scss'

export const SocialButton = ({ icon, title, href, onClick, className }: SocialButtonProps) => {
  const buttonClasses = combineClassNames(styles.socialButton, className)

  const content = (
    <>
      <Icon icon={icon} size={54} viewBox="0 0 54 54" className={styles.icon} />
      <span className={combineClassNames('aiuta-label-subtle', styles.title)}>{title}</span>
    </>
  )

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClasses}
        onClick={onClick}
      >
        {content}
      </a>
    )
  }

  return (
    <button className={buttonClasses} onClick={onClick}>
      {content}
    </button>
  )
}
