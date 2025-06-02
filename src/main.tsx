
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n';

const rootElement = document.getElementById("root");

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    
    window.addEventListener('error', (event) => {
      console.error('Unhandled error:', event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
    });

    window.addEventListener('load', () => {
      console.log('Application fully loaded');
      
      setTimeout(() => {
        const performance = window.performance;
        if (performance && performance.timing) {
          const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
          console.log(`Page load time: ${loadTime}ms`);
        }
      }, 0);
    });

    root.render(
      <React.StrictMode>
        <React.Suspense fallback="Loading...">
          <App />
        </React.Suspense>
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Error rendering application:", error);
    
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h2>Something went wrong</h2>
        <p>The application couldn't be loaded. Please try refreshing the page.</p>
        <button onclick="location.reload()" style="padding: 8px 16px; margin-top: 16px;">
          Refresh Page
        </button>
      </div>
    `;
  }
} else {
  console.error("Root element not found in the DOM.");
}
