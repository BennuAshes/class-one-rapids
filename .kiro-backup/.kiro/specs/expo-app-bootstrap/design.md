# Design Document

## Overview

The Expo app bootstrap will create a foundation for the Asheron's Call Idler game using modern React Native development practices. The design focuses on establishing a scalable architecture that supports cross-platform development while maintaining optimal performance for a tap-to-attack idle game that delivers constant visual feedback, explosive number scaling, and fun progression mechanics.

**Visual Design Reference**: All UI implementations should follow the comprehensive design system documented in `experiments/DESIGN_REFERENCE.md`, which provides detailed guidance for translating the HTML/CSS designs in `experiments/attribute-screen.html` and `experiments/skill-screen.html` into React Native components.

## Architecture

### Project Structure

The application will follow a vertical slicing architecture where each game feature is self-contained:

```
src/
├── app/                    # Expo Router app directory
├── features/               # Feature-based vertical slices
├── shared/                 # Shared utilities and components
└── data/                   # Static game data
```

### Technology Stack Integration

- **Expo SDK**: Latest version with web support enabled
- **TypeScript**: Strict configuration for type safety
- **Legend-state**: Beta version for reactive state management
- **MMKV**: High-performance storage for game data persistence
- **Expo Router**: File-based routing system

## Components and Interfaces

### Core Application Structure

#### App Entry Point (`src/app/_layout.tsx`)

- Root layout component with navigation setup
- Global providers for state management and storage
- Platform-specific optimizations

#### Navigation Structure (`src/app/(tabs)/`)

- Tab-based navigation for main game screens
- Combat screen as primary tab with tap-to-attack interface
- Character sheet tab for progression and customization
- Consistent navigation patterns across platforms

#### Combat Components (`src/features/combat/`)

- TapCombatScreen with creature display and tap handling
- DamageNumberDisplay with animated floating numbers
- ComboCounter with visual multiplier feedback
- CombatEngine for damage calculation and auto-attack

#### Shared Components (`src/shared/`)

- NumberFormatter for large number display (K, M, B, T notation)
- ProgressBar with pulsing animations for level progression
- CelebrationEffects for milestone achievements
- ScreenShake utility for impact feedback
- ParticleSystem for visual explosions

### Configuration Files

#### Expo Configuration (`app.json`)

```json
{
  "expo": {
    "name": "Asheron's Call Idler",
    "slug": "asherons-call-idler",
    "platforms": ["ios", "android", "web"],
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "web": {
      "favicon": "./assets/favicon.png",
      "bundler": "metro"
    }
  }
}
```

#### TypeScript Configuration (`tsconfig.json`)

- Strict type checking enabled
- Path mapping for clean imports
- React Native and Expo type definitions

#### Metro Configuration (`metro.config.js`)

- Web support enabled
- Optimized bundling for cross-platform assets
- Source map support for debugging

## Data Models

### Initial State Structure

#### Game State Interface

```typescript
interface GameState {
  player: PlayerState;
  combat: CombatState;
  settings: AppSettings;
  lastSaved: number;
}

interface PlayerState {
  name: string;
  level: number;
  experience: number;
  gold: number;
  attributes: {
    strength: number;
    endurance: number;
    coordination: number;
    quickness: number;
    focus: number;
    self: number;
  };
}

interface CombatState {
  currentCreature: Creature | null;
  tapDamage: number;
  comboCounter: number;
  comboMultiplier: number;
  isAutoAttacking: boolean;
}

interface AppSettings {
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  visualEffectsEnabled: boolean;
  theme: "light" | "dark";
}
```

### Combat System Architecture

#### Tap-to-Attack Engine

```typescript
interface TapCombatEngine {
  calculateTapDamage(
    baseDamage: number,
    attributes: Attributes,
    comboMultiplier: number
  ): number;
  updateComboCounter(lastTapTime: number): number;
  triggerVisualEffects(damageAmount: number, isCritical: boolean): void;
  processAutoAttack(deltaTime: number): number;
}
```

#### Visual Feedback System

- **Damage Numbers**: Animated floating text with size scaling based on damage magnitude
- **Screen Shake**: Intensity based on damage dealt and critical hit status
- **Particle Effects**: Explosion particles for critical hits and large damage
- **Combo Indicators**: Visual multiplier display that grows with consecutive taps

#### Number Scaling Formulas

```typescript
const EXPONENTIAL_BASE = 1.8;
const LEVEL_CURVE_BASE = 2.0;

function calculateDamage(level: number, strength: number): number {
  const baseDamage = Math.pow(EXPONENTIAL_BASE, level) * 10;
  const strengthMultiplier = 1 + strength * 0.1; // +10% per point
  return baseDamage * strengthMultiplier;
}

function formatLargeNumber(value: number): string {
  if (value < 1000) return value.toString();
  if (value < 1000000) return `${(value / 1000).toFixed(1)}K`;
  if (value < 1000000000) return `${(value / 1000000).toFixed(1)}M`;
  return `${(value / 1000000000).toFixed(1)}B`;
}
```

### Storage Strategy

- **MMKV**: Primary storage for game state and settings
- **Legend-state**: In-memory reactive state with MMKV persistence
- **Automatic saving**: Critical game state changes trigger immediate persistence
- **Combat state**: Frequent updates optimized for performance

## Error Handling

### Development Error Boundaries

- React error boundaries for graceful failure handling
- Development-only error overlays for debugging
- Production error reporting setup (placeholder)

### Platform-Specific Error Handling

- Web: Browser compatibility checks
- Mobile: Memory and battery optimization warnings
- Network: Offline state management

### Storage Error Recovery

- MMKV corruption detection and recovery
- Backup state management
- Data migration strategies for future updates

## Testing Strategy

### Unit Testing Setup

- Jest configuration for React Native
- React Native Testing Library for component testing
- Mock implementations for native modules

### Integration Testing

- Cross-platform navigation testing
- State management integration tests
- Storage persistence verification

### Platform Testing

- iOS simulator testing setup
- Android emulator configuration
- Web browser testing in development

### Test Structure

```
__tests__/
├── components/           # Component unit tests
├── hooks/               # Custom hook tests
├── utils/               # Utility function tests
└── integration/         # Integration tests
```

## Performance Considerations

### Bundle Optimization

- Metro bundler configuration for optimal splitting
- Tree shaking for unused code elimination
- Asset optimization for different screen densities

### Memory Management

- Efficient Legend-state usage patterns
- MMKV storage size monitoring
- Component lifecycle optimization

### Battery Optimization

- Background task management for idle calculations
- Efficient timer usage for game loops
- Platform-specific power management

## Development Workflow

### Scripts Configuration

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "test": "jest",
    "lint": "eslint . --ext .ts,.tsx",
    "type-check": "tsc --noEmit"
  }
}
```

### Code Quality Tools

- ESLint with TypeScript and React Native rules
- Prettier for consistent code formatting
- Husky for pre-commit hooks (future enhancement)

### Development Environment

- Expo Dev Client for enhanced debugging
- React Native Debugger integration
- Hot reloading for rapid development
