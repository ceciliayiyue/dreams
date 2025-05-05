import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './lib/auth'
import { DreamStorageProvider } from './lib/dreamStorage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DreamStorageProvider>
          <App />
        </DreamStorageProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
