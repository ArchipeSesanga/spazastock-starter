import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from '@/components/ThemeProvider'
import { ChaosPanel } from '@/mocks/ChaosPanel'

// The fake API (MSW) must be listening before the app sends its first
// request, so start it first, then render.
async function startFakeApi() {
  const { worker } = await import('./mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass', quiet: true })
}

void startFakeApi().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ThemeProvider>
        <App />
        {/* Development only: switches to make the fake API misbehave. */}
        {import.meta.env.DEV && <ChaosPanel />}
      </ThemeProvider>
    </StrictMode>,
  )
})
