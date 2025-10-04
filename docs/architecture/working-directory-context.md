# Working Directory Context and Path Rules

## CRITICAL: Project Structure

### Directory Layout
```
c:\dev\class-one-rapids\              # Project root
├── frontend\                         # All React Native/Expo code
│   ├── src\                         # Source code
│   │   ├── app\                    # Expo Router pages
│   │   ├── modules\                # Feature modules
│   │   └── shared\                 # Shared utilities
│   ├── package.json                 # Frontend dependencies
│   └── ...                          # Other frontend config
├── docs\                            # Documentation
├── .claude\                         # Claude commands
└── CLAUDE.md                        # Project instructions
```

## Working Directory Rules

### For All Frontend Development
**You are operating in**: `c:\dev\class-one-rapids\frontend\`
**All paths are relative to the frontend directory**
**NEVER create `frontend/frontend/` nested structures**

### Path Resolution
- When instructions say `src/modules/[feature]/`
  - ✅ CORRECT: Create at `c:\dev\class-one-rapids\frontend\src\modules\[feature]\`
  - ❌ WRONG: Create at `c:\dev\class-one-rapids\frontend\frontend\src\modules\[feature]\`

### Before ANY File Creation
1. **Verify working directory**: Run `pwd` to confirm you're in the frontend directory
2. **Check parent directories**: Use `ls` to verify parent directories exist
3. **Use correct paths**: Create files at `src/modules/[feature]/` NOT `frontend/src/modules/[feature]/`

## Common Path Mistakes to Avoid

### Nested Frontend Directories
❌ **NEVER DO THIS**:
```
frontend/
└── frontend/          # Duplicate nesting
    └── src/
        └── modules/
```

✅ **ALWAYS DO THIS**:
```
frontend/
└── src/              # Direct child of frontend
    └── modules/
```

### Absolute vs Relative Paths
- **From project root**: Use `frontend/src/modules/[feature]/`
- **From frontend directory**: Use `src/modules/[feature]/`
- **In commands**: Always clarify which directory you're in

## Directory Verification Commands

### Check Current Location
```bash
pwd
# Should output: c:\dev\class-one-rapids\frontend
```

### Verify Structure Before Creating Files
```bash
# From frontend directory
ls -la src/modules/
# Should show existing feature modules

# Check if a specific module exists
test -d src/modules/[feature] && echo "exists" || echo "not found"
```

### Create New Feature Module
```bash
# From frontend directory (c:\dev\class-one-rapids\frontend\)
mkdir -p src/modules/[feature]
# Creates: frontend/src/modules/[feature]/
# NOT: frontend/frontend/src/modules/[feature]/
```

## Import Path Rules

### Within Feature Modules
```typescript
// From src/modules/combat/Enemy.tsx
import { useEnemy } from './useEnemy';  // Same directory
import { Button } from '@/shared/components/Button';  // Shared components
import { CombatStats } from './types';  // Local types
```

### Cross-Feature Imports
```typescript
// From src/modules/inventory/Item.tsx
import { usePlayer } from '@/modules/player/usePlayer';  // Another feature
```

### From App Routes
```typescript
// From src/app/game.tsx
import { Enemy } from '@/modules/combat/Enemy';  // Feature component
```

## File Creation Examples

### Creating a New Feature Component
```bash
# Current directory: c:\dev\class-one-rapids\frontend\
# Task: Create Enemy component in combat module

# CORRECT:
echo "export const Enemy = () => {}" > src/modules/combat/Enemy.tsx

# WRONG (creates nested structure):
echo "export const Enemy = () => {}" > frontend/src/modules/combat/Enemy.tsx
```

### Creating Tests (Co-located)
```bash
# Current directory: c:\dev\class-one-rapids\frontend\
# Task: Create test for Enemy component

# CORRECT (co-located):
echo "describe('Enemy', () => {})" > src/modules/combat/Enemy.test.tsx

# WRONG (separate test directory):
echo "describe('Enemy', () => {})" > src/__tests__/combat/Enemy.test.tsx
```

## Troubleshooting

### If You See Nested Directories
1. **Stop immediately** - Don't create more files
2. **Check your current directory** with `pwd`
3. **List the structure** with `tree -L 3` or `ls -la`
4. **Move files to correct location** if needed
5. **Remove empty nested directories**

### Recovery from Wrong Structure
```bash
# If you accidentally created frontend/frontend/
# From project root (c:\dev\class-one-rapids\)

# Move files to correct location
mv frontend/frontend/src/* frontend/src/

# Remove empty nested directory
rmdir frontend/frontend/src
rmdir frontend/frontend
```

## Remember
- **Always verify your working directory first**
- **Frontend work happens in `c:\dev\class-one-rapids\frontend\`**
- **All src/ paths are relative to the frontend directory**
- **No barrel exports (index.ts)**
- **Tests are co-located with implementation files**