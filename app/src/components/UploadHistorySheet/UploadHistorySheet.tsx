import React from 'react'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { uploadsSlice } from '@/store/slices/uploadsSlice'
import { uploadsIsBottomSheetOpenSelector } from '@/store/slices/uploadsSlice'
import { BottomSheet } from '@/components/BottomSheet'
import { TryOnButton } from '@/components/tryOnButton/tryOnButton'
import { TitleDescription } from '@/components/titleDescription/titleDescription'
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
      <TitleDescription title="Previously used photos" textAlign="left" className={styles.title} />

      <div className={styles.content}>{children}</div>

      <TryOnButton onClick={onClickButton}>{buttonText}</TryOnButton>
    </BottomSheet>
  )
}
