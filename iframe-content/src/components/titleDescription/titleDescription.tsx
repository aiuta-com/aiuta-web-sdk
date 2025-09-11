import React from 'react'
// types
import { TitleDescriptionTypes } from './types'

// styles
import styles from './titleDescription.module.scss'

export const TitleDescription = (props: TitleDescriptionTypes) => {
  const { link, title, description, className, textAlign = 'center' } = props

  return (
    <div style={{ textAlign }} className={`${styles.titleDescriptionBox} ${className ?? ''}`}>
      <h2>{title}</h2>
      {description && <h3>{description}</h3>}
      {link && (
        <a href={link.url} target="_blank">
          {link.text}{' '}
        </a>
      )}
    </div>
  )
}
