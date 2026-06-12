import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAppDispatch } from '@/store/store'
import { useStorageBackend } from '@/contexts'
import { onboardingSlice } from '@/store/slices/onboardingSlice'
import { tryOnSlice } from '@/store/slices/tryOnSlice'
import { qrSlice } from '@/store/slices/qrSlice'
import { predefinedModelsSlice } from '@/store/slices/predefinedModelsSlice'
import { errorSnackbarSlice } from '@/store/slices/errorSnackbarSlice'
import { uploadsSlice } from '@/store/slices/uploadsSlice'
import { generationsSlice } from '@/store/slices/generationsSlice'
import { registerClearStorage } from '@/utils/debug/clearStorageRegistry'

// sessionStorage key from usePredefinedModelsSelection
const SELECTED_CATEGORY_KEY = 'aiuta-selected-category-id'

/**
 * Registers the clearStorage implementation for the RPC handler (see
 * clearStorageRegistry for why this lives in a component): wipes every key
 * the SDK stores, then resets in-memory state so the app behaves like a
 * first visit.
 */
export const ClearStorageBridge = () => {
  const backend = useStorageBackend()
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    registerClearStorage(async () => {
      // The full set of keys the SDK persists (clearOnboarding also removes
      // the legacy pre-per-mode key)
      await Promise.all([
        backend.clearInputImages(),
        backend.clearGeneratedImages(),
        backend.clearConsents(),
        backend.clearOnboarding(),
        backend.clearPredefinedModels(),
      ])

      sessionStorage.removeItem(SELECTED_CATEGORY_KEY)

      // Drop cached reads (uploads/generations lists live here)
      queryClient.clear()

      // Reset in-memory UI state
      dispatch(onboardingSlice.actions.resetOnboarding())
      dispatch(tryOnSlice.actions.resetTryOnState())
      dispatch(qrSlice.actions.resetQrState())
      dispatch(predefinedModelsSlice.actions.resetPredefinedModels())
      dispatch(errorSnackbarSlice.actions.hideErrorSnackbar())
      dispatch(uploadsSlice.actions.clearSelectedImages())
      dispatch(uploadsSlice.actions.setIsSelecting(false))
      dispatch(generationsSlice.actions.clearSelectedImages())
      dispatch(generationsSlice.actions.setIsSelecting(false))
      dispatch(generationsSlice.actions.clearCurrentResults())

      // Back to the entry point so the initial route is re-decided cleanly
      navigate('/', { replace: true })
    })

    return () => registerClearStorage(null)
  }, [backend, queryClient, dispatch, navigate])

  return null
}
