import React from 'react'
import { combineClassNames } from '@/utils'
import { FlexProps } from './types'
import styles from './Flex.module.scss'

export const Flex = ({ children, containerClassName, contentClassName }: FlexProps) => {
  return (
    <div className={combineClassNames(styles.container, containerClassName)}>
      <div className={combineClassNames(styles.content, contentClassName)}>{children}</div>
    </div>
  )
}
