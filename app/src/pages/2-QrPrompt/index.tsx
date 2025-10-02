import React from 'react'
import QrPromptDesktop from './QrPromptDesktop'

/**
 * QrPromptPage - QR code generation and display page
 *
 * Features:
 * - QR code generation for mobile device pairing
 * - Desktop-only functionality (mobile uses direct upload)
 * - Polling for mobile connection status
 * - File upload fallback option
 */
export default function QrPromptPage() {
  return <QrPromptDesktop />
}
