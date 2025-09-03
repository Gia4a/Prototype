import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';

import './index.css'

// Viewport Frame Component
const ViewportFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    background: '#1a1a1a',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    margin: 0,
    padding: 0,
    //position: 'relative' // Ensure relative for label positioning
  }}>
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      background: 'rgba(0, 0, 0, 0.8)',
      padding: '10px 15px',
      borderRadius: '8px',
      fontSize: '12px',
      color: '#888',
      zIndex: 1000
    }}>
      430 × 932 Development Frame
    </div>
    <div style={{
      width: '430px',
      height: '932px',
      background: '#000',
      borderRadius: '40px',
      padding: '8px',
      boxShadow: '0 0 30px rgba(0, 0, 0, 0.5)',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
    }}>
      <div style={{
        width: '100%',
        height: '932px',
        borderRadius: '32px',
        overflow: 'hidden',
        position: 'relative',
        background: '#242424',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start'
      }}>
        {/* Notch */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '150px',
          height: '30px',
          background: '#000',
          borderRadius: '0 0 20px 20px',
          zIndex: 100
        }} />
        {/* App Content Area */}
        <div style={{
          width: '100%',
          height: '100%',
          paddingTop: '35px',
          overflow: 'hidden',
          color: 'rgba(255, 255, 255, 0.87)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start'
        }}>
          {children}
        </div>
      </div>
    </div>
  </div>
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ViewportFrame>
        <App />
      </ViewportFrame>
    </QueryClientProvider>
  </React.StrictMode>,
)