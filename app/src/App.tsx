import React, { useEffect } from 'react'
import { Route, Routes, MemoryRouter } from 'react-router-dom'
import { RpcProvider, LoggerProvider } from './contexts'
import {
  PageBar,
  PoweredBy,
  FullScreenGallery,
  ShareModal,
  Spinner,
  AppContainer,
} from '@/components'
import { useUrlParams, useCustomCSS, useRpcInitialization } from '@/hooks'

import PhotoUploadPage from '@/pages/PhotoUploadPage'
import Home from '@/pages/Home'
import OnboardingPage from '@/pages/OnboardingPage'
import TryOnPage from '@/pages/TryOnPage'
import GenerationsHistoryPage from '@/pages/GenerationsHistoryPage'
import ResultsPage from '@/pages/ResultsPage'
import UploadsHistoryPage from '@/pages/UploadsHistoryPage'

export default function App() {
  const { cssUrl, initialPath } = useUrlParams()
  const { rpc } = useRpcInitialization()

  const loggerComponent = 'aiuta:iframe'

  // Handle bootstrap to main app transition after RPC is ready
  useEffect(() => {
    // Check if we're running inside bootstrap environment
    if (window.aiutaBootstrap?.ready && rpc) {
      // Wait for RPC to be fully established before hiding bootstrap
      const timer = setTimeout(() => {
        window.aiutaBootstrap?.hideBootstrap()
      }, 100) // Small delay to ensure smooth transition

      return () => clearTimeout(timer)
    }
  }, [rpc])

  return (
    <LoggerProvider component={loggerComponent}>
      <RpcProvider rpc={rpc}>
        <AppRouter cssUrl={cssUrl} initialPath={initialPath} />
      </RpcProvider>
    </LoggerProvider>
  )
}

function AppRouter({ cssUrl, initialPath }: { cssUrl?: string; initialPath?: string }) {
  useCustomCSS(cssUrl)

  return (
    <AppContainer>
      <MemoryRouter initialEntries={[initialPath || '/']}>
        {/* Global components */}
        <Spinner />
        <FullScreenGallery />
        <ShareModal />

        {/* App layout */}
        <PageBar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/qr" element={<PhotoUploadPage />} />
            <Route path="/qr/:token" element={<PhotoUploadPage />} />
            <Route path="/view" element={<TryOnPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/uploads-history" element={<UploadsHistoryPage />} />
            <Route path="/generations-history" element={<GenerationsHistoryPage />} />
          </Routes>
        </main>
        <PoweredBy />
      </MemoryRouter>
    </AppContainer>
  )
}
