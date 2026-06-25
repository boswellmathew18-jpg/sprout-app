import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.jsx'

// Passive touch listeners let the browser scroll without waiting for JS handlers
window.addEventListener('touchstart', () => {}, { passive: true })
window.addEventListener('touchmove', () => {}, { passive: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
