import React from 'react'
import { Route, Routes, MemoryRouter } from 'react-router-dom'
import { RpcProvider, LoggerProvider, ShareProvider } from './contexts'
import { PageBar, PoweredBy, FullScreenGallery, Share, AppContainer } from '@/components'
import { useUrlParams, useCustomCSS, useRpcInitialization, useStandaloneApp } from '@/hooks'

import HomePageRouter from '@/pages/Home'
import OnboardingPage from '@/pages/1-Onboarding'
import QrPromptPage from '@/pages/2-QrPrompt'
import QrUploadPage from '@/pages/3-QrUpload'
import TryOnPage from '@/pages/4-TryOn'
import ResultsPage from '@/pages/5-Results'
import GenerationsHistoryPage from '@/pages/6-GenerationsHistory'
import UploadsHistoryPage from '@/pages/7-UploadsHistory'

export default function App() {
  const { initialPath } = useUrlParams()
  const loggerComponent = 'aiuta:app'

  return (
    <LoggerProvider component={loggerComponent}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/qr/:token" element={<QrUploadContext />} />
          <Route path="*" element={<MainAppContent />} />
        </Routes>
      </MemoryRouter>
    </LoggerProvider>
  )
}

function MainAppContent() {
  const { rpc } = useRpcInitialization()
  const { cssUrl } = useUrlParams()
  const { isReady } = useCustomCSS(cssUrl)

  // Don't render until both RPC and CSS are ready
  if (!rpc || !isReady) {
    return null
  }

  return (
    <RpcProvider rpc={rpc}>
      <ShareProvider>
        <FullScreenGallery />
        <Share />
        <AppContainer>
          <PageBar />
          <Routes>
            <Route path="/" element={<HomePageRouter />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/qr" element={<QrPromptPage />} />
            <Route path="/tryon" element={<TryOnPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/generations" element={<GenerationsHistoryPage />} />
            <Route path="/uploads" element={<UploadsHistoryPage />} />
          </Routes>
          <PoweredBy />
        </AppContainer>
      </ShareProvider>
    </RpcProvider>
  )
}

function QrUploadContext() {
  const { cssUrl } = useUrlParams()
  const { isReady: isCssReady } = useCustomCSS(cssUrl)
  const { isReady: isAppReady } = useStandaloneApp()

  // Don't render until both app visibility and CSS are ready
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
