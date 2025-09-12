import { useCallback } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { generationsSlice } from '@/store/slices/generationsSlice'
import { selectedImagesSelector } from '@/store/slices/generationsSlice'

/**
 * Hook for managing image selection in galleries
 */
export const useImageSelection = () => {
  const dispatch = useAppDispatch()
  const selectedIds = useAppSelector(selectedImagesSelector)

  const toggleSelection = useCallback(
    (id: string) => {
      dispatch(generationsSlice.actions.toggleSelectedImage(id))
    },
    [dispatch],
  )

  const clearSelection = useCallback(() => {
    dispatch(generationsSlice.actions.clearSelectedImages())
  }, [dispatch])

  const isSelected = useCallback(
    (id: string) => {
      return selectedIds.includes(id)
    },
    [selectedIds],
  )

  return {
    selectedIds,
    toggleSelection,
    clearSelection,
    isSelected,
    hasSelection: selectedIds.length > 0,
  }
}
