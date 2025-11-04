# HOA Community App

A comprehensive React Native application for HOA (Homeowners Association) communities with real-time notifications, community management, and fee tracking features.

## 🚀 Quick Start

### Development Setup

1. **Install dependencies**
```bash
npm install
```

2. **Start Convex (applies schema and generates types)**
```bash
npx convex dev
```
This will print a Convex deployment URL. Copy it.

3. **Start Expo**
```bash
npm start
```

### Available Scripts

- `npm run web` - Run on web browser
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run convex:dev` - Start Convex development server

## 📱 Platform Support

- ✅ **iOS** - Full native support with push notifications
- ✅ **Android** - Full native support with push notifications  
- ✅ **Web** - Optimized web experience with platform-specific fixes

# HOA Community App

A comprehensive React Native mobile application for HOA (Homeowners Association) communities to manage communication and information sharing.

## ✨ Features

### 🏠 Home Screen
- Welcome dashboard with community information
- Quick access to office contact information
- Recent community posts preview
- Emergency contact button
- Real-time updates

### 👥 Board of Directors
- Complete board member profiles with photos
- Contact information (phone, email)
- Term end dates and positions
- Direct contact functionality
- Board meeting information
- Real-time updates

### 📋 Covenants & Rules
- Searchable covenants database
- Category-based filtering (Architecture, Landscaping, Parking, Pets, General)
- Detailed covenant descriptions
- Last updated timestamps
- PDF document links (when available)
- Advanced search functionality

### 💰 Fees & Fines Management
- Monthly HOA dues tracking with demo data
- Payment status monitoring (Pending, Paid, Overdue)
- Fine management system
- Due date tracking
- Summary cards with totals
- Board member fee management (Admin panel)
- Real-time fee updates via Convex

### 💬 Community Forum
- Create and share community posts
- Category-based posts (General, Event, Complaint, Suggestion, Lost & Found)
- Like and comment functionality
- Real-time community engagement
- Post filtering and search
- Rich text support


### 🔐 Authentication & Security
- **NEW**: Secure user authentication
- **NEW**: Role-based access control
- **NEW**: Board member indicators
- **NEW**: Admin panel for community management

## 🛠 Technology Stack

### Frontend
- **React Native** with Expo SDK 54
- **TypeScript** for type safety
- **React Navigation** for navigation
- **Expo Vector Icons** (Ionicons) for UI icons
- **React Native StyleSheet** for styling
- **Custom components** with platform-specific optimizations

### Backend & Services
- **Convex** - Real-time database and backend
- **Expo Notifications** - Cross-platform notifications
- **AsyncStorage** - Local data persistence

### Development Tools
- **Expo CLI** for development and building
- **Convex CLI** for backend management
- **ESLint** for code quality
- **TypeScript** for type checking

## 🗄 Database Schema (Convex)

The app uses Convex as the backend database with the following tables:

### Core Tables
- **communityPosts**: Community forum posts with categories and interactions
- **comments**: Post comments and replies with threading
- **residents**: Resident directory with contact information
- **boardMembers**: Board member profiles and positions
- **covenants**: Community rules and regulations

### Financial Tables
- **fees**: Monthly dues and assessments (demo data with board member management)
- **fines**: Violation tracking and penalties

### User Management
- **users**: User authentication and profile management
- **userSettings**: Individual notification and app preferences

### Real-time Features
- All tables support real-time updates
- Automatic conflict resolution
- Offline-first architecture with sync 

## 🔧 Setup Instructions

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **iOS Simulator** or **Android Emulator** (for testing)

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

## 🔑 Environment Variables

### Required (Auto-configured by Convex)
- `EXPO_PUBLIC_CONVEX_URL`: Your Convex deployment URL
- `CONVEX_DEPLOYMENT`: Your Convex deployment name

### Optional
- Additional environment variables can be configured as needed for future features

## 📁 Project Structure

```
hoa-community-app/
├── App.tsx                    # Main app component with navigation
├── src/
│   ├── screens/              # Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── BoardScreen.tsx
│   │   ├── CovenantsScreen.tsx
│   │   ├── FeesScreen.tsx
│   │   ├── CommunityScreen.tsx
│   │   ├── AdminScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   └── SignupScreen.tsx
│   ├── components/           # Reusable components
│   │   ├── CustomAlert.tsx
│   │   ├── MobileTabBar.tsx
│   │   ├── NotificationTest.tsx
│   │   ├── AuthHelper.tsx
│   │   ├── BoardMemberIndicator.tsx
│   │   └── DeveloperIndicator.tsx
│   ├── services/             # Business logic services
│   │   ├── EnhancedNotificationService.ts
│   │   ├── EnhancedUnifiedNotificationManager.ts
│   │   ├── EnhancedWebNotificationService.ts
│   │   ├── LatestNotificationService.ts
│   │   ├── LatestUnifiedNotificationManager.ts
│   │   └── LatestWebNotificationService.ts
│   ├── hooks/                # Custom React hooks
│   │   ├── useNotifications.ts
│   │   └── useCustomAlert.ts
│   ├── context/              # React Context providers
│   │   └── AuthContext.tsx
│   ├── utils/                # Utility functions
│   │   ├── animationUtils.ts
│   │   ├── webTouchUtils.ts
│   │   └── authUtils.ts
│   └── types/                # TypeScript type definitions
│       └── index.ts
├── convex/                   # Convex backend functions
│   ├── schema.ts             # Database schema
│   ├── boardMembers.ts       # Board member functions
│   ├── covenants.ts          # Covenant functions
│   ├── communityPosts.ts     # Community post functions
│   ├── fees.ts               # Fee management functions
│   ├── fines.ts              # Fine management functions
│   ├── residents.ts          # Resident management functions
│   ├── hoaInfo.ts            # HOA information functions
│   └── storage.ts            # File storage functions
└── assets/                   # Images and static assets
```

## 🚀 Key Features Implementation

### Real-time Updates
The app uses Convex's real-time capabilities to provide instant updates across all connected devices when:
- Community posts are created
- Board information is updated
- Fees and fines are modified
- User authentication events occur

### Cross-platform Compatibility
- **iOS**: Full native support with iOS 18+ features
- **Android**: Full native support with Android 15+ features
- **Web**: Optimized web experience with platform-specific fixes
- **Animations**: Platform-specific animation handling for optimal performance
- **Touch Events**: Web-compatible touch event handling

### Fee Management
- **Demo Data**: Realistic fee and fine data for demonstration
- **Board Member Control**: Admin panel for managing fees and fines
- **Real-time Updates**: Instant fee updates across all devices
- **Status Tracking**: Visual status indicators (Pending, Paid, Overdue)
- **Summary Cards**: Quick overview of financial totals

### Enhanced Notifications
- **Cross-platform**: iOS, Android, and Web notification support
- **Priority Levels**: High, Medium, Low priority notifications
- **Categories**: Organized by Security, Maintenance, Event, etc.
- **Real-time**: Instant notification delivery
- **Settings**: User-customizable notification preferences

### Security & Authentication
- **Secure Auth**: User authentication with role-based access
- **Board Members**: Special indicators and permissions
- **Admin Panel**: Community management interface
- **Data Protection**: Secure data handling and storage

## Customization

### Branding
- Update colors in the theme configuration
- Replace app icons and splash screen
- Modify the HOA name and contact information

### Content Management
- Modify fee and fine data in `src/screens/FeesScreen.tsx` (mock data)
- Update covenant categories and rules in Convex
- Customize board member information through Admin panel
- Manage community posts

### Features
- Add new screen components
- Extend the database schema
- Implement additional Convex functions

## 🚀 Deployment

### Expo Build
```bash
# Build for production
npx expo build:ios
npx expo build:android

# Or use EAS Build (recommended)
npx eas build --platform ios
npx eas build --platform android
```

### Convex Deployment
```bash
# Deploy to production
npx convex deploy --prod
```


### Environment Setup for Production
```bash
# Production environment variables
# Additional environment variables can be added as needed for future features
```

## 🛠 Recent Updates & Improvements

### Latest Features (v2.0)
- ✅ **Cross-platform Notifications** - iOS, Android, and Web support
- ✅ **Enhanced Authentication** - Role-based access control
- ✅ **Web Optimization** - Platform-specific fixes and improvements
- ✅ **Admin Panel** - Community management interface
- ✅ **Real-time Updates** - Instant synchronization across devices
- ✅ **Fee Management** - Board member fee and fine management

### Performance Improvements
- ✅ **Animation Optimization** - Platform-specific animation handling
- ✅ **Touch Event Fixes** - Web-compatible touch handling
- ✅ **Font Loading** - Optimized icon font loading
- ✅ **Error Handling** - Improved error management and logging

### Developer Experience
- ✅ **TypeScript** - Full type safety
- ✅ **ESLint** - Code quality enforcement
- ✅ **Development Scripts** - Easy setup and deployment
- ✅ **Documentation** - Comprehensive setup guides

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly on all platforms
5. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Test on iOS, Android, and Web
- Update documentation for new features
- Ensure accessibility compliance

## 📚 Documentation & Support

### Official Documentation
- [Convex Documentation](https://docs.convex.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [Stripe Documentation](https://stripe.com/docs)

### Community Resources
- [React Native Documentation](https://reactnative.dev/)
- [Expo Vector Icons](https://icons.expo.fyi/)

### Technical Support
For technical support or questions:
- Check the documentation links above
- Review existing issues in the repository
- Contact the development team

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔒 Privacy & Compliance

This app is designed for HOA communities and includes features for managing community affairs and resident communication. When implementing this solution:

- Ensure compliance with local privacy laws (GDPR, CCPA, etc.)
- Follow HOA regulations and bylaws
- Implement proper data protection measures
- Consider accessibility requirements (ADA compliance)
- Regular security audits recommended

---

**Built with ❤️ for HOA communities worldwide** 
