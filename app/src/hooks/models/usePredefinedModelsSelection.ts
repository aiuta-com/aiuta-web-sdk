import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/store'
import { predefinedModelsSlice } from '@/store/slices/predefinedModelsSlice'
import { uploadsSlice } from '@/store/slices/uploadsSlice'
import { tryOnModeSelector, tryOnPreferredCategoryIdSelector } from '@/store/slices/tryOnSlice'
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
  const mode = useAppSelector(tryOnModeSelector)
  const { categories: allCategories, isLoading, isLoaded, isError, isEnabled } = usePredefinedModels()
  const { startTryOn } = useTryOnGeneration()
  const { trackCategoryChange, trackModelSelected } = usePredefinedModelsAnalytics()

  // Predefined-models config (preferred default category + tab order)
  const predefinedConfig = rpc.config.features?.imagePicker?.predefinedModels?.data
  const preferredCategoryId = predefinedConfig?.preferredCategoryId
  const preferredCategoryOrder = predefinedConfig?.preferredCategoryOrder

  // Per-try-on override from the product gender (set via tryOn options), wins
  // over the configured preferredCategoryId.
  const tryOnPreferredCategoryId = useAppSelector(tryOnPreferredCategoryIdSelector)

  // General mode shows only full-height models in the classic picker — the
  // bird/side-view models are shoe angles, surfaced only by the shoes grouped
  // picker. Untagged (legacy) models are treated as full-height. Shoes mode
  // keeps every view and groups them in the UI.
  const categories = useMemo(() => {
    const filtered =
      mode === 'shoes'
        ? allCategories
        : allCategories
            .map((category) => ({
              ...category,
              models: category.models.filter(
                (model) => !model.tags?.view || model.tags.view === 'full-height',
              ),
            }))
            .filter((category) => category.models.length > 0)

    // Apply the configured tab order; unlisted categories keep their original
    // order, after the listed ones (Array.prototype.sort is stable).
    if (preferredCategoryOrder?.length) {
      const rank = (id: string) => {
        const index = preferredCategoryOrder.indexOf(id)
        return index === -1 ? Number.MAX_SAFE_INTEGER : index
      }
      return [...filtered].sort((a, b) => rank(a.category) - rank(b.category))
    }
    return filtered
  }, [allCategories, mode, preferredCategoryOrder])

  // Get saved category from sessionStorage
  const getSavedCategoryId = useCallback(() => {
    try {
      return sessionStorage.getItem(SELECTED_CATEGORY_KEY)
    } catch {
      return null
    }
  }, [])

  // The user's explicit in-session pick (null until they tap a category tab).
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

  // Default when the user hasn't picked this session. Priority: per-try-on
  // gender override → configured preferredCategoryId → saved selection → first.
  // Recomputed when categories/config arrive, so a late RPC config still
  // applies (the choice isn't frozen on first render).
  const defaultCategoryId = useMemo(() => {
    if (categories.length === 0) return null

    const candidate = tryOnPreferredCategoryId || preferredCategoryId || getSavedCategoryId()
    if (candidate) {
      const found = categories.find((cat) => cat.category === candidate)
      if (found) return found.category
    }

    return categories[0].category
  }, [categories, tryOnPreferredCategoryId, preferredCategoryId, getSavedCategoryId])

  // Category actually shown: the explicit pick wins, otherwise the default. The
  // default is NOT persisted — only an explicit change is (see
  // handleCategoryChange) — so an auto-applied default never masks
  // preferredCategoryId on a later load.
  const effectiveCategoryId = selectedCategoryId ?? defaultCategoryId

  // Get current category data
  const currentCategory = useMemo(() => {
    if (!effectiveCategoryId) return null
    return categories.find((cat) => cat.category === effectiveCategoryId) || null
  }, [categories, effectiveCategoryId])

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
      trackModelSelected(model.id, effectiveCategoryId || '')

      // Close bottom sheet if open
      dispatch(uploadsSlice.actions.setIsBottomSheetOpen(false))

      // Navigate to try-on page (replace: the picker entry is consumed, not
      // stacked — /tryon and the result that follows have no back button)
      navigate('/tryon', { replace: true })

      // Start try-on with selected model
      await startTryOn(model)
    },
    [navigate, startTryOn, trackModelSelected, effectiveCategoryId, dispatch],
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
    selectedCategoryId: effectiveCategoryId,

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
