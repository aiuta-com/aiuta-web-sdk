import { useCallback } from 'react'
import { useRpc } from '@/contexts'
import { useAppSelector } from '@/store/store'
import { productIdsSelector } from '@/store/slices/tryOnSlice'

/**
 * Hook for tracking predefined models analytics events
 */
export const usePredefinedModelsAnalytics = () => {
  const rpc = useRpc()
  const productIds = useAppSelector(productIdsSelector)

  const trackModelsPageView = useCallback(() => {
    rpc.sdk.trackEvent({
      type: 'page',
      pageId: 'predefinedModels',
      productIds,
      event: '',
    })
  }, [rpc, productIds])

  const trackSelectModelButtonClick = useCallback(() => {
    rpc.sdk.trackEvent({
      type: 'picker',
      event: 'selectModelButtonClicked',
      pageId: 'imagePicker',
      productIds,
    })
  }, [rpc, productIds])

  const trackCategoryChange = useCallback(
    (categoryId: string) => {
      rpc.sdk.trackEvent({
        type: 'picker',
        event: 'modelCategoryChanged',
        pageId: 'predefinedModels',
        productIds,
        categoryId,
      })
    },
    [rpc, productIds],
  )

  const trackModelSelected = useCallback(
    (modelId: string, categoryId: string) => {
      rpc.sdk.trackEvent({
        type: 'picker',
        event: 'predefinedModelSelected',
        pageId: 'predefinedModels',
        productIds,
        modelId,
        categoryId,
      })
    },
    [rpc, productIds],
  )

  return {
    trackModelsPageView,
    trackSelectModelButtonClick,
    trackCategoryChange,
    trackModelSelected,
  }
}
