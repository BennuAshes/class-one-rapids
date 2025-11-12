// Fix for Expo module import issues
// Note: @testing-library/jest-native matchers are built into @testing-library/react-native v12.4+
jest.mock('expo/src/winter/ImportMetaRegistry', () => ({
  ImportMetaRegistry: {
    get url() {
      return null;
    },
  },
}));

if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (object) => JSON.parse(JSON.stringify(object));
}

// Mock AsyncStorage for tests
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Silence warnings
if (typeof global.setImmediate === 'undefined') {
  global.setImmediate = setTimeout;
}
