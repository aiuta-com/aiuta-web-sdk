import React from 'react'
import { Route, Routes } from 'react-router-dom'
import {
  RpcProvider,
  ShareProvider,
  AlertProvider,
  AlertRenderer,
  DragAndDropProvider,
  StorageProvider,
  QueryProvider,
} from '@/contexts'
import {
  PageBar,
  PoweredBy,
  FullScreenGallery,
  Share,
  AppContainer,
  ConfigError,
} from '@/components'
import {
  useUrlParams,
  useCustomCssUrl,
  useCustomCss,
  useRpcInitialization,
  useOutsideClick,
  usePredefinedModels,
  useConfigValidation,
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
      <ConfigValidator />
    </RpcProvider>
  )
}

function ConfigValidator() {
  const { isValidating, isConfigValid, configError } = useConfigValidation()

  // These hooks are needed for both error screen and normal app
  useCustomCss()
  useOutsideClick()

  // Wait for validation to complete
  if (isValidating) {
    return null
  }

  // If config is invalid, show error screen
  if (!isConfigValid) {
    return (
      <AppContainer>
        <PageBar minimal={true} />
        <ConfigError error={configError} />
      </AppContainer>
    )
  }

  // If config is valid, render StorageProvider and the rest of the app
  return (
    <StorageProvider>
      <QueryProvider>
        <ShareProvider>
          <AppContent />
        </ShareProvider>
      </QueryProvider>
    </StorageProvider>
  )
}

function AppContent() {
  usePredefinedModels()

  return (
    <DragAndDropProvider>
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
    </DragAndDropProvider>
  )
}
