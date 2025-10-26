/**
 * Jest Pre-Setup File
 * Minimal Expo environment setup without jest-expo's problematic setup.js
 * This replaces jest-expo/src/preset/setup.js for React 19 compatibility
 */

// Define __DEV__ global
global.__DEV__ = true;

// Define __fbBatchedBridgeConfig before requiring NativeModules
global.__fbBatchedBridgeConfig = {
  remoteModuleConfig: [],
};

// Mock TurboModuleRegistry to provide PlatformConstants
jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => {
  return {
    getEnforcing: (name) => {
      if (name === 'PlatformConstants') {
        return {
          getConstants: () => ({
            isTesting: true,
            reactNativeVersion: { major: 0, minor: 81, patch: 4 },
            forceTouchAvailable: false,
            osVersion: '16.0',
            systemName: 'iOS',
            interfaceIdiom: 'phone',
          }),
        };
      }
      return null;
    },
    get: (name) => {
      if (name === 'PlatformConstants') {
        return {
          getConstants: () => ({
            isTesting: true,
            reactNativeVersion: { major: 0, minor: 81, patch: 4 },
            forceTouchAvailable: false,
            osVersion: '16.0',
            systemName: 'iOS',
            interfaceIdiom: 'phone',
          }),
        };
      }
      return null;
    },
  };
});

// Setup window global for React Native
if (typeof window !== 'object') {
  global.window = global;
  global.window.navigator = {};
}

// Setup React DevTools hook
if (typeof global.__REACT_DEVTOOLS_GLOBAL_HOOK__ === 'undefined') {
  global.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    isDisabled: true,
    renderers: {
      values: () => [],
    },
    on() {},
    off() {},
  };
  global.window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = global.__REACT_DEVTOOLS_GLOBAL_HOOK__;
}

// Mock NativeModules without the problematic UIManager extensions
const mockNativeModules = require('react-native/Libraries/BatchedBridge/NativeModules');

// Mock ImageLoader
const mockImageLoader = {
  configurable: true,
  enumerable: true,
  get: () => ({
    prefetchImage: jest.fn(),
    getSize: jest.fn((uri, success) => process.nextTick(() => success(320, 240))),
  }),
};
Object.defineProperty(mockNativeModules, 'ImageLoader', mockImageLoader);
Object.defineProperty(mockNativeModules, 'ImageViewManager', mockImageLoader);

// Mock LinkingManager
Object.defineProperty(mockNativeModules, 'LinkingManager', {
  configurable: true,
  enumerable: true,
  get: () => mockNativeModules.Linking,
});

// Mock UIManager with getViewManagerConfig for React Native Testing Library
Object.defineProperty(mockNativeModules, 'UIManager', {
  configurable: true,
  enumerable: true,
  writable: true,
  value: {
    getViewManagerConfig: jest.fn((name) => {
      // Return config for common React Native components
      const commonConfig = {
        NativeProps: {},
        directEventTypes: [],
        bubblingEventTypes: {},
      };
      return commonConfig;
    }),
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
  },
});
