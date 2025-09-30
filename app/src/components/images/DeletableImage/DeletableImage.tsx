import React, { useMemo, useCallback } from 'react'
import { RemoteImage, IconButton } from '@/components'
import { DeletableImageProps } from './types'
import { icons } from './icons'
import styles from './DeletableImage.module.scss'

export const DeletableImage = (props: DeletableImageProps) => {
  const { src, imageId, classNames, onClick, onDelete } = props

  const handleClick = useCallback(() => {
    onClick?.()
  }, [onClick])

  const handleDelete = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation()
      onDelete?.(imageId)
    },
    [onDelete, imageId],
  )

  const containerClasses = useMemo(
    () => [styles.deletableImage, classNames || ''].filter(Boolean).join(' '),
    [classNames],
  )

  return (
    <div className={containerClasses} onClick={handleClick}>
      <RemoteImage src={src} alt="Previously used photo" shape="M" loading="lazy" />
      <IconButton
        icon={icons.delete}
        label="Delete previously used photo"
        onClick={handleDelete}
        className={styles.deleteButton}
        size={24}
        viewBox="0 0 24 24"
      />
    </div>
  )
}
