import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/store'
import { productIdsSelector, tryOnSizeChartSelector } from '@/store/slices/tryOnSlice'
import { sizeFitSlice } from '@/store/slices/sizeFitSlice'
import { useRpc } from '@/contexts'

/**
 * The "Find your size" entry on the try-on results screen. Available when the
 * feature isn't disabled, the tryOn call carried a size-chart code, and the
 * try-on targets a single product (the chart is per-product).
 */
export const useSizeFitEntry = () => {
  const rpc = useRpc()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const productIds = useAppSelector(productIdsSelector)
  const sizeChart = useAppSelector(tryOnSizeChartSelector)

  const isAvailable =
    rpc.config.features?.sizeFit !== null && !!sizeChart && productIds.length === 1

  const open = useCallback(() => {
    if (!sizeChart || productIds.length !== 1) return
    dispatch(
      sizeFitSlice.actions.startSession({
        productId: productIds[0],
        sizeChart,
        origin: 'results',
      }),
    )
    navigate('/size-fit')
  }, [dispatch, navigate, productIds, sizeChart])

  return { isAvailable, open }
}
