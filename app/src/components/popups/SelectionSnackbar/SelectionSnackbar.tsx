import React from 'react'
import { SecondaryButton } from '@/components'
import { combineClassNames } from '@/utils'
import { SelectionSnackbarProps } from './types'
import styles from './SelectionSnackbar.module.scss'

export const SelectionSnackbar = (props: SelectionSnackbarProps) => {
  const { isVisible, selectedCount, totalCount, onCancel, onSelectAll, actions, className } = props

  const containerClasses = combineClassNames(
    styles.selectionSnackbar,
    isVisible && styles.selectionSnackbar_visible,
    className,
  )

  const isAllSelected = selectedCount === totalCount

  return (
    <div className={containerClasses}>
      <div className={styles.content}>
        <div className={styles.controls}>
          <SecondaryButton text="Cancel" onClick={onCancel} classNames={styles.cancelButton} />
          <SecondaryButton
            text={isAllSelected ? `All ${totalCount} selected` : 'Select All'}
            onClick={onSelectAll}
            classNames={styles.selectAllButton}
          />
        </div>

        <div className={styles.actions}>
          {actions.map((action, index) => (
            <img
              key={index}
              src={action.iconUrl}
              alt={action.label}
              className={styles.actionIcon}
              onClick={action.onClick}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
