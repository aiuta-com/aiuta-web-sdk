import React from 'react'
import { RpcProvider, LoggerProvider } from './contexts'
import { ModalRenderer, AppRouter, type ModalType } from '@/components'
import { useUrlParams, useCustomCSS, useRpcInitialization } from '@/hooks'

export default function App() {
  const { modalType, cssUrl, initialPath } = useUrlParams()
  const { rpcApp } = useRpcInitialization()

  const loggerComponent = modalType ? `aiuta:modal:${modalType}` : 'aiuta:iframe'

  return (
    <LoggerProvider component={loggerComponent}>
      <RpcProvider rpcApp={rpcApp}>
        <AppSwitch modalType={modalType} cssUrl={cssUrl} initialPath={initialPath} />
      </RpcProvider>
    </LoggerProvider>
  )
}

function AppSwitch({
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
    <AppRouter initialPath={initialPath || '/'} />
  )
}
