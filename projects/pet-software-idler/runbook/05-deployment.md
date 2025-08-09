# Phase 5: Deployment Preparation

## Objectives
- Optimize build configuration for production
- Configure platform-specific settings and assets
- Implement comprehensive testing pipeline
- Set up app store submission process
- Create deployment automation and monitoring

## Prerequisites
- Phase 4 Quality & Polish completed ✅
- Performance meets all target benchmarks ✅
- Save system tested and validated ✅

## Tasks Checklist

### 1. Production Build Configuration

- [ ] **Configure EAS Build**
  ```bash
  npm install -g eas-cli
  eas login
  eas build:configure
  ```

- [ ] **Create EAS Build Configuration**
  ```json
  // eas.json
  {
    "cli": {
      "version": ">= 5.9.0"
    },
    "build": {
      "development": {
        "developmentClient": true,
        "distribution": "internal",
        "ios": {
          "resourceClass": "m-medium"
        },
        "android": {
          "buildType": "developmentBuild"
        }
      },
      "preview": {
        "distribution": "internal",
        "ios": {
          "simulator": true,
          "resourceClass": "m-medium"
        },
        "android": {
          "buildType": "apk"
        }
      },
      "production": {
        "ios": {
          "resourceClass": "m-medium",
          "bundleIdentifier": "com.yourcompany.petsofttycoon"
        },
        "android": {
          "buildType": "app-bundle",
          "gradleCommand": ":app:bundleRelease"
        }
      }
    },
    "submit": {
      "production": {
        "ios": {
          "appleId": "your.apple.id@email.com",
          "ascAppId": "your_app_store_connect_app_id",
          "appleTeamId": "YOUR_TEAM_ID"
        },
        "android": {
          "serviceAccountKeyPath": "./service-account-key.json",
          "track": "internal"
        }
      }
    }
  }
  ```

- [ ] **Configure App Configuration**
  ```json
  // app.json
  {
    "expo": {
      "name": "PetSoft Tycoon",
      "slug": "petsoft-tycoon",
      "version": "1.0.0",
      "orientation": "portrait",
      "icon": "./assets/icon.png",
      "userInterfaceStyle": "light",
      "splash": {
        "image": "./assets/splash.png",
        "resizeMode": "contain",
        "backgroundColor": "#ffffff"
      },
      "assetBundlePatterns": [
        "**/*"
      ],
      "ios": {
        "supportsTablet": true,
        "bundleIdentifier": "com.yourcompany.petsofttycoon",
        "buildNumber": "1",
        "requireFullScreen": true,
        "infoPlist": {
          "NSMicrophoneUsageDescription": "This app does not use the microphone",
          "NSCameraUsageDescription": "This app does not use the camera"
        }
      },
      "android": {
        "adaptiveIcon": {
          "foregroundImage": "./assets/adaptive-icon.png",
          "backgroundColor": "#FFFFFF"
        },
        "package": "com.yourcompany.petsofttycoon",
        "versionCode": 1,
        "permissions": [
          "VIBRATE"
        ],
        "blockedPermissions": [
          "RECORD_AUDIO",
          "CAMERA"
        ]
      },
      "web": {
        "favicon": "./assets/favicon.png"
      },
      "plugins": [
        "expo-router",
        "expo-secure-store",
        [
          "expo-av",
          {
            "microphonePermission": false
          }
        ],
        [
          "expo-build-properties",
          {
            "android": {
              "enableProguardInReleaseBuilds": true,
              "enableShrinkResourcesInReleaseBuilds": true
            },
            "ios": {
              "flipper": false
            }
          }
        ]
      ],
      "extra": {
        "router": {
          "origin": false
        },
        "eas": {
          "projectId": "your-project-id"
        }
      }
    }
  }
  ```

### 2. Asset Optimization and Preparation

- [ ] **Create App Icons (All Required Sizes)**
  ```bash
  # Create icon assets directory
  mkdir -p assets/icons
  
  # iOS Icons (required sizes)
  # 20x20, 29x29, 40x40, 58x58, 60x60, 80x80, 87x87, 120x120, 180x180, 1024x1024
  
  # Android Icons
  # 48x48, 72x72, 96x96, 144x144, 192x192, 512x512
  ```

- [ ] **Create Splash Screen Assets**
  ```typescript
  // Create splash screen configuration
  // assets/splash.png (1242x2436 for iPhone X compatibility)
  // Ensure logo is centered in safe area
  ```

- [ ] **Optimize Audio Assets**
  ```bash
  # Convert audio files for optimal size and compatibility
  mkdir -p assets/audio
  
  # Optimize audio files
  # Use AAC format for iOS, MP3 for Android/Web
  # Keep file sizes under 100KB each
  # Sample rates: 22kHz or 44kHz
  ```

- [ ] **Create App Store Screenshots**
  ```typescript
  // Screenshot requirements:
  // iPhone: 6.7", 6.5", 5.5" screens
  // iPad: 12.9", 11" screens  
  // Android: Phone and tablet variants
  
  // Showcase key features:
  // 1. Main game screen with resources
  // 2. Department management
  // 3. Prestige system
  // 4. Achievement unlocks
  // 5. Settings/customization
  ```

### 3. Platform-Specific Optimizations

- [ ] **iOS Specific Configuration**
  ```typescript
  // ios/PetSoftTycoon/Info.plist additions
  <key>UIBackgroundModes</key>
  <array>
    <string>background-processing</string>
  </array>
  
  <key>NSAppTransportSecurity</key>
  <dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
  </dict>
  
  // Enable Hermes for iOS (performance boost)
  <key>expo.modules.ExpoModulesCore.ENABLE_EXPERIMENTAL_NEW_RENDERER</key>
  <string>true</string>
  ```

- [ ] **Android Specific Configuration**
  ```gradle
  // android/app/build.gradle optimizations
  android {
      compileSdkVersion 34
      
      defaultConfig {
          minSdkVersion 23
          targetSdkVersion 34
          versionCode 1
          versionName "1.0.0"
          
          // Enable multidex for larger APK support
          multiDexEnabled true
          
          // R8 optimization
          proguardFiles getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro"
      }
      
      buildTypes {
          release {
              minifyEnabled true
              shrinkResources true
              useProguard true
          }
      }
      
      // Enable Hermes
      project.ext.react = [
          enableHermes: true,
          hermesFlagsRelease: ["-O", "-output-source-map"]
      ]
  }
  
  // Proguard rules for Legend State
  -keep class com.legendapp.** { *; }
  -keep class * extends com.facebook.react.bridge.ReactContextBaseJavaModule { *; }
  ```

### 4. Performance Testing and Validation

- [ ] **Create Performance Test Suite**
  ```typescript
  // __tests__/performance.test.ts
  import { gameState$ } from '../src/features/game-core/state/gameState$';
  import { GameEngine } from '../src/features/game-core/services/gameEngine';
  import { PerformanceAdapter } from '../src/features/game-core/services/performanceAdapter';
  
  describe('Performance Tests', () => {
    beforeEach(() => {
      // Reset game state
      gameState$.set({
        resources: { code: 0, features: 0, money: 0, leads: 0 },
        performance: { fps: 60, frameDrops: 0, memoryUsage: 0 }
      });
    });
    
    it('maintains 60 FPS with maximum employees', async () => {
      // Simulate maximum game state
      const maxEmployees = 100;
      
      // Run game loop for 5 seconds
      const startTime = Date.now();
      GameEngine.start();
      
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const endTime = Date.now();
      const avgPerformance = PerformanceAdapter.getAveragePerformance();
      
      GameEngine.stop();
      
      expect(avgPerformance.fps).toBeGreaterThanOrEqual(55); // 5 FPS tolerance
      expect(avgPerformance.stability).toBeGreaterThan(0.8);
    });
    
    it('handles save/load operations under load', async () => {
      // Stress test save system
      const SaveManager = (await import('../src/features/game-core/services/saveManager')).SaveManager;
      
      // Perform multiple save/load cycles
      for (let i = 0; i < 10; i++) {
        const saveSuccess = await SaveManager.performAutoSave();
        expect(saveSuccess).toBe(true);
        
        const loadSuccess = await SaveManager.loadGame();
        expect(loadSuccess).toBe(true);
      }
    });
  });
  ```

- [ ] **Device Testing Matrix**
  ```bash
  # Test on minimum supported devices
  # iOS: iPhone 8 (iOS 13.4+)
  # Android: Samsung Galaxy A21 (Android 6.0+)
  
  # Performance benchmarks per device category:
  # High-end: 60 FPS sustained, <40MB memory
  # Mid-range: 60 FPS sustained, <45MB memory  
  # Low-end: 45+ FPS sustained, <50MB memory
  ```

### 5. Quality Assurance Pipeline

- [ ] **Create E2E Test Suite**
  ```typescript
  // e2e/game-flow.test.ts
  import { expect } from 'detox';
  
  describe('Game Flow', () => {
    beforeEach(async () => {
      await device.reloadReactNative();
    });
    
    it('should complete basic game progression', async () => {
      // Test main game flow
      await expect(element(by.id('click-button'))).toBeVisible();
      
      // Perform clicks to earn resources
      for (let i = 0; i < 10; i++) {
        await element(by.id('click-button')).tap();
      }
      
      // Verify resource increase
      await expect(element(by.id('code-counter'))).toHaveText('10');
      
      // Test department unlock
      await element(by.id('departments-tab')).tap();
      await expect(element(by.id('development-department'))).toBeVisible();
      
      // Test employee hiring
      await element(by.id('hire-junior-dev')).tap();
      await expect(element(by.id('junior-dev-count'))).toHaveText('1');
    });
    
    it('should handle prestige flow', async () => {
      // Set up game state for prestige
      // ... test prestige functionality
    });
    
    it('should maintain state across app lifecycle', async () => {
      // Test save/load functionality
      await element(by.id('click-button')).tap();
      await device.sendToHome();
      await device.launchApp();
      
      // Verify state persisted
      await expect(element(by.id('code-counter'))).not.toHaveText('0');
    });
  });
  ```

- [ ] **Create Automated Testing Scripts**
  ```json
  // package.json testing scripts
  {
    "scripts": {
      "test": "jest",
      "test:watch": "jest --watch",
      "test:coverage": "jest --coverage",
      "test:e2e": "detox test",
      "test:performance": "jest __tests__/performance.test.ts",
      "test:integration": "jest __tests__/integration/",
      "lint": "eslint src/ --ext .ts,.tsx",
      "lint:fix": "eslint src/ --ext .ts,.tsx --fix",
      "type-check": "tsc --noEmit"
    }
  }
  ```

### 6. App Store Preparation

- [ ] **Create App Store Listing Content**
  ```markdown
  # App Title
  PetSoft Tycoon - Build Your Software Empire
  
  # Subtitle (iOS)
  Idle tycoon game for aspiring developers
  
  # Short Description (Android)
  Build the ultimate software company in this addictive idle tycoon game!
  
  # Full Description
  Start from a single developer writing code and build your software empire! 
  
  🚀 KEY FEATURES:
  • Hire developers, designers, QA testers, and more
  • Unlock 7 different departments with unique abilities
  • Prestige system with permanent bonuses
  • Offline progress - earn money while away
  • 50+ achievements to unlock
  • Beautiful animations and satisfying sound effects
  
  💻 DEPARTMENTS:
  • Development - Write code and build features
  • Sales - Convert leads into revenue
  • Customer Experience - Keep users happy
  • Product - Define what to build next  
  • Design - Make your software beautiful
  • QA - Ensure quality and prevent bugs
  • Marketing - Generate leads and awareness
  
  ⭐ PRESTIGE SYSTEM:
  • Restart with powerful bonuses
  • Unlock investor points for permanent upgrades
  • Strategic depth in timing your next round
  
  Perfect for fans of idle games, tycoon games, and anyone interested in the software industry!
  
  # Keywords (iOS)
  idle, tycoon, software, developer, coding, business, management, incremental
  
  # Category
  Games > Simulation
  
  # Content Rating
  Everyone / PEGI 3+ / 4+ (no objectionable content)
  ```

- [ ] **Create Privacy Policy**
  ```markdown
  # Privacy Policy for PetSoft Tycoon
  
  ## Data Collection
  PetSoft Tycoon is designed with privacy in mind:
  
  • No personal information is collected
  • No network connections are made
  • All game data is stored locally on your device
  • No analytics or tracking
  • No advertisements
  • No in-app purchases requiring personal data
  
  ## Local Storage
  The game stores:
  • Game progress and achievements
  • Settings and preferences
  • Performance optimization data
  
  This data never leaves your device and can be deleted by uninstalling the app.
  
  ## Contact
  For questions about this privacy policy: privacy@yourcompany.com
  ```

### 7. Build and Release Process

- [ ] **Create Release Build Script**
  ```bash
  #!/bin/bash
  # build-release.sh
  
  echo "🚀 Starting PetSoft Tycoon release build process..."
  
  # Clean previous builds
  echo "🧹 Cleaning previous builds..."
  rm -rf dist/
  npx expo export:embed --clear
  
  # Run tests
  echo "🧪 Running test suite..."
  npm run test:coverage
  npm run lint
  npm run type-check
  
  # Build for production
  echo "📱 Building iOS..."
  eas build --platform ios --profile production --non-interactive
  
  echo "🤖 Building Android..."  
  eas build --platform android --profile production --non-interactive
  
  echo "✅ Release builds complete!"
  echo "Check EAS dashboard for download links"
  ```

- [ ] **Create Submission Checklist**
  ```markdown
  ## Pre-Submission Checklist
  
  ### Technical Requirements
  - [ ] App builds successfully for both platforms
  - [ ] Performance meets minimum requirements (45+ FPS)
  - [ ] Memory usage under limits (<50MB active)
  - [ ] No crashes during 30-minute stress test
  - [ ] Save/load system tested with app kills
  - [ ] Audio works correctly on all platforms
  - [ ] Offline progression calculates correctly
  
  ### Content Requirements  
  - [ ] All achievements are attainable
  - [ ] Prestige system provides meaningful progression
  - [ ] Department unlocks work at correct thresholds
  - [ ] No placeholder text or assets
  - [ ] Numbers format correctly (1K, 1M, 1B notation)
  
  ### Store Requirements
  - [ ] App icons created for all required sizes
  - [ ] Screenshots captured for all device sizes
  - [ ] App description written and proofread
  - [ ] Privacy policy published and linked
  - [ ] Metadata includes relevant keywords
  - [ ] Content rating appropriate for all regions
  
  ### Platform Specific
  
  #### iOS
  - [ ] Bundle identifier matches App Store Connect
  - [ ] Version number incremented
  - [ ] Build number incremented
  - [ ] App Store Connect metadata complete
  - [ ] TestFlight testing completed
  
  #### Android  
  - [ ] Package name unique and consistent
  - [ ] Version code incremented
  - [ ] Play Console metadata complete
  - [ ] Internal testing track validated
  - [ ] Required permissions justified
  ```

### 8. Monitoring and Analytics Setup

- [ ] **Create Performance Monitoring**
  ```typescript
  // src/services/monitoring.ts
  export class ProductionMonitoring {
    private static crashes: any[] = [];
    private static performanceIssues: any[] = [];
    
    static initialize() {
      // Set up global error handlers
      if (__DEV__) return;
      
      // Capture unhandled promise rejections
      const originalHandler = require('react-native/Libraries/Core/ExceptionsManager').default.exceptionHandler;
      require('react-native/Libraries/Core/ExceptionsManager').default.exceptionHandler = (error: any, isFatal: boolean) => {
        this.logCrash(error, isFatal);
        originalHandler(error, isFatal);
      };
      
      // Monitor performance issues
      setInterval(() => {
        this.checkPerformanceHealth();
      }, 30000); // Check every 30 seconds
    }
    
    private static logCrash(error: any, isFatal: boolean) {
      const crashReport = {
        timestamp: Date.now(),
        error: error.message,
        stack: error.stack,
        isFatal,
        gameState: this.getAnonymizedGameState(),
      };
      
      this.crashes.push(crashReport);
      
      // In production, you would send this to your crash reporting service
      if (this.crashes.length > 50) {
        this.crashes.shift(); // Keep only recent crashes
      }
    }
    
    private static checkPerformanceHealth() {
      const fps = gameState$.performance.fps.get();
      const memoryUsage = gameState$.performance.memoryUsage.get();
      
      if (fps < 30 || memoryUsage > 80) {
        this.performanceIssues.push({
          timestamp: Date.now(),
          fps,
          memoryUsage,
          gameState: this.getAnonymizedGameState(),
        });
        
        if (this.performanceIssues.length > 100) {
          this.performanceIssues.shift();
        }
      }
    }
    
    private static getAnonymizedGameState() {
      return {
        totalResources: Object.values(gameState$.resources.get()).reduce((sum, val) => sum + val, 0),
        prestigeCount: gameState$.meta.prestigeCount.get(),
        playTime: Date.now() - gameState$.meta.startTime.get(),
      };
    }
    
    // Export functions for future analytics integration
    static getCrashReports() {
      return [...this.crashes];
    }
    
    static getPerformanceIssues() {
      return [...this.performanceIssues];
    }
  }
  ```

## Validation Criteria

### Must Pass ✅
- [ ] Production builds complete successfully for both platforms
- [ ] Performance tests pass on minimum supported devices
- [ ] E2E test suite passes all scenarios
- [ ] App store requirements met (icons, screenshots, descriptions)
- [ ] Privacy policy complies with platform requirements

### Should Pass ⚠️
- [ ] Automated testing pipeline runs without errors
- [ ] Bundle size under platform limits (iOS <100MB, Android <150MB)
- [ ] Battery usage testing shows <5% drain per hour
- [ ] Accessibility features work correctly

### Nice to Have 💡
- [ ] Analytics integration ready for future updates
- [ ] A/B testing framework prepared
- [ ] Crash reporting system functional
- [ ] Performance monitoring dashboard ready

## Testing Commands

```bash
# Full test suite
npm run test:coverage
npm run test:e2e
npm run test:performance

# Build testing
eas build --platform all --profile preview
eas submit --platform all --profile production

# Performance validation
# Test on actual devices with battery monitoring
# Memory profiling with development builds
```

## Troubleshooting

### Build Issues
- **Symptom**: Build fails on EAS
- **Solution**: Check eas.json configuration and dependencies
- **Command**: `eas build --platform ios --profile production --clear-cache`

### App Store Rejection
- **Symptom**: Rejection for performance or content issues  
- **Solution**: Review guidelines and test on minimum devices
- **Command**: Use TestFlight/Internal Testing for validation

### Performance Problems
- **Symptom**: Performance degradation in production
- **Solution**: Enable performance monitoring and profiling
- **Command**: Use Flipper or React DevTools for debugging

## Deliverables

### 1. Production-Ready Builds
- ✅ iOS app bundle optimized for App Store
- ✅ Android app bundle optimized for Play Store
- ✅ All assets properly sized and optimized

### 2. Complete Store Listings
- ✅ App descriptions, screenshots, and metadata
- ✅ Privacy policy and content ratings
- ✅ All required app store assets

### 3. Quality Assurance
- ✅ Comprehensive test suite with high coverage
- ✅ Performance validation on target devices
- ✅ E2E testing of critical user flows

### 4. Deployment Infrastructure
- ✅ Automated build and release process
- ✅ Performance monitoring and crash reporting
- ✅ Update and maintenance procedures

## Launch Checklist

### Pre-Launch (Final 24 Hours)
- [ ] Final performance validation on real devices
- [ ] App store metadata final review
- [ ] Emergency rollback plan prepared
- [ ] Support channels ready (email, social media)

### Launch Day
- [ ] Submit to app stores (iOS first, then Android)
- [ ] Monitor download and crash metrics
- [ ] Respond to user reviews and feedback
- [ ] Prepare hotfix deployment if needed

### Post-Launch (First Week)
- [ ] Daily monitoring of key metrics
- [ ] User feedback analysis and prioritization
- [ ] Performance optimization based on real usage
- [ ] Plan first content update

**Estimated Duration**: 2-3 days
**Deployment Ready**: ✅/❌ (update after validation)

---

## Final Validation

This runbook provides a complete, step-by-step development process for implementing PetSoft Tycoon with:

- **React Native 0.76+** with New Architecture for performance
- **Expo SDK 52** for latest platform features  
- **Legend State @beta** for 40% state management performance improvement
- **Comprehensive department systems** with strategic depth
- **Robust prestige mechanics** for long-term engagement
- **Premium animations and audio** for satisfying game feel
- **Production-ready deployment** with quality assurance

Each phase builds systematically on the previous one, with clear validation criteria and troubleshooting guides for a senior engineer to execute successfully.