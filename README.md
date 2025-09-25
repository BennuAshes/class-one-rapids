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
- Tries adding a babel config - no knowledge of babel-preset-expo
- Tries to validate code in ways that cause it to freeze/pause
- Jest compatibility
- Doing research helps but there's a lot and it becomes bloated
- Memory Capabilities?
- hard time giving up, or realizing something isn't their fault
- data flow, architecture

### PRD specific issues
- focus on 60 FPS coming from the PRD generated

### Expo - Configuring a New Project


## Future Development Todo List

📋 **Detailed implementation guide**: [docs/improvements-roadmap.md](docs/improvements-roadmap.md)

### 🚀 Immediate Priorities
- [ ] Update CLAUDE.md with command execution guidelines and directory handling patterns
- [ ] Fix create-expo-project.md to handle existing directories and add better error recovery
- [ ] Document bash execution model and shell persistence limitations in CLAUDE.md
- [ ] Create test-command.md for validating new commands before deployment

### 📝 Command Improvements
- [ ] Add path verification between steps in multi-stage commands
- [ ] Implement error handling for when projects already exist
- [ ] Create rollback capabilities for failed setup commands
- [ ] Build command dependency checker to verify prerequisites
- [ ] Add conditional execution patterns for better error recovery

### 🔬 Research Needs
- [ ] Research Claude Code bash execution model and sandboxing
- [ ] Document best practices for multi-step bash workflows in commands
- [ ] Investigate state management strategies between commands
- [ ] Study error recovery patterns for markdown-based commands
- [ ] Explore monorepo vs single project setup patterns
- [ ] Research template versioning strategies for project generators

### 🏗️ Infrastructure
- [ ] Create automated testing for Claude Code commands
- [ ] Build command validation framework
- [ ] Implement command versioning system
- [ ] Add performance metrics for command execution
- [ ] Create cross-command communication patterns

### 📚 Documentation
- [ ] Write comprehensive guide for bash command patterns
- [ ] Document common pitfalls and solutions
- [ ] Create troubleshooting guide for command failures
- [ ] Add examples of successful command patterns
- [ ] Build command template library

### 🔧 Process Improvements
- [ ] Implement pre-execution checks (verify CWD, check existing directories)
- [ ] Enhance error messages with full path context
- [ ] Add progress indicators for long-running commands
- [ ] Create better clarification triggers for ambiguous requests
- [ ] Improve testing strategy for commands with different project states

### 🎯 Long-term Goals
- [ ] Develop command composition system for complex workflows
- [ ] Create dynamic frontmatter for conditional tool permissions
- [ ] Build command marketplace for sharing between projects
- [ ] Implement custom model parameters beyond model selection
- [ ] Design cross-command state sharing mechanism

### 🐛 Known Issues to Fix
- [ ] MMKV compatibility with Expo SDK 54 on Android
- [ ] npm scripts availability in fresh projects
- [ ] Directory context persistence between bash commands
- [ ] Silent failures in multi-step commands

### ✨ Enhancement Ideas
- [ ] Add command history and undo functionality
- [ ] Create command aliases for frequently used patterns
- [ ] Implement command chaining for workflows
- [ ] Build interactive command builder UI
- [ ] Add command analytics and usage tracking
