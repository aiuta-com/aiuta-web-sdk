import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector, store } from '@/store/store'
import { appSlice } from '@/store/slices/appSlice'
import { apiSlice } from '@/store/slices/apiSlice'
import { tryOnSlice } from '@/store/slices/tryOnSlice'
import { isAppVisibleSelector } from '@/store/slices/appSlice'
import { AiutaRpcApp } from '@lib/rpc'

declare const __APP_VERSION__: string

/**
 * Hook for RPC initialization and management
 */
export const useRpcInitialization = () => {
  const dispatch = useAppDispatch()
  const [rpcApp, setRpcApp] = useState<AiutaRpcApp | null>(null)
  const isAppVisible = useAppSelector(isAppVisibleSelector)

  useEffect(() => {
    const initializeRpc = async () => {
      try {
        const showApp = () => {
          dispatch(appSlice.actions.setIsAppVisible(true))
        }

        const rpcAppInstance = new AiutaRpcApp({
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

        await rpcAppInstance.connect()
        setRpcApp(rpcAppInstance)

        // Initialize auth data once RPC is connected
        initializeAuthData(rpcAppInstance)
      } catch (error) {
        console.log('[RPC APP] Failed to initialize RPC', error)
      }
    }

    initializeRpc()
  }, [dispatch])

  // Sync iframe interactivity with app visibility
  useEffect(() => {
    if (rpcApp) {
      rpcApp.sdk.setInteractive(isAppVisible)
    }
  }, [rpcApp, isAppVisible])

  return { rpcApp }
}

/**
 * Initialize authentication data from RPC config
 */
const initializeAuthData = (rpcAppInstance: AiutaRpcApp) => {
  try {
    const auth = rpcAppInstance.config.auth

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
