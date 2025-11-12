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
- This readme abstracted out such that its a list of features/apps/modules pointing to other readmes with more information on specific topics
- Finding I have to immediately reflect after each change, so that later when it tries to make an adjustment it doesn't undo and go back to a default it likes. I don't experience this often with Typescript but it happens a lot with python. It does not have a grasp of langfuse v3, and reverted back to v2 several times. The first few were quite confusing.
- The second time you interact with an LLM past your initial prompt should result in analysis for why we are having to ask that specific follow-up question. I call this reflection, and its common to do it with scoring or llm-as-judge. A formal name for this process that's evolving is called "Evaluations" or "Evals" for short. 

## Known TODOs
- approval app hasn't been well tested
- I want a more streamlined funnel going from idea to approval
    - off the cuff requests that need approval that have their own flow or no flow (just a prompt, maybe with standard context)
- change to point to feature description files?


## PRP/Spec-driven vs Plan & Act
If you are in an existing code base and working with other code, this sytem is a bit much. Maybe you have a product person not on board with AI yet, and you're just wanting to use AI to assist.

### Plan & Act
Simplifies the PRP/spec process, and assumes we already have a spec and a single task or small collection of todos related to a medium task.


## The Font of Knowledge
- There are many ways for you to describe rules, guidelines, guardrails, steering, commands, skills, hooks, etc that influence the final prompt that gets sent, and the response or results it generates. My goal here is exploring some of these ideas at low levels so I can understand them in a deep way, and thus be able to assess high level wrappers being marketed.

### The Flow of Knowledge
Source might be files generated from requests to do research from an LLM or you, or another expert in a field.
```Source -> Document -> Refine -> Store```
Example: You are the source, as an expert in your domain. You write a file with examples from your experiences that describe how code should be written with examples. You opt to keep it simple and just tag files in your prompts to add context (skipping the "Store" step that might go to a vector database to be retrieved as part of some process).

# What is Vital (thinking ahead)
## The feedback loop
- Being able to know where a given prompt stands, and how each change can influence it. We want as much data related to this process as possible, and interactive visualizations therein.
- Worktrees


Tests not ideal