import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

// Import the project's existing stylesheet to keep visual parity
import '../css/styles.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
