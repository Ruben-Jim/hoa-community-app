const fs = require('fs');
const path = require('path');

// Path to the generated index.html file
const indexPath = path.join(__dirname, '..', 'dist', 'index.html');

// Ionicons CDN injection script
const ioniconsScript = `
    <!-- Ionicons CDN for GitHub Pages deployment -->
    <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
    <script nomodule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"></script>
    <!-- Preload Ionicons for better performance -->
    <link rel="preload" href="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js" as="script">
    <link rel="preload" href="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js" as="script">
    <!-- Fallback script for Ionicons -->
    <script src="/hoa-community-app/ionicons-fallback.js"></script>`;

// Ionicons CSS fallback
const ioniconsCSS = `
    <!-- Ionicons CSS fallback for GitHub Pages -->
    <style>
      /* Fallback styles for Ionicons to ensure they display even if fonts fail to load */
      .ionicon, [class*="ion-"] {
        font-family: "Ionicons", "ionicons", sans-serif;
        font-style: normal;
        font-weight: normal;
        font-variant: normal;
        text-transform: none;
        line-height: 1;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
      /* Ensure Expo Vector Icons fallback works */
      [class*="expo-vector-icons"] {
        font-family: "Ionicons", "ionicons", sans-serif;
      }
    </style>`;

try {
  // Read the generated index.html file
  let html = fs.readFileSync(indexPath, 'utf8');
  
  // Inject CSS before the closing </head> tag
  html = html.replace('</head>', `${ioniconsCSS}\n  </head>`);
  
  // Inject scripts before the closing </body> tag
  html = html.replace('</body>', `    ${ioniconsScript}\n  </body>`);
  
  // Write the modified HTML back to the file
  fs.writeFileSync(indexPath, html);
  
  console.log('✅ Ionicons CDN successfully injected into index.html');
  console.log('✅ Ionicons will now work on GitHub Pages deployment');
  
} catch (error) {
  console.error('❌ Error injecting Ionicons:', error.message);
  process.exit(1);
}
