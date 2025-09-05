import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';

import './index.css'

// Adds a viewport meta tag for mobile optimization if not already present
function addMobileViewportMeta() {
  if (!document.querySelector('meta[name="viewport"]')) {
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
    document.head.appendChild(meta);
  }
}

// Set CSS variable for viewport height
function setViewportHeight() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

window.addEventListener('resize', setViewportHeight);
window.addEventListener('load', setViewportHeight);
setViewportHeight();

// Mobile Frame Component - optimized for mobile devices
const MobileFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    addMobileViewportMeta();
    
    // Prevent mobile browser behaviors
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    
    const preventDoubleTapZoom = (e: TouchEvent) => {
      let t2 = e.timeStamp;
      let t1Str = (e.currentTarget && 'dataset' in e.currentTarget) ? (e.currentTarget as HTMLElement).dataset?.lastTouch : undefined;
      let t1 = t1Str !== undefined ? Number(t1Str) : t2;
      let dt = t2 - t1;
      let fingers = e.touches.length;
      if (e.currentTarget && 'dataset' in e.currentTarget) {
        (e.currentTarget as HTMLElement).dataset.lastTouch = t2.toString();
      }
      
      if (!dt || dt > 500 || fingers > 1) return;
      e.preventDefault();
      if (e.target && 'click' in e.target) {
        (e.target as HTMLElement).click();
      }
    };
    
    document.addEventListener('touchstart', preventZoom, { passive: false });
    document.addEventListener('touchstart', preventDoubleTapZoom, { passive: false });
    
    // Prevent pull-to-refresh
    document.body.style.overscrollBehavior = 'none';
    
    return () => {
      document.removeEventListener('touchstart', preventZoom);
      document.removeEventListener('touchstart', preventDoubleTapZoom);
    };
  }, []);
  
  return (
    <>
      {/* Development frame for desktop */}
      <div style={{
        display: window.innerWidth > 500 ? 'flex' : 'none',
        background: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        margin: 0,
        padding: 0,
        position: 'relative'
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
      
      {/* Direct mobile view */}
      <div style={{
        display: window.innerWidth <= 500 ? 'block' : 'none',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
        background: '#000'
      }}>
        {children}
      </div>
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <MobileFrame>
        <App />
      </MobileFrame>
    </QueryClientProvider>
  </React.StrictMode>,
)