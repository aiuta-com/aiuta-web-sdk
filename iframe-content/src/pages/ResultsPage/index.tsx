import React from 'react'
import { useAppSelector } from '@/store/store'
import { isMobileSelector } from '@/store/slices/configSlice/selectors'
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
  const isMobile = useAppSelector(isMobileSelector)
  return isMobile ? <ResultsMobile /> : <ResultsDesktop />
}
