import React from 'react'
import { useAppSelector } from '@lib/redux/store'
import { isMobileSelector } from '@lib/redux/slices/configSlice/selectors'
import UploadsHistoryDesktop from './UploadsHistoryDesktop'
import UploadsHistoryMobile from './UploadsHistoryMobile'

/**
 * UploadsHistoryPage - gallery of user uploaded photos
 *
 * Features:
 * - View recently uploaded photos
 * - Select photos for try-on
 * - Delete photos from history
 * - Upload new photos
 * - Full-screen photo viewing
 */
export default function UploadsHistoryPage() {
  const isMobile = useAppSelector(isMobileSelector)
  return isMobile ? <UploadsHistoryMobile /> : <UploadsHistoryDesktop />
}
