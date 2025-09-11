import React from 'react'

// contexts
import { RpcProvider } from './contexts'

// components
import { ModalRenderer, AppRouter } from '@/components'

// hooks
import {
  useUrlParams,
  useCustomCSS,
  useModalOnlyStyles,
  useIframeInitialization,
  useRpcInitialization,
  useLegacyMessageHandler,
} from '@/hooks'

/**
 * Main App component - Entry point for the iframe application
 *
 * Handles:
 * - URL parameter parsing
 * - Custom CSS loading
 * - RPC initialization
 * - Modal-only rendering
 * - Full application routing
 */
function App() {
  // Parse URL parameters and determine app mode
  const { isModalOnly, modalType, cssUrl, initialPath } = useUrlParams()

  // Initialize all app functionality
  const { rpcApp } = useRpcInitialization()

  // Setup various initialization hooks
  useIframeInitialization()
  useCustomCSS(cssUrl)
  useModalOnlyStyles(isModalOnly)
  useLegacyMessageHandler()

  // If this is a modal-only iframe, only show the appropriate modal
  if (isModalOnly) {
    return <ModalRenderer modalType={modalType} />
  }

  // Full application with routing
  return (
    <RpcProvider rpcApp={rpcApp}>
      <AppRouter initialPath={initialPath} />
    </RpcProvider>
  )
}

export default App
