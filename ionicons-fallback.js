// Ionicons fallback script for GitHub Pages deployment
// This ensures Ionicons are available even if the CDN fails

(function() {
  console.log('🚀 Ionicons fallback script loaded');
  
  // Function to ensure Expo Vector Icons work with Ionicons
  function ensureExpoVectorIconsWork() {
    console.log('🔧 Setting up Expo Vector Icons compatibility');
    
    // Wait for React to be ready
    const checkReact = setInterval(() => {
      if (window.React && window.React.createElement) {
        clearInterval(checkReact);
        console.log('✅ React detected, setting up Ionicons');
        
        // Ensure Ionicons are available globally
        if (window.Ionicons) {
          console.log('✅ Ionicons CDN loaded successfully for all screens');
          
          // Add a global check for icon availability
          window.checkIoniconsAvailable = function(iconName) {
            return window.Ionicons && window.Ionicons.getIcon(iconName);
          };
          
          // Log available icons for debugging
          console.log('📋 Available Ionicons:', Object.keys(window.Ionicons.icons || {}));
        } else {
          console.warn('⚠️ Ionicons not available, trying to load...');
        }
      }
    }, 100);
    
    // Clear interval after 10 seconds
    setTimeout(() => {
      clearInterval(checkReact);
      console.log('⏰ React check timeout');
    }, 10000);
  }

  // Function to load Ionicons from CDN
  function loadIoniconsFromCDN(url, name) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = function() {
        console.log(`✅ ${name} loaded successfully`);
        resolve();
      };
      script.onerror = function() {
        console.warn(`❌ Failed to load ${name}`);
        reject();
      };
      document.head.appendChild(script);
    });
  }

  // Try to load Ionicons from multiple sources
  async function loadIonicons() {
    try {
      // Try primary CDN first
      await loadIoniconsFromCDN('https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js', 'Primary CDN');
      ensureExpoVectorIconsWork();
    } catch (error) {
      try {
        // Try fallback CDN
        await loadIoniconsFromCDN('https://cdn.jsdelivr.net/npm/ionicons@7.1.0/dist/ionicons/ionicons.js', 'Fallback CDN');
        ensureExpoVectorIconsWork();
      } catch (fallbackError) {
        console.error('❌ All Ionicons CDN sources failed');
        console.error('Primary error:', error);
        console.error('Fallback error:', fallbackError);
      }
    }
  }

  // Start loading Ionicons
  loadIonicons();
})();
