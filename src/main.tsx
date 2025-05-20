
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { handleModuleLoadingError } from './utils/errorBoundary';

// Initialize module error handler before anything else
handleModuleLoadingError();

// Find the root element
const rootElement = document.getElementById("root");

// Add error boundary to catch rendering errors
if (rootElement) {
  // Wrap in a try-catch to prevent unhandled exceptions during initialization
  try {
    const root = createRoot(rootElement);
    
    // Add event listener for unhandled errors
    window.addEventListener('error', (event) => {
      console.error('Unhandled error:', event.error || event.message);
    });

    // Add event listener for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
    });

    // Add performance monitoring for initial load
    window.addEventListener('load', () => {
      console.log('Application fully loaded');
      
      // Report any performance issues after load
      setTimeout(() => {
        const performance = window.performance;
        if (performance && performance.timing) {
          const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
          console.log(`Page load time: ${loadTime}ms`);
        }
      }, 0);
    });

    // Render the app
    root.render(<App />);
  } catch (error) {
    console.error("Error rendering application:", error);
    
    // Display a fallback UI when an error occurs during initial render
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h2>Something went wrong</h2>
        <p>The application couldn't be loaded. Please try refreshing the page.</p>
        <button onclick="localStorage.clear(); sessionStorage.clear(); location.reload(true);" style="padding: 8px 16px; margin-top: 16px;">
          Clear Cache & Refresh
        </button>
      </div>
    `;
  }
} else {
  console.error("Root element not found in the DOM.");
}
