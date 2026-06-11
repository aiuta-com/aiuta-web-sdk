import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.scss'

// Hold the first render until Poppins is in (same trick as the QA Tool), so
// text doesn't flash in the fallback font on slow networks. The timeout keeps
// the page usable if the fonts never arrive.
const fontWeights = ['400', '500', '600']
const fontsLoaded = Promise.all(fontWeights.map((w) => document.fonts.load(`${w} 1em Poppins`)))
const fontsTimeout = new Promise((resolve) => setTimeout(resolve, 5000))

const rootElement = document.getElementById('root')
const root = ReactDOM.createRoot(rootElement || document.body)

void Promise.race([fontsLoaded, fontsTimeout]).then(() => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
})
