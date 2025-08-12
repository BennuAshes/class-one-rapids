# Phase 5: Deployment

## 🎯 Objectives
- Configure production builds
- Optimize for iOS/Android platforms
- Prepare for app store release
- Set up CI/CD pipeline

## 📋 Tasks

### 5.1 Build Configuration
Create `app.json` updates:
```json
{
  "expo": {
    "name": "PetSoft Tycoon",
    "slug": "petsoft-tycoon",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#2196F3"
    },
    "updates": {
      "fallbackToCacheTimeout": 0,
      "url": "https://u.expo.dev/[project-id]"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.petsofttycoon",
      "buildNumber": "1",
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#2196F3"
      },
      "package": "com.yourcompany.petsofttycoon",
      "versionCode": 1,
      "permissions": []
    }
  }
}
```

### 5.2 EAS Build Setup
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure EAS
eas build:configure
```

Create `eas.json`:
```json
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
      "ios": {
        "simulator": true
      },
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "ios": {
        "autoIncrement": true
      },
      "android": {
        "autoIncrement": true
      }
    }
  }
}
```

### 5.3 Platform Optimizations

#### iOS Optimization
Create `ios/PetSoftTycoon/Info.plist` additions:
```xml
<key>UIRequiresFullScreen</key>
<true/>
<key>UIStatusBarHidden</key>
<false/>
<key>UIViewControllerBasedStatusBarAppearance</key>
<false/>
```

#### Android Optimization
Update `android/app/build.gradle`:
```gradle
android {
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    
    packagingOptions {
        pickFirst '**/libjsc.so'
        pickFirst '**/libc++_shared.so'
    }
}
```

### 5.4 Build Commands
```bash
# Development build
eas build --platform all --profile development

# Preview build for testing
eas build --platform all --profile preview

# Production build
eas build --platform all --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

### 5.5 CI/CD Pipeline
Create `.github/workflows/build.yml`:
```yaml
name: Build and Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm test
      - run: npx tsc --noEmit
  
  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: npm ci
      - run: eas build --platform all --non-interactive
```

### 5.6 App Store Preparation

#### Assets Required
- App icon: 1024x1024px
- Screenshots: 
  - iPhone: 1290x2796px
  - iPad: 2048x2732px
  - Android: 1080x1920px
- Feature graphic: 1024x500px (Android)
- App preview video: 15-30 seconds

#### Metadata
```yaml
Title: PetSoft Tycoon
Subtitle: Build Your Software Empire
Description: |
  Start from a garage startup and build your way to a software empire!
  Manage seven departments, hire employees, and make strategic decisions
  to grow your company valuation.
  
  Features:
  • Seven unique departments to manage
  • Prestige system for endless progression
  • Offline progress
  • No ads, no pay-to-win
  • Optimized for all devices
  
Keywords: idle, tycoon, business, simulation, management
Category: Games / Simulation
Content Rating: Everyone
Price: Free
```

## 🧪 Validation
```bash
# Test production build locally
npx expo start --no-dev --minify

# Check bundle size
eas build:inspect --platform android --profile production

# Verify on real devices
# Use TestFlight for iOS
# Use Internal Testing for Android
```

## ⏱️ Time Estimate
- Build configuration: 1 hour
- EAS setup: 1 hour
- Platform optimization: 1 hour
- Store preparation: 1 hour
- Total: **4 hours**

## ✅ Success Criteria
- [ ] Builds complete without errors
- [ ] App size <50MB
- [ ] Passes store guidelines
- [ ] CI/CD pipeline working
- [ ] Published to stores