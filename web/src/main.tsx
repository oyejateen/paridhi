import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'
import { PermissionsProvider } from './context/PermissionsContext'
import { ExplorationProvider } from './context/ExplorationContext'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('/sw.js')
    } catch {
      // ignore service worker registration failures in development
    }
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <PermissionsProvider>
        <ExplorationProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ExplorationProvider>
      </PermissionsProvider>
    </AuthProvider>
  </StrictMode>,
)
