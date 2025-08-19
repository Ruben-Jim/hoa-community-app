# HOA Community App

Development setup:

1. Install dependencies
```
npm install
```

2. Start Convex (applies schema and generates types)
```
npx convex dev
```
This will print a Convex deployment URL. Copy it.

3. Export the Convex URL for Expo
```
export EXPO_PUBLIC_CONVEX_URL="https://your-team-...convex.cloud"
```

4. Start Expo
```
npm start
```

Notes
- Schema is defined in `convex/schema.ts`. Keep `npx convex dev` running during development.
- Server functions are in `convex/*.ts`.
- Client uses `convex/react` hooks with `api` from `convex/_generated/api`.

# HOA Community App

A comprehensive React Native mobile application for HOA (Homeowners Association) communities to manage communication, information sharing, and emergency notifications.

## Features

### 🏠 Home Screen
- Welcome dashboard with community information
- Quick access to office contact information
- Active emergency alerts display
- Recent community posts preview
- Emergency contact button

### 👥 Board of Directors
- Complete board member profiles
- Contact information (phone, email)
- Term end dates
- Direct contact functionality
- Board meeting information

### 📋 Covenants & Rules
- Searchable covenants database
- Category-based filtering (Architecture, Landscaping, Parking, Pets, General)
- Detailed covenant descriptions
- Last updated timestamps
- PDF document links (when available)

### 💰 Fees & Fines
- Monthly HOA dues tracking
- Payment status monitoring
- Fine management system
- Due date tracking
- Payment processing integration
- Summary cards with totals

### 💬 Community Forum
- Create and share community posts
- Category-based posts (General, Event, Complaint, Suggestion, Lost & Found)
- Like and comment functionality
- Real-time community engagement
- Post filtering and search

### 🚨 Emergency Notifications
- Real-time emergency alerts
- Priority-based notifications (High, Medium, Low)
- Category filtering (Security, Maintenance, Event, Lost Pet, Other)
- Create new emergency alerts
- Alert status management (Active/Inactive)
- Detailed notification views

## Technology Stack

- **Frontend**: React Native with Expo
- **Backend**: Convex (Real-time database)
- **Navigation**: React Navigation
- **UI Components**: Custom components with React Native
- **Icons**: Expo Vector Icons (Ionicons)
- **Styling**: React Native StyleSheet

## Database Schema (Convex)

The app uses Convex as the backend database with the following tables:

- **boardMembers**: Board member information and contact details
- **covenants**: HOA rules and regulations
- **fees**: Monthly dues and assessments
- **fines**: Violation tracking and penalties
- **communityPosts**: Community forum posts
- **comments**: Post comments and replies
- **emergencyNotifications**: Emergency alerts and notifications
- **hoaInfo**: General HOA information
- **residents**: Resident directory

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (for testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hoa-community-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Convex**
   ```bash
   npx convex dev --once
   ```
   This will create a new Convex project and configure the environment variables.

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on device/simulator**
   ```bash
   # For iOS
   npm run ios
   
   # For Android
   npm run android
   
   # For web
   npm run web
   ```

## Environment Variables

The following environment variables are automatically configured by Convex:

- `EXPO_PUBLIC_CONVEX_URL`: Your Convex deployment URL
- `CONVEX_DEPLOYMENT`: Your Convex deployment name

## Project Structure

```
hoa-community-app/
├── App.tsx                 # Main app component with navigation
├── src/
│   ├── screens/           # Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── BoardScreen.tsx
│   │   ├── CovenantsScreen.tsx
│   │   ├── FeesScreen.tsx
│   │   ├── CommunityScreen.tsx
│   │   ├── EmergencyScreen.tsx
│   │   └── NotificationDetailScreen.tsx
│   ├── components/        # Reusable components
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   └── data/             # Sample data
│       └── sampleData.ts
├── convex/               # Convex backend functions
│   ├── schema.ts         # Database schema
│   ├── boardMembers.ts   # Board member functions
│   ├── covenants.ts      # Covenant functions
│   ├── communityPosts.ts # Community post functions
│   └── emergencyNotifications.ts # Emergency notification functions
└── assets/               # Images and static assets
```

## Key Features Implementation

### Real-time Updates
The app uses Convex's real-time capabilities to provide instant updates across all connected devices when:
- New emergency alerts are posted
- Community posts are created
- Board information is updated
- Fees and fines are modified

### Offline Support
The app includes basic offline functionality with local state management for immediate UI updates.

### Push Notifications
Emergency notifications can be configured to send push notifications to all residents (requires additional setup).

## Customization

### Branding
- Update colors in the theme configuration
- Replace app icons and splash screen
- Modify the HOA name and contact information

### Content Management
- Update sample data in `src/data/sampleData.ts`
- Modify covenant categories and rules
- Customize board member information

### Features
- Add new screen components
- Extend the database schema
- Implement additional Convex functions

## Deployment

### Expo Build
```bash
# Build for production
expo build:ios
expo build:android
```

### Convex Deployment
```bash
# Deploy to production
npx convex deploy --prod
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For technical support or questions about the app:
- Check the Convex documentation: https://docs.convex.dev/
- Review Expo documentation: https://docs.expo.dev/
- Contact the development team

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Note**: This app is designed for HOA communities and includes features for managing community affairs, emergency notifications, and resident communication. Ensure compliance with local privacy laws and HOA regulations when implementing this solution. 