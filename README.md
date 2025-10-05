# Class One Rapids (v2)
Teaching the creation of AI code generation processes

## Description
There are many CLI systems and now IDEs that let you build an app by creating requirements, design, and tasks for an agent. This repo answers the question, "How do I make my own PRP (Product Document Prompt), or spec-driven development style system using modern context engineering techniques? What commands do I need? How do I know what to put in them?"

## Tools
- Claude Code
- Opus4.1
- Windows 11 WSL 2 (Debian)

## How this was created

### Conversation Summary
[summary from LLM anaylzing conversation]
- first part and last part are in windows. theres duplicate parts in wsl ~/.claude and also new parts that need to be merged with the windows parts for a complete history.



### Expo - Configuring a New Project
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

# Flow for Creating Your Own
- Create a high level feature document/mvp/poc
- create a base project and testing setup manually (see below to see how to do this with expo)
- use "/next-feature" to create a description of the next uncompleted feature based on what is done and what is in the high level doc
- run /prd, then /design, then /tasks
- run /execute-task on the task list
- manually test + validate tests created and results
- if not valid, record what was wrong
- use /reflect to update commands and claude.md to avoid repeating issues in the future 
- can also analyze your conversations
- if you don't have the time/energy to run reflection stategies, you can "vibe code" corrections aka use conersational prompting to resolve remaining issues

### Known Todos
- 1000 hp isn't useful or fun
- the docs folder needs to be organized

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
- refactors into weird folders/subfolders
- uses "services" instead of hooks - hooks should be used
- in react(-native): uses classes instead of preferring functional paradigms
- code examples that depend on a file structure default to styles that suite small apps using global folders for the types of files being created (components, hooks, etc) - research "by feature", "vertical slicing", "lean software development" early on so they can influence future commands and research
- not sure the best way to reference this research we do early that a lot, but maybe not all, of the commands need.
- we guess in these first passes but we could document them in a table that shows the commands and which benefit from which research, and the types of research you may want to do
- This is a mobile/web game, so it seems odd it has this requirement of 60 FPS. It is coming from the PRD generation process.

## Expo
- expo-av is being deprecated, use expo-audio or expo-video instead
- react-reanimated lib needs react worklet library  