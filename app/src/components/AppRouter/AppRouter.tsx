import React from 'react'
import { Route, Routes, MemoryRouter } from 'react-router-dom'

// Pages
import PhotoUploadPage from '@/pages/PhotoUploadPage'
import Home from '@/pages/Home'
import TryOnPage from '@/pages/TryOnPage'
import GenerationsHistoryPage from '@/pages/GenerationsHistoryPage'
import ResultsPage from '@/pages/ResultsPage'
import UploadsHistoryPage from '@/pages/UploadsHistoryPage'

// Components
import { SdkHeader, SdkFooter, FullScreenImageModal, ShareModal, Spinner } from '@/components'

interface AppRouterProps {
  initialPath: string
}

/**
 * Main application router with all routes and shared components
 */
export const AppRouter: React.FC<AppRouterProps> = ({ initialPath }) => {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <Spinner />
      <SdkHeader />
      <FullScreenImageModal />
      <ShareModal />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/generated" element={<ResultsPage />} />
        <Route path="/history" element={<GenerationsHistoryPage />} />
        <Route path="/previously" element={<UploadsHistoryPage />} />
        <Route path="/qr" element={<PhotoUploadPage />} />
        <Route path="/view" element={<TryOnPage />} />
        <Route path="/qr/:token" element={<PhotoUploadPage />} />
      </Routes>
      <SdkFooter />
    </MemoryRouter>
  )
}

export default AppRouter
