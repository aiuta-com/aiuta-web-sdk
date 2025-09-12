import React from 'react'
import { useParams } from 'react-router-dom'
import PhotoUploadDesktop from './PhotoUploadDesktop'
import PhotoUploadMobile from './PhotoUploadMobile'

/**
 * PhotoUploadPage - cross-device photo upload via QR code
 *
 * Routes:
 * - /qr - Desktop QR code generation and polling
 * - /qr/:token - Mobile photo upload interface
 *
 * Features:
 * - QR code generation for cross-device upload
 * - Real-time polling for uploaded photos
 * - Direct device upload fallback
 * - Mobile-optimized upload interface
 */
export default function PhotoUploadPage() {
  const { token } = useParams<{ token: string }>()

  // Mobile version for QR token route
  if (token) {
    return <PhotoUploadMobile />
  }

  // Desktop version for main QR route
  return <PhotoUploadDesktop />
}
