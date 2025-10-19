# Expo & Jest Setup Guide

## Expo - Configuring a New Project

- Had lots of issues with react-test-renderer existing and conflicting with
- Suggestion was to add react-test-renderer for your exact version, but it wouldn't even let me install that.
- This is how I got it working finally:

```
npx create-expo-app frontend --template blank-typescript@sdk-54
npx expo install jest-expo jest @types/jest "--" --dev
# manually updated versions for anything related react, react-native, then manually added react-test-renderer, then 'npm install', OR likely just:
npm install react-test-renderer --dev
npx expo install @testing-library/react-native "--" --dev
npx expo install react-dom react-native-web
npx npm-check-updates -u
npm install
```

## jest.setup.js

```
// Fix for Expo module import issues
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
```

## package.json

```
"jest": {
    "preset": "jest-expo",
    "setupFilesAfterEnv": [
      "<rootDir>/jest.setup.js"
    ],
    "transformIgnorePatterns": [
      "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)"
    ],
    "moduleDirectories": [
      "node_modules"
    ],
    "testPathIgnorePatterns": [
      "/node_modules/"
    ],
    "watchPathIgnorePatterns": [
      "/node_modules/"
    ],
    "haste": {
      "defaultPlatform": "ios",
      "platforms": [
        "ios",
        "android",
        "native"
      ]
    }
}
```
