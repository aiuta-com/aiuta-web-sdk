import React from 'react'
import { useAppSelector } from '@/store/store'
import { isMobileSelector } from '@/store/slices/appSlice'
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
