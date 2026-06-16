import React from 'react'
import { combineClassNames } from '@/utils'
import { FlexProps } from './types'
import styles from './Flex.module.scss'

export const Flex = ({ children, containerClassName, contentClassName, fill }: FlexProps) => {
  return (
    <div className={combineClassNames(styles.container, containerClassName)}>
      <div
        className={combineClassNames(styles.content, fill && styles.content_fill, contentClassName)}
      >
        {children}
      </div>
    </div>
  )
}
