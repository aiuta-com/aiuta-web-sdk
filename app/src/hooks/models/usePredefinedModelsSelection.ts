import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@/store/store'
import { predefinedModelsSlice } from '@/store/slices/predefinedModelsSlice'
import { uploadsSlice } from '@/store/slices/uploadsSlice'
import { usePredefinedModels } from './usePredefinedModels'
import { usePredefinedModelsAnalytics } from './usePredefinedModelsAnalytics'
import { useTryOnGeneration } from '@/hooks/tryOn/useTryOnGeneration'
import { useRpc } from '@/contexts'
import type { InputImage } from '@/utils/api'

const SELECTED_CATEGORY_KEY = 'aiuta-selected-category-id'

/**
 * Hook for managing predefined models selection
 * Handles category selection, model selection, and navigation to try-on
 */
export const usePredefinedModelsSelection = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const rpc = useRpc()
  const { categories, isLoading, isLoaded, isError, isEnabled } = usePredefinedModels()
  const { startTryOn } = useTryOnGeneration()
  const { trackCategoryChange, trackModelSelected } = usePredefinedModelsAnalytics()

  // Get preferred category from config
  const preferredCategoryId =
    rpc.config.features?.imagePicker?.predefinedModels?.data?.preferredCategoryId

  // Get saved category from sessionStorage
  const getSavedCategoryId = useCallback(() => {
    try {
      return sessionStorage.getItem(SELECTED_CATEGORY_KEY)
    } catch {
      return null
    }
  }, [])

  // Selected category state
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(getSavedCategoryId)

  // Determine initial category based on saved value, config, or first available
  const initialCategory = useMemo(() => {
    if (categories.length === 0) return null

    const savedCategoryId = getSavedCategoryId()

    // Priority 1: Saved category (if exists in current list)
    if (savedCategoryId) {
      const saved = categories.find((cat) => cat.category === savedCategoryId)
      if (saved) return saved.category
    }

    // Priority 2: Preferred category from config (if exists in the list)
    if (preferredCategoryId) {
      const preferred = categories.find((cat) => cat.category === preferredCategoryId)
      if (preferred) return preferred.category
    }

    // Priority 3: First category
    return categories[0].category
  }, [categories, preferredCategoryId, getSavedCategoryId])

  // Set initial category when categories load
  useEffect(() => {
    if (initialCategory && !selectedCategoryId) {
      setSelectedCategoryId(initialCategory)

      // Save to sessionStorage
      try {
        sessionStorage.setItem(SELECTED_CATEGORY_KEY, initialCategory)
      } catch {
        // Ignore errors
      }
    }
  }, [initialCategory, selectedCategoryId])

  // Get current category data
  const currentCategory = useMemo(() => {
    if (!selectedCategoryId) return null
    return categories.find((cat) => cat.category === selectedCategoryId) || null
  }, [categories, selectedCategoryId])

  // Handle category change
  const handleCategoryChange = useCallback(
    (categoryId: string) => {
      setSelectedCategoryId(categoryId)
      trackCategoryChange(categoryId)

      // Save to sessionStorage
      try {
        sessionStorage.setItem(SELECTED_CATEGORY_KEY, categoryId)
      } catch {
        // Ignore errors (e.g., in incognito mode with disabled storage)
      }
    },
    [trackCategoryChange],
  )

  // Handle model selection
  const handleModelSelect = useCallback(
    async (model: InputImage) => {
      // Track selection
      trackModelSelected(model.id, selectedCategoryId || '')

      // Close bottom sheet if open
      dispatch(uploadsSlice.actions.setIsBottomSheetOpen(false))

      // Navigate to try-on page
      navigate('/tryon')

      // Start try-on with selected model
      await startTryOn(model)
    },
    [navigate, startTryOn, trackModelSelected, selectedCategoryId, dispatch],
  )

  // Retry loading (resets state to allow new loading attempt)
  const handleRetry = useCallback(() => {
    // Reset loading state - this will trigger usePredefinedModels to retry
    dispatch(predefinedModelsSlice.actions.retryLoading())
  }, [dispatch])

  return {
    // Data
    categories,
    currentCategory,
    selectedCategoryId,

    // State flags
    isLoading,
    isLoaded,
    isError,
    isEnabled,

    // Actions
    handleCategoryChange,
    handleModelSelect,
    handleRetry,
  }
}
