import React from 'react'
import styles from './DeletableImage.module.scss'
import { DeletionButtonProps } from './types'

export const DeletionButton = ({ showTrashIcon, onDelete }: DeletionButtonProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete()
  }

  if (showTrashIcon) {
    return (
      <div className={styles.trashIcon} onClick={handleClick}>
        <img src="./icons/redTrash.svg" alt="Delete" width={18} height={19} />
      </div>
    )
  }

  return (
    <div className={styles.deleteimage} onClick={handleClick}>
      <span />
      <span />
    </div>
  )
}
