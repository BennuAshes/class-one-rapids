# Phase 5: Deployment Preparation

## Objective
Prepare the application for production release including build configuration, platform-specific optimizations, store submissions, and launch readiness.

## Prerequisites
- [ ] All features implemented and tested
- [ ] Performance targets achieved
- [ ] Quality assurance complete
- [ ] Assets finalized

## Work Packages

### WP 5.1: Build Configuration

#### Task 5.1.1: Configure App Metadata
Update `app.json`:
```json
{
  "expo": {
    "name": "PetSoft Tycoon",
    "slug": "petsoft-tycoon",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "updates": {
      "enabled": true,
      "fallbackToCacheTimeout": 30000
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.petsofttycoon",
      "buildNumber": "1",
      "infoPlist": {
        "NSUserTrackingUsageDescription": "This allows us to improve your game experience."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.yourcompany.petsofttycoon",
      "versionCode": 1,
      "permissions": []
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```
**Validation:** Metadata correct for both platforms
**Time:** 30 minutes

#### Task 5.1.2: Set Up EAS Build
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Create eas.json
```

Create `eas.json`:
```json
{
  "cli": {
    "version": ">= 6.0.0"
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
        "simulator": false
      },
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "ios": {
        "buildNumber": "1.0.0"
      },
      "android": {
        "buildType": "app-bundle",
        "versionCode": 1
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "your-app-store-connect-id",
        "appleTeamId": "your-team-id"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```
**Validation:** EAS configured correctly
**Time:** 30 minutes

### WP 5.2: Platform-Specific Optimization

#### Task 5.2.1: iOS Optimization
```typescript
// iOS-specific optimizations
import { Platform } from 'react-native';

// Configure iOS-specific settings
if (Platform.OS === 'ios') {
  // Enable iOS haptics
  Haptics.NotificationFeedbackType.Success;
  
  // iOS-specific safe area handling
  import { useSafeAreaInsets } from 'react-native-safe-area-context';
  
  // iOS keyboard handling
  KeyboardAvoidingView.behavior = 'padding';
}

// Info.plist additions (via app.json)
{
  "ios": {
    "infoPlist": {
      "ITSAppUsesNonExemptEncryption": false,
      "NSFaceIDUsageDescription": "Secure your game progress",
      "UIBackgroundModes": ["fetch"]
    }
  }
}
```
**Validation:** iOS build runs correctly
**Time:** 30 minutes

#### Task 5.2.2: Android Optimization
```typescript
// Android-specific optimizations
if (Platform.OS === 'android') {
  // Android-specific performance settings
  import { enableScreens } from 'react-native-screens';
  enableScreens();
  
  // Enable Hermes
  // In app.json:
  {
    "android": {
      "jsEngine": "hermes"
    }
  }
  
  // Configure ProGuard for release builds
  // android/app/proguard-rules.pro
}

// Android permissions and features
{
  "android": {
    "permissions": [],
    "intentFilters": [
      {
        "action": "VIEW",
        "data": [{
          "scheme": "petsofttycoon"
        }],
        "category": ["BROWSABLE", "DEFAULT"]
      }
    ]
  }
}
```
**Validation:** Android build runs correctly
**Time:** 30 minutes

### WP 5.3: Performance Profiling

#### Task 5.3.1: Production Performance Testing
```typescript
// Add performance monitoring
import * as Analytics from 'expo-analytics';

// Track key metrics
export function trackPerformance() {
  const metrics = {
    fps: getFPS(),
    memoryUsage: getMemoryUsage(),
    jsHeapSize: performance.memory?.usedJSHeapSize,
    renderTime: measureRenderTime(),
  };
  
  Analytics.logEvent('performance_metrics', metrics);
  
  // Alert on performance issues
  if (metrics.fps < 50) {
    console.warn('Low FPS detected:', metrics.fps);
  }
}

// Profile critical paths
const ProfiledGameScreen = __DEV__ 
  ? () => (
      <Profiler id="GameScreen" onRender={onRenderCallback}>
        <GameScreen />
      </Profiler>
    )
  : GameScreen;
```
**Validation:** Performance meets targets in production build
**Time:** 45 minutes

#### Task 5.3.2: Memory Leak Detection
```typescript
// Check for memory leaks
export function detectMemoryLeaks() {
  const initialMemory = performance.memory?.usedJSHeapSize || 0;
  
  // Run game for extended period
  setTimeout(() => {
    const currentMemory = performance.memory?.usedJSHeapSize || 0;
    const memoryGrowth = currentMemory - initialMemory;
    
    if (memoryGrowth > 50 * 1024 * 1024) { // 50MB growth
      console.error('Potential memory leak detected');
      // Log details for debugging
    }
  }, 60000); // Check after 1 minute
}

// Clean up subscriptions and timers
useEffect(() => {
  const timers: NodeJS.Timeout[] = [];
  const subscriptions: (() => void)[] = [];
  
  // Track all subscriptions
  subscriptions.push(
    onEvent('GAME_EVENT', handler)
  );
  
  return () => {
    // Clean up everything
    timers.forEach(clearInterval);
    subscriptions.forEach(unsub => unsub());
  };
}, []);
```
**Validation:** No memory leaks detected
**Time:** 30 minutes

### WP 5.4: Asset Optimization

#### Task 5.4.1: Optimize Images and Audio
```bash
# Optimize images
npx expo-optimize

# Compress audio files
# Use online tools or ffmpeg to compress audio to appropriate bitrates
ffmpeg -i input.mp3 -b:a 96k output.mp3

# Create multiple resolutions for images
# icon.png: 1024x1024
# adaptive-icon.png: 512x512
# splash.png: 1284x2778 (iPhone 15 Pro Max)
```

Asset requirements:
```javascript
// assets/index.ts
export const images = {
  icon: require('./icon.png'),
  splash: require('./splash.png'),
  logo: require('./logo.png'),
  // Sprites
  developer: require('./sprites/developer.png'),
  manager: require('./sprites/manager.png'),
};

export const sounds = {
  click: require('./sounds/click.mp3'),
  cash: require('./sounds/cash.mp3'),
  achievement: require('./sounds/achievement.mp3'),
  bgMusic: require('./sounds/background.mp3'),
};
```
**Validation:** Assets optimized and loading correctly
**Time:** 45 minutes

### WP 5.5: Build Generation

#### Task 5.5.1: Create Development Builds
```bash
# Create development build for testing
eas build --platform ios --profile development
eas build --platform android --profile development

# Install on devices
eas build:run -p ios
eas build:run -p android
```
**Validation:** Development builds install and run
**Time:** 45 minutes

#### Task 5.5.2: Create Production Builds
```bash
# Production builds
eas build --platform ios --profile production
eas build --platform android --profile production

# Download artifacts
eas build:download --platform ios
eas build:download --platform android
```
**Validation:** Production builds created successfully
**Time:** 60 minutes

### WP 5.6: Store Submission Preparation

#### Task 5.6.1: Prepare App Store Assets
Create required assets:
- App icon (1024x1024)
- Screenshots (iPhone 6.7", 6.1", 5.5", iPad 12.9")
- App preview video (optional)
- App description (4000 characters max)
- Keywords (100 characters max)
- Privacy policy URL
- Support URL

App Store Connect metadata:
```
Name: PetSoft Tycoon
Subtitle: Build Your Pet Tech Empire
Category: Games > Simulation
Age Rating: 4+
Copyright: © 2025 Your Company

Description:
Start from a garage startup and build the ultimate pet software empire! 

In PetSoft Tycoon, you'll:
• Click to write code and ship features
• Hire developers, designers, and managers
• Unlock and manage 7 unique departments
• Discover powerful department synergies
• Prestige to earn permanent bonuses
• Compete for achievements and milestones

With addictive idle gameplay, strategic depth, and charming pet-themed content, PetSoft Tycoon is the perfect game for aspiring entrepreneurs and idle game enthusiasts alike!

Keywords: idle, clicker, tycoon, business, simulation, incremental, pet, software
```
**Validation:** All assets meet store requirements
**Time:** 60 minutes

#### Task 5.6.2: Prepare Play Store Assets
Create required assets:
- App icon (512x512)
- Feature graphic (1024x500)
- Screenshots (min 2, max 8)
- Short description (80 characters)
- Full description (4000 characters)
- Privacy policy URL

Play Console metadata:
```
Title: PetSoft Tycoon - Idle Game
Short Description: Build a pet software empire from garage to billions!
Category: Simulation
Content Rating: Everyone

Full Description:
🐾 Welcome to PetSoft Tycoon! 🐾

Transform your garage startup into a billion-dollar pet software empire in this addictive idle clicker game!

[Similar to App Store description...]

Features:
✓ Simple one-touch gameplay
✓ 7 departments to unlock and manage
✓ Hire workers and automate production
✓ Offline progress system
✓ Prestige for permanent bonuses
✓ 50+ achievements to unlock
✓ No forced ads
✓ Play offline
```
**Validation:** All assets meet Play Store requirements
**Time:** 45 minutes

### WP 5.7: Launch Preparation

#### Task 5.7.1: Submit to Stores
```bash
# Submit to App Store
eas submit -p ios

# Submit to Play Store
eas submit -p android
```

Post-submission checklist:
- [ ] App Store Connect review information provided
- [ ] Play Console questionnaires completed
- [ ] Privacy policy published and linked
- [ ] Support email configured
- [ ] App website live (optional)
**Validation:** Apps submitted successfully
**Time:** 30 minutes

#### Task 5.7.2: Prepare Launch Materials
Create launch assets:
- Press release
- Social media posts
- Email announcement
- Landing page updates
- Analytics tracking setup

Setup monitoring:
```typescript
// Analytics configuration
import * as Analytics from 'expo-analytics';
import * as Sentry from 'sentry-expo';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  enableInExpoDevelopment: false,
  debug: __DEV__,
});

// Track key events
Analytics.logEvent('game_started');
Analytics.logEvent('first_purchase');
Analytics.logEvent('prestige_activated');
```
**Validation:** Launch materials ready
**Time:** 30 minutes

## Deployment Checklist

### Build Configuration
- [ ] App metadata configured
- [ ] EAS build setup complete
- [ ] Environment variables configured
- [ ] Signing certificates ready

### Platform Optimization
- [ ] iOS specific features working
- [ ] Android specific features working
- [ ] Platform-specific bugs fixed
- [ ] Performance optimized per platform

### Assets
- [ ] All images optimized
- [ ] Audio files compressed
- [ ] App icon in all sizes
- [ ] Screenshots prepared

### Store Submission
- [ ] App Store assets uploaded
- [ ] Play Store assets uploaded
- [ ] Privacy policy published
- [ ] Store listings complete

### Launch Readiness
- [ ] Production builds tested
- [ ] Analytics configured
- [ ] Error tracking setup
- [ ] Launch materials prepared

## Success Metrics
- Builds complete without errors
- App size <50MB (iOS), <100MB (Android)
- Store submissions approved
- Launch tracking operational

## Post-Launch Plan
- Monitor crash reports
- Track user metrics
- Gather feedback
- Plan update roadmap
- Implement user-requested features

## Time Summary
**Total Estimated Time:** 7.5 hours
**Recommended Schedule:** Complete over 2-3 days to handle build times and store reviews