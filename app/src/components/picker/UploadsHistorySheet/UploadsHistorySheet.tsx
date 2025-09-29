import React from 'react'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { uploadsSlice } from '@/store/slices/uploadsSlice'
import { uploadsIsBottomSheetOpenSelector } from '@/store/slices/uploadsSlice'
import { BottomSheet } from '@/components'
import { PrimaryButton } from '@/components'
import type { UploadsHistorySheetProps } from './types'
import styles from './UploadsHistorySheet.module.scss'

export const UploadsHistorySheet = ({
  children,
  buttonText,
  onClickButton,
}: UploadsHistorySheetProps) => {
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

      <PrimaryButton onClick={onClickButton}>{buttonText}</PrimaryButton>
    </BottomSheet>
  )
}
