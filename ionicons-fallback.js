// Ionicons fallback script for GitHub Pages deployment
// This ensures Ionicons are available even if the CDN fails

(function() {
  // Check if Ionicons are already loaded
  if (typeof window !== 'undefined' && window.Ionicons) {
    return;
  }

  // Function to ensure Expo Vector Icons work with Ionicons
  function ensureExpoVectorIconsWork() {
    // Wait for React to be ready
    const checkReact = setInterval(() => {
      if (window.React && window.React.createElement) {
        clearInterval(checkReact);
        
        // Ensure Ionicons are available globally
        if (window.Ionicons) {
          console.log('Ionicons CDN loaded successfully for all screens');
          
          // Add a global check for icon availability
          window.checkIoniconsAvailable = function(iconName) {
            return window.Ionicons && window.Ionicons.getIcon(iconName);
          };
          
          // Log available icons for debugging
          console.log('Available Ionicons:', Object.keys(window.Ionicons.icons || {}));
        }
      }
    }, 100);
    
    // Clear interval after 5 seconds
    setTimeout(() => clearInterval(checkReact), 5000);
  }

  // Fallback: Load Ionicons from alternative CDN if primary fails
  function loadIoniconsFallback() {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/ionicons@7.1.0/dist/ionicons/ionicons.js';
    script.async = true;
    script.onload = function() {
      console.log('Ionicons loaded from fallback CDN');
      ensureExpoVectorIconsWork();
    };
    script.onerror = function() {
      console.warn('Failed to load Ionicons from fallback CDN');
    };
    document.head.appendChild(script);
  }

  // Try to load from primary CDN first
  const primaryScript = document.createElement('script');
  primaryScript.src = 'https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js';
  primaryScript.async = true;
  primaryScript.onload = function() {
    console.log('Ionicons loaded from primary CDN');
    ensureExpoVectorIconsWork();
  };
  primaryScript.onerror = function() {
    console.warn('Primary Ionicons CDN failed, trying fallback');
    loadIoniconsFallback();
  };
  
  document.head.appendChild(primaryScript);
})();
