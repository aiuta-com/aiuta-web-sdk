import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/store'
import { productIdsSelector, tryOnSizeFitOptionsSelector } from '@/store/slices/tryOnSlice'
import { sizeFitSlice } from '@/store/slices/sizeFitSlice'
import { useRpc } from '@/contexts'

/**
 * The "Find your size" entry on the try-on results screen. Available when the
 * feature isn't disabled, the tryOn call carried the Size & Fit context
 * (size chart + naiz credentials), and the try-on targets a single product
 * (the chart is per-product).
 */
export const useSizeFitEntry = () => {
  const rpc = useRpc()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const productIds = useAppSelector(productIdsSelector)
  const options = useAppSelector(tryOnSizeFitOptionsSelector)

  const isAvailable = rpc.config.features?.sizeFit !== null && !!options && productIds.length === 1

  const open = useCallback(() => {
    if (!options || productIds.length !== 1) return
    dispatch(
      sizeFitSlice.actions.startSession({
        productId: productIds[0],
        options,
        origin: 'results',
      }),
    )
    navigate('/size-fit')
  }, [dispatch, navigate, productIds, options])

  return { isAvailable, open }
}
