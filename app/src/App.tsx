import React from 'react'
import { Route, Routes, MemoryRouter } from 'react-router-dom'
import { RpcProvider, LoggerProvider } from './contexts'
import {
  PageBar,
  PoweredBy,
  FullScreenGallery,
  ShareModal,
  AppContainer,
  MainContent,
} from '@/components'
import { useUrlParams, useCustomCSS, useRpcInitialization, useBootstrapTransition } from '@/hooks'

import ImagePickerPage from '@/pages/ImagePickerPage'
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
        <MainContent>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/qr" element={<ImagePickerPage />} />
            <Route path="/qr/:token" element={<ImagePickerPage />} />
            <Route path="/view" element={<TryOnPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/uploads-history" element={<UploadsHistoryPage />} />
            <Route path="/generations-history" element={<GenerationsHistoryPage />} />
          </Routes>
        </MainContent>
        <PoweredBy />
      </MemoryRouter>
    </AppContainer>
  )
}
