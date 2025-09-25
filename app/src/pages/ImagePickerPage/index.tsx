import React from 'react'
import { useParams } from 'react-router-dom'
import ImagePickerDesktop from './ImagePickerDesktop'
import QrUploadHelper from '@/pages/QrUploadHelper'

/**
 * ImagePickerPage - cross-device image upload via QR code
 *
 * Routes:
 * - /qr - Desktop QR code generation and polling
 * - /qr/:token - QR upload helper interface
 *
 * Features:
 * - QR code generation for cross-device upload
 * - Real-time polling for uploaded images
 * - Direct device upload fallback
 * - QR token-based upload flow
 */
export default function ImagePickerPage() {
  const { token } = useParams<{ token: string }>()

  // QR upload helper for token route
  if (token) {
    return <QrUploadHelper />
  }

  // Desktop QR generator for main route
  return <ImagePickerDesktop />
}
