
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import App from './App.tsx'
import './index.css'

// Add animation keyframes to tailwind CSS
if (!document.getElementById('dot-animation-keyframes')) {
  const style = document.createElement('style')
  style.id = 'dot-animation-keyframes'
  style.textContent = `
    @keyframes bounce {
      0%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-10px); }
    }
  `
  document.head.appendChild(style)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Analytics />
  </React.StrictMode>,
)
