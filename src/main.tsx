
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Find the root element
const rootElement = document.getElementById("root");

// Add error boundary to catch rendering errors
if (rootElement) {
  try {
    const root = createRoot(rootElement);
    
    // Add event listener for unhandled errors with improved handling
    window.addEventListener('error', (event) => {
      console.error('Caught unhandled error:', event.error);
      // Prevent the error from breaking the entire app
      event.preventDefault();
    });

    // Add event listener for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Caught unhandled promise rejection:', event.reason);
      // Prevent the rejection from breaking the entire app
      event.preventDefault();
    });

    // Performance monitoring for debugging
    window.addEventListener('load', () => {
      console.log('Application fully loaded');
    });

    // Initialize performance mark for tracking app load time
    performance.mark('app-init-start');
    
    // Render the app with error handling
    root.render(<App />);
    
    // Capture render completion time
    setTimeout(() => {
      performance.mark('app-init-end');
      performance.measure('app-initialization', 'app-init-start', 'app-init-end');
      const measures = performance.getEntriesByName('app-initialization');
      if (measures.length > 0) {
        console.log(`App initialization time: ${measures[0].duration.toFixed(2)}ms`);
      }
    }, 0);
    
  } catch (error) {
    console.error("Error rendering application:", error);
    
    // Display a user-friendly fallback UI
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: system-ui, -apple-system, sans-serif;">
        <h2>Something went wrong</h2>
        <p>We're having trouble loading the application. Please try refreshing the page.</p>
        <button onclick="location.reload()" 
          style="padding: 8px 16px; margin-top: 16px; background-color: #3b82f6; color: white; 
          border: none; border-radius: 4px; cursor: pointer;">
          Refresh Page
        </button>
      </div>
    `;
  }
} else {
  console.error("Root element not found in the DOM.");
}
