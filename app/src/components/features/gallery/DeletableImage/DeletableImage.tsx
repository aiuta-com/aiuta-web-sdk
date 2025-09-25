import React, { useMemo, useCallback } from 'react'
import { DeletableImageProps } from './types'
import { DeletionButton } from './DeletionButton'
import styles from './DeletableImage.module.scss'

export const DeletableImage = (props: DeletableImageProps) => {
  const { src, imageId, classNames, showTrashIcon, onClick, onDelete } = props

  const handleClick = useCallback(() => {
    onClick?.()
  }, [onClick])

  const handleDelete = useCallback(() => {
    onDelete?.(imageId)
  }, [onDelete, imageId])

  const containerClasses = useMemo(
    () => [styles.deletableImage, classNames || ''].filter(Boolean).join(' '),
    [classNames],
  )

  return (
    <div className={containerClasses} onClick={handleClick}>
      <DeletionButton showTrashIcon={showTrashIcon} onDelete={handleDelete} />
      <img src={src} loading="lazy" alt="Deletable image" />
    </div>
  )
}
