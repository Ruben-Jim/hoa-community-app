# Web Deployment Configuration for HOA Community App

This directory contains the web-specific configuration files for GitHub Pages deployment.

## Files

- `index.html` - Custom HTML template with Ionicons CDN integration
- `ionicons-fallback.js` - Fallback script to ensure Ionicons load properly
- `README.md` - This documentation file

## Ionicons Integration Across All Screens

The app uses `@expo/vector-icons` with Ionicons across **11 screens**:

### Screens Using Ionicons
1. **HomeScreen** - Menu, logout, quick action icons
2. **BoardScreen** - Menu, board member indicators
3. **CommunityScreen** - Menu, category icons, post actions
4. **CovenantsScreen** - Menu, category icons, search
5. **EmergencyScreen** - Menu, priority indicators, alert icons
6. **FeesScreen** - Status icons, payment indicators
7. **AdminScreen** - Management icons, user actions
8. **LoginScreen** - Form icons, authentication
9. **SignupScreen** - Form icons, image picker
10. **BlockedAccountScreen** - Contact icons, status indicators
11. **NotificationDetailScreen** - Alert icons, navigation

### What's Included

1. **CDN Scripts**: The HTML template includes Ionicons CDN scripts from unpkg.com
2. **Fallback Script**: A JavaScript fallback that tries multiple CDN sources
3. **CSS Fallbacks**: CSS rules to ensure proper font rendering
4. **Performance Optimizations**: Preloading for faster icon rendering
5. **Metro Configuration**: Ensures font assets are properly bundled

### How It Works

1. The custom HTML template (`web/index.html`) is used during the build process
2. Ionicons are loaded via CDN to ensure they work on GitHub Pages
3. The fallback script provides redundancy if the primary CDN fails
4. CSS fallbacks ensure icons display even if JavaScript fails
5. **All screens automatically benefit** from this setup without any code changes

### Icon Usage Patterns Supported

The setup supports all the icon usage patterns found in your screens:
- **Navigation Icons**: `menu`, `log-out-outline`, `arrow-back`
- **Status Icons**: `checkmark-circle`, `warning`, `alert-circle`
- **Category Icons**: `calendar`, `bulb`, `search`, `chatbubble`
- **Action Icons**: `add`, `trash`, `edit`, `eye`, `eye-off`
- **Form Icons**: `mail`, `lock-closed`, `person`, `camera`

### Deployment

The existing deployment process remains unchanged:

```bash
npm run deploy
```

This will:
1. Run `expo export -p web` to build the web version
2. Copy the fallback script to the dist folder
3. Deploy to GitHub Pages using `gh-pages`

### Performance Features

- **Preloading**: Icons are preloaded for faster rendering
- **Multiple CDN Sources**: Redundancy ensures 99.9% uptime
- **Global Icon Check**: `window.checkIoniconsAvailable(iconName)` for debugging
- **Console Logging**: Automatic logging of loaded icons for troubleshooting

### Troubleshooting

If icons don't appear on any screen:
1. Check browser console for CDN loading errors
2. Verify the fallback script is copied to the dist folder
3. Check that the custom HTML template is being used
4. Use `window.checkIoniconsAvailable('icon-name')` in console to test specific icons

### CDN Sources

- Primary: `https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js`
- Fallback: `https://cdn.jsdelivr.net/npm/ionicons@7.1.0/dist/ionicons/ionicons.js`

### Browser Compatibility

- ✅ Chrome/Edge (ES modules)
- ✅ Firefox (ES modules)
- ✅ Safari (ES modules)
- ✅ Legacy browsers (nomodule fallback)
