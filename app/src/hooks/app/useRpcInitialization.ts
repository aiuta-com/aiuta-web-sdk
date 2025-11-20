import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/store'
import { appSlice } from '@/store/slices/appSlice'
import { tryOnSlice } from '@/store/slices/tryOnSlice'
import { isAppVisibleSelector } from '@/store/slices/appSlice'
import { useAlert, useLogger } from '@/contexts'
import { AiutaAppRpc } from '@lib/rpc'

declare const __APP_VERSION__: string

/**
 * Delay for iframe appearance animation
 * Allows DOM to fully render before triggering CSS transition
 */
const SHOW_DELAY = 200

/**
 * Hook for RPC initialization and management
 */
export const useRpcInitialization = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const logger = useLogger()
  const { closeAlert } = useAlert()
  const [rpc, setRpc] = useState<AiutaAppRpc | null>(null)
  const isAppVisible = useAppSelector(isAppVisibleSelector)

  useEffect(() => {
    // Prevent multiple initialization attempts
    if (rpc) {
      return
    }

    const initializeRpc = async () => {
      try {
        const showApp = () => {
          // Close any active alerts when showing app
          closeAlert()

          // Always navigate to home when showing the app, clearing history
          navigate('/', { replace: true })

          // Delay to ensure iframe and AppContainer are fully rendered
          // This prevents size flickering during CSS transition
          setTimeout(() => {
            dispatch(appSlice.actions.setIsAppVisible(true))
          }, SHOW_DELAY)
        }

        const rpc = new AiutaAppRpc({
          context: { appVersion: __APP_VERSION__ },
          handlers: {
            tryOn: async (productIds: string | string[]) => {
              try {
                // Support both single and multi-item try-on (backward compatibility)
                const productIdsArray = Array.isArray(productIds) ? productIds : [productIds]

                // Show app when tryOn is called
                showApp()

                // Update productIds in tryOnSlice
                dispatch(tryOnSlice.actions.setProductIds(productIdsArray))

                return // Explicitly return to complete the Promise
              } catch (error) {
                logger.error('[RPC APP] Error in tryOn handler:', error)
                throw error // Re-throw so RPC can handle the error
              }
            },
          },
        })

        await rpc.connect()
        setRpc(rpc)
      } catch (error) {
        logger.error('[RPC APP] Failed to initialize RPC', error)
      }
    }

    initializeRpc()
  }, [dispatch, navigate, closeAlert, rpc]) // Add rpc to dependencies

  // Sync iframe interactivity with app visibility
  useEffect(() => {
    if (rpc) {
      rpc.sdk.setInteractive(isAppVisible)
    }
  }, [rpc, isAppVisible])

  return { rpc }
}
