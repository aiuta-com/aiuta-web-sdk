import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { RpcProvider, ShareProvider, AlertProvider, AlertRenderer } from '@/contexts'
import { PageBar, PoweredBy, FullScreenGallery, Share, AppContainer } from '@/components'
import {
  useUrlParams,
  useCustomCssUrl,
  useCustomCss,
  useRpcInitialization,
  useOutsideClick,
  usePredefinedModels,
} from '@/hooks'

import HomePageRouter from '@/pages/Home'
import OnboardingPage from '@/pages/1-Onboarding'
import QrPromptPage from '@/pages/2-QrPrompt'
import TryOnPage from '@/pages/4-TryOn'
import ResultsPage from '@/pages/5-Results'
import GenerationsHistoryPage from '@/pages/6-GenerationsHistory'
import UploadsHistoryPage from '@/pages/7-UploadsHistory'
import PredefinedModelsPage from '@/pages/8-PredefinedModels'

/**
 * Main application component with full RPC and context setup
 */
export const MainApp = () => {
  const { cssUrl } = useUrlParams()
  const { isReady: isCssUrlReady } = useCustomCssUrl(cssUrl)

  // Don't render until CSS URL is ready
  if (!isCssUrlReady) {
    return null
  }

  return (
    <AlertProvider>
      <RpcInitializer />
    </AlertProvider>
  )
}

function RpcInitializer() {
  const { rpc } = useRpcInitialization()

  // Don't render until RPC is ready
  if (!rpc) {
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
  usePredefinedModels()

  return (
    <>
      <AppContainer>
        <AlertRenderer />
        <PageBar />
        <Routes>
          <Route path="/" element={<HomePageRouter />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/qr" element={<QrPromptPage />} />
          <Route path="/models" element={<PredefinedModelsPage />} />
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
