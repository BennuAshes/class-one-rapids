# Organizing Expo Apps by Feature - Comprehensive Research

## Executive Summary
- Feature-based architecture organizes Expo/React Native apps around business features rather than technical layers
- Modern Expo Router (v5) supports file-based routing with feature modules, creating scalable app structures
- As of 2025, 75% of SDK 52+ projects use React Native's New Architecture, making feature organization critical
- Companies like Meta, Discord, and Shopify successfully use feature-based patterns in production
- Future roadmap includes full-stack capabilities with Server Components and API Routes

## Foundation

### Definitions & Concepts

**Feature-Based Architecture**: An organizational pattern where code is grouped by business feature or domain rather than technical layer. Each feature becomes a self-contained module with its own components, services, hooks, and tests.

**Key Components**:
- **Feature Modules**: Self-contained units of functionality (e.g., auth, profile, chat)
- **Expo Router**: File-based routing system that maps directory structure to app navigation
- **Shared Services**: Cross-cutting concerns like theming, i18n, and state management
- **Module Boundaries**: Clear separation between features to minimize coupling

### Context & Background

**Historical Development**:
- Pre-2023: React Native apps typically used layer-based organization (components/, services/, utils/)
- 2023-2024: Shift toward feature-based organization as apps grew in complexity
- 2024-2025: Expo Router v3-v5 introduced file-based routing, making feature organization natural
- Future (Late 2025+): Legacy React Native architecture will be deprecated

**Current State**:
- Expo Router is now the official framework for React Native projects (2024 RN team recommendation)
- File-based routing eliminates manual navigation configuration
- New Architecture (Fabric + TurboModules) is production-ready

## Core Content

### Modern Expo App Structure (2025)

#### Recommended Feature-Based Structure

```
AwesomeProject/
├── app/                        # Expo Router Pages (Screens Only)
│   ├── index.tsx              # Home screen ("/")
│   ├── _layout.tsx            # Global layout & providers
│   ├── (auth)/                # Auth flow group
│   │   ├── _layout.tsx        # Auth-specific layout
│   │   ├── login.tsx          # "/auth/login"
│   │   ├── signup.tsx         # "/auth/signup"
│   │   └── forgot.tsx         # "/auth/forgot"
│   ├── (tabs)/                # Tab navigation group
│   │   ├── _layout.tsx        # Tab layout configuration
│   │   ├── home.tsx           # "/home" tab
│   │   ├── explore.tsx        # "/explore" tab
│   │   └── profile.tsx        # "/profile" tab
│   └── settings/              # Settings screens
│       ├── index.tsx          # "/settings"
│       ├── notifications.tsx  # "/settings/notifications"
│       └── security.tsx       # "/settings/security"
│
├── modules/                    # Feature Modules
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── SocialButtons.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useSession.ts
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   └── tokenStorage.ts
│   │   ├── stores/
│   │   │   └── authStore.ts
│   │   └── types/
│   │       └── auth.types.ts
│   ├── profile/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   └── chat/
│       ├── components/
│       ├── hooks/
│       └── services/
│
├── shared/                     # Shared Resources
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # Basic UI elements
│   │   └── layout/           # Layout components
│   ├── services/             # Cross-cutting services
│   │   ├── api/             # API client setup
│   │   ├── i18n/            # Internationalization
│   │   └── theme/           # Theming system
│   ├── hooks/               # Shared custom hooks
│   └── utils/               # Utility functions
│
├── assets/                   # Images, fonts, etc.
├── constants/               # App-wide constants
└── types/                   # Global TypeScript types
```

### Key Organizational Principles

#### 1. Separation of Concerns
- **app/** directory: Pure navigation/routing (screens only)
- **modules/** directory: Business logic and feature implementation
- **shared/** directory: Cross-cutting concerns and utilities

#### 2. Feature Module Anatomy
Each feature module contains:
```
feature/
├── components/      # Feature-specific UI components
├── hooks/          # Feature-specific React hooks
├── services/       # API calls and business logic
├── stores/         # State management (Zustand/Redux)
├── types/          # TypeScript interfaces
└── utils/          # Feature-specific utilities
```

#### 3. Grouped Routes Pattern
Use parentheses for logical grouping without affecting URLs:
```
app/
├── (public)/       # Public routes (no auth required)
├── (authenticated)/ # Protected routes
└── (admin)/        # Admin-only routes
```

### Examples & Evidence

#### Example 1: Authentication Feature Module

```typescript
// modules/auth/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      signIn: async (credentials) => {
        const { user, token } = await authService.login(credentials);
        set({ user, token, isAuthenticated: true });
      },

      signOut: async () => {
        await authService.logout();
        set({ user: null, token: null, isAuthenticated: false });
      },

      checkAuth: async () => {
        const token = get().token;
        if (token) {
          const user = await authService.validateToken(token);
          set({ user, isAuthenticated: !!user });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);
```

```typescript
// app/_layout.tsx - Root layout with auth protection
import { Redirect, Stack } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '@/modules/auth/stores/authStore';

export default function RootLayout() {
  const { checkAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <Stack>
      <Stack.Screen
        name="(authenticated)"
        options={{ headerShown: false }}
        redirect={!isAuthenticated}
      />
      <Stack.Screen
        name="(public)"
        options={{ headerShown: false }}
        redirect={isAuthenticated}
      />
    </Stack>
  );
}
```

#### Example 2: Shared i18n Service

```typescript
// shared/services/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translation files
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';

const LANGUAGE_KEY = '@app:language';

// Initialize i18n
export const initI18n = async () => {
  // Get saved language or device language
  const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
  const deviceLanguage = Localization.getLocales()[0].languageCode;

  await i18n
    .use(initReactI18next)
    .init({
      resources: { en, es, fr },
      lng: savedLanguage || deviceLanguage || 'en',
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
    });
};

export const changeLanguage = async (language: string) => {
  await AsyncStorage.setItem(LANGUAGE_KEY, language);
  await i18n.changeLanguage(language);
};
```

#### Example 3: Feature-Based Testing Structure

```typescript
// modules/profile/__tests__/ProfileService.test.ts
import { profileService } from '../services/profileService';
import { mockApi } from '@/shared/testing/mockApi';

describe('ProfileService', () => {
  beforeEach(() => {
    mockApi.reset();
  });

  it('should fetch user profile', async () => {
    const mockProfile = { id: '1', name: 'John Doe', email: 'john@example.com' };
    mockApi.onGet('/profile/1').reply(200, mockProfile);

    const profile = await profileService.getProfile('1');
    expect(profile).toEqual(mockProfile);
  });

  it('should update profile', async () => {
    const updates = { name: 'Jane Doe' };
    mockApi.onPatch('/profile/1').reply(200, { ...updates, id: '1' });

    const updated = await profileService.updateProfile('1', updates);
    expect(updated.name).toBe('Jane Doe');
  });
});
```

### Comparative Analysis

| Aspect | Feature-Based | Layer-Based | Domain-Driven |
|--------|--------------|-------------|---------------|
| **File Organization** | By business feature | By technical layer | By business domain |
| **Code Discoverability** | High - features are obvious | Low - logic scattered | High - domains clear |
| **Module Coupling** | Low - features independent | High - layers depend on each other | Low - domains isolated |
| **Scalability** | Excellent - add features easily | Poor - layers grow unwieldy | Excellent - domains scale |
| **Team Collaboration** | Easy - teams own features | Hard - conflicts in shared layers | Easy - teams own domains |
| **Testing** | Simple - test per feature | Complex - mock many layers | Simple - test per domain |
| **Refactoring** | Low risk - isolated changes | High risk - affects entire layer | Low risk - domain boundaries |
| **Code Reuse** | Moderate via shared/ | High but creates coupling | Moderate via shared kernel |
| **Initial Setup** | More structure upfront | Simple to start | Most complex setup |
| **Best For** | Most apps, especially large | Small, simple apps | Enterprise, complex domains |

## Multiple Perspectives

### Mainstream View

The React Native community has largely embraced feature-based organization, especially with Expo Router's file-based routing making it natural. Major companies like Meta, Discord, and Shopify use this pattern successfully in production apps serving millions of users.

**Supporting Evidence**:
- 75% of SDK 52+ Expo projects use the New Architecture (April 2025)
- Expo Router is now the official RN framework recommendation
- Instagram achieves 85-99% code sharing between platforms with this approach

### Alternative Approaches

#### 1. **Micro-Frontend Architecture**
Some teams split features into completely independent apps/packages:
- Each feature is a separate npm package
- Features communicate via events/contracts
- Enables independent deployment
- Higher complexity but maximum isolation

#### 2. **Monorepo with Workspaces**
Large teams may use monorepo tools (Nx, Turborepo):
- Features as separate workspace packages
- Shared libraries in common packages
- Better dependency management
- Requires more tooling setup

#### 3. **Hybrid Approach**
Combine feature-based with strategic layers:
- Core features use feature-based organization
- Shared functionality uses layer-based
- Gradual migration path from legacy codebases

### Critical Analysis

**Strengths**:
- Clear feature boundaries improve maintainability
- Parallel development without conflicts
- Easy to understand app functionality from structure
- Natural fit with Expo Router's file-based routing
- Supports gradual migration and refactoring

**Weaknesses**:
- Initial setup requires more planning
- Potential code duplication between features
- Cross-feature communication needs careful design
- Shared state management can be complex
- May be overkill for simple apps

**Assumptions**:
- Assumes features can be clearly separated
- Requires discipline to maintain boundaries
- Assumes team understanding of architecture

**Limitations**:
- Not ideal for highly interconnected features
- Shared components may not fit cleanly
- Performance overhead from module boundaries
- Learning curve for developers new to pattern

## Practical Applications

### Use Cases

1. **E-Commerce App**:
   - Features: auth, catalog, cart, checkout, orders, profile
   - Each feature has own screens, components, and API calls
   - Shared: payment processing, analytics, design system

2. **Social Media App**:
   - Features: feed, messaging, stories, profile, settings
   - Independent feature teams can work in parallel
   - Shared: media upload, real-time sync, notifications

3. **Enterprise App**:
   - Features: dashboard, reports, admin, workflows
   - Different teams own different business domains
   - Shared: authentication, authorization, data sync

### Best Practices

**DO**:
- **Start with clear feature boundaries**
  - Define what belongs in each module upfront
  - Document module responsibilities

- **Use TypeScript for type safety**
  - Define clear interfaces between modules
  - Export types from feature modules

- **Implement proper state management**
  - Use Zustand or Redux Toolkit for complex state
  - Keep feature state isolated when possible

- **Create a shared design system**
  - Consistent UI components across features
  - Theme provider at root level

**DON'T**:
- **Don't create circular dependencies**
  - Features should not import from each other
  - Use events or shared services for communication

- **Don't over-engineer small apps**
  - Start simple, refactor as needed
  - Not every app needs full feature isolation

- **Don't neglect cross-cutting concerns**
  - Plan for auth, i18n, theming upfront
  - These affect all features

### Implementation Guide

1. **Project Setup**
   ```bash
   npx create-expo-app my-app --template expo-template-blank-typescript
   npx expo install expo-router
   ```

2. **Configure Expo Router**
   ```json
   // app.json
   {
     "expo": {
       "scheme": "myapp",
       "plugins": ["expo-router"]
     }
   }
   ```

3. **Create Feature Structure**
   ```bash
   mkdir -p app modules shared
   mkdir -p modules/{auth,profile,chat}/{components,hooks,services,stores}
   mkdir -p shared/{components,services,hooks,utils}
   ```

4. **Setup State Management**
   ```bash
   npm install zustand
   npm install @tanstack/react-query  # For server state
   ```

5. **Configure Testing**
   ```bash
   npm install --save-dev jest jest-expo @testing-library/react-native
   npm install --save-dev maestro  # For E2E tests
   ```

6. **Success Metrics**
   - Feature development time reduction
   - Decreased merge conflicts
   - Improved test coverage per feature
   - Faster onboarding of new developers

## Synthesis & Insights

### Key Patterns

1. **Module Federation**: Features act as mini-applications within the main app
2. **Dependency Inversion**: Features depend on abstractions, not concrete implementations
3. **Event-Driven Communication**: Features communicate via events rather than direct calls
4. **Shared Kernel**: Common functionality extracted to shared modules
5. **Progressive Enhancement**: Start simple, add complexity as needed

### Connections

- **Microservices Architecture**: Feature modules mirror microservice boundaries
- **Domain-Driven Design**: Features align with business domains
- **Component-Driven Development**: Each feature has its own component library
- **DevOps Practices**: Feature flags enable independent deployment

### Future Directions

#### Near-term (2025)
- **Server Components**: React Server Components in Expo Router
- **API Routes**: Full-stack capabilities in Expo apps
- **Bundle Splitting**: Native support for code splitting by feature
- **New Architecture**: Complete migration from legacy architecture

#### Long-term (2026+)
- **AI-Assisted Architecture**: Tools to suggest optimal feature boundaries
- **Automatic Code Splitting**: Smart bundling based on usage patterns
- **Cross-Platform Features**: Share features between mobile and web
- **Edge Computing**: Features deployed to edge locations

#### Research Opportunities
- Optimal feature granularity metrics
- Automated dependency analysis tools
- Performance impact of feature boundaries
- Cross-feature state synchronization patterns

## Knowledge Gaps & Uncertainties

### What Remains Unknown
- Optimal feature size for different app types
- Best practices for cross-feature transactions
- Performance overhead in production at scale
- Migration costs for large legacy codebases

### Conflicting Evidence
- Some teams report success with layer-based organization for simple apps
- Debate over whether UI components belong in features or shared
- Disagreement on state management approach (local vs global)

### Areas Needing Research
- Quantitative metrics for architecture effectiveness
- Automated tools for enforcing module boundaries
- Patterns for gradual migration from monolithic apps
- Impact on app performance and bundle size

### Alternative Interpretations
- Feature-based may be a trend that cycles back to layers
- Hybrid approaches may prove more practical
- The "best" architecture depends entirely on team and project context

## Resources & References

### Primary Sources
- [Expo Router Documentation](https://docs.expo.dev/router/)
- [React Native New Architecture Guide](https://reactnative.dev/docs/new-architecture-intro)
- [Zustand State Management](https://github.com/pmndrs/zustand)

### Authoritative References
- [Feature-Based React Architecture by Robin Wieruch](https://www.robinwieruch.de/react-feature-architecture/)
- [Expo Blog: Building Scalable Apps](https://expo.dev/blog)
- [React Native at Shopify](https://shopify.engineering/react-native-new-architecture)

### Further Reading
- "Modularizing React Applications with Established UI Patterns" - Martin Fowler
- "Domain-Driven Design in React Native" - Various authors
- "Micro Frontends in React Native" - Community discussions

### Communities and Experts
- [Expo Discord Community](https://chat.expo.dev)
- [React Native Community](https://reactnative.dev/community)
- [Callstack (React Native experts)](https://www.callstack.com)
- Evan Bacon (Expo Router creator)
- Software Mansion (React Native core contributors)

## Metadata
- Research date: 2025-09-21 11:30:00
- Confidence levels:
  - High: Current Expo Router capabilities and patterns
  - Medium: Performance implications at scale
  - Low: Future roadmap beyond 2026
- Version: Based on Expo SDK 54 (beta) and React Native 0.79+
- Updates: Check Expo Changelog for latest Router updates