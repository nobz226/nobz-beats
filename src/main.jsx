import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ConvexReactClient, ConvexProvider } from 'convex/react'

// Import the project's existing stylesheet to keep visual parity
import '../css/styles.css'

const convexUrl = import.meta.env.VITE_CONVEX_URL || process.env.REACT_APP_CONVEX_URL || ''
console.debug('[Convex] using URL:', convexUrl)
const convexClient = new ConvexReactClient(convexUrl)

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConvexProvider client={convexClient}>
      <App />
    </ConvexProvider>
  </React.StrictMode>
)
