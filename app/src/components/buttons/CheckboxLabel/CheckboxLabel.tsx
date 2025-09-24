import React, { useId } from 'react'
import type { CheckboxLabelProps } from './types'
import styles from './CheckboxLabel.module.scss'

export const CheckboxLabel = ({ labelText, checked = false, onChange }: CheckboxLabelProps) => {
  const id = useId()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = event.target.checked
    onChange?.(newChecked)
  }

  return (
    <div className={styles.checkboxLabel}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        className={styles.input}
      />
      <label htmlFor={id} className={`aiuta-label-regular ${styles.label}`}>
        {labelText}
      </label>
    </div>
  )
}
