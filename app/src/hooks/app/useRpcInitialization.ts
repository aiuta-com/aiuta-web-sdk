import { useState, useEffect } from 'react'
import { useAppDispatch, store } from '@/store/store'
import { appSlice } from '@/store/slices/appSlice'
import { apiSlice } from '@/store/slices/apiSlice'
import { tryOnSlice } from '@/store/slices/tryOnSlice'
import { isMobileSelector } from '@/store/slices/appSlice'
import { AiutaRpcApp } from '@lib/rpc'
import type { AppHandlers } from '@lib/rpc'

declare const __APP_VERSION__: string

// Mobile breakpoint constant
const MOBILE_BREAKPOINT = 992

/**
 * Hook for RPC initialization and management
 */
export const useRpcInitialization = () => {
  const dispatch = useAppDispatch()
  const [rpcApp, setRpcApp] = useState<AiutaRpcApp | null>(null)

  useEffect(() => {
    const initializeRpc = async () => {
      try {
        const handlers: AppHandlers = {
          tryOn: async (productId: string) => {
            try {
              // Update endpoint data with the product ID
              // const currentState = store.getState()
              // const currentApiKey = currentState.api.apiKey
              // const currentSubscriptionId = currentState.api.subscriptionId

              // Update productId in tryOnSlice
              dispatch(tryOnSlice.actions.setProductId(productId))
              return // Explicitly return to complete the Promise
            } catch (error) {
              console.error('[RPC APP] Error in tryOn handler:', error)
              throw error // Re-throw so RPC can handle the error
            }
          },

          updateWindowSizes: async (sizes: { width: number; height: number }) => {
            try {
              // Get current isMobile state from store (not from closure)
              const state = store.getState()
              const currentIsMobile = isMobileSelector(state)

              // Update mobile state based on window width
              if (sizes.width <= MOBILE_BREAKPOINT && !currentIsMobile) {
                dispatch(appSlice.actions.setIsMobile(true))
              } else if (sizes.width > MOBILE_BREAKPOINT && currentIsMobile) {
                dispatch(appSlice.actions.setIsMobile(false))
              }
            } catch (error) {
              console.error('[RPC APP] Error handling updateWindowSizes:', error)
              throw error
            }
          },
        }

        const rpcAppInstance = new AiutaRpcApp({
          context: { appVersion: __APP_VERSION__ },
          handlers,
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

  return { rpcApp }
}

/**
 * Initialize authentication data from RPC config
 */
const initializeAuthData = (rpcAppInstance: AiutaRpcApp) => {
  try {
    const auth = rpcAppInstance.config.auth

    let endpointData: any = {
      status: 200,
      skuId: '', // Will be set by SDK via tryOn
    }

    if ('apiKey' in auth) {
      // API Key auth
      endpointData.apiKey = auth.apiKey
      store.dispatch(apiSlice.actions.setApiKey(auth.apiKey))
    } else if ('subscriptionId' in auth) {
      // JWT auth
      endpointData.subscriptionId = auth.subscriptionId
      store.dispatch(apiSlice.actions.setSubscriptionId(auth.subscriptionId))
      // Note: JWT token is obtained dynamically via getJwt callback when needed
    }
  } catch (error) {
    console.error('Failed to initialize auth data:', error)
  }
}
