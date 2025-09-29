import React from 'react'
import { SecondaryButton, IconButton } from '@/components'
import { combineClassNames } from '@/utils'
import { SelectionSnackbarProps } from './types'
import { icons } from './icons'
import styles from './SelectionSnackbar.module.scss'

export const SelectionSnackbar = (props: SelectionSnackbarProps) => {
  const {
    isVisible,
    selectedCount,
    totalCount,
    onCancel,
    onSelectAll,
    onDelete,
    onDownload,
    className,
  } = props

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
            text={isAllSelected ? 'Unselect All' : 'Select All'}
            onClick={onSelectAll}
            classNames={styles.selectAllButton}
          />
        </div>

        <div className={styles.actions}>
          {onDelete && (
            <IconButton
              icon={icons.delete}
              label="Delete selected images"
              onClick={onDelete}
              size={36}
              viewBox="0 0 25 24"
              className={styles.actionIcon}
            />
          )}
          {onDownload && (
            <IconButton
              icon={icons.download}
              label="Download selected images"
              onClick={onDownload}
              size={36}
              viewBox="0 0 21 20"
              className={styles.actionIcon}
            />
          )}
        </div>
      </div>
    </div>
  )
}
