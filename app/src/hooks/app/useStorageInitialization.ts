import { useEffect } from 'react'
import { useAppDispatch } from '@/store/store'
import { onboardingSlice } from '@/store/slices/onboardingSlice'
import { predefinedModelsSlice } from '@/store/slices/predefinedModelsSlice'
import { useOnboardingData, usePredefinedModelsCache } from '@/hooks/data'

/**
 * Hook to sync storage data (React Query) with Redux UI state on app initialization
 * This ensures Redux has the correct initial values from IndexedDB/localStorage
 */
export const useStorageInitialization = () => {
  const dispatch = useAppDispatch()

  // Load data from storage
  const { data: isOnboardingCompleted, isLoading: isOnboardingLoading } = useOnboardingData()
  const { data: modelsCache, isLoading: isModelsLoading } = usePredefinedModelsCache()

  // Sync onboarding state
  useEffect(() => {
    if (!isOnboardingLoading && isOnboardingCompleted !== undefined) {
      dispatch(onboardingSlice.actions.setIsCompleted(isOnboardingCompleted))
    }
  }, [dispatch, isOnboardingCompleted, isOnboardingLoading])

  // Sync predefined models cache
  useEffect(() => {
    if (!isModelsLoading && modelsCache) {
      // Use initializeFromCache instead of setCategories
      // This loads the etag but doesn't mark as loaded, allowing the fetch to proceed
      dispatch(
        predefinedModelsSlice.actions.initializeFromCache({
          categories: modelsCache.categories,
          etag: modelsCache.etag,
        }),
      )
    }
  }, [dispatch, modelsCache, isModelsLoading])

  // Return loading state so we can wait for initialization
  return {
    isInitializing: isOnboardingLoading || isModelsLoading,
  }
}
