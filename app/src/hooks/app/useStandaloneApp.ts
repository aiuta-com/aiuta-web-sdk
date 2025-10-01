import { useLayoutEffect, useState } from 'react'
import { useAppDispatch } from '@/store/store'
import { appSlice } from '@/store/slices/appSlice'

/**
 * Hook for standalone app contexts that don't use RPC
 * Sets app as visible immediately and returns readiness flag
 */
export const useStandaloneApp = () => {
  const dispatch = useAppDispatch()
  const [isReady, setIsReady] = useState(false)

  // Use useLayoutEffect to run synchronously before paint
  useLayoutEffect(() => {
    dispatch(appSlice.actions.setIsAppVisible(true))
    setIsReady(true)
  }, [dispatch])

  return { isReady }
}
