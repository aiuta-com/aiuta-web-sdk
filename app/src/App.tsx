import React from 'react'
import { Route, Routes, MemoryRouter } from 'react-router-dom'
import { RpcProvider, LoggerProvider, ShareProvider } from './contexts'
import {
  PageBar,
  PoweredBy,
  FullScreenGallery,
  Share,
  AppContainer,
  AbortAlert,
} from '@/components'
import {
  useUrlParams,
  useCustomCssUrl,
  useCustomCss,
  useRpcInitialization,
  useStandaloneApp,
  useOutsideClick,
} from '@/hooks'

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
          <Route path="*" element={<MainAppContext />} />
        </Routes>
      </MemoryRouter>
    </LoggerProvider>
  )
}

function MainAppContext() {
  const { rpc } = useRpcInitialization()
  const { cssUrl } = useUrlParams()
  const { isReady: isCssUrlReady } = useCustomCssUrl(cssUrl)

  // Don't render until both RPC and CSS URL are ready
  if (!rpc || !isCssUrlReady) {
    return null
  }

  return (
    <RpcProvider rpc={rpc}>
      <ShareProvider>
        <MainAppContent />
      </ShareProvider>
    </RpcProvider>
  )
}

function MainAppContent() {
  useCustomCss()
  useOutsideClick()

  return (
    <>
      <AppContainer>
        <AbortAlert />
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

      <FullScreenGallery />
      <Share />
    </>
  )
}

function QrUploadContext() {
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
