import { useCallback } from 'react'
import { useAppDispatch } from '@/store/store'
import { appSlice } from '@/store/slices/appSlice'
import { useRpcProxy } from '@/contexts/RpcContext'

/**
 * Hook for managing app visibility
 * Handles both app state and SDK communication
 */
export const useAppVisibility = () => {
  const dispatch = useAppDispatch()
  const rpc = useRpcProxy()

  const hideApp = useCallback(() => {
    // Update app state to hide AppContainer
    dispatch(appSlice.actions.setIsAppVisible(false))

    // Tell SDK to make iframe non-interactive
    rpc.sdk.setInteractive(false)
  }, [dispatch, rpc])

  const showApp = useCallback(() => {
    // Update app state to show AppContainer
    dispatch(appSlice.actions.setIsAppVisible(true))

    // Tell SDK to make iframe interactive
    rpc.sdk.setInteractive(true)
  }, [dispatch, rpc])

  return {
    hideApp,
    showApp,
  }
}
