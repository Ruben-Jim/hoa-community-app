const fs = require('fs');
const path = require('path');

// Copy Ionicons font to root of dist for GitHub Pages compatibility
const sourceFont = path.join(__dirname, '../dist/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.b4eb097d35f44ed943676fd56f6bdc51.ttf');
const destFont = path.join(__dirname, '../dist/Ionicons.ttf');

if (fs.existsSync(sourceFont)) {
  fs.copyFileSync(sourceFont, destFont);
  console.log('✅ Ionicons font copied to root');
} else {
  console.log('❌ Source font not found');
}

// Add font loading to HTML
const htmlPath = path.join(__dirname, '../dist/index.html');
if (fs.existsSync(htmlPath)) {
  let html = fs.readFileSync(htmlPath, 'utf8');
  
  const fontCSS = `
      /* Ionicons font face declaration */
      @font-face {
        font-family: 'Ionicons';
        src: url('./Ionicons.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
    </style>
    <!-- Preload Ionicons font for better performance -->
    <link rel="preload" href="./Ionicons.ttf" as="font" type="font/ttf" crossorigin="anonymous">`;
  
  html = html.replace('</style>', fontCSS);
  fs.writeFileSync(htmlPath, html);
  console.log('✅ HTML updated with font loading');
} else {
  console.log('❌ HTML file not found');
}