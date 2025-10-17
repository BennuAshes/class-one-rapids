# Working Directory Context and Path Rules

## CRITICAL: Project Structure

### Directory Layout
```
c:\dev\class-one-rapids\             # Project root
├── frontend\                        # All React Native/Expo code
│   ├── app\                         # Expo Router pages
│   ├── modules\                     # Feature modules
│   ├── shared\                      # Shared utilities
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
  - ✅ CORRECT: Create at `c:\dev\class-one-rapids\frontend\modules\[feature]\`

### Before ANY File Creation
1. **Verify working directory**: Run `pwd` to confirm you're in the frontend directory
2. **Check parent directories**: Use `ls` to verify parent directories exist
3. **Use correct paths**: Create files at `frontend/modules/[feature]/` NOT `frontend/modules/[feature]/`

## Common Path Mistakes to Avoid


✅ **ALWAYS DO THIS**:
```
frontend/
└── modules/ # Direct child of frontend
```

### Absolute vs Relative Paths
- **From project root**: Use `frontend/modules/[feature]/`
- **From frontend directory**: Use `modules/[feature]/`
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
ls -la modules/
# Should show existing feature modules

# Check if a specific module exists
test -d modules/[feature] && echo "exists" || echo "not found"
```

### Create New Feature Module
```bash
# From frontend directory (c:\dev\class-one-rapids\frontend\)
mkdir -p modules/[feature]
# Creates: frontend/modules/[feature]/
# NOT: frontend/frontend/src/modules/[feature]/
```

## Import Path Rules

### Within Feature Modules
```typescript
// From modules/combat/Enemy.tsx
import { useEnemy } from './useEnemy';  // Same directory
import { Button } from '@/shared/components/Button';  // Shared components
import { CombatStats } from './types';  // Local types
```

### From Shared Utilities
```typescript
// From modules/inventory/Item.tsx
import { usePlayerStats } from '@/shared/hooks/usePlayerStats';  // Shared hook
import { formatCurrency } from '@/shared/utils/formatting';  // Shared utility
```

**Avoid cross-feature imports** (e.g., `modules/inventory` importing from `modules/player`). Instead, extract common logic into `shared/hooks/` or `shared/utils/` for composition.

### From Expo Router Pages (app/ directory)
```typescript
// From app/game.tsx (route page)
import { Enemy } from '@/modules/combat/Enemy';  // Feature component
import { Inventory } from '@/modules/inventory/Inventory';  // Another feature
```

 ## Remember
- **Always verify your working directory first**
- **Frontend work happens in `c:\dev\class-one-rapids\frontend\`**
- **No barrel exports (index.ts)**
- **Tests are co-located with implementation files**