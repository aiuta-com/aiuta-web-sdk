import React, { useEffect, useState } from 'react'
import { Route, Routes, MemoryRouter } from 'react-router-dom'

// redux
import { useAppDispatch, store } from '@lib/redux/store'

// contexts
import { RpcProvider } from './contexts'

// actions
import { configSlice } from '@lib/redux/slices/configSlice'

// selectors
import { isMobileSelector } from '@lib/redux/slices/configSlice/selectors'

// messaging
import { SecureMessenger, MESSAGE_ACTIONS } from '@shared/messaging'

// RPC
import { AiutaRpcApp } from '@shared/rpc'
import type { AppHandlers } from '@shared/rpc'

// pages
import PhotoUploadPage from './pages/PhotoUploadPage'
import Home from './pages/Home'
import TryOnPage from './pages/TryOnPage'
import GenerationsHistoryPage from './pages/GenerationsHistoryPage'
import ResultsPage from './pages/ResultsPage'
import UploadsHistoryPage from './pages/UploadsHistoryPage'
import UploadImages from './pages/UploadImages'

// components
import { SdkHeader } from './components/shared'
import { SdkFooter } from './components/shared'
import { FullScreenImageModal } from './components/feature'
import { ShareModal } from './components/feature'
import { Spinner } from './components/feature/spinner/spinner'

declare const __IFRAME_VERSION__: string

function App() {
  const dispatch = useAppDispatch()
  const [rpcApp, setRpcApp] = useState<AiutaRpcApp | null>(null)

  const initialPath = window.location.hash.replace(/^#/, '') || '/'

  // Check if this is a modal-only iframe and what type
  const urlParams = new URLSearchParams(window.location.search)
  const isModalOnly = urlParams.get('modal') === 'true'
  const modalType = urlParams.get('modalType') || 'fullscreen'

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

    // Initialize RPC App
    const initializeRpc = async () => {
      try {
        const handlers: AppHandlers = {
          tryOn: async (productId: string) => {
            try {
              // Update endpoint data with the product ID
              const currentState = store.getState()
              const currentEndpointData = currentState.config.aiutaEndpointData

              const updatedEndpointData = {
                ...currentEndpointData,
                skuId: productId,
              }

              dispatch(configSlice.actions.setAiutaEndpointData(updatedEndpointData))
              return // Explicitly return to complete the Promise
            } catch (error) {
              console.error('[RPC APP] Error in tryOn handler:', error)
              throw error // Re-throw so RPC can handle the error
            }
          },

          updateWindowSizes: async (sizes: { width: number; height: number }) => {
            try {
              // Get current isMobile state from store (not from closure)
              const state = store.getState()
              const currentIsMobile = isMobileSelector(state)

              // Update mobile state based on window width
              if (sizes.width <= 992 && !currentIsMobile) {
                dispatch(configSlice.actions.setIsMobile(true))
              } else if (sizes.width > 992 && currentIsMobile) {
                dispatch(configSlice.actions.setIsMobile(false))
              }
            } catch (error) {
              console.error('[RPC APP] Error handling updateWindowSizes:', error)
              throw error
            }
          },
        }

        const rpcAppInstance = new AiutaRpcApp({
          context: { appVersion: __IFRAME_VERSION__ },
          handlers,
        })

        await rpcAppInstance.connect()
        setRpcApp(rpcAppInstance)

        // Initialize auth data once RPC is connected
        try {
          const auth = rpcAppInstance.config.auth

          let endpointData: any = {
            status: 200,
            skuId: '', // Will be set by SDK via tryOn
          }

          if ('apiKey' in auth) {
            // API Key auth
            endpointData.apiKey = auth.apiKey
          } else if ('subscriptionId' in auth) {
            // JWT auth
            endpointData.userId = auth.subscriptionId
          }

          dispatch(configSlice.actions.setAiutaEndpointData(endpointData))
        } catch (error) {
          console.error('Failed to initialize auth data:', error)
        }
      } catch (error) {
        console.log('[RPC APP] Failed to initialize RPC', error)
      }
    }

    initializeRpc()

    const handleMessage = (event: MessageEvent) => {
      // Legacy postMessage handler for non-RPC functionality
      if (
        event.data &&
        event.data.action &&
        event.data.action === MESSAGE_ACTIONS.OPEN_AIUTA_FULL_SCREEN_MODAL
      ) {
        // Handle fullscreen modal data from postMessage
        console.log('Received fullscreen modal data:', event.data.data)
        // The FullScreenImageModal component will handle this via its own message listener
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  // Add modal-only class to root element and body for transparent background
  useEffect(() => {
    if (isModalOnly) {
      const rootElement = document.getElementById('__next')
      const bodyElement = document.body

      if (rootElement) {
        rootElement.classList.add('modal-only')
      }
      if (bodyElement) {
        bodyElement.classList.add('modal-only')
      }

      return () => {
        if (rootElement) {
          rootElement.classList.remove('modal-only')
        }
        if (bodyElement) {
          bodyElement.classList.remove('modal-only')
        }
      }
    }
  }, [isModalOnly])

  // Render appropriate modal based on type
  const renderModal = () => {
    switch (modalType) {
      case 'share':
        return <ShareModal />
      case 'fullscreen':
      default:
        return <FullScreenImageModal />
    }
  }

  // If this is a modal-only iframe, only show the appropriate modal
  if (isModalOnly) {
    return renderModal()
  }

  return (
    <RpcProvider rpcApp={rpcApp}>
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
          <Route path="/uploadImages" element={<UploadImages />} />
          <Route path="/view" element={<TryOnPage />} />
          <Route path="/qr/:token" element={<PhotoUploadPage />} />
        </Routes>
        <SdkFooter />
      </MemoryRouter>
    </RpcProvider>
  )
}

export default App
