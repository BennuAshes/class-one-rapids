/**
 * Jest Setup File
 * Global test configuration and mocks
 */

// Mock React Native Paper - avoid requireActual due to React 19 compatibility issues
const mockColors = {
  primary: '#6750A4',
  primaryContainer: '#EADDFF',
  secondary: '#625B71',
  secondaryContainer: '#E8DEF8',
  tertiary: '#7D5260',
  tertiaryContainer: '#FFD8E4',
  surface: '#FFFBFE',
  surfaceVariant: '#E7E0EC',
  surfaceDisabled: 'rgba(28, 27, 31, 0.12)',
  background: '#FFFBFE',
  error: '#B3261E',
  errorContainer: '#F9DEDC',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#21005E',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#1E192B',
  onTertiary: '#FFFFFF',
  onTertiaryContainer: '#370B1E',
  onSurface: '#1C1B1F',
  onSurfaceVariant: '#49454E',
  onSurfaceDisabled: 'rgba(28, 27, 31, 0.38)',
  onError: '#FFFFFF',
  onErrorContainer: '#370B1E',
  onBackground: '#1C1B1F',
  outline: '#79747E',
  outlineVariant: '#CAC4CF',
  inverseSurface: '#313033',
  inverseOnSurface: '#F4EFF4',
  inversePrimary: '#D0BCFF',
  shadow: '#000000',
  scrim: '#000000',
  backdrop: 'rgba(50, 47, 55, 0.4)',
  elevation: {
    level0: 'transparent',
    level1: '#F7F2FA',
    level2: '#F2EDF7',
    level3: '#ECE6F0',
    level4: '#E9E3EC',
    level5: '#E6E0E9',
  },
};

jest.mock('react-native-paper', () => {
  const React = require('react');
  const RN = require('react-native');

  // Create proper React components that render React Native primitives
  const MockProvider = ({ children }) => children;
  const MockPortal = ({ children }) => children;
  const MockText = ({ children, ...props }) =>
    React.createElement(RN.Text, props, children);
  const MockButton = ({ children, onPress, ...props }) =>
    React.createElement(RN.TouchableOpacity, { onPress, ...props },
      React.createElement(RN.Text, {}, children)
    );
  const MockSurface = ({ children, ...props }) =>
    React.createElement(RN.View, props, children);
  const MockIconButton = ({ icon, onPress, ...props }) =>
    React.createElement(RN.TouchableOpacity, { onPress, ...props },
      React.createElement(RN.Text, {}, icon)
    );
  const MockChip = ({ children, ...props }) =>
    React.createElement(RN.View, props,
      React.createElement(RN.Text, {}, children)
    );
  const MockBadge = ({ children, ...props }) =>
    React.createElement(RN.View, props,
      React.createElement(RN.Text, {}, children)
    );
  const MockActivityIndicator = (props) =>
    React.createElement(RN.ActivityIndicator, props);
  const MockCard = ({ children, ...props }) =>
    React.createElement(RN.View, props, children);

  // Card sub-components
  MockCard.Title = ({ title, subtitle, ...props }) =>
    React.createElement(RN.View, props,
      React.createElement(RN.Text, {}, title),
      subtitle && React.createElement(RN.Text, {}, subtitle)
    );
  MockCard.Content = ({ children, ...props }) =>
    React.createElement(RN.View, props, children);
  MockCard.Actions = ({ children, ...props }) =>
    React.createElement(RN.View, props, children);

  const MockTouchableRipple = ({ children, onPress, ...props }) =>
    React.createElement(RN.TouchableOpacity, { onPress, ...props }, children);

  // Create Appbar component and sub-components
  const MockAppbar = ({ children, ...props }) =>
    React.createElement(RN.View, props, children);
  MockAppbar.Header = ({ children, ...props }) =>
    React.createElement(RN.View, props, children);
  MockAppbar.Content = ({ title, subtitle, ...props }) =>
    React.createElement(RN.View, props,
      React.createElement(RN.Text, {}, title),
      subtitle && React.createElement(RN.Text, {}, subtitle)
    );
  MockAppbar.Action = ({ icon, onPress, ...props }) =>
    React.createElement(RN.TouchableOpacity, { onPress, ...props },
      React.createElement(RN.Text, {}, icon)
    );
  MockAppbar.BackAction = ({ onPress, ...props }) =>
    React.createElement(RN.TouchableOpacity, { onPress, ...props },
      React.createElement(RN.Text, {}, 'back')
    );

  return {
    Provider: MockProvider,
    PaperProvider: MockProvider, // Export both Provider and PaperProvider
    Portal: MockPortal,
    Button: MockButton,
    Card: MockCard,
    Text: MockText,
    Surface: MockSurface,
    Chip: MockChip,
    IconButton: MockIconButton,
    Badge: MockBadge,
    ActivityIndicator: MockActivityIndicator,
    TouchableRipple: MockTouchableRipple,
    Appbar: MockAppbar,
    configureFonts: (config) => config?.config || {
      regular: { fontFamily: 'Roboto', fontWeight: 'normal' },
      medium: { fontFamily: 'Roboto-Medium', fontWeight: 'normal' },
      light: { fontFamily: 'Roboto-Light', fontWeight: 'normal' },
      thin: { fontFamily: 'Roboto-Thin', fontWeight: 'normal' },
    },
  MD3LightTheme: {
    dark: false,
    roundness: 4,
    version: 3,
    isV3: true,
    colors: mockColors,
    fonts: {
      regular: { fontFamily: 'Roboto', fontWeight: 'normal' },
      medium: { fontFamily: 'Roboto-Medium', fontWeight: 'normal' },
      light: { fontFamily: 'Roboto-Light', fontWeight: 'normal' },
      thin: { fontFamily: 'Roboto-Thin', fontWeight: 'normal' },
    },
    animation: { scale: 1.0 },
  },
  MD3DarkTheme: {
    dark: true,
    roundness: 4,
    version: 3,
    isV3: true,
    colors: mockColors,
    fonts: {
      regular: { fontFamily: 'Roboto', fontWeight: 'normal' },
      medium: { fontFamily: 'Roboto-Medium', fontWeight: 'normal' },
      light: { fontFamily: 'Roboto-Light', fontWeight: 'normal' },
      thin: { fontFamily: 'Roboto-Thin', fontWeight: 'normal' },
    },
    animation: { scale: 1.0 },
  },
  DefaultTheme: {
    colors: mockColors,
  },
    useTheme: () => ({
      colors: mockColors,
    }),
  };
});

// Mock Expo modules
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      extra: {
        apiBaseUrl: 'http://localhost:8080',
      },
    },
  },
}));

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('notification-id')),
  setBadgeCountAsync: jest.fn(() => Promise.resolve()),
  dismissAllNotificationsAsync: jest.fn(() => Promise.resolve()),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  setNotificationChannelAsync: jest.fn(() => Promise.resolve()),
  AndroidNotificationPriority: {
    MIN: 'min',
    LOW: 'low',
    DEFAULT: 'default',
    HIGH: 'high',
    MAX: 'max',
  },
  AndroidImportance: {
    MIN: 1,
    LOW: 2,
    DEFAULT: 3,
    HIGH: 4,
    MAX: 5,
  },
}));

jest.mock('expo-device', () => ({
  isDevice: true,
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      setOptions: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
  };
});

// Mock vector icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

// Mock NativeLinkingManager for React Navigation
jest.mock('react-native/Libraries/Linking/NativeLinkingManager', () => ({
  __esModule: true,
  default: {
    getInitialURL: jest.fn(() => Promise.resolve(null)),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
    openURL: jest.fn(() => Promise.resolve()),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
}));

// Mock NativeIntentAndroid
jest.mock('react-native/Libraries/Linking/NativeIntentAndroid', () => ({
  __esModule: true,
  default: {
    getInitialURL: jest.fn(() => Promise.resolve(null)),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
    openURL: jest.fn(() => Promise.resolve()),
  },
}));

// Mock AppState - need to export default as well for proper import
jest.mock('react-native/Libraries/AppState/AppState', () => {
  const appStateMock = {
    currentState: 'active',
    isAvailable: true,
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
  };
  return {
    __esModule: true,
    default: appStateMock,
    ...appStateMock,
  };
});

// Mock NativeDeviceInfo for Dimensions
jest.mock('react-native/src/private/specs_DEPRECATED/modules/NativeDeviceInfo', () => ({
  getConstants: () => ({
    Dimensions: {
      windowPhysicalPixels: {
        width: 1080,
        height: 1920,
        scale: 2,
        fontScale: 1,
      },
      screenPhysicalPixels: {
        width: 1080,
        height: 1920,
        scale: 2,
        fontScale: 1,
      },
    },
  }),
}));

// Mock Native Animated module for React Native Animated API
jest.mock('react-native/src/private/animated/NativeAnimatedHelper', () => {
  const API = {
    createAnimatedNode: jest.fn(),
    startListeningToAnimatedNodeValue: jest.fn(),
    stopListeningToAnimatedNodeValue: jest.fn(),
    connectAnimatedNodes: jest.fn(),
    disconnectAnimatedNodes: jest.fn(),
    startAnimatingNode: jest.fn(),
    stopAnimation: jest.fn(),
    setAnimatedNodeValue: jest.fn(),
    setAnimatedNodeOffset: jest.fn(),
    flattenAnimatedNodeOffset: jest.fn(),
    extractAnimatedNodeOffset: jest.fn(),
    connectAnimatedNodeToView: jest.fn(),
    disconnectAnimatedNodeFromView: jest.fn(),
    restoreDefaultValues: jest.fn(),
    dropAnimatedNode: jest.fn(),
    addAnimatedEventToView: jest.fn(),
    removeAnimatedEventFromView: jest.fn(),
    queueFlush: jest.fn(),
    flushQueue: jest.fn(),
  };

  return {
    __esModule: true,
    default: {
      API,
      generateNewNodeTag: jest.fn(() => Math.random()),
      generateNewAnimationId: jest.fn(() => Math.random()),
      assertNativeAnimatedModule: jest.fn(),
      shouldUseNativeDriver: jest.fn(() => false),
      shouldSignalBatch: jest.fn(() => false),
      transformDataType: jest.fn((val) => val),
      get nativeEventEmitter() {
        return {
          addListener: jest.fn(() => ({ remove: jest.fn() })),
          removeAllListeners: jest.fn(),
          removeSubscription: jest.fn(),
        };
      },
    },
  };
});

// Mock UIManager module to ensure it's available for React Native Testing Library
jest.mock('react-native/Libraries/ReactNative/UIManager', () => {
  const mockUIManager = {
    getViewManagerConfig: jest.fn((name) => ({
      NativeProps: {},
      directEventTypes: [],
      bubblingEventTypes: {},
    })),
    hasViewManagerConfig: jest.fn(() => true),
    getConstants: () => ({}),
    getConstantsForViewManager: () => ({}),
    getDefaultEventTypes: () => [],
    lazilyLoadView: jest.fn(),
    createView: jest.fn(),
    updateView: jest.fn(),
    focus: jest.fn(),
    blur: jest.fn(),
    findSubviewIn: jest.fn(),
    dispatchViewManagerCommand: jest.fn(),
    measure: jest.fn(),
    measureInWindow: jest.fn(),
    viewIsDescendantOf: jest.fn(),
    measureLayout: jest.fn(),
    measureLayoutRelativeToParent: jest.fn(),
    setJSResponder: jest.fn(),
    clearJSResponder: jest.fn(),
    configureNextLayoutAnimation: jest.fn(),
    sendAccessibilityEvent: jest.fn(),
    showPopupMenu: jest.fn(),
    dismissPopupMenu: jest.fn(),
    setLayoutAnimationEnabledExperimental: jest.fn(),
  };

  return {
    __esModule: true,
    default: mockUIManager,
    ...mockUIManager,
  };
});

// Global fetch mock
global.fetch = jest.fn();
global.btoa = (str) => Buffer.from(str).toString('base64');

// Suppress console errors in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};

// Configure React Native Testing Library host component names manually
// This bypasses the auto-detection which has issues with React 19
// Use the actual component names that React Test Renderer creates
const { configure } = require('@testing-library/react-native');
configure({
  hostComponentNames: {
    text: 'RCTText',
    textInput: 'RCTTextInput',
    image: 'RCTImageView',
    switch: 'RCTSwitch',
    scrollView: 'RCTScrollView',
    modal: 'RCTModalHostView',
  },
});