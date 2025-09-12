import React from 'react'
import { LayoutTypes } from './types'
import styles from './layout.module.scss'

export const Layout = (props: LayoutTypes) => {
  const { children } = props

  return <div className={styles.layoutConteiner}>{children} </div>
}
