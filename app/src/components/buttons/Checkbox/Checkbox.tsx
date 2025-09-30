import React, { useId } from 'react'
import type { CheckboxProps } from './types'
import styles from './Checkbox.module.scss'

export const Checkbox = ({ labelText, checked = false, onChange }: CheckboxProps) => {
  const id = useId()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = event.target.checked
    onChange?.(newChecked)
  }

  return (
    <div className={styles.checkbox}>
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
