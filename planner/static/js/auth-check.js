(async () => {
  async function checkAuth() {
    if (!window.supabaseClient) return;

    const { data: { session } } = await window.supabaseClient.auth.getSession();
    
    if (!session) {
      return;
    }

    // Initialize storage if logged in
    if (window.opusStorage) {
      try {
        await window.opusStorage.initializeStorage();
        window.dispatchEvent(new CustomEvent('opusStorageInitialized'));
        // Trigger initial render if initialize function exists
        const moduleName = document.body.dataset.module;
        if (moduleName && window[moduleName] && window[moduleName].initialize) {
          window[moduleName].initialize();
        }
      } catch (err) {
        console.error('Failed to initialize storage:', err);
      }
    }
  }

  // Run check
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAuth);
  } else {
    checkAuth();
  }
})();
