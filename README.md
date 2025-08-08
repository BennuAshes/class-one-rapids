# Context Engineering System "Class One Rapids"

## Automatic Research Validation
**✅ All commands now automatically validate against research/ folder - no manual checking required!**

## Primary Workflow

### Phase 1: Requirements & Analysis
1. `/generate-advanced-prd` description of app/feature
2. `/analyze-prd-technical-requirements` path/to/prd.md
   - Automatically cross-references all technologies with research/
   - Extracts package versions from research files
   - Flags any technologies not covered by research

### Phase 2: Runbook Generation
3. **NAVIGATE TO PROJECT DIRECTORY FIRST**: `cd projects/{project-name}/`
4. `/create-development-runbook-v2` ./prd-filename.md
   - Automatically scans research/ for package versions
   - Injects correct versions into all install commands
   - Validates architecture patterns against research
   - Creates research-requirements.json with all validations
   - Default output: ./runbook/ directory

### Phase 3: Architecture Validation
5. `/validate-architecture-alignment` ./runbook/
   - Verifies all patterns match research requirements
   - Confirms package versions align with research

### Phase 4: Execution
6. `/follow-runbook-with-senior-engineer` ./runbook/
   - **Automatic package correction**: ALL npm/yarn/pnpm commands auto-corrected to research versions
   - **No manual intervention needed**: Corrections logged for transparency
   - **Architecture validation**: Real-time pattern checking against research
   - **Example auto-correction**:
     - Runbook says: `npm install @legendapp/state`
     - Research has: `@legendapp/state@beta`
     - Executed: `npm install @legendapp/state@beta`
     - Log: "✅ Auto-corrected to @beta from research"

## How It Works

### Automatic Research Integration
1. **Commands scan research/ folder automatically** - no manual lookup needed
2. **Package versions extracted and enforced** - @beta, @next tags preserved
3. **Architecture patterns validated** - vertical slicing, custom hooks, etc.
4. **Conflicts resolved automatically** - research always wins

### No More Manual Steps
- ❌ ~~Check research/PACKAGE-REQUIREMENTS.md~~ → ✅ Automatic
- ❌ ~~Verify package versions~~ → ✅ Automatic
- ❌ ~~Update runbook if wrong~~ → ✅ Auto-corrected
- ❌ ~~Search research for patterns~~ → ✅ Built-in

### Simple Workflow
```bash
cd projects/{project-name}/
/create-development-runbook-v2 ./prd.md     # Auto-validates against research
/follow-runbook-with-senior-engineer ./runbook/  # Auto-corrects all packages
```


