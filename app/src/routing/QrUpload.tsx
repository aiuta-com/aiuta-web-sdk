import React from 'react'
import { AppContainer, PoweredBy } from '@/components'
import { useUrlParams, useCustomCssUrl, useStandaloneApp } from '@/hooks'
import QrUploadPage from '@/pages/3-QrUpload'

/**
 * Standalone QR upload context for direct QR code scanning
 * This runs independently without full RPC setup
 */
export const QrUpload = () => {
  const { cssUrl } = useUrlParams()
  const { isReady: isCssReady } = useCustomCssUrl(cssUrl)
  const { isReady: isAppReady } = useStandaloneApp()

  // Don't render until both app visibility and CSS URL are ready
  // Note: customCss is not available here as RPC is not initialized
  if (!isAppReady || !isCssReady) {
    return null
  }

  return (
    <AppContainer>
      <QrUploadPage />
      <PoweredBy />
    </AppContainer>
  )
}
