# Epic Breakdown - Kanban Workflow System

## Overview

This directory contains the epic breakdown for PetSoft Tycoon using a file-based kanban workflow system. Each user story is represented by a single markdown file that contains all necessary information for implementation.

## Directory Structure

```
epic-breakdown/
├── kanban/                 # Story files organized by state
│   ├── backlog/           # Stories not yet started
│   ├── in-progress/       # Stories actively being worked on
│   ├── review/            # Stories complete, awaiting review
│   ├── blocked/           # Stories blocked by dependencies
│   └── done/              # Completed stories
├── epics/                 # Epic overview documents
├── reports/               # Generated progress reports
├── integration/           # Cross-epic documentation
└── [scripts]              # Automation scripts
```

## Workflow States

1. **backlog** - Story defined but not started
2. **in-progress** - Active development
3. **review** - Implementation complete, needs review
4. **blocked** - Cannot proceed due to dependencies
5. **done** - Fully implemented and integrated

## Story File Format

Each story is a single markdown file with YAML frontmatter:

```yaml
---
epic: 2
story: 2.1
title: "Development Department Core"
status: "in-progress"
assigned: "developer-name"
blocked_by: []
blocks: ["2.8"]
estimated_hours: 20
actual_hours: 15
completion_date: null
last_updated: 2024-12-20T10:30:00Z
---
```

## Available Scripts

### 1. Create a New Story
```bash
./create-story.sh <epic> <story> <name> <title>

# Example:
./create-story.sh 3 3.1 investor-rounds "Investor Rounds Prestige System"
```

### 2. Move Story Between States
```bash
./move-story.sh <story-identifier> <new-state>

# Examples with shorthand (recommended):
./move-story.sh 1.1 in-progress
./move-story.sh 2.3 review
./move-story.sh 3.1 done

# Examples with full filename:
./move-story.sh epic-2-story-2-1-development-department.md in-progress
```

### 3. Generate Progress Dashboard
```bash
./generate-dashboard.sh
```
This creates/updates `reports/progress-dashboard.md` with current progress visualization.

### 4. List Stories (Quick View)
```bash
./list-stories.sh                    # All stories
./list-stories.sh epic 2            # Only Epic 2 stories  
./list-stories.sh state in-progress # Only in-progress stories
./list-stories.sh assigned alice    # Only Alice's stories
```
Quick story lookup without generating full dashboard.

### 5. Migrate Old Format (Archived)
Migration scripts have been moved to `archive/` folder as they were one-time use.

## Workflow Process

### Starting Work on a Story

1. **Find a story in backlog:**
   ```bash
   ls kanban/backlog/
   ```

2. **Move to in-progress:**
   ```bash
   ./move-story.sh 2.3 in-progress
   ```

3. **Update assigned field:**
   Edit the file and add your name to the `assigned:` field

4. **Work on implementation:**
   - Update task checkboxes as you complete them
   - Add notes about decisions or blockers
   - Update actual_hours as you work

### Completing a Story

1. **Move to review:**
   ```bash
   ./move-story.sh 2.3 review
   ```

2. **After review, move to done:**
   ```bash
   ./move-story.sh 2.3 done
   ```

3. **Update completion_date:**
   Edit the file and set the completion date

### Handling Blockers

1. **Move to blocked:**
   ```bash
   ./move-story.sh 3.1 blocked
   ```

2. **Update blocked_by:**
   Edit the file and list the blocking stories

3. **When unblocked, move back:**
   ```bash
   ./move-story.sh 3.1 in-progress
   ```

## Progress Tracking

Run the dashboard generator to see current progress:
```bash
./generate-dashboard.sh
cat reports/progress-dashboard.md
```

The dashboard shows:
- Overall progress bar
- Summary statistics by state
- Epic-level progress
- Detailed story listings by state
- Blocked story dependencies

## Story Naming Convention

Files follow this pattern:
```
epic-[#]-story-[#]-[descriptive-name].md
```

Examples:
- `epic-1-story-1-1-project-architecture.md`
- `epic-2-story-2-5-design-department.md`
- `epic-3-story-3-2-achievement-system.md`

## Benefits

1. **Visual State Management** - See progress at a glance
2. **Single Source of Truth** - All story info in one file
3. **Git-Friendly** - Track changes and history
4. **Offline-First** - No external tools required
5. **Scriptable** - Automate common workflows
6. **Flexible** - Easy to extend or modify

## Tips

- Keep story files updated as you work
- Run dashboard generation daily/weekly
- Use git commits when moving stories between states
- Add detailed notes about implementation decisions
- Update time estimates based on actual experience
- Link related stories in the blocks/blocked_by fields

## Epic Overview

The project contains 5 epics with 23 total stories:

1. **Epic 1: Core Gameplay Foundation** (5 stories)
2. **Epic 2: Department Systems** (8 stories)
3. **Epic 3: Progression & Prestige** (3 stories)
4. **Epic 4: Audio-Visual Polish** (4 stories)
5. **Epic 5: Persistence & Performance** (3 stories)

See `integration/cross-epic-dependencies.md` for detailed dependency information.