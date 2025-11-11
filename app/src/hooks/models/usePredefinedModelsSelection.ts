import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@/store/store'
import { predefinedModelsSlice } from '@/store/slices/predefinedModelsSlice'
import { usePredefinedModels } from './usePredefinedModels'
import { usePredefinedModelsAnalytics } from './usePredefinedModelsAnalytics'
import { useTryOnGeneration } from '@/hooks/tryOn/useTryOnGeneration'
import { useRpc } from '@/contexts'
import type { InputImage } from '@/utils/api'

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

  // Selected category state
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

  // Determine initial category based on config or first available
  const initialCategory = useMemo(() => {
    if (categories.length === 0) return null

    // If preferred category exists and is in the list, use it
    if (preferredCategoryId) {
      const preferred = categories.find((cat) => cat.category === preferredCategoryId)
      if (preferred) return preferred.category
    }

    // Otherwise, use first category
    return categories[0].category
  }, [categories, preferredCategoryId])

  // Set initial category when categories load
  useEffect(() => {
    if (initialCategory && !selectedCategoryId) {
      setSelectedCategoryId(initialCategory)
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
    },
    [trackCategoryChange],
  )

  // Handle model selection
  const handleModelSelect = useCallback(
    async (model: InputImage) => {
      // Track selection
      trackModelSelected(model.id, selectedCategoryId || '')

      // Navigate to try-on page
      navigate('/tryon')

      // Start try-on with selected model
      await startTryOn(model)
    },
    [navigate, startTryOn, trackModelSelected, selectedCategoryId],
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
