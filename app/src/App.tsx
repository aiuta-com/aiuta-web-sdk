import React from 'react'
import { Route, Routes, MemoryRouter } from 'react-router-dom'
import { LoggerProvider } from './contexts'
import { useUrlParams } from '@/hooks'
import { MainApp, QrUpload } from '@/routing'

export default function App() {
  const { initialPath } = useUrlParams()
  const loggerComponent = 'aiuta:app'

  return (
    <LoggerProvider component={loggerComponent}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/qr/:token" element={<QrUpload />} />
          <Route path="*" element={<MainApp />} />
        </Routes>
      </MemoryRouter>
    </LoggerProvider>
  )
}
