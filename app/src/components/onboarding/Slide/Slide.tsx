import React from 'react'
import { combineClassNames } from '@/utils'
import { SlideProps } from './types'
import styles from './Slide.module.scss'

export const Slide = ({ state, children }: SlideProps) => {
  const containerClasses = combineClassNames(styles.slide, styles[`slide_${state}`])

  return <div className={containerClasses}>{children}</div>
}
