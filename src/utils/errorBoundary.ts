
// Improved module error handling with retries and more robust recovery

// Function to handle module loading errors
export const handleModuleLoadingError = () => {
  // Track retry attempts to prevent infinite loops
  const maxRetries = 2;
  
  window.addEventListener('error', (event) => {
    // Check if the error is related to module loading
    if (event.message.includes('module script failed') || 
        event.message.includes('importing module') ||
        event.message.includes('Loading chunk') ||
        event.message.includes('Failed to fetch dynamically imported module')) {
      
      console.error('Module loading error detected:', event);
      
      // Store error information
      localStorage.setItem('module_load_error', JSON.stringify({
        message: event.message,
        timestamp: Date.now(),
        url: event.filename || 'unknown'
      }));
      
      // Check current retry count
      const retryCount = parseInt(sessionStorage.getItem('module_load_retry_count') || '0');
      
      if (retryCount < maxRetries) {
        // Increment and save retry count
        sessionStorage.setItem('module_load_retry_count', String(retryCount + 1));
        console.log(`Attempting to reload page (attempt ${retryCount + 1} of ${maxRetries})...`);
        
        // Clear Vite cache
        try {
          console.log('Clearing Vite cache...');
          const keys = Object.keys(localStorage);
          keys.forEach(key => {
            if (key.startsWith('vite-') || key.includes('chunk') || key.includes('module')) {
              localStorage.removeItem(key);
              console.log(`Removed cached item: ${key}`);
            }
          });
        } catch (e) {
          console.error('Error clearing cache:', e);
        }
        
        // Force hard reload with cache bypass
        setTimeout(() => {
          window.location.href = window.location.href + (window.location.href.includes('?') ? '&' : '?') + 
            'cache_bust=' + Date.now();
        }, 500);
      } else {
        console.error(`Maximum retry attempts (${maxRetries}) reached. Showing error to user.`);
        
        // Display user-friendly error if we've tried enough times
        document.body.innerHTML = `
          <div style="padding: 2rem; max-width: 600px; margin: 4rem auto; text-align: center; font-family: system-ui, sans-serif;">
            <h2 style="color: #e11d48; margin-bottom: 1rem;">Unable to load application</h2>
            <p style="margin-bottom: 1.5rem;">We're experiencing technical difficulties loading some resources.</p>
            <p style="margin-bottom: 2rem;">Please try the following:</p>
            <ul style="text-align: left; margin-bottom: 2rem;">
              <li style="margin-bottom: 0.5rem;">Refresh your browser</li>
              <li style="margin-bottom: 0.5rem;">Clear your browser cache</li>
              <li style="margin-bottom: 0.5rem;">Try a different browser</li>
            </ul>
            <button 
              onclick="localStorage.clear(); sessionStorage.clear(); window.location.reload(true);" 
              style="background: #2563eb; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.375rem; cursor: pointer; font-weight: bold;">
              Clear Cache & Reload
            </button>
          </div>
        `;
      }
    }
  });
  
  // Also handle chunk loading errors
  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.message || String(event.reason);
    
    if (message.includes('Loading chunk') || 
        message.includes('Failed to fetch dynamically imported module') ||
        message.includes('Network Error')) {
      
      console.error('Chunk loading failure detected:', event.reason);
      
      // Store error information
      localStorage.setItem('chunk_load_error', JSON.stringify({
        message: message,
        timestamp: Date.now()
      }));
      
      // Apply same retry logic as for module errors
      const retryCount = parseInt(sessionStorage.getItem('module_load_retry_count') || '0');
      
      if (retryCount < maxRetries) {
        sessionStorage.setItem('module_load_retry_count', String(retryCount + 1));
        console.log(`Attempting to reload page after chunk failure (attempt ${retryCount + 1} of ${maxRetries})...`);
        
        // Clear cache and reload
        setTimeout(() => {
          // Clear Vite cache
          try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
              if (key.startsWith('vite-') || key.includes('chunk')) {
                localStorage.removeItem(key);
              }
            });
          } catch (e) {
            console.error('Error clearing cache:', e);
          }
          
          window.location.reload(true); // Force reload from server
        }, 500);
      }
    }
  });
};
