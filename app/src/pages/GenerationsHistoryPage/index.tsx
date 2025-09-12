import React from 'react'
import { useAppSelector } from '@/store/store'
import { isMobileSelector } from '@/store/slices/configSlice/selectors'
import GenerationsHistoryDesktop from './GenerationsHistoryDesktop'
import GenerationsHistoryMobile from './GenerationsHistoryMobile'

/**
 * GenerationsHistoryPage - gallery of generated try-on images
 *
 * Features:
 * - View generated try-on results
 * - Select multiple images for deletion
 * - Full-screen image viewing
 * - Bulk image management
 */
export default function GenerationsHistoryPage() {
  const isMobile = useAppSelector(isMobileSelector)
  return isMobile ? <GenerationsHistoryMobile /> : <GenerationsHistoryDesktop />
}
