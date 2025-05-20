
// Fonction pour gérer les erreurs de chargement de module
export const handleModuleLoadingError = () => {
  window.addEventListener('error', (event) => {
    if (event.message.includes('module script failed') || 
        event.message.includes('importing module')) {
      console.error('Module loading error detected:', event);
      
      // Stockage de l'information d'erreur
      localStorage.setItem('module_load_error', JSON.stringify({
        message: event.message,
        timestamp: Date.now()
      }));
      
      // Vérifier si nous avons déjà essayé de recharger
      const hasRetried = sessionStorage.getItem('module_load_retried');
      
      if (!hasRetried) {
        sessionStorage.setItem('module_load_retried', 'true');
        console.log('Attempting to reload page to fix module loading error...');
        
        // Attendre un court instant pour que les logs s'affichent
        setTimeout(() => {
          // Effacer le cache Vite
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
          
          // Force le rechargement de la page
          window.location.reload();
        }, 300);
      }
    }
  });
};
