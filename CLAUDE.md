# Setup
- We are using windows
- The emulator is configured for windows
- You must use cmd.exe to execute npm and expo commands.
- 

## WSL/Bash Scripts

- **IMMEDIATELY after creating or editing any .sh file**, run these commands to fix line endings:
  ```bash
  sed -i 's/\r$//' path/to/script.sh && chmod +x path/to/script.sh
  ```
- This is NOT optional - files created in Windows have CRLF line endings that break WSL execution
- You will see "required file not found" errors if you forget this step
- Do this in the SAME response where you create the file, using the Bash tool

# Project Rules

- This is a expo + react-native app
- Do not add dependencies directly to package.json, use npm install
- Do not directly modify the android or ios folders in the expo app folders (such as /frontend/ and /approval-app/)

## Critical

- Ask questions or do research if you have gaps in knowledge
- No git checkout or git stash without user approval
- NEVER change package versions (React, React Native, Expo, etc) without explicit user approval
- Version mismatches should be reported to user, not auto-fixed

## Configuration Safety

- NEVER remove/replace code in test setup files (jest.setup.js, etc)
- ADD to existing config, don't replace
- If unsure about config code, leave it unchanged
- NEVER run ```expo start``` yourself, ask for help
