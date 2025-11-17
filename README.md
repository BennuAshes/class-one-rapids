# Class One Rapids - A Teaching Tool

Context/Vibe Engineering/PRP/Spec-driven/AgentOS style system, developed to teach myself and others low level agentic techniques building up from simple prompts.

## Description

There are many CLI systems and now IDEs that let you build an app by creating requirements, design, and tasks for an agent. This repo answers the question, "How do I make my own PRP (Product Document Prompt), or spec-driven development style system using modern context engineering techniques? What commands do I need?"

## How This System Was Built

**The High Level Process:**

1. **Built the `/research` command** - Created a tool for deep research and knowledge synthesis
2. **Used research to build more commands** - Created `/prd`, `/design`, and `/tasks` commands informed by research
3. **Used commands to generate features** - Attempt to generate features. Note issues to LLM and ask which files to change
4. **Built the `/reflect` command** - A quick manual way to run Evaluations using what looks right to me. Alter commands, add/modify research contributing to the output

**Key Insight:** Research → Command Creation → Feature Development creates a compounding advantage where each tool makes building the next tool easier.

📖 **[Full Development Journey](HOW_THIS_WAS_MADE/README.md)** - Complete chronological breakdown of phases, patterns, and lessons learned

## Tools

- Claude Code on Windows 11 WSL 2 (Debian)
- Opus-4.1: All of v1 and 90 of v2 and 40% of v2.5
- Sonnet-4.5: Updated most of v2.5
