import React, { useEffect } from 'react'
import { useAppSelector } from '@/store/store'
import { isMobileSelector } from '@/store/slices/appSlice'
import { productIdSelector } from '@/store/slices/tryOnSlice'
import { useRpc } from '@/contexts'
import ResultsDesktop from './ResultsDesktop'
import ResultsMobile from './ResultsMobile'

/**
 * ResultsPage - display generated try-on results
 *
 * Features:
 * - View generated try-on images
 * - Navigate through multiple results
 * - Share results
 * - Full-screen image viewing
 * - Synchronized scrolling (desktop)
 */
export default function ResultsPage() {
  const rpc = useRpc()
  const isMobile = useAppSelector(isMobileSelector)
  const productId = useAppSelector(productIdSelector)

  // Track page view on mount
  useEffect(() => {
    rpc.sdk.trackEvent({
      type: 'page',
      pageId: 'results',
      productIds: [productId],
    })
  }, [rpc, productId])

  return isMobile ? <ResultsMobile /> : <ResultsDesktop />
}
