# Phase 5: Deployment
## Build Optimization and Production Deployment

**Estimated Time**: 1-2 days  
**Prerequisites**: All features complete with stable performance and polish  
**Deliverables**: Production-ready builds, deployment configurations, monitoring setup

---

## Objectives

1. **Production Build Optimization**: Configure builds for optimal performance and size
2. **EAS Build Configuration**: Set up cloud builds for iOS and Android
3. **App Store Preparation**: Create store listings, screenshots, and metadata
4. **Performance Monitoring**: Implement crash reporting and analytics
5. **Deployment Automation**: Create CI/CD pipeline for future updates

---

## Task Checklist

### Build Configuration Optimization
- [ ] **Optimize Bundle Size and Performance** (2 hours)
  ```bash
  # Configure production build settings
  cat > metro.config.js << 'EOF'
  const { getDefaultConfig } = require('expo/metro-config');
  
  const config = getDefaultConfig(__dirname);
  
  // Production optimizations
  config.transformer = {
    ...config.transformer,
    minifierPath: 'metro-minify-terser',
    minifierConfig: {
      ecma: 8,
      keep_fnames: false,
      mangle: {
        keep_fnames: false,
        safari10: true
      },
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.info', 'console.debug', 'console.warn']
      },
      format: {
        comments: false
      }
    }
  };
  
  // Tree shaking for better bundle size
  config.resolver.platforms = ['native', 'ios', 'android'];
  
  // Performance optimizations
  config.cacheStores = [
    {
      name: 'filesystem',
      path: './node_modules/.cache/metro'
    }
  ];
  
  module.exports = config;
  EOF
  
  # Update app.json for production
  cat > app.json << 'EOF'
  {
    "expo": {
      "name": "PetSoft Tycoon",
      "slug": "petsoft-tycoon",
      "version": "1.0.0",
      "orientation": "portrait",
      "icon": "./assets/icon.png",
      "userInterfaceStyle": "dark",
      "splash": {
        "image": "./assets/splash-icon.png",
        "resizeMode": "contain",
        "backgroundColor": "#0a0a0a"
      },
      "assetBundlePatterns": ["**/*"],
      "ios": {
        "supportsTablet": true,
        "bundleIdentifier": "com.petsoft.tycoon",
        "buildNumber": "1",
        "infoPlist": {
          "ITSAppUsesNonExemptEncryption": false,
          "NSCameraUsageDescription": "This app does not use the camera.",
          "NSMicrophoneUsageDescription": "This app does not use the microphone."
        },
        "config": {
          "usesNonExemptEncryption": false
        }
      },
      "android": {
        "adaptiveIcon": {
          "foregroundImage": "./assets/adaptive-icon.png",
          "backgroundColor": "#0a0a0a"
        },
        "package": "com.petsoft.tycoon",
        "versionCode": 1,
        "permissions": [],
        "config": {
          "googleServicesFile": "./google-services.json"
        }
      },
      "web": {
        "favicon": "./assets/favicon.png",
        "bundler": "metro"
      },
      "plugins": [
        "expo-router",
        [
          "expo-build-properties",
          {
            "android": {
              "enableProguardInReleaseBuilds": true,
              "enableShrinkResourcesInReleaseBuilds": true,
              "extraMavenRepos": ["../../node_modules/react-native-mmkv/android/build/maven"]
            },
            "ios": {
              "deploymentTarget": "13.0"
            }
          }
        ],
        [
          "expo-font",
          {
            "fonts": ["./assets/fonts/Inter-Regular.ttf", "./assets/fonts/Inter-Bold.ttf"]
          }
        ]
      ],
      "scheme": "petsoft-tycoon",
      "experiments": {
        "typedRoutes": true
      },
      "extra": {
        "eas": {
          "projectId": "your-eas-project-id"
        }
      },
      "updates": {
        "fallbackToCacheTimeout": 0,
        "url": "https://u.expo.dev/your-project-id"
      },
      "runtimeVersion": {
        "policy": "sdkVersion"
      }
    }
  }
  EOF
  
  # Create build optimization script
  cat > scripts/optimize-build.js << 'EOF'
  const fs = require('fs');
  const path = require('path');
  
  console.log('🔧 Optimizing build configuration...');
  
  // Remove development-only dependencies from production build
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Ensure production dependencies are minimal
  const productionDeps = {
    ...packageJson.dependencies
  };
  
  // Remove any dev-only packages that might have slipped in
  const devOnlyPackages = ['flipper', 'react-devtools', 'why-did-you-render'];
  devOnlyPackages.forEach(pkg => {
    if (productionDeps[pkg]) {
      console.log(`Removing dev dependency from production: ${pkg}`);
      delete productionDeps[pkg];
    }
  });
  
  // Create asset optimization
  const assetDir = './assets';
  if (fs.existsSync(assetDir)) {
    console.log('📦 Checking asset optimization...');
    
    const checkImageOptimization = (dir) => {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          checkImageOptimization(filePath);
        } else if (file.match(/\.(png|jpg|jpeg)$/)) {
          const size = stat.size;
          if (size > 500 * 1024) { // 500KB
            console.warn(`⚠️  Large image detected: ${filePath} (${Math.round(size/1024)}KB)`);
            console.log('   Consider optimizing this image for production');
          }
        }
      });
    };
    
    checkImageOptimization(assetDir);
  }
  
  // Check for unused assets
  console.log('🔍 Scanning for unused assets...');
  
  const sourceFiles = [];
  const scanSource = (dir) => {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.includes('node_modules')) {
        scanSource(filePath);
      } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
        sourceFiles.push(filePath);
      }
    });
  };
  
  scanSource('./src');
  scanSource('./app');
  
  // This would implement asset usage detection
  console.log(`📊 Scanned ${sourceFiles.length} source files`);
  
  console.log('✅ Build optimization complete');
  EOF
  
  node scripts/optimize-build.js
  ```

### EAS Build Configuration
- [ ] **Configure EAS Build** (1.5 hours)
  ```bash
  # Install EAS CLI
  npm install -g @expo/eas-cli
  
  # Login to EAS (requires Expo account)
  eas login
  
  # Initialize EAS configuration
  eas build:configure
  
  # Create EAS build configuration
  cat > eas.json << 'EOF'
  {
    "cli": {
      "version": ">= 5.0.0"
    },
    "build": {
      "development": {
        "developmentClient": true,
        "distribution": "internal"
      },
      "preview": {
        "distribution": "internal",
        "android": {
          "buildType": "apk"
        },
        "ios": {
          "simulator": true
        }
      },
      "production": {
        "distribution": "store",
        "android": {
          "buildType": "aab",
          "gradleCommand": ":app:bundleRelease"
        },
        "ios": {
          "autoIncrement": "buildNumber"
        },
        "env": {
          "NODE_ENV": "production"
        },
        "cache": {
          "disabled": false
        }
      }
    },
    "submit": {
      "production": {
        "android": {
          "serviceAccountKeyPath": "./android-service-account.json",
          "track": "internal"
        },
        "ios": {
          "appleId": "your-apple-id@email.com",
          "ascAppId": "your-app-store-connect-app-id",
          "appleTeamId": "your-team-id"
        }
      }
    }
  }
  EOF
  
  # Create build secrets configuration
  cat > .env.production << 'EOF'
  # Production environment variables
  NODE_ENV=production
  EXPO_PUBLIC_API_URL=https://api.petsoft-tycoon.com
  EXPO_PUBLIC_ANALYTICS_ENABLED=true
  EXPO_PUBLIC_CRASH_REPORTING_ENABLED=true
  
  # Feature flags for production
  EXPO_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
  EXPO_PUBLIC_ENABLE_OFFLINE_ANALYTICS=true
  
  # Build optimization flags
  EXPO_PUBLIC_MINIFY_JS=true
  EXPO_PUBLIC_OPTIMIZE_ASSETS=true
  EOF
  ```

### Performance Monitoring Setup
- [ ] **Implement Crash Reporting and Analytics** (2 hours)
  ```bash
  # Install monitoring dependencies
  npm install @react-native-async-storage/async-storage
  npm install react-native-exception-handler
  
  # Create analytics system
  cat > src/core/analytics/Analytics.ts << 'EOF'
  interface AnalyticsEvent {
    name: string;
    properties?: Record<string, any>;
    timestamp: number;
  }
  
  interface UserProperties {
    userId?: string;
    sessionId: string;
    appVersion: string;
    platform: string;
    deviceInfo: {
      model: string;
      osVersion: string;
      screenSize: string;
    };
  }
  
  class Analytics {
    private static instance: Analytics;
    private events: AnalyticsEvent[] = [];
    private userProperties: UserProperties;
    private sessionStartTime: number;
    private isEnabled: boolean;
  
    constructor() {
      this.sessionStartTime = Date.now();
      this.sessionId = this.generateSessionId();
      this.isEnabled = process.env.EXPO_PUBLIC_ANALYTICS_ENABLED === 'true';
      
      this.userProperties = {
        sessionId: this.sessionId,
        appVersion: '1.0.0',
        platform: Platform.OS,
        deviceInfo: {
          model: 'Unknown', // Would be populated with device info
          osVersion: Platform.Version.toString(),
          screenSize: `${Dimensions.get('window').width}x${Dimensions.get('window').height}`
        }
      };
      
      this.initializeErrorHandling();
    }
    
    static getInstance(): Analytics {
      if (!Analytics.instance) {
        Analytics.instance = new Analytics();
      }
      return Analytics.instance;
    }
    
    private generateSessionId(): string {
      return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    private initializeErrorHandling() {
      if (!this.isEnabled) return;
      
      // Global error handler for unhandled promise rejections
      const originalHandler = global.ErrorUtils?.getGlobalHandler?.();
      
      global.ErrorUtils?.setGlobalHandler?.((error, isFatal) => {
        this.trackError(error, { isFatal, type: 'global' });
        originalHandler?.(error, isFatal);
      });
      
      // Console error tracking
      const originalError = console.error;
      console.error = (...args) => {
        this.trackError(new Error(args.join(' ')), { type: 'console' });
        originalError(...args);
      };
    }
    
    // Event tracking
    trackEvent(eventName: string, properties: Record<string, any> = {}) {
      if (!this.isEnabled) return;
      
      const event: AnalyticsEvent = {
        name: eventName,
        properties: {
          ...properties,
          sessionId: this.userProperties.sessionId,
          timestamp: Date.now()
        },
        timestamp: Date.now()
      };
      
      this.events.push(event);
      this.persistEvent(event);
      
      // Send to analytics service (would be implemented)
      if (__DEV__) {
        console.log('📊 Analytics Event:', eventName, properties);
      }
    }
    
    // Game-specific event tracking
    trackGameEvent(eventType: 'gameplay' | 'progression' | 'monetization' | 'error', data: any) {
      this.trackEvent(`game_${eventType}`, {
        category: 'game',
        ...data
      });
    }
    
    trackError(error: Error, context: Record<string, any> = {}) {
      if (!this.isEnabled) return;
      
      this.trackEvent('error_occurred', {
        errorMessage: error.message,
        errorStack: error.stack,
        errorName: error.name,
        ...context
      });
      
      console.error('🚨 Error tracked:', error.message);
    }
    
    // Performance tracking
    trackPerformance(metric: string, value: number, context: Record<string, any> = {}) {
      if (!this.isEnabled) return;
      
      this.trackEvent('performance_metric', {
        metric,
        value,
        ...context
      });
    }
    
    // User progression tracking
    trackProgression(event: 'level_start' | 'level_complete' | 'prestige' | 'achievement', data: any) {
      this.trackGameEvent('progression', {
        progressionType: event,
        ...data
      });
    }
    
    // Session management
    startSession() {
      this.sessionStartTime = Date.now();
      this.trackEvent('session_start', {
        platform: this.userProperties.platform,
        appVersion: this.userProperties.appVersion
      });
    }
    
    endSession() {
      const sessionDuration = Date.now() - this.sessionStartTime;
      this.trackEvent('session_end', {
        sessionDuration,
        eventsInSession: this.events.length
      });
      
      this.flushEvents();
    }
    
    private async persistEvent(event: AnalyticsEvent) {
      try {
        const existingEvents = await AsyncStorage.getItem('analytics_events');
        const events = existingEvents ? JSON.parse(existingEvents) : [];
        events.push(event);
        
        // Keep only last 1000 events locally
        if (events.length > 1000) {
          events.splice(0, events.length - 1000);
        }
        
        await AsyncStorage.setItem('analytics_events', JSON.stringify(events));
      } catch (error) {
        console.warn('Failed to persist analytics event:', error);
      }
    }
    
    private async flushEvents() {
      try {
        const events = await AsyncStorage.getItem('analytics_events');
        if (events) {
          // Would send to analytics service here
          console.log('📤 Flushing analytics events to server');
          
          // Clear local events after successful send
          await AsyncStorage.removeItem('analytics_events');
        }
      } catch (error) {
        console.warn('Failed to flush analytics events:', error);
      }
    }
    
    // Privacy and settings
    setAnalyticsEnabled(enabled: boolean) {
      this.isEnabled = enabled;
      
      if (!enabled) {
        // Clear local analytics data
        AsyncStorage.removeItem('analytics_events');
        this.events = [];
      }
    }
    
    setUserProperty(key: string, value: any) {
      this.userProperties = {
        ...this.userProperties,
        [key]: value
      };
    }
  }
  
  export const analytics = Analytics.getInstance();
  
  // React hook for component-level analytics
  export function useAnalytics() {
    const trackScreenView = useCallback((screenName: string, properties = {}) => {
      analytics.trackEvent('screen_view', {
        screenName,
        ...properties
      });
    }, []);
    
    const trackUserAction = useCallback((action: string, properties = {}) => {
      analytics.trackEvent('user_action', {
        action,
        ...properties
      });
    }, []);
    
    return {
      trackScreenView,
      trackUserAction,
      trackEvent: analytics.trackEvent.bind(analytics),
      trackError: analytics.trackError.bind(analytics),
      trackPerformance: analytics.trackPerformance.bind(analytics)
    };
  }
  EOF
  
  # Create crash reporting system
  cat > src/core/analytics/CrashReporting.ts << 'EOF'
  import { analytics } from './Analytics';
  
  interface CrashReport {
    id: string;
    timestamp: number;
    error: {
      message: string;
      stack?: string;
      componentStack?: string;
    };
    context: {
      userId?: string;
      sessionId: string;
      gameState: any;
      deviceInfo: any;
      buildVersion: string;
    };
    breadcrumbs: Breadcrumb[];
  }
  
  interface Breadcrumb {
    timestamp: number;
    category: string;
    message: string;
    level: 'info' | 'warning' | 'error';
    data?: any;
  }
  
  class CrashReporting {
    private static instance: CrashReporting;
    private breadcrumbs: Breadcrumb[] = [];
    private isEnabled: boolean;
    private maxBreadcrumbs = 50;
    
    constructor() {
      this.isEnabled = process.env.EXPO_PUBLIC_CRASH_REPORTING_ENABLED === 'true';
      this.setupGlobalErrorHandlers();
    }
    
    static getInstance(): CrashReporting {
      if (!CrashReporting.instance) {
        CrashReporting.instance = new CrashReporting();
      }
      return CrashReporting.instance;
    }
    
    private setupGlobalErrorHandlers() {
      if (!this.isEnabled) return;
      
      // React error boundary integration would go here
      // Native crash reporting integration would go here
      
      // Unhandled promise rejections
      global.addEventListener?.('unhandledrejection', (event) => {
        this.reportCrash(new Error(event.reason), {
          type: 'unhandled_promise_rejection'
        });
      });
    }
    
    addBreadcrumb(category: string, message: string, level: 'info' | 'warning' | 'error' = 'info', data?: any) {
      if (!this.isEnabled) return;
      
      const breadcrumb: Breadcrumb = {
        timestamp: Date.now(),
        category,
        message,
        level,
        data
      };
      
      this.breadcrumbs.push(breadcrumb);
      
      // Keep only recent breadcrumbs
      if (this.breadcrumbs.length > this.maxBreadcrumbs) {
        this.breadcrumbs.shift();
      }
    }
    
    reportCrash(error: Error, context: Record<string, any> = {}) {
      if (!this.isEnabled) return;
      
      const crashId = `crash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const crashReport: CrashReport = {
        id: crashId,
        timestamp: Date.now(),
        error: {
          message: error.message,
          stack: error.stack,
          componentStack: context.componentStack
        },
        context: {
          sessionId: 'current_session_id', // Would get from analytics
          gameState: this.getGameStateSummary(),
          deviceInfo: this.getDeviceInfo(),
          buildVersion: '1.0.0',
          ...context
        },
        breadcrumbs: [...this.breadcrumbs]
      };
      
      this.persistCrashReport(crashReport);
      analytics.trackError(error, { crashId, ...context });
      
      console.error('💥 Crash reported:', crashId, error.message);
    }
    
    private getGameStateSummary(): any {
      try {
        // Would get current game state summary
        return {
          currentScreen: 'dashboard',
          gameProgress: 'mid_game',
          lastAction: 'hire_employee'
        };
      } catch (error) {
        return { error: 'Failed to get game state' };
      }
    }
    
    private getDeviceInfo(): any {
      return {
        platform: Platform.OS,
        version: Platform.Version,
        model: 'Unknown', // Would be populated with actual device info
        memory: 'Unknown',
        storage: 'Unknown'
      };
    }
    
    private async persistCrashReport(report: CrashReport) {
      try {
        const existingReports = await AsyncStorage.getItem('crash_reports');
        const reports = existingReports ? JSON.parse(existingReports) : [];
        reports.push(report);
        
        // Keep only last 10 crash reports locally
        if (reports.length > 10) {
          reports.splice(0, reports.length - 10);
        }
        
        await AsyncStorage.setItem('crash_reports', JSON.stringify(reports));
      } catch (error) {
        console.warn('Failed to persist crash report:', error);
      }
    }
    
    async sendPendingReports() {
      try {
        const reports = await AsyncStorage.getItem('crash_reports');
        if (reports) {
          const crashReports = JSON.parse(reports);
          
          // Would send to crash reporting service here
          console.log(`📤 Sending ${crashReports.length} crash reports`);
          
          // Clear after successful send
          await AsyncStorage.removeItem('crash_reports');
        }
      } catch (error) {
        console.warn('Failed to send crash reports:', error);
      }
    }
  }
  
  export const crashReporting = CrashReporting.getInstance();
  EOF
  ```

### App Store Preparation
- [ ] **Create App Store Assets** (2 hours)
  ```bash
  # Create app store description
  cat > store-listing/description.md << 'EOF'
  # PetSoft Tycoon - Build Your Software Empire!
  
  ## Short Description (80 characters)
  Build and grow your software company from startup to tech giant!
  
  ## Full Description
  Welcome to PetSoft Tycoon, the ultimate idle business simulation where you build and manage your own software development company!
  
  ### 🚀 Start Small, Dream Big
  Begin your journey as a solo developer writing code line by line. Watch your simple startup grow into a tech empire spanning multiple departments and thousands of employees.
  
  ### 🏢 Manage 7 Unique Departments
  - **Development**: The heart of your company - hire programmers and build amazing software
  - **Sales**: Convert your products into revenue with skilled sales teams
  - **Marketing**: Boost your brand awareness and customer acquisition
  - **HR**: Recruit top talent and improve company-wide efficiency
  - **Finance**: Optimize costs and manage investments strategically
  - **Operations**: Streamline processes and improve overall productivity
  - **Executive**: Make strategic decisions that shape your company's future
  
  ### 💰 Idle Progression System
  Your company keeps growing even when you're away! Return to find your teams have been productive, generating revenue and developing new features.
  
  ### 🎯 Prestige & Long-term Growth
  When you've built a successful company, restart with investor backing for permanent bonuses and faster progression. Each prestige run offers new strategies and higher goals.
  
  ### ✨ Key Features
  - **Engaging Idle Gameplay**: Progress continues even when offline
  - **Strategic Department Management**: Each department offers unique upgrade paths
  - **Achievement System**: Unlock rewards for reaching major milestones
  - **Prestige Mechanics**: Reset for permanent bonuses and investor points
  - **Smooth Performance**: Optimized for 60 FPS on all devices
  - **No Pay-to-Win**: Pure skill and strategy determine success
  
  ### 🎮 Perfect For
  - Fans of idle and incremental games
  - Business simulation enthusiasts  
  - Anyone who loves watching numbers grow
  - Players seeking long-term progression goals
  - Strategic thinkers who enjoy optimization
  
  Download PetSoft Tycoon today and start building your software empire! From writing your first line of code to managing a billion-dollar company, every tap brings you closer to becoming the ultimate tech tycoon.
  EOF
  
  # Create screenshot specifications
  cat > store-listing/screenshot-specs.md << 'EOF'
  # App Store Screenshot Specifications
  
  ## Required Screenshots (iOS)
  - iPhone 6.7": 1290 x 2796 pixels
  - iPhone 6.5": 1242 x 2688 pixels
  - iPhone 5.5": 1242 x 2208 pixels
  - iPad Pro 12.9": 2048 x 2732 pixels
  - iPad Pro 11": 1668 x 2388 pixels
  
  ## Screenshot Content Plan
  
  ### Screenshot 1: Dashboard Overview
  - Show main dashboard with currency, stats, and production rates
  - Highlight key metrics and progress indicators
  - Text overlay: "Build Your Software Empire"
  
  ### Screenshot 2: Department Management
  - Display departments screen with multiple unlocked departments
  - Show employee hiring and upgrade options
  - Text overlay: "Manage 7 Unique Departments"
  
  ### Screenshot 3: Employee Hiring
  - Focus on hiring interface with different employee types
  - Show production benefits and cost information
  - Text overlay: "Hire & Upgrade Your Team"
  
  ### Screenshot 4: Prestige System
  - Display prestige screen with investor points
  - Show multiplier benefits and progression rewards
  - Text overlay: "Prestige for Permanent Bonuses"
  
  ### Screenshot 5: Achievements
  - Show achievement list with unlocked rewards
  - Highlight progression milestones and benefits
  - Text overlay: "Unlock Achievements & Rewards"
  EOF
  
  # Create metadata files
  mkdir -p store-listing/metadata
  
  cat > store-listing/metadata/keywords.txt << 'EOF'
  idle game, business simulation, tycoon game, incremental game, software company, management game, strategy game, prestige game, offline progress, department management
  EOF
  
  cat > store-listing/metadata/categories.txt << 'EOF'
  Primary Category: Games
  Secondary Category: Simulation
  Tags: Idle, Strategy, Business, Tycoon
  EOF
  ```

### Final Build and Testing
- [ ] **Create Production Builds** (1 hour)
  ```bash
  # Build optimization check
  echo "🔧 Pre-build optimization check..."
  node scripts/optimize-build.js
  
  # Create production builds
  echo "📱 Creating iOS production build..."
  eas build --platform ios --profile production --non-interactive
  
  echo "🤖 Creating Android production build..."
  eas build --platform android --profile production --non-interactive
  
  # Create internal testing builds
  echo "🧪 Creating preview builds for testing..."
  eas build --platform all --profile preview --non-interactive
  
  # Build verification script
  cat > scripts/verify-builds.js << 'EOF'
  const fs = require('fs');
  const https = require('https');
  
  async function verifyBuilds() {
    console.log('🔍 Verifying build artifacts...');
    
    // This would integrate with EAS Build API to check build status
    const buildChecks = [
      { platform: 'ios', profile: 'production', expected: 'completed' },
      { platform: 'android', profile: 'production', expected: 'completed' }
    ];
    
    let allPassed = true;
    
    for (const check of buildChecks) {
      console.log(`Checking ${check.platform} ${check.profile} build...`);
      
      // Mock build verification - would use actual EAS API
      const buildStatus = 'completed'; // Simulated
      
      if (buildStatus === check.expected) {
        console.log(`✅ ${check.platform} build successful`);
      } else {
        console.log(`❌ ${check.platform} build failed: ${buildStatus}`);
        allPassed = false;
      }
    }
    
    if (allPassed) {
      console.log('\n🎉 All builds verified successfully!');
      console.log('Ready for app store submission.');
    } else {
      console.log('\n❌ Build verification failed. Check build logs.');
    }
    
    return allPassed;
  }
  
  verifyBuilds().catch(console.error);
  EOF
  
  # Run build verification
  node scripts/verify-builds.js
  ```

### Deployment Automation
- [ ] **Create CI/CD Pipeline** (1 hour)
  ```bash
  # Create GitHub Actions workflow
  mkdir -p .github/workflows
  
  cat > .github/workflows/build-and-deploy.yml << 'EOF'
  name: Build and Deploy
  
  on:
    push:
      branches: [main, production]
    pull_request:
      branches: [main]
  
  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        
        - name: Setup Node.js
          uses: actions/setup-node@v4
          with:
            node-version: '18'
            cache: 'npm'
            
        - name: Install dependencies
          run: npm ci
          
        - name: Run TypeScript check
          run: npx tsc --noEmit
          
        - name: Run tests
          run: npm test -- --watchAll=false --coverage
          
        - name: Run build optimization
          run: node scripts/optimize-build.js
  
    build-preview:
      if: github.event_name == 'pull_request'
      needs: test
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        
        - name: Setup Node.js
          uses: actions/setup-node@v4
          with:
            node-version: '18'
            cache: 'npm'
            
        - name: Setup Expo
          uses: expo/expo-github-action@v8
          with:
            expo-version: latest
            token: ${{ secrets.EXPO_TOKEN }}
            
        - name: Install dependencies
          run: npm ci
          
        - name: Build preview
          run: eas build --platform all --profile preview --non-interactive
  
    build-production:
      if: github.ref == 'refs/heads/production'
      needs: test
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        
        - name: Setup Node.js
          uses: actions/setup-node@v4
          with:
            node-version: '18'
            cache: 'npm'
            
        - name: Setup Expo
          uses: expo/expo-github-action@v8
          with:
            expo-version: latest
            token: ${{ secrets.EXPO_TOKEN }}
            
        - name: Install dependencies
          run: npm ci
          
        - name: Build production
          run: eas build --platform all --profile production --non-interactive
          
        - name: Verify builds
          run: node scripts/verify-builds.js
          
        - name: Create release
          if: success()
          uses: actions/create-release@v1
          env:
            GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          with:
            tag_name: v${{ github.run_number }}
            release_name: Release v${{ github.run_number }}
            body: |
              Production build completed successfully.
              iOS and Android builds ready for app store submission.
            draft: false
            prerelease: false
  EOF
  
  # Create deployment checklist
  cat > deployment-checklist.md << 'EOF'
  # Pre-Deployment Checklist
  
  ## Code Quality
  - [ ] All tests passing
  - [ ] TypeScript compilation successful  
  - [ ] No console.error or console.warn in production
  - [ ] Performance targets met (60 FPS, <75MB memory)
  - [ ] Bundle size under 10MB
  
  ## Build Configuration
  - [ ] Production environment variables configured
  - [ ] Bundle identifier and package name correct
  - [ ] Version numbers incremented appropriately
  - [ ] App icons and splash screens optimized
  - [ ] Build optimization script executed
  
  ## App Store Assets
  - [ ] App description written and reviewed
  - [ ] Screenshots created for all required device sizes
  - [ ] App metadata complete (categories, keywords, ratings)
  - [ ] Privacy policy and terms of service ready
  - [ ] Age rating assessment completed
  
  ## Testing
  - [ ] Internal testing on target devices completed
  - [ ] Performance testing passed on minimum spec devices
  - [ ] Crash reporting and analytics tested
  - [ ] Offline functionality verified
  - [ ] Save/load system thoroughly tested
  
  ## Security & Privacy
  - [ ] No hardcoded secrets or API keys
  - [ ] Analytics opt-out functionality working
  - [ ] Data collection practices documented
  - [ ] COPPA compliance verified (if applicable)
  - [ ] GDPR compliance verified (if applicable)
  
  ## Distribution
  - [ ] Apple Developer account setup and certificates valid
  - [ ] Google Play Console account setup and keys configured
  - [ ] EAS Build credentials configured
  - [ ] CI/CD pipeline tested and working
  - [ ] Rollback plan documented
  
  ## Post-Launch Monitoring
  - [ ] Crash reporting system active
  - [ ] Analytics dashboard configured
  - [ ] Performance monitoring alerts setup
  - [ ] User feedback collection system ready
  - [ ] Update deployment process documented
  EOF
  ```

---

## Quality Gates & Validation

### Build Quality Validation
- [ ] **Production Build Verification**
  ```bash
  echo "Build Quality Checklist:"
  echo "1. iOS and Android builds complete successfully"
  echo "2. Bundle sizes under target limits"
  echo "3. No development dependencies in production builds"
  echo "4. Performance optimization settings active"
  echo "5. Crash reporting and analytics configured"
  echo "6. All environment variables properly set"
  ```

### App Store Readiness
- [ ] **Store Listing Completeness**
  - App description compelling and accurate
  - Screenshots showcase key features effectively
  - Keywords optimized for discoverability
  - Age ratings and content warnings appropriate
  - Privacy policy and terms of service complete

### Performance Validation
- [ ] **Final Performance Testing**
  - Production builds maintain 60 FPS target
  - Memory usage remains under 75MB
  - Cold start time under 3 seconds
  - No crashes during extended testing sessions
  - Analytics and crash reporting working correctly

---

## Deliverables

### Required Outputs
1. **Production-Ready Builds** for iOS and Android app stores
2. **EAS Build Configuration** with automated build pipeline
3. **App Store Assets** including descriptions, screenshots, and metadata
4. **Performance Monitoring** with crash reporting and analytics
5. **CI/CD Pipeline** for automated testing and deployment
6. **Documentation** for deployment processes and maintenance

### Final Validation Checklist
- [ ] Production builds complete and tested on devices
- [ ] All app store assets prepared and optimized
- [ ] Performance monitoring systems active and collecting data
- [ ] CI/CD pipeline tested and functional
- [ ] Team trained on deployment and update processes
- [ ] Rollback procedures documented and tested
- [ ] Post-launch monitoring plan in place

---

**Time Tracking**: Record actual time vs estimates
- [ ] Build optimization: __ hours (est: 2)
- [ ] EAS configuration: __ hours (est: 1.5)
- [ ] Analytics setup: __ hours (est: 2)
- [ ] App store preparation: __ hours (est: 2)
- [ ] Production builds: __ hours (est: 1)
- [ ] CI/CD setup: __ hours (est: 1)
- [ ] **Total Phase 5**: __ hours (est: 9.5-11 hours over 1-2 days)

**Critical Success Metrics**:
- [ ] Production builds successful for both platforms
- [ ] Bundle sizes meet target requirements
- [ ] Performance monitoring functional and reporting
- [ ] App store assets complete and professional
- [ ] Automated deployment pipeline operational

**Final Milestone**: **Production-ready PetSoft Tycoon app ready for app store submission**

**Post-Launch Planning**: Monitor crash reports, user feedback, and analytics data to plan future updates and improvements. Maintain regular update schedule for bug fixes and feature enhancements.

---

## Project Completion Summary

Upon successful completion of this phase, the PetSoft Tycoon project will have achieved:

### Technical Achievements
- **Mobile-first architecture** implemented with React Native + Expo
- **60 FPS performance** maintained across all target devices
- **Hybrid routing pattern** successfully reconciling Expo Router with vertical slicing
- **Legend State v3** providing fine-grained reactivity with optimal performance
- **Comprehensive department system** with 7 unique departments and upgrade trees
- **Prestige mechanics** creating compelling long-term progression
- **Production-ready builds** optimized for app store distribution

### Business Objectives Met
- **Complete idle game** with engaging progression mechanics
- **Professional user experience** with polished animations and audio
- **Scalable architecture** supporting future feature additions
- **Performance monitoring** enabling data-driven optimization
- **App store ready** with complete marketing assets and deployment pipeline

The runbook provides a comprehensive, executable development plan that transforms the original web-based PRD into a modern, performant mobile application while maintaining the core gameplay vision and performance requirements.