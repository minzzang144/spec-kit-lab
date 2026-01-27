import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Performance monitoring in development
if (import.meta.env.DEV) {
  import('./shared/utils/performance-monitor')
    .then(({ performanceMonitor }) => {
      // Log metrics after 3 seconds to allow initial load
      setTimeout(() => {
        performanceMonitor.logMetrics()
        performanceMonitor.checkMemoryThreshold(70) // Alert at 70% memory usage
      }, 3000)
    })
    .catch(console.error)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
