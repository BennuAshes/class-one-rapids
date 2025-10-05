# Project Rules

- This is a expo + react-native app
- Do not add dependencies directly to package.json, use npm install

## Critical

- Ask questions if you have gaps in knowledge
- No git checkout or git stash without user approval
- NEVER change package versions (React, React Native, Expo, etc) without explicit user approval
- Version mismatches should be reported to user, not auto-fixed

## Configuration Safety

- NEVER remove/replace code in test setup files (jest.setup.js, etc)
- ADD to existing config, don't replace
- If unsure about config code, leave it unchanged
- NEVER run expo start yourself, ask me to do it if its at that step
