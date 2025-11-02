# Class One Rapids

Spec-driven development system using modern context engineering techniques

## Description

There are many CLI systems and now IDEs that let you build an app by creating requirements, design, and tasks for an agent. This repo answers the question, "How do I make my own PRP (Product Document Prompt), or spec-driven development style system using modern context engineering techniques? What commands do I need? How do I know what to put in them?"

## How This System Was Built

**The High Level Process:**

1. **Built the `/research` command** - Created a tool for deep research and knowledge synthesis
2. **Used research to build more commands** - Created `/prd`, `/design`, and `/tasks` commands informed by research
3. **Used commands to generate features** - Generated complete feature specifications in minutes vs. hours or days

**Key Insight:** Research → Command Creation → Feature Development creates a compounding advantage where each tool makes building the next tool easier.

📖 **[Full Development Journey](HOW_THIS_WAS_MADE/README.md)** - Complete chronological breakdown of phases, patterns, and lessons learned

## Tools

- Claude Code
- Opus4.1
- Windows 11 WSL 2 (Debian)


# Flow for Creating Your Own

- Create a high level poc or mvp document with long term goals
- create a base project and testing setup manually (see below to see how to do this with expo)
- use "/next-feature" to create a description of the next uncompleted feature based on what is done and what is in the high level doc
- run /prd, then /design, then /tasks
- run /execute-task on the task list
- manually test + validate tests created and results
- if not valid, record what was wrong
- use /reflect to update commands and claude.md to avoid repeating issues in the future
- can also analyze your conversations
- if you don't have the time/energy to run reflection stategies, you can "vibe code" corrections aka use conersational prompting to resolve remaining issues

## Setup Base Project and Testing

For Expo and Jest configuration details, see [EXPO_JEST_SETUP.md](EXPO_JEST_SETUP.md)

### Known Todos

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

## Expo Specific Notes

- expo-av is being deprecated, use expo-audio or expo-video instead
- react-reanimated lib needs react worklet library

# Patterns

## Architecture Needed

- state management including how to do fine-grained by-feature state/hooks (it likes to use services and groups things together often)
- folder structure - common for simple react apps to be organized by type rather than by feature
- setting up the project
- best practices for react as far as separating out features into comonents and sub-components for UX clarity. UX is a function of behavior

# Thoughts
- I want to have LLM automatically analyze each prompt/response and subsquent followup/response until the chain stops with an LLM response only.
- replace human approval method in new full flow script w/ telemtry to be apart of a UX we build just for this
- Abstract things enough that we can sub out claude for cursor cli, codex, auggie, etc