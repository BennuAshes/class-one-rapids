# Class One Rapids - A Teaching Tool

- Context/Vibe Engineering/PRP/Spec-driven/AgentOS style system, developed to teach myself and others low level agentic techniques building up from simple prompts.

## Description

- There are many CLI systems and now IDEs that let you build an app by creating requirements, design, and tasks for an agent. This repo answers the question, "How do I make my own PRP (Product Document Prompt), or spec-driven development style system using modern context engineering techniques? What commands do I need?"
- Last tested/consistent run: 75591b7e3ac544feb0c6fbcfc4007a740a878395
- 3 feature run - e09ffc9a4db7580baef65784cd82f3362b654ecc

## How This System Was Built

**The High Level Process:**

1. **Built the `/research` command** - Created a tool for deep research and knowledge synthesis
2. **Used research to build more commands** - Created `/prd`, `/design`, `/tasks`, and `/execute-task` commands informed by research documents generated from Step 1.
3. **Used commands to generate features** - Generate features, manually evaluate performance, alter commands (process) and research/knowledge.
4. **Built the `/reflect` command** - Semi-automate reflection/feedback prompts into a command to use to suggest alterations to the flow.
5. **Iterate** - Change command structure/content and knowledge (context) feeding those commands

**Summary:** Research → Command Creation → Feature Development → Reflection creates a compounding advantage where each tool and run through makes building the next feature/tool easier.

## Tools

- Claude Code on Windows 11 WSL 2 (Debian)
- Opus-4.1: All of v1 and 90 of v2 and 40% of v2.5
- Sonnet-4.5: Updated most of v2.5 (thinking mode OFF)
