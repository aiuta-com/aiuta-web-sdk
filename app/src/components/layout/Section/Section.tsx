import React from 'react'
import { SectionProps } from './types'
import styles from './Section.module.scss'

export const Section = (props: SectionProps) => {
  const { children, className } = props

  const sectionClasses = [styles.sectionContent, className].filter(Boolean).join(' ')

  return <section className={sectionClasses}>{children}</section>
}
