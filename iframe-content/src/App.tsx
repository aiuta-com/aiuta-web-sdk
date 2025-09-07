import React, { useEffect } from 'react'
import { Route, Routes, MemoryRouter } from 'react-router-dom'

// reudx
import { useAppDispatch } from '@lib/redux/store'

// actions
import { configSlice } from '@lib/redux/slices/configSlice'

// messaging
import { SecureMessenger, MESSAGE_ACTIONS } from '@shared/messaging'

// pages
import Qr from './pages/Qr'
import Home from './pages/Home'
import View from './pages/View'
import History from './pages/History'
import Generated from './pages/Generated'
import QRTokenPage from './pages/Qr/token'
import Previously from './pages/Previously'
import UploadImages from './pages/UploadImages'

// components
import { SdkHeader } from './components/shared'
import { SdkFooter } from './components/shared'
import { FullScreenImageModal } from './components/feature'
import { Spinner } from './components/feature/spinner/spinner'

declare const __IFRAME_VERSION__: string

function App() {
  const dispatch = useAppDispatch()

  const initialPath = window.location.hash.replace(/^#/, '') || '/'

  const handleGetStylesConfiguration = () => {
    SecureMessenger.sendToParent({ action: MESSAGE_ACTIONS.GET_AIUTA_STYLES_CONFIGURATION })
  }

  const loadCustomCSS = () => {
    const urlParams = new URLSearchParams(window.location.search)
    const cssUrl = urlParams.get('css')

    if (cssUrl) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = cssUrl
      link.onload = () => console.log('Custom CSS loaded from:', cssUrl)
      link.onerror = () => console.error('Failed to load custom CSS from:', cssUrl)
      document.head.appendChild(link)
    }
  }

  const handleSendIframeVersion = () => {
    SecureMessenger.sendToParent({
      action: MESSAGE_ACTIONS.IFRAME_LOADED,
      version: __IFRAME_VERSION__,
    })
  }

  useEffect(() => {
    handleSendIframeVersion()
    handleGetStylesConfiguration()

    loadCustomCSS()

    const handleMessage = (event: MessageEvent) => {
      console.log('Received message:', event.data)
      if (
        event.data &&
        event.data.action &&
        event.data.action === MESSAGE_ACTIONS.GET_AIUTA_STYLES_CONFIGURATION
      ) {
        console.log('Setting styles configuration:', event.data.data.stylesConfiguration)
        const stylesConfig = event.data.data.stylesConfiguration
        if (stylesConfig && stylesConfig.components && stylesConfig.pages) {
          dispatch(configSlice.actions.setStylesConfiguration(stylesConfig))
        } else {
          console.error('Invalid styles configuration structure:', stylesConfig)
        }
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <Spinner />
      <SdkHeader />
      <FullScreenImageModal />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/generated" element={<Generated />} />
        <Route path="/history" element={<History />} />
        <Route path="/previously" element={<Previously />} />
        <Route path="/qr" element={<Qr />} />
        <Route path="/uploadImages" element={<UploadImages />} />
        <Route path="/view" element={<View />} />
        <Route path="/qr/:token" element={<QRTokenPage />} />
      </Routes>
      <SdkFooter />
    </MemoryRouter>
  )
}

export default App
