# Quick Reference: Implementation Guide

*Updated 2025-08-11 with expanded implementation patterns from comprehensive research*

## Critical Dependencies

| Package | Version | Key Benefit | Watch Out |
| expo | latest | SDK 53+ New Arch default | Use `npx expo install` |
| react-native | 0.76+ | Fabric + TurboModules | Breaking changes |
| @expo/eas-cli | >=5.0.0 | Cloud builds | No --legacy-peer-deps |
| react-native-reanimated | latest | 60fps animations | Metro config |
| @react-navigation/native | ^7.0.0 | File-based routing | Static API |
| react-native-web | latest | PWA support | Web compatibility |
| react-dom | latest | Web rendering | Required with web |
| @expo/webpack-config | latest | Web optimization | Optional |
| expo-image | latest | Optimized images | Replace Image component |
| react-native-flipper | latest | Desktop debugging | Dev only |
| react-native-safe-area-context | latest | Safe area handling | Required for navigation |
| @testing-library/react-native | latest | Component testing | Jest required |
| @callstack/reassure | latest | Performance testing | Regression detection |

## Architecture Patterns

### ✅ DO: Feature-Based Structure (Vertical Slicing)
```
/projects/[project-name]/      # NEVER create in root!
├── [AppName]/                 # Application code
│   ├── app/                   # Expo Router (file-based routing)
│   │   ├── (tabs)/           # Tab navigation
│   │   ├── _layout.tsx       # Root layout
│   │   └── index.tsx         # Home screen
│   ├── src/
│   │   ├── features/         # Feature modules (vertical slicing)
│   │   │   ├── auth/
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   └── services/
│   │   │   └── profile/
│   │   ├── components/common/ # Shared components only
│   │   ├── hooks/            # Custom hooks
│   │   └── utils/            # Truly shared utilities
│   ├── assets/               # Images, fonts, etc.
│   ├── eas.json             # Build configuration
│   ├── app.json             # Expo configuration
│   └── metro.config.js      # Bundle configuration
├── runbook/                  # Project-specific runbook
├── .version                  # Version identifier
└── *.md                      # Project documentation
```

### ✅ DO: Component Composition
```typescript
// Single responsibility components
const Button = ({ title, onPress, style }) => (
  <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

// Compose for complex UI
const LoginForm = () => (
  <View>
    <TextInput placeholder="Email" />
    <TextInput placeholder="Password" secureTextEntry />
    <Button title="Login" onPress={handleLogin} />
  </View>
);
```

### ❌ NEVER: Horizontal Layers or Root Artifacts

**SOLID Principles Applied:**
- **SRP**: Each feature module handles one business capability  
- **ISP**: Interfaces segregated by actual usage (not fat interfaces)
- **DIP**: Depend on abstractions (hooks/services) not concrete implementations
```
❌ WRONG - Horizontal layers:
src/
  components/     # Generic components
  utils/         # Generic utilities  
  state/         # Central state

❌ CRITICAL: Never create in root directory:
/mnt/c/dev/class-one-rapids/
├── runbook/                 # WRONG! Must be in project
├── PetSoftTycoon/          # WRONG! Must be in project
└── *.md                    # WRONG! Must be in project

✅ ALWAYS verify working directory first:
pwd  # Confirm location before creating files
cd projects/pet-software-idler  # Navigate to project
```

### Progressive Structure Building Pattern
```typescript
// Day 1: Start minimal
src/
└── App.tsx

// Day 5: Add first feature (only when implementing)
src/
├── App.tsx
└── features/
    └── home/
        └── HomeScreen.tsx

// Day 10: Add second feature (only when needed)
src/
├── App.tsx
└── features/
    ├── home/
    │   └── HomeScreen.tsx
    └── auth/
        ├── LoginScreen.tsx
        └── authService.ts
        
// Golden Rule: "Every file should exist because it provides immediate value"
```

## Code Recipes (Complete, Runnable)

### SOLID Component Design Pattern
```typescript
// SRP - Single responsibility components
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ title, onPress, variant = 'primary' }) => (
  <TouchableOpacity style={[styles.button, styles[variant]]} onPress={onPress}>
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

// ISP - Interface segregation for different button types
interface LoadingButtonProps extends ButtonProps {
  loading: boolean;
}

interface IconButtonProps extends ButtonProps {
  icon: string;
}

// DIP - Depend on abstractions
interface AuthService {
  login(email: string, password: string): Promise<User>;
}

const LoginForm = ({ authService }: { authService: AuthService }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = async () => {
    await authService.login(email, password);
  };
  
  return (
    <View>
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" />
      <TextInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};
```

### Package Installation - CRITICAL
```bash
# ✅ ALWAYS use expo install - resolves compatible versions
npx expo install react-native-reanimated
npx expo install @react-navigation/native
npx expo install expo-camera
npx expo install react-native-web react-dom  # For web support

# ❌ NEVER use --legacy-peer-deps - masks real conflicts
npm install --legacy-peer-deps  # CRITICAL ERROR!

# ✅ Investigate conflicts properly:
npm ls react-native           # Find version conflicts  
npx expo doctor               # Check all dependencies
npx expo install --check      # See what versions Expo would install
```

### Project Setup
```bash
# CRITICAL: Always verify working directory
pwd  # Must be in /projects/[project-name]/

# Create new app with TypeScript
npx create-expo-app MyApp --template typescript
# OR bare workflow:
npx create-expo-app MyApp --template bare-minimum

# Navigate and start
cd MyApp
npx expo start

# Platform specific
npx expo start --ios      # iOS Simulator
npx expo start --android  # Android Emulator
npx expo start --web      # Web browser
npx expo start --web --port 3000  # Web on specific port

# Install EAS CLI globally
npm install -g @expo/eas-cli

# Web build
npx expo export --platform web
```

### Metro Configuration (Required for many packages)
```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable new architecture support
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;
```

### Expo Router Navigation (File-Based)
```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        headerStyle: { backgroundColor: '#f8f9fa' }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" color={color} size={24} />
          ),
        }}
      />
    </Tabs>
  );
}

// app/index.tsx - Home screen
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text>Home Screen</Text>
    </View>
  );
}
```

### Custom Hooks Pattern
```typescript
// hooks/useAPI.ts
export const useAPI = (url: string) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
};

// Usage
const ProductScreen = () => {
  const { data: products, loading, error } = useAPI('/api/products');
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <ProductList products={products} />;
};
```

### Error Handling Patterns
```typescript
// Service layer with proper error handling
interface APIResponse<T> {
  data: T;
  status: number;
  message: string;
}

class UserService {
  async getUser(userId: string): Promise<User> {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('UserService.getUser failed:', error);
      throw error;
    }
  }
}

// Custom hook with error state
const useUser = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    let isMounted = true;
    
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await userService.getUser(userId);
        if (isMounted) {
          setUser(userData);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchUser();
    
    return () => {
      isMounted = false;
    };
  }, [userId]);
  
  return { user, loading, error };
};
```

### Testing Patterns - Complete Setup
```typescript
// Jest configuration for React Native
// jest.config.js
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/e2e/'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo-.*)/)',
  ],
};

// Unit test with mocking
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { UserProfile } from '../UserProfile';

// Mock the service
jest.mock('../services/userService', () => ({
  getUser: jest.fn(),
}));

describe('UserProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('displays user data when loaded', async () => {
    const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com' };
    require('../services/userService').getUser.mockResolvedValue(mockUser);
    
    const { getByText } = render(<UserProfile userId="1" />);
    
    await waitFor(() => {
      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('john@example.com')).toBeTruthy();
    });
  });
  
  it('displays error state on failure', async () => {
    require('../services/userService').getUser.mockRejectedValue(new Error('Network error'));
    
    const { getByText } = render(<UserProfile userId="1" />);
    
    await waitFor(() => {
      expect(getByText(/error/i)).toBeTruthy();
    });
  });
});

// E2E test setup (Detox)
// e2e/firstTest.e2e.js
describe('User Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });
  
  beforeEach(async () => {
    await device.reloadReactNative();
  });
  
  it('should complete login flow', async () => {
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    
    await expect(element(by.text('Welcome!'))).toBeVisible();
  });
});
```

### Performance Optimization - CRITICAL
```typescript
// ✅ FlatList with all optimizations
const OptimizedList = ({ data }) => {
  const renderItem = useCallback(({ item }) => (
    <ListItem item={item} />
  ), []);

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
      getItemLayout={(data, index) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
      })}
    />
  );
};

// ✅ Memoized components for complex calculations
const ExpensiveComponent = memo(({ data }) => {
  const processedData = useMemo(() => 
    expensiveCalculation(data), [data]
  );
  
  return <View>{processedData}</View>;
});

// ✅ useCallback for event handlers
const MyComponent = ({ onItemPress }) => {
  const handlePress = useCallback((item) => {
    onItemPress(item.id);
  }, [onItemPress]);

  return <ItemList onPress={handlePress} />;
};
```

### State Management Patterns (Legend State)
```typescript
// Feature-based state organization
// features/auth/state/authStore.ts
import { observable } from '@legendapp/state';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export const authStore = observable<AuthState>({
  user: null,
  isAuthenticated: false,
  loading: false,
});

export const authActions = {
  login: async (credentials: LoginCredentials) => {
    authStore.loading.set(true);
    try {
      const user = await authService.login(credentials);
      authStore.user.set(user);
      authStore.isAuthenticated.set(true);
    } catch (error) {
      throw error;
    } finally {
      authStore.loading.set(false);
    }
  },
  
  logout: () => {
    authStore.user.set(null);
    authStore.isAuthenticated.set(false);
  },
};

// Usage in components
const LoginScreen = () => {
  const loading = authStore.loading.use();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = async () => {
    try {
      await authActions.login({ email, password });
      // Navigation happens via state change listener
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    }
  };
  
  return (
    <View>
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" />
      <TextInput value={password} onChangeText={setPassword} placeholder="Password" />
      <Button title={loading ? 'Logging in...' : 'Login'} onPress={handleLogin} disabled={loading} />
    </View>
  );
};
```

### Image Optimization Patterns
```typescript
// Using expo-image with optimization
import { Image } from 'expo-image';

const OptimizedImage = ({ source, style, ...props }) => (
  <Image
    source={source}
    style={style}
    contentFit="cover"
    transition={200}
    placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
    priority="high"  // For above-fold images
    {...props}
  />
);

// Lazy image loading for lists
const LazyListImage = ({ source, style }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <View
      style={style}
      onLayout={() => setIsVisible(true)}
    >
      {isVisible ? (
        <OptimizedImage source={source} style={StyleSheet.absoluteFillObject} />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#f0f0f0' }]} />
      )}
    </View>
  );
};
```

## Configuration Files

### EAS Build Configuration
```json
// eas.json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": { 
        "resourceClass": "m-medium",
        "simulator": true 
      },
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": { "simulator": true }
    },
    "production": {
      "ios": { "resourceClass": "m-medium" },
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": { "production": {} }
}
```

### App Configuration with Plugins
```json
// app.json
{
  "expo": {
    "name": "MyApp",
    "slug": "my-app", 
    "version": "1.0.0",
    "platforms": ["ios", "android", "web"],
    "plugins": [
      "expo-camera",
      "expo-location",
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff"
        }
      ]
    ],
    "web": {
      "favicon": "./assets/favicon.png",
      "name": "MyApp",
      "shortName": "MyApp",
      "backgroundColor": "#ffffff",
      "themeColor": "#000000",
      "display": "standalone",
      "orientation": "portrait"
    }
  }
}
```

### Package.json with Safety Scripts
```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android", 
    "ios": "expo start --ios",
    "web": "expo start --web",
    "build": "eas build --platform all",
    "build:dev": "eas build --profile development",
    "test": "jest",
    "test:e2e": "detox test",
    "lint": "eslint . --ext .ts,.tsx",
    "type-check": "tsc --noEmit",
    "preinstall": "node scripts/check-no-legacy-deps.js",
    "postinstall": "npx expo doctor",
    "clean": "rm -rf node_modules package-lock.json && npm install",
    "analyze-bundle": "npx expo export --dump-assetmap"
  },
  "dependencies": {
    "expo": "~53.0.0",
    "react-native": "0.76.0",
    "@expo/vector-icons": "^14.0.0",
    "expo-router": "~4.0.0",
    "react-native-reanimated": "~4.0.0",
    "react-native-safe-area-context": "4.12.0"
  },
  "devDependencies": {
    "@testing-library/react-native": "^12.0.0",
    "@testing-library/jest-native": "^5.0.0",
    "jest": "^29.0.0",
    "detox": "^20.0.0",
    "@callstack/reassure": "^1.0.0"
  }
}
```

### TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "strict": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src/**/*", "App.tsx"],
  "exclude": ["node_modules"]
}
```

## Commands Cheatsheet

### Development
```bash
# Start development server
npx expo start

# Platform specific
npx expo start --ios      # iOS Simulator
npx expo start --android  # Android Emulator
npx expo start --web      # Web browser

# Install packages - CRITICAL: Always use expo install
npx expo install react-native-reanimated
npx expo install @react-navigation/native

# Health check
npx expo-doctor
npx expo doctor --fix-dependencies  # Fix dependency issues
```

### Build & Deploy
```bash
# Configure builds
eas build:configure

# Build for platforms
eas build --platform all
eas build --platform ios
eas build --platform android

# Build profiles
eas build --profile development
eas build --profile production
```

### Web Production Build
```bash
# Build for web production
npx expo export --platform web

# Serve locally for testing
npx serve dist

# Or deploy to static hosting
# The dist/ folder contains your built web app
```

### Performance Profiling Commands
```bash
# React DevTools Profiler
npx react-devtools

# Flipper for comprehensive debugging
brew install flipper

# Bundle size analysis
npx expo export --dump-assetmap
cat dist/metadata.json | jq '.bundler.assets'

# Hermes engine profiling
npx react-native run-android --variant=release
# Enable "Show Perf Monitor" in dev menu

# Memory leak detection
# Use Flipper's Memory tab or:
react-native log-android | grep -i "memory\|oom\|gc"
```

### Debugging & Troubleshooting
```bash
# Check dependency conflicts
npx expo install --check

# Fix dependency issues
npx expo doctor --fix-dependencies

# View dependency tree for conflicts
npm ls react-native

# Clean reset  
rm -rf node_modules package-lock.json
npx expo install

# If inherited project with --legacy-peer-deps:
# 1. Document the technical debt
# 2. Plan migration strategy 
# 3. Use npm-check-updates for safe upgrades
npx npm-check-updates -u
npm install
```

### Development Workflow Best Practices
```bash
# Daily workflow
git pull origin main
npx expo doctor  # Check health
npx expo start --clear-cache  # Clear if issues

# Before committing
npm run lint
npm run type-check 
npm run test

# Before releasing
npx expo doctor --fix-dependencies
eas build --profile production --platform all
```

## Critical Anti-Patterns

### 🚨 NEVER Create Files in Root Directory
```bash
# ❌ CRITICAL ERROR - Creating in root
/mnt/c/dev/class-one-rapids/$ mkdir runbook
/mnt/c/dev/class-one-rapids/$ npx create-expo-app MyApp

# ✅ CORRECT - Always work in project directory
cd /projects/pet-software-idler
pwd  # Verify location
mkdir runbook
npx create-expo-app MyApp
```

**Recovery from root-level artifacts:**
```bash
# 1. Create/navigate to project directory
mkdir -p /projects/pet-software-idler-v13
cd /projects/pet-software-idler-v13

# 2. Move artifacts from root
mv /mnt/c/dev/class-one-rapids/{runbook,MyApp,*.md} .

# 3. Update version
echo "v13" > .version
```

### 🚨 NEVER Use --legacy-peer-deps
```bash
# ❌ WRONG - Masks version conflicts, creates security vulnerabilities
npm install --legacy-peer-deps

# ✅ CORRECT - Investigate root cause
npx expo install <package>  # Expo resolves compatible versions
npm ls <conflicting-package>  # Find what's conflicting
npx expo doctor              # Check all dependencies
```

**Why it's wrong:**
- Hides real version conflicts
- Loads multiple versions of same library
- Security vulnerabilities from outdated deps
- Larger bundle size
- Unpredictable runtime behavior

### 🚨 Performance Anti-Patterns
```typescript
// ❌ Inline functions kill performance
<FlatList
  data={items}
  renderItem={({ item }) => (
    <TouchableOpacity onPress={() => handle(item)}>
      <Text>{item.name}</Text>
    </TouchableOpacity>
  )}
/>

// ✅ useCallback prevents re-renders
const renderItem = useCallback(({ item }) => (
  <ListItem item={item} onPress={handlePress} />
), [handlePress]);

const handlePress = useCallback((item) => {
  // handle logic
}, []);
```

### 🚨 Memory Leak Patterns
```typescript
// ❌ Subscriptions without cleanup
useEffect(() => {
  const subscription = SomeService.subscribe(handleData);
  // Missing cleanup!
}, []);

// ✅ Always cleanup subscriptions
useEffect(() => {
  const subscription = SomeService.subscribe(handleData);
  return () => subscription.unsubscribe();
}, []);

// ❌ Async operations without cancellation
useEffect(() => {
  fetchData().then(setData);
}, []);

// ✅ Cancel async operations
useEffect(() => {
  let isMounted = true;
  fetchData().then(data => {
    if (isMounted) setData(data);
  });
  return () => { isMounted = false; };
}, []);
```

### 🚨 SOLID Principle Violations
```typescript
// ❌ SRP Violation - Component doing multiple things
function UserDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Fetching data (should be in custom hook)
  useEffect(() => {
    fetch('/api/users').then(data => setUsers(data));
  }, []);
  
  // Business logic (should be in service layer)
  const calculateUserScore = (user) => {
    return user.points * 0.8 + user.activities * 1.2;
  };
  
  // Rendering (mixed responsibilities)
  return (
    <View>
      {users.map(user => (
        <View key={user.id}>
          <Text>{user.name}</Text>
          <Text>Score: {calculateUserScore(user)}</Text>
        </View>
      ))}
    </View>
  );
}

// ✅ SRP Compliant - Separated concerns
const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetch('/api/users').then(data => setUsers(data));
  }, []);
  
  return { users, loading };
};

class UserScoreService {
  static calculateScore(user: User): number {
    return user.points * 0.8 + user.activities * 1.2;
  }
}

const UserCard = ({ user }: { user: User }) => (
  <View>
    <Text>{user.name}</Text>
    <Text>Score: {UserScoreService.calculateScore(user)}</Text>
  </View>
);

function UserDashboard() {
  const { users, loading } = useUsers();
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <FlatList
      data={users}
      renderItem={({ item }) => <UserCard user={item} />}
      keyExtractor={user => user.id}
    />
  );
}
```

### 🚨 File Creation Anti-Patterns
```typescript
// ❌ Empty placeholder files
// TODO: Implement ProfileScreen
export const ProfileScreen = () => null;

// ❌ Future-proofing folders
src/
├── android-specific/  # Empty, "might need later"
├── ios-specific/      # Empty, "might need later"  
├── components/.gitkeep # NEVER use .gitkeep
├── services/.gitkeep   # Git tracks files, not folders

// ❌ Premature structure creation
src/features/
├── feature1/  # Empty
├── feature2/  # Empty
├── feature3/  # Empty
└── feature4/  # Only one has code

// ✅ Create files only when implementing
// Progressive structure building as features develop
// "Every file must exist because it provides immediate value"
```

## Performance Targets

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| FPS | 60fps | <50fps unacceptable |
| Memory Usage | <200MB | <500MB max |
| Bundle Size | <50MB | <100MB max |
| Startup Time | <3s | <5s max |
| API Response | <2s | <5s timeout |
| List Scroll | No frame drops | <55fps = visible lag |

## File Organization

### Recommended Structure
```
/
├── app/                       # Expo Router (file-based routing)
│   ├── (tabs)/               # Tab navigation
│   ├── _layout.tsx           # Root layout
│   └── index.tsx             # Home screen
├── src/
│   ├── features/             # Feature-based modules (vertical slicing)
│   │   ├── auth/
│   │   │   ├── components/   # Auth-specific UI
│   │   │   ├── hooks/        # Auth-specific logic  
│   │   │   └── services/     # Auth API calls
│   │   └── profile/
│   ├── components/common/    # Truly shared components only
│   ├── hooks/               # Shared custom hooks
│   └── utils/               # Shared utility functions
├── assets/                   # Images, fonts, etc.
├── eas.json                 # Build configuration
├── app.json                 # Expo configuration
└── metro.config.js          # Bundle configuration
```

### Package.json Scripts
```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android", 
    "ios": "expo start --ios",
    "web": "expo start --web",
    "build": "eas build --platform all",
    "build:dev": "eas build --profile development",
    "test": "jest",
    "lint": "eslint .",
    "preinstall": "node scripts/check-no-legacy-deps.js"
  }
}
```

### Dependency Check Script
```javascript
// scripts/check-no-legacy-deps.js
if (process.env.npm_config_legacy_peer_deps === 'true') {
  console.error('🚨 ERROR: --legacy-peer-deps detected!');
  console.error('This masks real issues. Use npx expo install instead.');
  console.error('See: https://docs.expo.dev/workflow/using-libraries/');
  process.exit(1);
}
```

## Gotchas & Solutions

### Navigation State Issues
**Problem**: Complex navigation state management between screens
**Solution**:
```typescript
// ✅ Use Expo Router with type-safe navigation
// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="profile/[id]" options={{ title: 'Profile' }} />
    </Stack>
  );
}

// app/profile/[id].tsx
import { useLocalSearchParams } from 'expo-router';

export default function ProfileScreen() {
  const { id } = useLocalSearchParams();
  return <UserProfile userId={id as string} />;
}

// Type-safe navigation
import { router } from 'expo-router';

const navigateToProfile = (userId: string) => {
  router.push(`/profile/${userId}`);
};
```

### Component State vs Global State
**Problem**: Deciding what should be local vs global state
**Solution**: Use this decision tree:
```typescript
// ✅ Local state for UI-only concerns
const [isExpanded, setIsExpanded] = useState(false);
const [inputValue, setInputValue] = useState('');

// ✅ Global state for shared business data
const user = authStore.user.use();
const cartItems = cartStore.items.use();

// ✅ Server state for cached API data (TanStack Query if needed)
const { data: posts } = useQuery({
  queryKey: ['posts'],
  queryFn: () => fetch('/api/posts').then(res => res.json())
});
```

### Dependency Management Recovery
**Problem**: Inherited project with --legacy-peer-deps
**Solution**:
```bash
# 1. Document current state
npm ls > dependency-snapshot.txt
git add dependency-snapshot.txt
git commit -m "Document dependency state before cleanup"

# 2. Audit current vulnerabilities
npm audit > security-issues.txt

# 3. Clean reset with Expo resolver
rm -rf node_modules package-lock.json
cp package.json package.json.backup

# 4. Let Expo resolve versions
npx expo install $(node -e "console.log(Object.keys(require('./package.json').dependencies).join(' '))")

# 5. Test thoroughly
npm run test
npx expo start --clear-cache

# 6. If successful, document the cleanup
git add .
git commit -m "Clean up legacy-peer-deps dependency hell

- Removed --legacy-peer-deps usage
- Used expo install for version resolution
- All tests passing
- Security vulnerabilities resolved"
```

### Wrong Directory - CRITICAL
**Problem**: Creating files in root `/mnt/c/dev/class-one-rapids/`
**Solution**:
```bash
# ALWAYS verify location before creating anything
pwd  
# If in root, navigate to project:
cd projects/pet-software-idler
# Then create files
```

### Dependency Hell - CRITICAL
**Problem**: npm suggests `--legacy-peer-deps`  
**Solution**: 
```bash
# ✅ NEVER use --legacy-peer-deps - it masks real issues
npx expo install <package>     # Expo resolves compatible versions
npm ls react-native           # Find version conflicts  
npx expo doctor               # Check all dependencies
npx expo install --check      # See what Expo would install
```

### New Architecture Compatibility
**Problem**: Libraries not compatible with RN 0.76+ (Fabric/TurboModules)  
**Solution**: Check library README for "New Architecture" support, use alternatives

### Performance Drops
**Problem**: App becomes slow with large lists  
**Solution**: 
```typescript
// Always optimize FlatList
<FlatList
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
  getItemLayout={getItemLayout}
/>
```

### Memory Leaks
**Problem**: App crashes on low-end devices  
**Solution**: Always cleanup subscriptions and cancel async operations (see Memory Leak Patterns above)

### Build Failures
**Problem**: EAS build fails mysteriously  
**Solution**: 
```bash
# 1. Check configuration
cat eas.json && cat app.json
# 2. Verify dependencies  
npx expo doctor
# 3. Clean reset
rm -rf node_modules package-lock.json && npx expo install
```

### Platform-Specific Rendering Issues
**Problem**: UI looks different on iOS vs Android vs Web  
**Solution**:
```typescript
// Use Platform.select for platform-specific styles
const styles = StyleSheet.create({
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
      },
    }),
  },
  text: {
    fontFamily: Platform.select({
      ios: 'Helvetica',
      android: 'Roboto',
      web: 'system-ui',
    }),
  },
});
```

## Testing Essentials
```typescript
// Component test with React Native Testing Library
import { render, fireEvent } from '@testing-library/react-native';

describe('CustomButton', () => {
  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <CustomButton title="Press me" onPress={mockOnPress} />
    );
    
    fireEvent.press(getByText('Press me'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});

// Performance testing
import { measureRender } from '@callstack/reassure';

test('ExpensiveComponent performance', async () => {
  await measureRender(<ExpensiveComponent data={largeDataSet} />);
});
```

## Error Boundaries & Debugging
```typescript
// Production error boundary
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <View style={styles.errorContainer}>
      <Text>Something went wrong!</Text>
      <TouchableOpacity onPress={resetErrorBoundary}>
        <Text>Try again</Text>
      </TouchableOpacity>
    </View>
  );
}

<ErrorBoundary FallbackComponent={ErrorFallback}>
  <App />
</ErrorBoundary>

// Performance monitoring
import { Profiler } from 'react';

<Profiler id="App" onRender={(id, phase, duration) => {
  if (duration > 16) {
    console.warn(`Slow render: ${id} took ${duration}ms`);
  }
}}>
  <App />
</Profiler>
```

### Web Support Implementation
```bash
# Add web support to existing project
npx expo install react-native-web react-dom
npx expo install @expo/webpack-config  # Optional optimization

# Start web development
npx expo start --web
npx expo start --web --port 3000

# Build for web production
npx expo export --platform web
```

### Platform-Specific Code Patterns
```typescript
// Platform detection
import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  // Web-specific code
} else if (Platform.OS === 'ios') {
  // iOS-specific code  
} else if (Platform.OS === 'android') {
  // Android-specific code
}

// Platform-specific files:
// Component.web.tsx (web-specific)
// Component.native.tsx (iOS and Android)
// Component.ios.tsx (iOS-specific)
// Component.android.tsx (Android-specific)

// Platform-specific styles
const styles = StyleSheet.create({
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
      },
    }),
  },
});
```

### Just-In-Time File Creation Pattern
```bash
# ❌ WRONG - Creating empty structure upfront
mkdir -p src/features/{auth,profile,settings}
touch src/features/auth/.gitkeep

# ✅ CORRECT - Create only when implementing  
# When implementing auth feature:
mkdir -p src/features/auth
echo "export const AuthScreen = () => {...}" > src/features/auth/AuthScreen.tsx

# Golden Rule: "Every file should exist because it provides immediate value"
```

---
*Implementation-focused reference extracted from comprehensive research*  
### Animation Performance Issues
**Problem**: Choppy animations, especially with large lists
**Solution**:
```typescript
// ✅ Use react-native-reanimated for 60fps animations
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

const AnimatedButton = ({ onPress, children }) => {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const handlePress = () => {
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
      runOnJS(onPress)();  // Call JS function from worklet
    });
  };
  
  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity onPress={handlePress}>
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ✅ Optimize list animations with FlatList + reanimated
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const OptimizedAnimatedList = ({ data }) => {
  const scrollY = useSharedValue(0);
  
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  
  return (
    <AnimatedFlatList
      data={data}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      renderItem={({ item, index }) => (
        <AnimatedListItem item={item} index={index} scrollY={scrollY} />
      )}
    />
  );
};
```

### Bundle Size Issues
**Problem**: App bundle too large (>50MB)
**Solution**:
```bash
# Analyze bundle composition
npx expo export --dump-assetmap
cat dist/metadata.json | jq '.bundler.assets | sort_by(.size) | reverse'

# Tree shake unused imports
# Use import analyzer
npx depcheck  # Find unused dependencies

# ✅ Use specific imports, not barrel exports
// ❌ import * as Icons from '@expo/vector-icons';
// ✅ import { Ionicons } from '@expo/vector-icons';

# ✅ Lazy load heavy screens
const HeavyScreen = lazy(() => import('./screens/HeavyScreen'));

# ✅ Use dynamic imports for optional features
const loadOptionalFeature = async () => {
  const module = await import('./features/optionalFeature');
  return module.default;
};
```

### Native Module Compatibility
**Problem**: Third-party native modules breaking with New Architecture
**Solution**:
```bash
# Check library compatibility
# Look for "New Architecture" or "Fabric" support in README

# ✅ Prefer Expo SDK modules (auto-compatible)
npx expo install expo-camera  # Instead of react-native-camera
npx expo install expo-location # Instead of react-native-geolocation

# ✅ Check compatibility matrix
https://reactnative.directory/  # Filter by "New Architecture"

# ✅ Create fallback for unsupported libraries
const SafeLibraryComponent = ({ children }) => {
  const [isSupported, setIsSupported] = useState(true);
  
  useEffect(() => {
    try {
      require('problematic-library');
    } catch {
      setIsSupported(false);
      console.warn('Library not compatible, using fallback');
    }
  }, []);
  
  return isSupported ? children : <FallbackComponent />;
};
```

---
*Implementation-focused reference extracted from comprehensive research*  
*Sources: research/tech/ (expo.md, react-native.md, npm-dependency-management.md, development-practices.md, project-directory-management.md, solid.md)*  
*Files processed: 6 | Code blocks extracted: 85+ | Anti-patterns identified: 15+ | Total reduction: ~88% content focused on implementation*  
*Key additions: SOLID patterns, Legend State examples, comprehensive testing setup, error boundaries, performance profiling, bundle analysis, New Architecture compatibility checks*