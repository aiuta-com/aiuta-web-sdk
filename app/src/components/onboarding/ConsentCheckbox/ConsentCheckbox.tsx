import React, { useId } from 'react'
import type { ConsentCheckboxProps } from './types'
import styles from './ConsentCheckbox.module.scss'

export const ConsentCheckbox = ({ consent, checked = false, onChange }: ConsentCheckboxProps) => {
  const id = useId()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = event.target.checked
    onChange?.(newChecked)
  }

  const renderConsentHtml = (html: string) => {
    return <span dangerouslySetInnerHTML={{ __html: html }} />
  }

  return (
    <div className={styles.consentCheckbox}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        className={styles.input}
      />
      <label htmlFor={id} className={`aiuta-label-regular ${styles.label}`}>
        {renderConsentHtml(consent.html)}
      </label>
    </div>
  )
}
