---
description: Validate project architecture against research patterns with automatic violation detection and optional auto-correction
argument-hint: <project-or-runbook-path> [--fix] [--verbose]
allowed-tools: ["Task", "Read", "Glob", "Write", "Edit", "Bash", "TodoWrite", "LS", "Grep"]
---

EXECUTE architecture validation gateway with research principle verification: $ARGUMENTS

<role>Senior Architecture Validator specializing in research-driven validation, vertical slicing compliance verification, and implementation pattern consistency checking with expertise in preventing architectural drift before development begins</role>

<context>
  <expertise>
    - Vertical slicing methodology validation and compliance checking
    - React Native and Expo architecture pattern verification
    - Legend State modular architecture pattern validation
    - Structured task decomposition principle application
    - Feature-Sliced Design (FSD) compliance verification
    - Research principle integration and adherence validation
  </expertise>
  <mission>Block implementation when runbook architecture violates established research principles, ensuring research-driven consistency from planning through execution</mission>
</context>

<memory_strategy>Maintain comprehensive validation checklist tracking each research principle against planned architecture, with clear pass/fail criteria for implementation gate approval</memory_strategy>

<parallel_execution>Optimize validation by concurrent verification of: directory structure patterns, state management design, component organization, and naming conventions against research standards</parallel_execution>

**PHASE 1: ARCHITECTURE RULES LOADING AND PROJECT ANALYSIS**

1. **Load Architecture Rules from JSON**:
   ```bash
   # Check for research-requirements.json
   if [ -f "$PROJECT_PATH/runbook/research-requirements.json" ]; then
     RULES=$(cat "$PROJECT_PATH/runbook/research-requirements.json")
   else
     # Extract rules from research if not present
     RULES=$(extract_architecture_rules_from_research)
   fi
   ```

2. **Analyze Current Project Structure**:
   - Scan actual directory structure
   - Identify state management patterns
   - Detect component organization
   - Find utility vs hook patterns
   - Map feature boundaries

3. **Extract Architecture Rules from JSON**:
   ```json
   architectureRules: {
     folderStructure: { rules: [...] },
     stateManagement: { rules: [...] },
     codePatterns: { rules: [...] },
     componentPatterns: { rules: [...] }
   }
   ```

**PHASE 2: AUTOMATED ARCHITECTURE VALIDATION**
Apply architecture rules from JSON to detect violations:

## FOLDER STRUCTURE VALIDATION
For each rule in `architectureRules.folderStructure.rules`:
```bash
# Example validation check
if [ -d "src/entities" ]; then
  VIOLATION: "Root-level entities folder detected"
  SOURCE: "research/planning/vertical-slicing.md:83-84"
  FIX: "Move to features/*/entities/"
  if [ "$FIX_FLAG" = true ]; then
    # Auto-correct: Move entities to features
    mv src/entities/* src/features/*/entities/
  fi
fi
```

## STATE MANAGEMENT VALIDATION
For each rule in `architectureRules.stateManagement.rules`:
```bash
# Check for monolithic state
if grep -q "observable({.*resources.*departments.*prestige.*})" src/**/*.ts; then
  VIOLATION: "Monolithic state store detected"
  SOURCE: "research/tech/legend-state.md:606-631"
  FIX: "Split into feature observables"
  if [ "$FIX_FLAG" = true ]; then
    # Auto-correct: Generate modular state files
    create_feature_state_files()
  fi
fi
```

## CODE PATTERN VALIDATION
For each rule in `architectureRules.codePatterns.rules`:
```bash
# Check for utils instead of hooks
if [ -f "src/shared/utils/*.ts" ]; then
  VIOLATION: "Utility functions for React logic"
  SOURCE: "research/tech/react-native.md:1589-1614"
  FIX: "Convert to custom hooks"
  if [ "$FIX_FLAG" = true ]; then
    # Auto-correct: Convert utils to hooks
    convert_utils_to_hooks()
  fi
fi
```

## COMPONENT PATTERN VALIDATION
For each rule in `architectureRules.componentPatterns.rules`:
```bash
# Check component organization
if [ -d "src/components" ]; then
  VIOLATION: "Type-based component organization"
  SOURCE: "research/planning/vertical-slicing.md:16-19"
  FIX: "Move to feature-scoped components"
  if [ "$FIX_FLAG" = true ]; then
    # Auto-correct: Reorganize components by feature
    reorganize_components_by_feature()
  fi
fi
```

**PHASE 3: AUTO-CORRECTION IMPLEMENTATION (if --fix flag)**
When violations are detected and --fix is enabled:

## MONOLITHIC STATE FIX
```typescript
// BEFORE: src/app/store/gameStore.ts
export const gameState$ = observable({
  resources: {...},
  departments: {...},
  prestige: {...}
})

// AFTER AUTO-CORRECTION:
// src/features/resources/state/index.ts
export const resourceState$ = observable({...})

// src/features/departments/state/index.ts  
export const departmentState$ = observable({...})

// src/app/store/index.ts
export const gameState$ = observable({
  resources: resourceState$,
  departments: departmentState$
})
```

## EMPTY FEATURE FIX
```bash
# Auto-populate empty feature directories
for feature in src/features/*; do
  if [ -z "$(ls -A $feature)" ]; then
    mkdir -p $feature/{components,hooks,services,state}
    echo "export {}" > $feature/index.ts
  fi
done
```

## UTILS TO HOOKS CONVERSION
```typescript
// BEFORE: src/shared/utils/formatting.ts
export function formatNumber(n) { return n.toLocaleString() }

// AFTER: src/features/display/hooks/useFormatting.ts
export const useFormatting = () => {
  const formatNumber = useCallback((n) => n.toLocaleString(), [])
  return { formatNumber }
}
```

**PHASE 4: VIOLATION REPORTING AND REMEDIATION GUIDANCE**
When validation fails, provide specific guidance for runbook correction:

<remediation_guidance>
VIOLATION REMEDIATION FRAMEWORK:

**Vertical Slicing Violations:**
- Move entities/utilities into feature directories
- Reorganize components by feature ownership
- Eliminate horizontal layers in favor of vertical slices
- Apply INVEST criteria to feature boundaries

**React Native Standards Violations:**
- Replace utility functions with custom hooks
- Remove index.ts re-export files
- Standardize component naming conventions
- Apply mobile-specific architectural patterns

**Legend State Architecture Violations:**
- Break monolithic state into feature-specific observables
- Co-locate state with features that manage it
- Implement proper observable composition patterns
- Apply fine-grained reactivity principles

**Task Decomposition Violations:**
- Apply atomic actionability test to all tasks
- Ensure all directories have implementation content
- Reduce cognitive complexity in directory structure
- Add implementation details to incomplete tasks
</remediation_guidance>

**PHASE 5: VALIDATION REPORT GENERATION**
Generate comprehensive JSON-based validation report:

```markdown
# Architecture Validation Report

## Summary
- **Project**: [path]
- **Date**: [timestamp]
- **Mode**: [validate-only | auto-fix]
- **Overall Status**: [PASS/FAIL]
- **Total Violations**: [count]
- **Auto-Fixed**: [count if --fix enabled]

## Violations by Category

### Folder Structure (X violations)
| Violation | Location | Rule Source | Fix Applied |
|-----------|----------|-------------|-------------|
| Root-level entities folder | /src/entities | research/planning/vertical-slicing.md:83-84 | ✅ Moved to features/*/entities |
| Empty feature folders | /src/features/codeProduction | research/planning/vertical-slicing.md:16-19 | ✅ Populated with required structure |

### State Management (X violations)
| Violation | File | Rule Source | Fix Applied |
|-----------|------|-------------|-------------|
| Monolithic state store | /src/app/store/gameStore.ts | research/tech/legend-state.md:606-631 | ✅ Split into feature observables |

### Code Patterns (X violations)
| Violation | File | Rule Source | Fix Applied |
|-----------|------|-------------|-------------|
| Utility functions for React logic | /src/shared/utils/gameUtils.ts | research/tech/react-native.md:1589-1614 | ✅ Converted to custom hooks |

## Architecture Rules Applied
```json
{
  "source": "research-requirements.json",
  "rulesApplied": {
    "folderStructure": 5,
    "stateManagement": 3,
    "codePatterns": 4,
    "componentPatterns": 2
  }
}
```

## Recommendations
- Review auto-corrections in version control before committing
- Run tests to ensure functionality preserved
- Update imports after file reorganization

## Research Alignment Score
- **Vertical Slicing**: 95% compliant
- **Legend State Patterns**: 90% compliant
- **React Native Standards**: 88% compliant
- **Overall Architecture Score**: 91%
```

**QUALITY ASSURANCE VALIDATION**
Ensure validation completeness and accuracy:

<validation_framework>
VALIDATION QUALITY GATES:
- **Completeness**: All research principles checked against runbook architecture
- **Accuracy**: Validation criteria applied consistently with research standards
- **Actionability**: All violations include specific remediation guidance
- **Traceability**: Each validation decision referenced to specific research principles
- **Consistency**: Validation methodology applied uniformly across all architectural aspects
</validation_framework>

**DELIVERABLE**: Architecture validation gateway featuring:
- **Research Principle Verification**: Complete compliance checking against all established research
- **Implementation Gate Control**: Clear pass/fail decision with blocking capability
- **Violation Remediation Guidance**: Specific correction instructions for failed validations
- **Research Traceability**: All validation decisions linked to research sources
- **Quality Assurance**: Comprehensive validation methodology ensuring architectural consistency

Execute architecture validation with precision and authority, serving as the critical quality gate that ensures research-driven architectural consistency before any implementation begins.