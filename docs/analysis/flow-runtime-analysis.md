# FLOW Runtime Analysis

## Executive Summary
Analysis of FLOW.md workflow steps to identify runtime bottlenecks and potentially unnecessary components.

## Flow Steps Breakdown

### 1. prd.md - Product Requirements Document Generator
**What it does:**
- Reads feature description file
- Generates 12-section comprehensive PRD (Problem/Solution, Success Metrics, User Stories, Functional/Non-Functional Requirements, Scope, Dependencies/Risks, Timeline, Open Questions, Appendix)
- Creates detailed markdown output with tables, checklists, and hypothetical metrics

**Runtime impact:** MEDIUM-HIGH
- Generates extensive documentation (12+ sections)
- Requires reading reference guides
- Heavy text generation

**Potentially unnecessary if:**
- You already have clear requirements
- Working on small/simple features
- Iterating quickly without formal documentation needs

---

### 2. design.md - Technical Design Document Generator
**What it does:**
- Reads PRD file
- Consults 6 mandatory architecture guides
- Generates 14-section comprehensive TDD (Architecture, Component Design, Data Model, API Design, Security Design, TDD Strategy, Infrastructure, Deployment, Monitoring, Implementation Plan, Decision Log, etc.)
- Creates detailed technical specifications

**Runtime impact:** HIGH
- Reads multiple architecture guides
- Generates most extensive documentation (14 sections)
- Heavy analysis and text generation
- Can use Task tool (subagents)

**Potentially unnecessary if:**
- Architecture is already established
- Working on incremental features
- Don't need formal design documentation
- Team already knows implementation approach

---

### 3. tasks.md - Agent Task List Generator
**What it does:**
- **Launches Explore subagent** (MANDATORY) - "very thorough" codebase exploration
- Searches for existing implementations (Glob, Grep, Read files)
- Validates architecture decisions (UPDATE vs CREATE)
- Generates extremely detailed task descriptions with:
  - COSTAR framework (Context, Objective, Style, Tone, Audience, Response)
  - Dependency validation checklists
  - File location specifications
  - Integration plans
  - TDD cycles for each requirement
  - Visual requirements (YAML or tables)
  - Testing checklists
- Outputs comprehensive task list with multiple subsections per task

**Runtime impact:** VERY HIGH
- **Explore subagent** runs comprehensive codebase search (slowest component)
- Reads TDD file
- Reads multiple architecture guides (6 references)
- Heavy file searching and analysis
- Extensive task generation with detailed specifications

**Potentially unnecessary if:**
- Codebase is well-known (exploration overhead not needed)
- Tasks are simple and obvious
- Don't need extensive validation and planning
- Working solo (don't need detailed agent instructions)

---

### 4. execute-task.md - TDD Task Executor
**What it does:**
- **Launches Explore subagent AGAIN** (MANDATORY) - searches for duplicates
- Reads task list file
- For EACH task:
  - Validates dependencies (Read tool checks)
  - Validates architecture (Glob searches for duplicates)
  - Reads store files to verify property names
  - Writes test file (RED phase)
  - Runs test (cmd.exe + jest)
  - Writes implementation (GREEN phase)
  - Runs test again
  - Refactors (REFACTOR phase)
  - Runs test again
  - Validates completion (coverage, lint, typecheck)
- Updates TodoWrite progress
- Reports completion

**Runtime impact:** VERY HIGH (execution phase)
- **Explore subagent** runs AGAIN (redundant with tasks.md)
- Multiple file reads per task (validation)
- Test execution for each TDD cycle (multiple test runs per task)
- Code quality checks per task
- Actual code generation and testing (inherently time-consuming)

**Potentially unnecessary components:**
- Second Explore subagent (redundant with tasks.md exploration)
- Extensive pre-task validation if already done in tasks.md
- Running tests multiple times per small change (could batch)

---

## Runtime Bottlenecks (Ranked)

### 🔴 CRITICAL BOTTLENECKS
1. **Explore Subagent (tasks.md)** - "very thorough" codebase exploration
2. **Explore Subagent (execute-task.md)** - Redundant exploration
3. **Test Execution (execute-task.md)** - Running jest multiple times per task

### 🟡 MODERATE BOTTLENECKS
4. **TDD Generation (design.md)** - 14-section comprehensive document
5. **PRD Generation (prd.md)** - 12-section comprehensive document
6. **Detailed Task Generation (tasks.md)** - COSTAR framework + extensive specifications

### 🟢 MINOR BOTTLENECKS
7. **Architecture Guide Reading** - Multiple reference documents
8. **Validation Checks** - Pre-task dependency and architecture validation

---

## Potentially Unnecessary Components

### For Quick Feature Development:
- ❌ **prd.md** - Skip if requirements are clear
- ❌ **design.md** - Skip if architecture is established
- ⚠️ **tasks.md Explore subagent** - Could use simpler search or skip if familiar with codebase
- ⚠️ **execute-task.md Explore subagent** - Redundant, use results from tasks.md

### For Established Codebases:
- ❌ **Duplicate Explore subagent** - Only run once, share results
- ⚠️ **Extensive validation** - Could streamline pre-task checks
- ⚠️ **Comprehensive documentation** - Could generate lighter versions

### For Solo Development:
- ⚠️ **COSTAR framework** - Detailed agent instructions not needed
- ⚠️ **Extensive task descriptions** - Simpler task format sufficient

---

## Optimization Recommendations

### High-Impact Optimizations:
1. **Remove redundant Explore subagent** in execute-task.md - use results from tasks.md
2. **Make PRD/TDD generation optional** - Add flag to skip documentation steps
3. **Reduce Explore thoroughness** - Use "quick" or "medium" instead of "very thorough" for known codebases
4. **Batch test execution** - Run tests less frequently during development

### Medium-Impact Optimizations:
5. **Simplify task descriptions** - Use lightweight format for solo work
6. **Cache exploration results** - Reuse codebase analysis across multiple features
7. **Parallelize document generation** - Generate PRD and TDD concurrently if both needed

### Low-Impact Optimizations:
8. **Reduce validation checks** - Trust earlier validation results
9. **Streamline documentation sections** - Remove optional sections from PRD/TDD

---

## Minimal Flow for Fast Iteration

For users who just want to implement features quickly:

1. ❌ **Skip prd.md** - Write feature description directly
2. ❌ **Skip design.md** - Use existing architecture
3. ✅ **Keep tasks.md** BUT:
   - Use "quick" Explore thoroughness (not "very thorough")
   - Generate simpler task format
4. ✅ **Keep execute-task.md** BUT:
   - Skip redundant Explore subagent
   - Reduce pre-task validation
   - Trust task.md exploration results

**Estimated time savings:** 60-80% reduction in pre-implementation overhead

---

## Conclusion

**Main bottleneck:** Explore subagents running "very thorough" searches (twice)

**Most expendable:** PRD and TDD document generation for quick iterations

**Keep:** Task execution with TDD methodology (core value)

**Quick win:** Remove redundant Explore subagent in execute-task.md and reduce thoroughness level for familiar codebases.
