import React from 'react'
import { SecondaryButton, IconButton } from '@/components'
import { combineClassNames } from '@/utils'
import { SelectionSnackbarProps } from './types'
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
              icon="<path fill-rule='evenodd' clip-rule='evenodd' d='M17.1576 4.34921L17.4515 5.67152C17.8189 5.69812 18.1574 5.72609 18.4656 5.75411C19.1666 5.81784 19.7108 5.8818 20.0825 5.93027C20.2767 5.9556 20.4709 5.98162 20.6641 6.01356C21.2089 6.10435 21.5772 6.61963 21.4864 7.1644C21.3956 7.70904 20.8806 8.07701 20.336 7.98646L20.3311 7.98565L20.3091 7.98215C20.2888 7.97894 20.257 7.97401 20.214 7.96761C20.1281 7.9548 19.9974 7.93611 19.8238 7.91348C19.4767 7.8682 18.9584 7.80716 18.2845 7.74589C16.9365 7.62335 14.9669 7.5 12.5001 7.5C10.0333 7.5 8.06365 7.62335 6.71568 7.74589C6.04177 7.80716 5.52347 7.8682 5.17636 7.91348C5.00282 7.93611 4.87209 7.9548 4.78613 7.96761C4.74315 7.97401 4.71137 7.97894 4.69102 7.98215L4.66911 7.98565L4.66416 7.98646C4.11953 8.07701 3.60453 7.70904 3.51375 7.1644C3.42296 6.61963 3.79127 6.10435 4.33604 6.01356C4.52925 5.98162 4.72351 5.9556 4.91768 5.93027C5.28933 5.8818 5.83353 5.81784 6.53461 5.75411C6.84272 5.7261 7.18118 5.69813 7.54865 5.67153L7.8425 4.34921C8.14753 2.9766 9.36497 2 10.7711 2H14.229C15.6351 2 16.8526 2.9766 17.1576 4.34921ZM9.62309 5.55613L9.79488 4.78307C9.89655 4.32553 10.3024 4 10.7711 4L14.229 4C14.6977 4 15.1036 4.32553 15.2052 4.78307L15.377 5.55612C14.51 5.52168 13.5481 5.5 12.5 5.5M7.49553 9.90519C7.44317 9.35539 6.95502 8.95214 6.40522 9.0045C5.85543 9.05687 5.45218 9.54501 5.50454 10.0948L6.33212 18.7844C6.47876 20.3241 7.77193 21.5 9.31861 21.5H15.6815C17.2281 21.5 18.5213 20.3241 18.6679 18.7844L19.4955 10.0948C19.5479 9.54501 19.1446 9.05687 18.5948 9.0045C18.045 8.95214 17.5569 9.35539 17.5045 9.90519L16.677 18.5948C16.6281 19.108 16.197 19.5 15.6815 19.5H9.31861C8.80305 19.5 8.37199 19.108 8.32311 18.5948L7.49553 9.90519ZM9.50002 12C9.50002 11.4477 9.94774 11 10.5 11H14.5C15.0523 11 15.5 11.4477 15.5 12C15.5 12.5523 15.0523 13 14.5 13H10.5C9.94774 13 9.50002 12.5523 9.50002 12ZM11.5 15C10.9477 15 10.5 15.4477 10.5 16C10.5 16.5523 10.9477 17 11.5 17H13.5C14.0523 17 14.5 16.5523 14.5 16C14.5 15.4477 14.0523 15 13.5 15H11.5Z' fill='currentColor'/>"
              label="Delete selected images"
              onClick={onDelete}
              size={36}
              viewBox="0 0 25 24"
              className={styles.actionIcon}
            />
          )}
          {onDownload && (
            <IconButton
              icon="<path d='M18 12.5V15.8333C18 16.2754 17.8244 16.6993 17.5118 17.0118C17.1993 17.3244 16.7754 17.5 16.3333 17.5H4.66667C4.22464 17.5 3.80072 17.3244 3.48816 17.0118C3.17559 16.6993 3 16.2754 3 15.8333V12.5' stroke='currentColor' stroke-width='1.66667' stroke-linecap='round' stroke-linejoin='round'/><path d='M6.33301 8.33337L10.4997 12.5L14.6663 8.33337' stroke='currentColor' stroke-width='1.66667' stroke-linecap='round' stroke-linejoin='round'/><path d='M10.5 12.5V2.5' stroke='currentColor' stroke-width='1.66667' stroke-linecap='round' stroke-linejoin='round'/>"
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
