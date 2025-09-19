import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector, store } from '@/store/store'
import { appSlice } from '@/store/slices/appSlice'
import { apiSlice } from '@/store/slices/apiSlice'
import { tryOnSlice } from '@/store/slices/tryOnSlice'
import { isAppVisibleSelector } from '@/store/slices/appSlice'
import { AiutaAppRpc } from '@lib/rpc'

declare const __APP_VERSION__: string

/**
 * Hook for RPC initialization and management
 */
export const useRpcInitialization = () => {
  const dispatch = useAppDispatch()
  const [rpc, setRpc] = useState<AiutaAppRpc | null>(null)
  const isAppVisible = useAppSelector(isAppVisibleSelector)

  useEffect(() => {
    const initializeRpc = async () => {
      try {
        const showApp = () => {
          dispatch(appSlice.actions.setIsAppVisible(true))
        }

        const rpc = new AiutaAppRpc({
          context: { appVersion: __APP_VERSION__ },
          handlers: {
            tryOn: async (productId: string) => {
              try {
                // Show app when tryOn is called
                showApp()

                // Update productId in tryOnSlice
                dispatch(tryOnSlice.actions.setProductId(productId))

                return // Explicitly return to complete the Promise
              } catch (error) {
                console.error('[RPC APP] Error in tryOn handler:', error)
                throw error // Re-throw so RPC can handle the error
              }
            },
          },
        })

        await rpc.connect()
        setRpc(rpc)

        // Initialize auth data once RPC is connected
        initializeAuthData(rpc)
      } catch (error) {
        console.log('[RPC APP] Failed to initialize RPC', error)
      }
    }

    initializeRpc()
  }, [dispatch])

  // Sync iframe interactivity with app visibility
  useEffect(() => {
    if (rpc) {
      rpc.sdk.setInteractive(isAppVisible)
    }
  }, [rpc, isAppVisible])

  return { rpc }
}

/**
 * Initialize authentication data from RPC config
 */
const initializeAuthData = (rpc: AiutaAppRpc) => {
  try {
    const auth = rpc.config.auth

    if ('apiKey' in auth) {
      // API Key auth
      store.dispatch(apiSlice.actions.setApiKey(auth.apiKey))
    } else if ('subscriptionId' in auth) {
      // JWT auth
      store.dispatch(apiSlice.actions.setSubscriptionId(auth.subscriptionId))
      // Note: JWT token is obtained dynamically via getJwt callback when needed
    }
  } catch (error) {
    console.error('Failed to initialize auth data:', error)
  }
}
