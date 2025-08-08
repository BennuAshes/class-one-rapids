import '@testing-library/react-native';

// Mock native modules
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn(() => ({
    set: jest.fn(),
    getString: jest.fn(),
    delete: jest.fn(),
    clearAll: jest.fn(),
  })),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

jest.mock('expo-audio', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(() => Promise.resolve({ 
        sound: {
          playAsync: jest.fn(),
          setPositionAsync: jest.fn(),
          setRateAsync: jest.fn(),
          setVolumeAsync: jest.fn(),
          unloadAsync: jest.fn(),
        }
      })),
    },
    setAudioModeAsync: jest.fn(),
  },
}));

// Mock global performance for performance testing
global.performance = {
  now: jest.fn(() => Date.now()),
};

// Suppress console.warn for known issues during tests
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('deprecated')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
});