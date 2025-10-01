import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/store'
import './styles/aiuta.css'
import App from './App'

const rootElement = document.getElementById('aiuta-root')
const root = ReactDOM.createRoot(rootElement || document.body)

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)
