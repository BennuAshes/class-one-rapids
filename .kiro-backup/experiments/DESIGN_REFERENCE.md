# Design Reference: HTML to React Native Implementation Guide

## Overview

This document provides a comprehensive analysis of the HTML/CSS designs in `attribute-screen.html` and `skill-screen.html` and serves as the authoritative reference for implementing these designs in React Native for task #2 and related character creation screens.

## Visual Design System

### Color Palette

```typescript
// Primary Colors
const colors = {
  // Backgrounds
  backgroundPrimary: "#1a1a2e", // Main dark blue
  backgroundSecondary: "#0a0a0f", // Darker gradient end
  backgroundPanel: "#2a2a3e", // Panel backgrounds

  // Gold Theme
  goldPrimary: "#d4af37", // Main UI gold
  goldAccent: "#ffd700", // Highlights & active states
  goldSecondary: "#8b7355", // Borders & inactive elements

  // Text Colors
  textPrimary: "#d4af37", // Main text
  textSecondary: "#8b7355", // Secondary text
  textHighlight: "#ffd700", // Active/highlighted text
  textMuted: "#a0a0a0", // Muted text

  // Interactive Elements
  success: "#00ff00", // Up arrows, positive actions
  panelOverlay: "rgba(0, 0, 0, 0.5)", // Semi-transparent overlays
  hoverOverlay: "rgba(212, 175, 55, 0.1)", // Hover states
  selectedOverlay: "rgba(212, 175, 55, 0.2)", // Selected states
};
```

### Typography System

```typescript
// Font Families (React Native equivalents)
const fonts = {
  // Headers & Titles (Cinzel equivalent)
  heading: {
    fontFamily: Platform.select({
      ios: "Georgia-Bold",
      android: "serif",
      web: "Cinzel, Georgia, serif",
    }),
    fontWeight: "600",
  },

  // Body Text (Crimson Text equivalent)
  body: {
    fontFamily: Platform.select({
      ios: "Georgia",
      android: "serif",
      web: "Crimson Text, Georgia, serif",
    }),
    fontWeight: "400",
  },

  // UI Elements
  ui: {
    fontFamily: Platform.select({
      ios: "System",
      android: "Roboto",
      web: "system-ui",
    }),
  },
};

// Font Sizes
const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};
```

## Layout Analysis

### Attribute Screen Structure

```
┌─────────────────────────────────────────────────────────┐
│ Top Navigation (Logo + Tabs)                           │
├─────────────────────────────────────────────────────────┤
│ Info Banner                                             │
├─────────────────────────────────────────────────────────┤
│ Main Content                                            │
│ ┌─────────────────┐ ┌─────────────────────────────────┐ │
│ │ Left Panel      │ │ Right Panel                     │ │
│ │ - Professions   │ │ - Attribute Header              │ │
│ │ - Custom Input  │ │ - Attribute Sliders             │ │
│ │                 │ │ - Stats Display                 │ │
│ └─────────────────┘ └─────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ Bottom Navigation (Arrows + Buttons)                   │
└─────────────────────────────────────────────────────────┘
```

### Skill Screen Structure

```
┌─────────────────────────────────────────────────────────┐
│ Top Navigation (Logo + Tabs)                           │
├─────────────────────────────────────────────────────────┤
│ Skill Credits Header                                    │
├─────────────────────────────────────────────────────────┤
│ Main Content                                            │
│ ┌─────────────────────────────────┐ ┌─────────────────┐ │
│ │ Left Panel                      │ │ Right Panel     │ │
│ │ - Skills Container              │ │ - Instructions  │ │
│ │   - Specialized Skills          │ │ - Diamond Icon  │ │
│ │   - Trained Skills              │ │ - Help Text     │ │
│ │   - Untrained Skills            │ │                 │ │
│ │ - Empty Box                     │ │                 │ │
│ └─────────────────────────────────┘ └─────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ Bottom Navigation (Arrows + Buttons)                   │
└─────────────────────────────────────────────────────────┘
```

## Component Implementation Guide

### 1. Navigation Components

#### Top Navigation

```typescript
// Key Features:
// - Circular logo with "C"
// - Horizontal tab list with active state
// - Golden decorative border with pattern
// - Responsive tab spacing

const TopNavigation = () => {
  // Implementation notes:
  // - Use ScrollView for tabs on mobile
  // - Active tab: goldAccent color + text shadow effect
  // - Logo: circular border with gradient background
  // - Border pattern: use repeating linear gradient or custom component
};
```

#### Bottom Navigation

```typescript
// Key Features:
// - Left: Arrow navigation buttons
// - Right: Action buttons (Help, Exit, Random)
// - Consistent styling with top nav

const BottomNavigation = () => {
  // Implementation notes:
  // - Arrow buttons: square with diamond shape or chevron icons
  // - Action buttons: transparent background, gold border
  // - Hover/press states: background overlay + border color change
};
```

### 2. Panel Components

#### Left Panel (Attribute Screen)

```typescript
// Profession List Component
const ProfessionList = () => {
  // Features:
  // - Selectable profession items
  // - Circular icons (filled/empty states)
  // - Hover and selected states
  // - Custom profession selected by default
};

// Custom Input Component
const CustomInput = () => {
  // Features:
  // - Multi-line text input
  // - Placeholder text
  // - Consistent panel styling
};
```

#### Right Panel (Attribute Screen)

```typescript
// Attribute Slider Component
const AttributeSlider = ({
  label,
  value,
  onChange,
  icon,
}: AttributeSliderProps) => {
  // Features:
  // - Custom slider with diamond-shaped handle
  // - Gradient fill bar
  // - Icon + label on left
  // - Numeric value on right
  // - Touch/drag interaction
};

// Stats Display Component
const StatsDisplay = () => {
  // Features:
  // - Three columns: Health, Stamina, Mana
  // - Calculated values based on attributes
  // - Centered layout with labels
};
```

### 3. Skill Components

#### Skill Row Component

```typescript
const SkillRow = ({
  name,
  baseValue,
  level,
  credits,
  isSpecialized,
  onAdjust,
}: SkillRowProps) => {
  // Features:
  // - Grid layout: Icon | Name | Base | Level | Up Arrow | Down Arrow | Credits
  // - Diamond icon (filled for specialized, empty for untrained)
  // - Interactive up/down arrows
  // - Disabled states for arrows
  // - Hover effects
};
```

#### Skill Category Component

```typescript
const SkillCategory = ({
  title,
  skills,
  onSkillAdjust,
}: SkillCategoryProps) => {
  // Features:
  // - Category header with gold accent
  // - List of skill rows
  // - Consistent spacing and styling
};
```

## React Native Specific Adaptations

### 1. Gradients

```typescript
// Use expo-linear-gradient for background gradients
import { LinearGradient } from "expo-linear-gradient";

const backgroundGradient = (
  <LinearGradient
    colors={["#1a1a2e", "#0a0a0f"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={StyleSheet.absoluteFillObject}
  />
);
```

### 2. Custom Slider Implementation

```typescript
// Since RN Slider is limited, implement custom slider
const CustomSlider = ({ value, onValueChange, style }) => {
  // Use PanGestureHandler from react-native-gesture-handler
  // Or implement with TouchableOpacity + onLayout for simpler version
  // Key features:
  // - Diamond-shaped handle (use transform: rotate(45deg) on square)
  // - Gradient fill bar
  // - Smooth animations with Animated API
};
```

### 3. Diamond Icons

```typescript
// Create diamond shapes using transform or SVG
const DiamondIcon = ({ filled, size = 20 }) => (
  <View
    style={[
      {
        width: size,
        height: size,
        backgroundColor: filled ? colors.goldPrimary : "transparent",
        borderWidth: filled ? 0 : 2,
        borderColor: colors.goldSecondary,
        transform: [{ rotate: "45deg" }],
      },
    ]}
  />
);
```

### 4. Interactive Lists

```typescript
// Use FlatList or ScrollView with TouchableOpacity
const InteractiveList = ({ data, onItemPress, selectedId }) => (
  <FlatList
    data={data}
    renderItem={({ item }) => (
      <TouchableOpacity
        style={[styles.listItem, item.id === selectedId && styles.selectedItem]}
        onPress={() => onItemPress(item)}
        activeOpacity={0.8}
      >
        {/* Item content */}
      </TouchableOpacity>
    )}
  />
);
```

### 5. Responsive Layout

```typescript
// Use Dimensions API and responsive design patterns
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
const isTablet = width > 768;
const isMobile = width <= 768;

// Adjust layouts based on screen size
const styles = StyleSheet.create({
  mainContent: {
    flexDirection: isMobile ? "column" : "row",
    padding: isMobile ? 10 : 20,
  },
  leftPanel: {
    width: isMobile ? "100%" : 300,
    marginBottom: isMobile ? 20 : 0,
  },
});
```

## Animation Guidelines

### 1. Hover Effects (Mobile: Press States)

```typescript
// Use Animated API for smooth transitions
const AnimatedTouchable = ({ children, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        activeOpacity={1}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};
```

### 2. Slider Animations

```typescript
// Smooth value changes with spring animations
const animateSliderValue = (toValue: number) => {
  Animated.spring(sliderValue, {
    toValue,
    tension: 100,
    friction: 8,
    useNativeDriver: false,
  }).start();
};
```

## State Management Integration

### Legend-state Integration

```typescript
// Character state structure
const characterState = observable({
  attributes: {
    strength: 10,
    endurance: 10,
    coordination: 10,
    quickness: 100,
    focus: 100,
    self: 100,
  },
  profession: "Custom",
  availableCredits: 270,
  skills: {
    specialized: [],
    trained: [],
    untrained: [],
  },
  skillCredits: 52,
});

// Reactive components using observer
const AttributeScreen = observer(() => {
  const attributes = characterState.attributes.get();
  const credits = characterState.availableCredits.get();

  // Component implementation
});
```

## Performance Considerations

### 1. List Optimization

- Use `FlatList` with `getItemLayout` for large skill lists
- Implement `keyExtractor` for efficient re-renders
- Use `removeClippedSubviews` for long lists

### 2. Animation Performance

- Use `useNativeDriver: true` when possible
- Avoid animating layout properties on large lists
- Use `InteractionManager` for complex animations

### 3. Memory Management

- Implement proper cleanup in useEffect hooks
- Use `useMemo` and `useCallback` for expensive calculations
- Optimize image assets and use appropriate formats

## Accessibility Guidelines

### 1. Screen Reader Support

```typescript
// Add accessibility props to interactive elements
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Increase Strength attribute"
  accessibilityRole="button"
  accessibilityHint="Increases strength by 1 point"
>
  <ArrowUpIcon />
</TouchableOpacity>
```

### 2. Color Contrast

- Ensure gold text meets WCAG contrast requirements against dark backgrounds
- Provide alternative indicators beyond color for important states

### 3. Touch Targets

- Minimum 44pt touch targets for interactive elements
- Adequate spacing between adjacent interactive elements

## Testing Strategy

### 1. Component Testing

- Test slider value changes and constraints
- Verify profession selection updates attributes correctly
- Test skill credit calculations

### 2. Integration Testing

- Test state persistence with Legend-state
- Verify navigation between screens
- Test responsive layout on different screen sizes

### 3. Visual Testing

- Compare rendered components with HTML reference designs
- Test animations and transitions
- Verify color accuracy and consistency

## Implementation Priority

### Phase 1: Core Components

1. Color system and typography setup
2. Basic layout structure (top/bottom nav, panels)
3. Simple interactive elements (buttons, touchables)

### Phase 2: Complex Components

1. Custom slider implementation
2. Skill list with interactive arrows
3. Profession selection with state management

### Phase 3: Polish & Optimization

1. Animations and transitions
2. Responsive design refinements
3. Performance optimizations
4. Accessibility improvements

## Reference Files

- **Visual Design**: `experiments/attribute-screen.html`
- **Skill Interface**: `experiments/skill-screen.html`
- **Implementation Tasks**: `.kiro/specs/expo-app-bootstrap/tasks.md`
- **Requirements**: `.kiro/specs/expo-app-bootstrap/requirements.md`
- **Technical Design**: `.kiro/specs/expo-app-bootstrap/design.md`

---

_This document should be referenced for all character creation screen implementations to ensure visual consistency and proper React Native adaptation of the HTML/CSS designs._
