import React, { useMemo } from 'react'
import { SecondaryButton } from '@/components'
import { SelectionSnackbarProps } from './types'
import styles from './SelectionSnackbar.module.scss'

export const SelectionSnackbar = (props: SelectionSnackbarProps) => {
  const {
    isVisible,
    selectedCount,
    totalCount,
    onCancel,
    onSelectAll,
    actions,
    isMobile = false,
    className,
  } = props

  const containerClasses = useMemo(() => {
    const classes = [styles.selectionSnackbar]

    if (isVisible && isMobile) {
      classes.push(styles.selectionSnackbar_visibleMobile)
    } else if (isVisible) {
      classes.push(styles.selectionSnackbar_visible)
    }

    if (className) {
      classes.push(className)
    }

    return classes.join(' ')
  }, [isVisible, isMobile, className])

  const isAllSelected = selectedCount === totalCount

  return (
    <div className={containerClasses}>
      <div className={styles.content}>
        <div className={styles.controls}>
          <SecondaryButton text="Cancel" onClick={onCancel} classNames={styles.cancelButton} />
          <p className={styles.selectAllText} onClick={onSelectAll}>
            {isAllSelected ? `All ${totalCount} selected` : 'Select All'}
          </p>
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
