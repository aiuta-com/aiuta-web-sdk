import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { isMobileSelector } from '@/store/slices/appSlice'
import { productIdsSelector, tryOnSlice } from '@/store/slices/tryOnSlice'
import { currentResultIdSelector } from '@/store/slices/generationsSlice/selectors'
import { useGenerationsData } from '@/hooks/data'
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
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const isMobile = useAppSelector(isMobileSelector)
  const productIds = useAppSelector(productIdsSelector)
  const currentResultId = useAppSelector(currentResultIdSelector)
  const { data: generations = [], isLoading } = useGenerationsData()

  // The results screen is tied to a specific generation. If it's gone (deleted
  // here, in the fullscreen, or on the history screen), there's nothing to show
  // → fall back to the input step, as if the widget was just opened.
  useEffect(() => {
    if (isLoading) return
    const hasResult = !!currentResultId && generations.some((g) => g.id === currentResultId)
    if (!hasResult) navigate('/', { replace: true })
  }, [isLoading, currentResultId, generations, navigate])

  // Clear the generating flag here rather than at generation success: doing it
  // there re-rendered the still-mounted try-on page into its picker state for a
  // frame (a visible flash). By now the try-on page is unmounted.
  useEffect(() => {
    dispatch(tryOnSlice.actions.setIsGenerating(false))
  }, [dispatch])

  // Track page view on mount
  useEffect(() => {
    rpc.sdk.trackEvent({
      type: 'page',
      pageId: 'results',
      productIds,
    })
  }, [rpc, productIds])

  return isMobile ? <ResultsMobile /> : <ResultsDesktop />
}
