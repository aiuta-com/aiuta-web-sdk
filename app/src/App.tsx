import React from 'react'
import { RpcProvider } from './contexts'
import { ModalRenderer, AppRouter } from '@/components'
import { useUrlParams, useCustomCSS, useRpcInitialization } from '@/hooks'

/**
 * Main App component - Entry point for the iframe application
 *
 * Handles two distinct modes:
 * 1. Main app mode: Small iframe with full application routing and navigation
 * 2. Modal mode: Fullscreen showing specific modal (share/fullscreen image)
 *
 * URL structure:
 * - Main app: / (no modal param) → AppRouter with full navigation
 * - Modal app: ?modal=share|fullscreen → ModalRenderer with specific modal
 */
export default function App() {
  const { modalType, cssUrl, initialPath } = useUrlParams()
  const { rpcApp } = useRpcInitialization()
  useCustomCSS(cssUrl)

  if (modalType) {
    return (
      <RpcProvider rpcApp={rpcApp}>
        <ModalRenderer modalType={modalType} />
      </RpcProvider>
    )
  }

  return (
    <RpcProvider rpcApp={rpcApp}>
      <AppRouter initialPath={initialPath} />
    </RpcProvider>
  )
}
