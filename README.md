# Class One Rapids

This repo answers the question, "How do I make my own PRP (Product Document Prompt), or spec-driven style system?"

## Variations

Providing a toolkit, or prompts and a methodology to create different types of projects with a central LLM-related mechanism for researching, remembering knowledge, searching that knowledge when relevant

## Description

There are many CLI systems and now IDEs that let you build an app by creating requirements, design, and tasks for an agent

## Tools

- Claude Code
- Opus4.1
- Windows 11 WSL 2 (Ubuntu)

## How this was created

### Conversation Summary
[summary from LLM anaylzing conversation]

### General Issues I'm Running Into
- folder organization: organizing by feature is not super common for react apps as the apps tend to be small
- fine-grained state management for non-established
- starting new projects (don't let it overthink)
- related to above, creating configs ahead of time
- configs should be updated step by step per item relevant to the step
- eg don't use a "standard config" it suggests - start with a seed project and build on that as you add "features" even if the feature is a dev enabler.
- big focus on stuff like marketing, metrics, and full testing suite when talking about an "MVP" - maybe I need to use "POC"
- Tries adding a babel config - no knowledge of babel-preset-expo or other modern built-in expo options
- Tries to validate code in ways that cause it to freeze/pause
- Jest compatibility
- Doing research helps but there's a lot and it becomes bloated
- Memory Capabilities?
- hard time giving up, or realizing something isn't their fault
- data flow, architecture
- it doesn't know modern tooling doesn't need special typescript versions like ts-jest

### PRD specific issues
- This is a web game, so it seems odd it has this requirement of 60 FPS. It is coming from the PRD generation process.

### Expo - Configuring a New Project
- Had lots of issues with react-test-renderer existing and conflicting with
- Suggestion was to add react-test-renderer for your exact version, but it wouldn't even let me install that.
- This is how I got it working finally:

```
npx create-expo-app frontend --template blank-typescript@sdk-54
npx expo install jest-expo jest @types/jest "--" --dev
# manually updated versions for anything related react, react-native, then manually added react-test-renderer, then 'npm install', OR likely just:
npm update
npm install react-test-renderer@19.1.1 --dev
npx expo install @testing-library/react-native "--" --dev
npx expo install react-dom react-native-web
```

## jest.setup.js
```
// Mock expo modules
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'Light',
    Medium: 'Medium',
    Heavy: 'Heavy',
  },
}));

jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(),
    },
  },
}));

console.log('=== JEST SETUP: Complete ===')

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