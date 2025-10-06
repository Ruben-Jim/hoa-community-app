// Ionicons font loading utility for React Navigation + Expo SDK 54
// This ensures Ionicons fonts are properly loaded for web deployment

(function() {
  console.log('🎨 Loading Ionicons fonts for React Navigation');
  
  // Function to load font from CDN
  function loadFont(url, fontFamily) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.onload = () => {
        console.log(`✅ Font loaded: ${fontFamily}`);
        resolve();
      };
      link.onerror = () => {
        console.warn(`❌ Failed to load font: ${fontFamily}`);
        reject();
      };
      document.head.appendChild(link);
    });
  }

  // Function to create font face for Ionicons
  function createIoniconsFontFace() {
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'Ionicons';
        src: url('https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.woff2') format('woff2'),
             url('https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.woff') format('woff'),
             url('https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
      
      /* Ensure all icon elements use Ionicons font */
      .expo-vector-icons,
      [class*="expo-vector-icons"],
      [data-testid*="icon"],
      [aria-label*="icon"] {
        font-family: 'Ionicons', 'ionicons', sans-serif !important;
        display: inline-block;
        font-style: normal;
        font-weight: normal;
        line-height: 1;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
    `;
    document.head.appendChild(style);
    console.log('✅ Ionicons font-face created');
  }

  // Load Ionicons fonts
  async function loadIoniconsFonts() {
    try {
      // Create font face first
      createIoniconsFontFace();
      
      // Load CSS from CDN
      await loadFont('https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.css', 'Ionicons CSS');
      
      console.log('🎉 All Ionicons fonts loaded successfully');
      
      // Dispatch custom event to notify that fonts are ready
      window.dispatchEvent(new CustomEvent('ioniconsLoaded'));
      
    } catch (error) {
      console.error('❌ Failed to load Ionicons fonts:', error);
      
      // Try fallback CDN
      try {
        await loadFont('https://cdn.jsdelivr.net/npm/ionicons@7.1.0/dist/ionicons/ionicons.css', 'Ionicons CSS (Fallback)');
        console.log('✅ Ionicons fonts loaded from fallback CDN');
        window.dispatchEvent(new CustomEvent('ioniconsLoaded'));
      } catch (fallbackError) {
        console.error('❌ All font loading attempts failed:', fallbackError);
      }
    }
  }

  // Start loading fonts
  loadIoniconsFonts();
})();
