import React from 'react'
import { Route, Routes, MemoryRouter } from 'react-router-dom'
import { RpcProvider, LoggerProvider } from './contexts'
import { PageBar, PoweredBy, FullScreenGallery, ShareModal, AppContainer } from '@/components'
import { useUrlParams, useCustomCSS, useRpcInitialization, useBootstrapTransition } from '@/hooks'

import Home from '@/pages/Home'
import OnboardingPage from '@/pages/1-OnboardingPage'
import QrPromptPage from '@/pages/2-QrPromptPage/QrPromptPage'
import QrUploadPage from '@/pages/3-QrUploadPage'
import TryOnPage from '@/pages/4-TryOnPage'
import ResultsPage from '@/pages/5-ResultsPage'
import GenerationsHistoryPage from '@/pages/6-GenerationsHistoryPage'
import UploadsHistoryPage from '@/pages/7-UploadsHistoryPage'

export default function App() {
  const { cssUrl, initialPath } = useUrlParams()
  const { rpc } = useRpcInitialization()
  const loggerComponent = 'aiuta:iframe'

  useBootstrapTransition(rpc)

  // Don't render anything until RPC is connected and config is loaded
  if (!rpc) {
    return null
  }

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
        <FullScreenGallery />
        <ShareModal />

        {/* App layout */}
        <PageBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/qr" element={<QrPromptPage />} />
          <Route path="/qr/:token" element={<QrUploadPage />} />
          <Route path="/tryon" element={<TryOnPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/uploads-history" element={<UploadsHistoryPage />} />
          <Route path="/generations-history" element={<GenerationsHistoryPage />} />
        </Routes>
        <PoweredBy />
      </MemoryRouter>
    </AppContainer>
  )
}
