import { useCallback, useRef, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/store'
import { predefinedModelsSlice } from '@/store/slices/predefinedModelsSlice'
import {
  modelsSelector,
  modelsLoadingSelector,
  modelsLoadedSelector,
  modelsErrorSelector,
  modelsEtagSelector,
} from '@/store/slices/predefinedModelsSlice'
import { apiKeySelector, subscriptionIdSelector } from '@/store/slices/apiSlice'
import { TryOnApiService } from '@/utils/api'
import { useRpc } from '@/contexts'

const RETRY_DELAY = 3000 // 3 seconds

/**
 * Hook for loading predefined models with retry logic and ETag caching
 */
export const usePredefinedModels = () => {
  const dispatch = useAppDispatch()
  const rpc = useRpc()
  const categories = useAppSelector(modelsSelector)
  const isLoading = useAppSelector(modelsLoadingSelector)
  const isLoaded = useAppSelector(modelsLoadedSelector)
  const error = useAppSelector(modelsErrorSelector)
  const etag = useAppSelector(modelsEtagSelector)
  const apiKey = useAppSelector(apiKeySelector)
  const subscriptionId = useAppSelector(subscriptionIdSelector)

  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isLoadingRef = useRef(false)

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [])

  const loadModelsIfNeeded = useCallback(async () => {
    // Skip if already loaded or currently loading
    if (isLoaded || isLoadingRef.current) {
      return
    }

    // Set loading flag immediately to prevent duplicate requests
    isLoadingRef.current = true

    // Check if feature is explicitly disabled (null means disabled, undefined means enabled by default)
    const isPredefinedModelsEnabled = rpc.config.features?.imagePicker?.predefinedModels !== null
    if (!isPredefinedModelsEnabled) {
      isLoadingRef.current = false
      return
    }

    // Check auth
    if (!apiKey && !subscriptionId) {
      console.warn('[usePredefinedModels] No authentication provided')
      isLoadingRef.current = false
      return
    }

    dispatch(predefinedModelsSlice.actions.setLoading(true))

    try {
      const result = await TryOnApiService.getPredefinedModels({ apiKey, subscriptionId }, etag)

      // Handle 304 Not Modified - use cached data
      if (result.notModified) {
        dispatch(predefinedModelsSlice.actions.setLoading(false))
        isLoadingRef.current = false
        return
      }

      // Handle successful response with new data
      if (result.categories && result.categories.length > 0) {
        dispatch(
          predefinedModelsSlice.actions.setCategories({
            categories: result.categories,
            etag: result.etag,
          }),
        )
        dispatch(predefinedModelsSlice.actions.setLoading(false))
        isLoadingRef.current = false
      } else {
        // Empty list - still consider it loaded
        dispatch(
          predefinedModelsSlice.actions.setCategories({
            categories: [],
            etag: result.etag,
          }),
        )
        dispatch(predefinedModelsSlice.actions.setLoading(false))
        isLoadingRef.current = false
      }
    } catch (error) {
      console.error('[usePredefinedModels] Failed to load models:', error)
      dispatch(predefinedModelsSlice.actions.setError((error as Error).message))
      isLoadingRef.current = false

      // Retry after delay
      retryTimeoutRef.current = setTimeout(() => {
        loadModelsIfNeeded()
      }, RETRY_DELAY)
    }
  }, [isLoaded, dispatch, rpc, apiKey, subscriptionId, etag])

  // Auto-load on mount
  useEffect(() => {
    loadModelsIfNeeded()
  }, [loadModelsIfNeeded])

  // Check if feature is enabled (null means disabled, undefined means enabled by default)
  const isEnabled = rpc.config.features?.imagePicker?.predefinedModels !== null

  return {
    categories,
    isLoading,
    isLoaded,
    isError: error !== null,
    isEnabled,
  }
}
