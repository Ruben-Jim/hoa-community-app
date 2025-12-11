# Production Build Checklist for App Store Submission

This checklist covers all requirements for building and submitting the Shelton Springs app to iOS App Store and Google Play Store.

## Environment Variables & Secrets

### Required EAS Secrets

Before building for production, you must set the following secrets in EAS:

- [ ] **EXPO_PUBLIC_CONVEX_URL** - Your Convex deployment URL
  ```bash
  eas secret:create --scope project --name EXPO_PUBLIC_CONVEX_URL --value <your-convex-url>
  ```

- [ ] **EXPO_PUBLIC_PAYPAL_CLIENT_ID** (if using PayPal payments)
  ```bash
  eas secret:create --scope project --name EXPO_PUBLIC_PAYPAL_CLIENT_ID --value <your-paypal-client-id>
  ```

- [ ] **EXPO_PUBLIC_PAYPAL_MODE** (if using PayPal payments)
  ```bash
  eas secret:create --scope project --name EXPO_PUBLIC_PAYPAL_MODE --value production
  ```

### Verify Secrets

```bash
eas secret:list
```

All secrets should be listed with scope "project" for production builds.

## iOS App Store Requirements

### App Store Connect Setup

- [ ] App Store Connect account created and configured
- [ ] App listing created in App Store Connect
- [ ] Bundle identifier matches: `com.rubenjim.sheltonsprings` (configured in `app.json`)
- [ ] App Store screenshots prepared (required sizes):
  - iPhone 6.7" (1290 x 2796 pixels)
  - iPhone 6.5" (1242 x 2688 pixels)
  - iPhone 5.5" (1242 x 2208 pixels)
- [ ] App description and metadata ready
- [ ] Privacy policy URL (if required)
- [ ] Support URL
- [ ] Marketing URL (optional)

### App Configuration

- [ ] App icons in PNG format (not JPG) - ✅ Already fixed
- [ ] Splash screen configured - ✅ Already configured
- [ ] Version number set correctly in `app.json` (currently: 1.0.0)
- [ ] Build number increments automatically (configured in `eas.json`)
- [ ] Privacy permissions configured in `app.json`:
  - [ ] Notifications (already configured)
  - [ ] Camera (if used for profile images)
  - [ ] Photo library (if used)

### Code Signing

- [ ] Apple Developer account active
- [ ] Signing certificates configured in EAS (automatic)
- [ ] Provisioning profiles configured in EAS (automatic)
- [ ] Team ID configured: `8J942JVU38` (already in `eas.json`)

### Testing

- [ ] TestFlight build uploaded and tested
- [ ] App tested on physical iOS device
- [ ] All features tested and working
- [ ] No crashes or critical bugs
- [ ] App passes `expo-doctor` checks - ✅ Already passing

### Submission

- [ ] App Store review guidelines reviewed
- [ ] App metadata complete
- [ ] Screenshots uploaded
- [ ] App submitted for review

## Android Play Store Requirements

### Google Play Console Setup

- [ ] Google Play Console account created
- [ ] App listing created in Play Console
- [ ] Package name matches: `com.rubenjim.sheltonsprings` (configured in `app.json`)
- [ ] Play Store screenshots prepared (required sizes):
  - Phone: 1080 x 1920 pixels (16:9)
  - Tablet: 1200 x 1920 pixels (4:3)
- [ ] App description and metadata ready
- [ ] Privacy policy URL (required for apps that collect user data)
- [ ] Support email address

### App Configuration

- [ ] App icons in PNG format (not JPG) - ✅ Already fixed
- [ ] Adaptive icon configured - ✅ Already configured
- [ ] Version name set correctly in `app.json` (currently: 1.0.0)
- [ ] Version code increments automatically (configured in `eas.json`)
- [ ] Permissions configured in `app.json`:
  - [ ] Notifications
  - [ ] Camera (if used)
  - [ ] Storage (if used)

### Code Signing

- [ ] Signing key configured in EAS (automatic on first build)
- [ ] Keystore backed up securely (EAS handles this)

### Testing

- [ ] Internal testing track build uploaded
- [ ] App tested on physical Android device
- [ ] All features tested and working
- [ ] No crashes or critical bugs
- [ ] App passes `expo-doctor` checks - ✅ Already passing

### Submission

- [ ] Play Store review guidelines reviewed
- [ ] App metadata complete
- [ ] Screenshots uploaded
- [ ] Content rating questionnaire completed
- [ ] App submitted for review

## Code Quality & Testing

### Pre-Build Checks

- [ ] All environment variables validated at startup - ✅ Implemented
- [ ] Error boundaries in place to prevent crashes - ✅ Implemented
- [ ] Notification permissions handled gracefully - ✅ Implemented
- [ ] Convex initialization handles missing URL gracefully - ✅ Implemented
- [ ] No console errors in production build
- [ ] App tested in release mode locally (if possible)

### Error Handling

- [ ] Error boundaries catch React errors - ✅ Implemented
- [ ] Network errors handled gracefully
- [ ] Missing data handled gracefully
- [ ] User-friendly error messages displayed

### Performance

- [ ] App loads quickly (< 3 seconds)
- [ ] Images optimized
- [ ] No memory leaks
- [ ] Smooth animations (60 FPS)

## Build Commands

### iOS Production Build

```bash
eas build --platform ios --profile production
```

### Android Production Build

```bash
eas build --platform android --profile production
```

### Submit to App Stores

```bash
# iOS
eas submit --platform ios --profile production

# Android
eas submit --platform android --profile production
```

## Post-Submission

### iOS App Store

- [ ] Monitor App Store Connect for review status
- [ ] Respond to any review feedback
- [ ] Monitor crash reports in App Store Connect
- [ ] Monitor user reviews and ratings

### Google Play Store

- [ ] Monitor Play Console for review status
- [ ] Respond to any review feedback
- [ ] Monitor crash reports in Play Console
- [ ] Monitor user reviews and ratings

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   - Error: App crashes on launch
   - Solution: Ensure all required EAS secrets are set

2. **Icon Format Issues**
   - Error: Expo doctor reports icon format errors
   - Solution: Use PNG format for all icons (already fixed)

3. **Code Signing Issues**
   - Error: Build fails with signing errors
   - Solution: Check Apple Developer account and team ID configuration

4. **TestFlight Build Issues**
   - Error: App crashes in TestFlight
   - Solution: Check environment variables, error boundaries, and logs

## Notes

- This checklist should be reviewed before each production build
- Mark items as complete as you complete them
- Keep this document updated as requirements change
- Refer to [Expo documentation](https://docs.expo.dev) for latest requirements

