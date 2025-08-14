# validate-research-requirements

Validates that research/quick-ref.md covers key architectural requirements we keep running into during development.

## Usage
```bash
/validate-research-requirements
```

## Validation Checklist

### 1. Vertically Sliced State (No Global Game State)
- ✅ MUST mention per-feature state management
- ✅ MUST show feature-based state organization
- ❌ MUST NOT suggest centralized/global game state
- ❌ MUST NOT show src/store/gameStore.ts pattern

### 2. No Empty Folders
- ✅ MUST discourage empty folder creation
- ✅ MUST show populated directory structures
- ❌ MUST NOT suggest creating empty placeholder folders

### 3. Don't Mention 60fps
- ❌ MUST NOT contain "60fps" or "60 FPS" 
- ❌ MUST NOT set specific framerate targets
- ✅ MAY mention general performance optimization

### 4. No EventBus
- ❌ MUST NOT mention EventBus pattern
- ❌ MUST NOT suggest event-driven architecture with central bus
- ✅ MAY mention direct component communication or state-based patterns

## Implementation

The command will:
1. Read `/mnt/c/dev/class-one-rapids/research/quick-ref.md`
2. Search for each requirement using pattern matching
3. Report ✅ PASS / ❌ FAIL for each item
4. Suggest specific fixes for any failures
5. Exit with error code if any critical items fail

## Output Format
```
╔════════════════════════════════════════════════════════════╗
║     🔍 RESEARCH REQUIREMENTS VALIDATION                    ║
╚════════════════════════════════════════════════════════════╝

✅ PASS: Vertically sliced state (line 35: @legendapp/state@beta per-feature)
❌ FAIL: Contains EventBus reference (line 18: EventBus.ts)
✅ PASS: No 60fps mentions
✅ PASS: No empty folder patterns

Score: 3/4 (75%)

🚨 CRITICAL ISSUES:
- Remove EventBus reference from line 18
- EventBus pattern conflicts with vertical slicing approach

Status: FAILED - Fix issues before proceeding with development
```

## Exception Justification

This is an exception to our "don't hard-code" rule because:
1. These are recurring system validation needs during testing
2. Prevents common architectural mistakes before they propagate  
3. Ensures research alignment with actual development patterns
4. Temporary validation during system refinement phase