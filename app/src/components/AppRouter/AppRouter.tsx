import React from 'react'
import { Route, Routes, MemoryRouter } from 'react-router-dom'

import PhotoUploadPage from '@/pages/PhotoUploadPage'
import Home from '@/pages/Home'
import TryOnPage from '@/pages/TryOnPage'
import GenerationsHistoryPage from '@/pages/GenerationsHistoryPage'
import ResultsPage from '@/pages/ResultsPage'
import UploadsHistoryPage from '@/pages/UploadsHistoryPage'

import { SdkHeader, SdkFooter, FullScreenImageModal, ShareModal, Spinner } from '@/components'

interface AppRouterProps {
  initialPath: string
}

/**
 * Main application router with all routes and shared components
 */
export const AppRouter = ({ initialPath }: AppRouterProps) => {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      {/* Global components */}
      <Spinner />
      <FullScreenImageModal />
      <ShareModal />

      {/* App layout */}
      <SdkHeader />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/qr" element={<PhotoUploadPage />} />
          <Route path="/qr/:token" element={<PhotoUploadPage />} />
          <Route path="/view" element={<TryOnPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/uploads-history" element={<UploadsHistoryPage />} />
          <Route path="/generations-history" element={<GenerationsHistoryPage />} />
        </Routes>
      </main>
      <SdkFooter />
    </MemoryRouter>
  )
}
