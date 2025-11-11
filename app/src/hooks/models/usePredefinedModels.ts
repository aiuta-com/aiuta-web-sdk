import { useCallback, useRef, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/store'
import { predefinedModelsSlice } from '@/store/slices/predefinedModelsSlice'
import {
  modelsSelector,
  modelsLoadingSelector,
  modelsLoadedSelector,
  modelsErrorSelector,
  modelsEtagSelector,
  modelsRetryRequestedSelector,
} from '@/store/slices/predefinedModelsSlice'
import { apiKeySelector, subscriptionIdSelector } from '@/store/slices/apiSlice'
import { TryOnApiService } from '@/utils/api'
import { useRpc } from '@/contexts'

const RETRY_DELAY = 5000 // 5 seconds

// Global state shared between all hook instances to prevent duplicate operations
const globalRetryInProgressRef = { current: false }
const globalRetryTimeoutRef = { current: null as NodeJS.Timeout | null }

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
  const retryRequested = useAppSelector(modelsRetryRequestedSelector)
  const apiKey = useAppSelector(apiKeySelector)
  const subscriptionId = useAppSelector(subscriptionIdSelector)

  const loadingInProgressRef = useRef(false) // Track if loading is currently in progress (sync guard)
  const mountedRef = useRef(false) // Track if component has mounted
  const loadModelsIfNeededRef = useRef<(() => Promise<void>) | null>(null)

  const loadModelsIfNeeded = useCallback(async () => {
    // ATOMIC: Handle retry request with priority - immediately claim it
    if (retryRequested) {
      // Use GLOBAL synchronous flag to prevent race condition
      // between multiple hook instances trying to handle the same retry
      if (globalRetryInProgressRef.current || isLoading || loadingInProgressRef.current) {
        return
      }
      // Claim the retry SYNCHRONOUSLY with global flag
      globalRetryInProgressRef.current = true
      // Then dispatch to Redux (async but shared state)
      dispatch(predefinedModelsSlice.actions.setLoading(true))
      loadingInProgressRef.current = true
    } else {
      // Normal flow: check if we should skip
      if (isLoaded || isLoading || loadingInProgressRef.current) {
        return
      }

      // Check if feature is explicitly disabled
      const isPredefinedModelsEnabled = rpc.config.features?.imagePicker?.predefinedModels !== null
      if (!isPredefinedModelsEnabled) {
        return
      }

      // Mark that loading is in progress
      loadingInProgressRef.current = true
      dispatch(predefinedModelsSlice.actions.setLoading(true))
    }

    // Clear any pending GLOBAL retry timeout
    if (globalRetryTimeoutRef.current) {
      clearTimeout(globalRetryTimeoutRef.current)
      globalRetryTimeoutRef.current = null
    }

    try {
      const result = await TryOnApiService.getPredefinedModels({ apiKey, subscriptionId }, etag)

      // Handle 304 Not Modified - use cached data
      if (result.notModified) {
        dispatch(predefinedModelsSlice.actions.markAsLoaded())
        loadingInProgressRef.current = false
        globalRetryInProgressRef.current = false
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
        loadingInProgressRef.current = false
        globalRetryInProgressRef.current = false
      } else {
        // Empty list - still consider it loaded
        dispatch(
          predefinedModelsSlice.actions.setCategories({
            categories: [],
            etag: result.etag,
          }),
        )
        loadingInProgressRef.current = false
        globalRetryInProgressRef.current = false
      }
    } catch (error) {
      console.error('[usePredefinedModels] Failed to load models:', error)
      dispatch(predefinedModelsSlice.actions.setError((error as Error).message))
      loadingInProgressRef.current = false
      globalRetryInProgressRef.current = false

      // Schedule retry using GLOBAL timeout (only one timer for all instances)
      // Only schedule if no timeout is already pending
      if (!globalRetryTimeoutRef.current) {
        globalRetryTimeoutRef.current = setTimeout(() => {
          globalRetryTimeoutRef.current = null
          loadModelsIfNeededRef.current?.()
        }, RETRY_DELAY)
      }
    }
  }, [isLoaded, isLoading, retryRequested, dispatch, rpc, apiKey, subscriptionId, etag])

  // Store function in ref for stable reference
  loadModelsIfNeededRef.current = loadModelsIfNeeded

  // Auto-load on mount - only once
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      loadModelsIfNeededRef.current?.()
    }
  }, [])

  // Watch for manual retry requests (triggered by retryLoading action)
  // retryRequested flag ensures only one hook instance handles the retry
  useEffect(() => {
    if (retryRequested && !isLoading) {
      // Only trigger if explicitly requested via retryLoading()
      loadModelsIfNeededRef.current?.()
    }
  }, [retryRequested, isLoading])

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
