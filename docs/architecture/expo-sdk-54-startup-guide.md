# Expo SDK 54 Startup Guide

*Complete guide for setting up and configuring Expo SDK 54 projects*

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- iOS Simulator (Mac only) or Android Emulator
- Expo Go app on physical device (optional)

### Create New Project

```bash
# Create new Expo app with SDK 54
npx create-expo-app my-app --template blank-typescript@sdk-54

# Navigate to project
cd my-app

# Start development server
npm start
```

### Project Templates

| Template | Command | Description |
|----------|---------|-------------|
| Blank TypeScript | `--template blank-typescript@sdk-54` | Minimal TypeScript setup |
| Blank JavaScript | `--template blank@sdk-54` | Minimal JavaScript setup |
| Navigation | `--template tabs@sdk-54` | Tab navigation pre-configured |
| Blank (Bare) | `--template blank-typescript@sdk-54 --workflow bare` | With native directories |

## 📋 Essential Commands

### Development Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `npm start` | Start Metro bundler | Development server |
| `npm run ios` | Run on iOS simulator | Requires Mac with Xcode |
| `npm run android` | Run on Android emulator | Requires Android Studio |
| `npm run web` | Run in browser | Web development |
| `npx expo start --clear` | Start with cache cleared | Fix caching issues |
| `npx expo start --tunnel` | Use tunnel connection | For network issues |

### Build & Deploy Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `npx expo prebuild` | Generate native projects | Before native changes |
| `npx expo prebuild --clean` | Clean prebuild | Remove and regenerate |
| `eas build` | Build with EAS | Production builds |
| `eas submit` | Submit to stores | App store submission |
| `npx expo export` | Export for web | Static web build |

### Utility Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `npx expo install [package]` | Install Expo-compatible version | Safe package installation |
| `npx expo doctor` | Check project health | Diagnose issues |
| `npx expo upgrade` | Upgrade SDK version | Update Expo SDK |
| `npx expo customize` | Customize config files | Modify app.json/metro |

## 🛠️ Project Configuration

## 📦 Essential Dependencies

### Core Navigation
```bash
npx expo install @react-navigation/native @react-navigation/stack
npx expo install react-native-screens react-native-safe-area-context
npx expo install @react-navigation/bottom-tabs @react-navigation/drawer
```

### UI Components & Styling
```bash
npx expo install react-native-reanimated
npx expo install react-native-gesture-handler
npx expo install react-native-svg
npx expo install expo-linear-gradient
npx expo install lottie-react-native
```

### Device Features
```bash
npx expo install expo-camera
npx expo install expo-location
npx expo install expo-notifications
npx expo install expo-media-library
npx expo install expo-file-system
npx expo install expo-sensors
```

### Storage & Data
See /docs/

### Development Tools
```bash
npm install --save-dev @types/react @types/react-native
npm install --save-dev prettier eslint
npm install --save-dev @typescript-eslint/eslint-plugin
npm install --save-dev @typescript-eslint/parser
```

## 🏗️ Project Structure

```
my-app/
├── App.tsx                 # Root component
├── app.json               # Expo configuration
├── metro.config.js        # Metro bundler config
├── tsconfig.json          # TypeScript config
├── package.json           # Dependencies
├── eas.json              # EAS Build config
│
├── assets/               # Static assets
│   ├── icon.png
│   ├── splash.png
│   └── adaptive-icon.png
│
├── src/                  # Source code
│   ├── components/       # Reusable components
│   │   ├── common/
│   │   └── ui/
│   │
│   ├── screens/         # Screen components
│   │   ├── Home.tsx
│   │   └── Profile.tsx
│   │
│   ├── navigation/      # Navigation setup
│   │   └── AppNavigator.tsx
│   │
│   ├── services/        # API & external services
│   │   ├── api.ts
│   │   └── auth.ts
│   │
│   ├── utils/           # Utility functions
│   │   ├── constants.ts
│   │   └── helpers.ts
│   │
│   ├── hooks/           # Custom hooks
│   │   └── useAuth.ts
│   │
│   └── types/           # TypeScript types
│       └── index.ts
│
└── __tests__/           # Test files
    └── App.test.tsx
```

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Metro bundler cache issues | Run `npx expo start --clear` |
| iOS Simulator not opening | Check Xcode installation, run `xcode-select --install` |
| Android build failures | Update Android Studio, check SDK versions |
| Module resolution errors | Clear watchman: `watchman watch-del-all` |
| Dependency conflicts | Use `npx expo install` instead of `npm install` |
| iOS build missing Info.plist keys | Add required keys in app.json `ios.infoPlist` |
| Android permissions not working | Add to app.json `android.permissions` array |
| Web build failing | Check `web.bundler` is set to "metro" in app.json |

## 🔒 Security Best Practices

### Environment Variables
```typescript
// app.config.js (instead of app.json for dynamic config)
export default {
  expo: {
    name: "My App",
    slug: "my-app",
    extra: {
      apiUrl: process.env.API_URL,
      apiKey: process.env.API_KEY,
    }
  }
};

// Access in app
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl;
```

### Secure Storage
```typescript
import * as SecureStore from 'expo-secure-store';

// Store sensitive data
await SecureStore.setItemAsync('auth_token', token);

// Retrieve sensitive data
const token = await SecureStore.getItemAsync('auth_token');

// Delete sensitive data
await SecureStore.deleteItemAsync('auth_token');
```

## 📱 Platform-Specific Code

### Using Platform-Specific Files
```
components/
├── Button.tsx          # Shared logic
├── Button.ios.tsx      # iOS specific
├── Button.android.tsx  # Android specific
└── Button.web.tsx      # Web specific
```

### Conditional Platform Code
```typescript
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    ...Platform.select({
      ios: { backgroundColor: 'white' },
      android: { backgroundColor: '#f5f5f5' },
      web: { backgroundColor: '#fafafa' }
    })
  }
});

// Platform-specific logic
if (Platform.OS === 'ios') {
  // iOS specific code
} else if (Platform.OS === 'android') {
  // Android specific code
} else if (Platform.OS === 'web') {
  // Web specific code
}
```

## 🎯 Production Checklist

### Before Building
- [ ] Update app version and build numbers
- [ ] Set proper bundle identifiers
- [ ] Configure app icons and splash screens
- [ ] Add all required permissions
- [ ] Set up proper error tracking
- [ ] Configure push notifications certificates
- [ ] Test on physical devices
- [ ] Optimize images and assets
- [ ] Remove console.log statements
- [ ] Enable ProGuard (Android) / Bitcode (iOS)

### EAS Build Configuration
```json
// eas.json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true,
      "ios": {
        "buildConfiguration": "Release"
      },
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

*Expo SDK 54 Startup Guide - Focus on Setup & Configuration*