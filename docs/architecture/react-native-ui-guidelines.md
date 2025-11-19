# React Native UI Guidelines

*Behavioral guidelines and best practices for React Native UI components in Expo SDK 54 projects*

## Purpose
This guide defines how to select and use React Native UI components, focusing on platform compatibility, accessibility, and avoiding deprecated APIs.

---

## Safe Area Handling

### The Problem: Deprecated SafeAreaView

React Native's built-in `SafeAreaView` is **deprecated** and will be removed:

```typescript
// ❌ DEPRECATED - Triggers console warning
import { SafeAreaView } from 'react-native';

export function MyScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Content */}
    </SafeAreaView>
  );
}

// Warning: SafeAreaView has been deprecated and will be removed in a future release.
// Please use 'react-native-safe-area-context' instead.
```

### The Solution: react-native-safe-area-context

Use the community package `react-native-safe-area-context` instead.

#### Installation

```bash
npx expo install react-native-safe-area-context
```

**Note**: This package is already listed in the Expo SDK 54 guide as a recommended dependency for navigation.

#### Setup: App-Level Provider

Wrap your entire app with `SafeAreaProvider` at the root level:

```typescript
// App.tsx
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      {/* Your app content - screens, navigation, etc. */}
    </SafeAreaProvider>
  );
}
```

**CRITICAL**: This setup is required ONCE at the app root. Do not wrap individual screens with `SafeAreaProvider`.

#### Usage: Screen-Level Components

Use `SafeAreaView` from the context package in your screens:

```typescript
// MyScreen.tsx
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';

export function MyScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View>
        <Text>Content appears below notch/status bar</Text>
      </View>
    </SafeAreaView>
  );
}
```

#### Edge Configuration

Control which edges get safe area insets:

```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

// Only apply safe area to top and bottom (not left/right)
<SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
  {/* Content */}
</SafeAreaView>

// No safe area on bottom (useful for custom tab bars)
<SafeAreaView edges={['top']} style={{ flex: 1 }}>
  {/* Content */}
</SafeAreaView>
```

Available edges: `'top' | 'bottom' | 'left' | 'right'`

#### Using Safe Area Insets Directly

For custom layouts that need inset values:

```typescript
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet } from 'react-native';

export function CustomHeader() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <Text>Custom Header</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
});
```

**Inset Properties**:
- `insets.top` - Top safe area (notch, status bar)
- `insets.bottom` - Bottom safe area (home indicator)
- `insets.left` - Left safe area (horizontal orientation)
- `insets.right` - Right safe area (horizontal orientation)

### When to Use Safe Areas

#### ✅ DO Use SafeAreaView For:
- **Full-screen views** - Main app screens
- **Modal screens** - Overlays and popups
- **Custom navigation** - When not using React Navigation
- **Top-level containers** - Screen root components

#### ❌ DON'T Use SafeAreaView For:
- **Nested components** - Only use at screen level
- **Components inside scrolling containers** - Use padding instead
- **Every component** - Only screen-level containers
- **When using React Navigation** - Navigator handles safe areas automatically

#### When React Navigation Handles It

If using `@react-navigation/native`, safe areas are handled automatically for stack screens:

```typescript
// No SafeAreaView needed - React Navigation handles it
export function MyScreen() {
  return (
    <View style={{ flex: 1 }}>
      <Text>Content</Text>
    </View>
  );
}
```

**Exception**: Still use SafeAreaView for:
- Modal screens
- Custom headers
- Screens with `headerShown: false`

---

## Platform-Specific UI Components

### Choosing the Right Component

React Native provides platform-agnostic components, but some have platform-specific alternatives.

#### Pressable vs TouchableOpacity

**Always prefer `Pressable`** (modern, platform-agnostic):

```typescript
// ✅ PREFERRED - Modern approach
import { Pressable, Text, StyleSheet } from 'react-native';

<Pressable
  onPress={handlePress}
  style={({ pressed }) => [
    styles.button,
    pressed && styles.buttonPressed
  ]}
>
  <Text>Press me</Text>
</Pressable>

const styles = StyleSheet.create({
  button: {
    padding: 16,
    backgroundColor: '#007AFF',
  },
  buttonPressed: {
    opacity: 0.7,
  },
});
```

```typescript
// ❌ AVOID - Older API, less flexible
import { TouchableOpacity } from 'react-native';

<TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
  <Text>Press me</Text>
</TouchableOpacity>
```

**Why Pressable**:
- Supports advanced press states (pressed, hovered)
- Better TypeScript support
- More flexible styling API
- Works across web, iOS, and Android

#### Platform-Specific Components

Some components only work on specific platforms:

```typescript
import { Platform, StatusBar } from 'react-native';

// StatusBar has different APIs per platform
if (Platform.OS === 'ios') {
  StatusBar.setBarStyle('dark-content');
} else if (Platform.OS === 'android') {
  StatusBar.setBackgroundColor('#FFFFFF');
}
```

**Platform-Specific Files**:
```
components/
├── Button.tsx          # Shared logic
├── Button.ios.tsx      # iOS-specific implementation
├── Button.android.tsx  # Android-specific implementation
└── Button.web.tsx      # Web-specific implementation
```

React Native automatically loads the correct file for each platform.

---

## Accessibility Requirements

### Minimum Touch Target Size

**WCAG Guideline**: All interactive elements must be **at least 44x44 points**.

```typescript
// ✅ CORRECT - Meets accessibility standards
const styles = StyleSheet.create({
  button: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

```typescript
// ❌ WRONG - Too small for touch
const styles = StyleSheet.create({
  button: {
    width: 20,  // Too small!
    height: 20,
  },
});
```

**For small icons**, add invisible padding:

```typescript
<Pressable
  style={{ minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
>
  <Image source={smallIcon} style={{ width: 24, height: 24 }} />
</Pressable>
```

### Screen Reader Support

Always provide accessibility attributes:

```typescript
<Pressable
  accessibilityRole="button"
  accessibilityLabel="Add to cart"
  accessibilityHint="Double tap to add this item to your shopping cart"
  onPress={handleAddToCart}
>
  <Text>Add</Text>
</Pressable>
```

**Required Attributes**:
- `accessibilityRole` - Semantic role ('button', 'text', 'image', 'header', etc.)
- `accessibilityLabel` - Brief description of element
- `accessibilityHint` - Optional hint about what happens on interaction
- `accessibilityState` - Current state (disabled, selected, checked, etc.)

**For non-text interactive elements**:

```typescript
<Pressable
  accessibilityRole="button"
  accessibilityLabel="Close dialog"
  onPress={handleClose}
>
  <Image source={closeIcon} />
</Pressable>
```

### Color Contrast

**WCAG AA Standard**: Minimum contrast ratio of **4.5:1** for text.

```typescript
// ✅ GOOD - High contrast
const styles = StyleSheet.create({
  text: {
    color: '#000000',      // Black text
    backgroundColor: '#FFFFFF', // White background
    // Contrast ratio: 21:1
  },
});
```

```typescript
// ❌ BAD - Low contrast
const styles = StyleSheet.create({
  text: {
    color: '#CCCCCC',      // Light gray text
    backgroundColor: '#FFFFFF', // White background
    // Contrast ratio: 2.8:1 - Fails WCAG AA
  },
});
```

**Testing Contrast**:
- Use WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Target: 4.5:1 for normal text, 3:1 for large text (18pt+)

---

## Layout Components

### View vs ScrollView vs FlatList

#### Use `View` for:
- Static layouts
- Non-scrolling containers
- Flex layouts

```typescript
<View style={{ flex: 1, padding: 16 }}>
  <Text>Header</Text>
  <Text>Body</Text>
</View>
```

#### Use `ScrollView` for:
- Small lists (< 100 items)
- Mixed content (text + images + components)
- When you need scroll events

```typescript
<ScrollView style={{ flex: 1 }}>
  <Text>Long content...</Text>
  <Image source={...} />
  <CustomComponent />
</ScrollView>
```

⚠️ **Warning**: ScrollView renders all children at once. Don't use for large lists.

#### Use `FlatList` for:
- Large lists (100+ items)
- Uniform item structure
- Performance-critical scrolling

```typescript
<FlatList
  data={items}
  renderItem={({ item }) => <ItemComponent item={item} />}
  keyExtractor={item => item.id}
  // Performance optimizations
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={5}
/>
```

**Why FlatList**:
- Only renders visible items
- Recycles item components
- Better performance for long lists

---

## Modal and Overlay Patterns

### Modal Component

React Native provides a built-in `Modal` component:

```typescript
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function MyModal({ visible, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.modalContent}>
          <Text>Modal Content</Text>
          <Pressable onPress={onClose}>
            <Text>Close</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
```

**Modal Properties**:
- `animationType`: `'none' | 'slide' | 'fade'`
- `presentationStyle`: `'fullScreen' | 'pageSheet' | 'formSheet' | 'overFullScreen'`
- `onRequestClose`: Required for Android back button

**IMPORTANT**: Always use `SafeAreaView` inside modals to handle notches/home indicators.

### Overlay Patterns

For dialogs and alerts over existing content:

```typescript
<View style={{ flex: 1 }}>
  {/* Main content */}
  <MainScreen />

  {/* Overlay */}
  {showOverlay && (
    <View style={StyleSheet.absoluteFill}>
      <Pressable
        style={[StyleSheet.absoluteFill, styles.backdrop]}
        onPress={handleDismiss}
      />
      <View style={styles.dialog}>
        <Text>Dialog Content</Text>
      </View>
    </View>
  )}
</View>

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dialog: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -150 }, { translateY: -100 }],
    width: 300,
    height: 200,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
});
```

---

## Component Selection Decision Tree

Use this flowchart to choose the right component:

### Interactive Elements
```
Need user interaction?
├─ Yes → Is it a button?
│   ├─ Yes → Use Pressable
│   └─ No → Is it a text input?
│       ├─ Yes → Use TextInput
│       └─ No → Use Pressable with custom content
└─ No → Use View or Text
```

### Scrolling Containers
```
Need scrolling?
├─ Yes → How many items?
│   ├─ < 100 items → ScrollView
│   ├─ 100+ items → FlatList
│   └─ Sections/groups → SectionList
└─ No → View
```

### Screen Layout
```
Screen with notch/safe areas?
├─ Yes → Using React Navigation?
│   ├─ Yes → No SafeAreaView needed (unless modal/custom header)
│   └─ No → Use SafeAreaView from react-native-safe-area-context
└─ No → Use regular View
```

---

## Best Practices Summary

### DO ✅
- Use `SafeAreaView` from `react-native-safe-area-context`
- Wrap app root with `SafeAreaProvider`
- Use `Pressable` instead of `TouchableOpacity`
- Ensure 44x44pt minimum touch targets
- Provide accessibility attributes on all interactive elements
- Use `FlatList` for long lists
- Test on both iOS and Android

### DON'T ❌
- Don't use deprecated `SafeAreaView` from `react-native`
- Don't nest `SafeAreaView` components
- Don't wrap every component with safe area views
- Don't create touch targets smaller than 44x44pt
- Don't use `ScrollView` for large lists (100+ items)
- Don't forget `onRequestClose` for modals on Android
- Don't assume UI looks the same on iOS and Android without testing

---

## Testing UI Components

### Accessibility Testing

```typescript
import { render, screen } from '@testing-library/react-native';

test('has correct accessibility attributes', () => {
  render(<MyButton title="Submit" onPress={() => {}} />);

  const button = screen.getByRole('button');
  expect(button).toHaveAccessibilityValue({ text: 'Submit' });
  expect(button).toBeEnabled();
});
```

### Touch Target Testing

```typescript
test('has minimum touch target size', () => {
  const { getByRole } = render(<IconButton />);
  const button = getByRole('button');

  const style = button.props.style;
  expect(style.minWidth).toBeGreaterThanOrEqual(44);
  expect(style.minHeight).toBeGreaterThanOrEqual(44);
});
```

---

## Migration Checklist

When migrating from deprecated React Native components:

### SafeAreaView Migration

- [ ] Install `react-native-safe-area-context`
- [ ] Add `SafeAreaProvider` to App.tsx root
- [ ] Replace all `SafeAreaView` imports from `'react-native'` with `'react-native-safe-area-context'`
- [ ] Test on devices with notches (iPhone 14+, modern Android)
- [ ] Verify modals and overlays handle safe areas correctly

### TouchableOpacity → Pressable Migration

- [ ] Replace `TouchableOpacity` with `Pressable`
- [ ] Convert `activeOpacity` to style function: `style={({ pressed }) => [...]}`
- [ ] Update tests to use `userEvent.press()` instead of `fireEvent.press()`
- [ ] Test press states on all platforms

---

## References

- [React Native Safe Area Context](https://github.com/th3rdwave/react-native-safe-area-context)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Native Pressable API](https://reactnative.dev/docs/pressable)
- [Expo SDK 54 Startup Guide](./expo-sdk-54-startup-guide.md)
- [React Native Testing Library Guide](../research/react_native_testing_library_guide_20250918_184418.md)

---

*This guide should be consulted when designing UI components for Expo SDK 54 projects to ensure accessibility, platform compatibility, and avoidance of deprecated APIs.*
