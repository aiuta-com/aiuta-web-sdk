import React from 'react'
import { useParams } from 'react-router-dom'
import ImagePickerDesktop from './ImagePickerDesktop'
import ImagePickerMobile from './ImagePickerMobile'

/**
 * ImagePickerPage - cross-device image upload via QR code
 *
 * Routes:
 * - /qr - Desktop QR code generation and polling
 * - /qr/:token - Mobile image upload interface
 *
 * Features:
 * - QR code generation for cross-device upload
 * - Real-time polling for uploaded images
 * - Direct device upload fallback
 * - Mobile-optimized upload interface
 */
export default function ImagePickerPage() {
  const { token } = useParams<{ token: string }>()

  // Mobile version for QR token route
  if (token) {
    return <ImagePickerMobile />
  }

  // Desktop version for main QR route
  return <ImagePickerDesktop />
}
