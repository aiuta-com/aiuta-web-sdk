import React from 'react'
import { Route, Routes, MemoryRouter } from 'react-router-dom'
import { RpcProvider, LoggerProvider } from './contexts'
import {
  ModalRenderer,
  PageBar,
  PoweredBy,
  FullScreenGallery,
  ShareModal,
  Spinner,
  type ModalType,
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
  const { modalType, cssUrl, initialPath } = useUrlParams()
  const { rpcApp } = useRpcInitialization()

  const loggerComponent = modalType ? `aiuta:modal:${modalType}` : 'aiuta:iframe'

  return (
    <LoggerProvider component={loggerComponent}>
      <RpcProvider rpcApp={rpcApp}>
        <AppRouter modalType={modalType} cssUrl={cssUrl} initialPath={initialPath} />
      </RpcProvider>
    </LoggerProvider>
  )
}

function AppRouter({
  modalType,
  cssUrl,
  initialPath,
}: {
  modalType: ModalType | null
  cssUrl?: string
  initialPath?: string
}) {
  useCustomCSS(cssUrl)

  return modalType ? (
    <ModalRenderer modalType={modalType} />
  ) : (
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
  )
}
