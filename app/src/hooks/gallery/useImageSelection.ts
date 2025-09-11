import { useCallback } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { generateSlice } from '@/store/slices/generateSlice'
import { selectedImagesSelector } from '@/store/slices/generateSlice/selectors'

/**
 * Hook for managing image selection in galleries
 */
export const useImageSelection = () => {
  const dispatch = useAppDispatch()
  const selectedIds = useAppSelector(selectedImagesSelector)

  const toggleSelection = useCallback(
    (id: string) => {
      dispatch(generateSlice.actions.setSelectedImage(id))
    },
    [dispatch],
  )

  const clearSelection = useCallback(() => {
    dispatch(generateSlice.actions.setSelectedImage([]))
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
