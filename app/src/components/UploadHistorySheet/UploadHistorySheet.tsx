import React from 'react'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { uploadsSlice } from '@/store/slices/uploadsSlice'
import { uploadsIsBottomSheetOpenSelector } from '@/store/slices/uploadsSlice'
import { BottomSheet } from '@/components/BottomSheet'
import { TryOnButton } from '@/components/tryOnButton/tryOnButton'
import type { UploadHistorySheetProps } from './types'
import styles from './UploadHistorySheet.module.scss'

export const UploadHistorySheet = ({
  children,
  buttonText,
  onClickButton,
}: UploadHistorySheetProps) => {
  const dispatch = useAppDispatch()
  const isOpen = useAppSelector(uploadsIsBottomSheetOpenSelector)

  const handleClose = () => {
    dispatch(uploadsSlice.actions.setIsBottomSheetOpen(false))
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose}>
      <div className={styles.title}>
        <h2>Previously used photos</h2>
      </div>

      <div className={styles.content}>{children}</div>

      <TryOnButton onClick={onClickButton}>{buttonText}</TryOnButton>
    </BottomSheet>
  )
}
