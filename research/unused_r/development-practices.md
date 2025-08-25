# Development Practices and Project Hygiene

## Table of Contents
1. [File and Folder Management](#file-and-folder-management)
2. [Code Organization Principles](#code-organization-principles)
3. [Feature Development Workflow](#feature-development-workflow)
4. [Code Quality Standards](#code-quality-standards)
5. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)

---

## File and Folder Management

### Critical Rule: No Empty Folders or Placeholder Files

**🚨 NEVER create empty folders or placeholder files**

Empty folders and placeholder files are a major anti-pattern that leads to:
- Confusion about what's implemented vs. planned
- Unnecessary cognitive load when navigating the codebase
- Version control noise
- False sense of progress

### File Creation Guidelines

1. **Create files only when writing actual code**
   - Each file should have immediate, functional content
   - No "TODO" files or empty exports

2. **Delete unused code immediately**
   - Remove files as soon as they become obsolete
   - Don't keep "might need later" code

3. **Each file must have a clear purpose**
   - Single responsibility principle
   - If you can't describe what a file does, it shouldn't exist

---

## Code Organization Principles

### Feature-Based Organization (Vertical Slicing)

Organize code by feature, not by technical layer:

```
# ✅ GOOD - Feature-based
src/
├── features/
│   ├── checkout/           # Only exists when checkout is implemented
│   │   ├── CheckoutScreen.tsx
│   │   ├── PaymentForm.tsx
│   │   ├── checkoutService.ts
│   │   └── checkoutTypes.ts
│   └── product/            # Only exists when products are implemented
│       ├── ProductList.tsx
│       ├── ProductDetail.tsx
│       └── productService.ts

# ❌ BAD - Layer-based with empty folders
src/
├── components/    # Has 10 empty subfolders
├── services/      # Has placeholder files
├── models/        # Empty "for future use"
└── utils/         # Contains only .gitkeep
```

### Progressive Structure Building

Build your project structure as you build features:

```typescript
// Day 1: Start with minimal structure
src/
└── App.tsx

// Day 5: Add first feature
src/
├── App.tsx
└── features/
    └── home/
        └── HomeScreen.tsx

// Day 10: Add second feature
src/
├── App.tsx
└── features/
    ├── home/
    │   └── HomeScreen.tsx
    └── auth/
        ├── LoginScreen.tsx
        └── authService.ts
```

---

## Feature Development Workflow

### When Starting a New Feature

1. **Plan the feature** (in documentation, not empty files)
2. **Create the first functional file** with actual implementation
3. **Add supporting files** as needed, with real content
4. **Refactor and organize** as the feature grows

### Example: Adding User Authentication

```bash
# Step 1: Create the first functional component
cat > src/features/auth/LoginScreen.tsx << 'EOF'
import React from 'react';
import { View, Text } from 'react-native';

export const LoginScreen = () => {
  return (
    <View>
      <Text>Login Screen</Text>
    </View>
  );
};
EOF

# Step 2: Add service when you need it (not before)
# When you actually need to call an API:
cat > src/features/auth/authService.ts << 'EOF'
export const login = async (email: string, password: string) => {
  // Actual implementation
  const response = await fetch('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  return response.json();
};
EOF

# Step 3: Add types when you have real types to define
cat > src/features/auth/types.ts << 'EOF'
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
EOF
```

---

## Code Quality Standards

### File Lifecycle Management

1. **Creation**: Only when implementing functionality
2. **Maintenance**: Keep files focused and clean
3. **Deletion**: Remove immediately when obsolete

### Signs a File Should Not Exist

- Contains only TODOs or comments
- Has only boilerplate with no real implementation
- Exports nothing or only re-exports
- Has been commented out entirely
- Contains only type definitions never used
- Is a "backup" or "old" version

### Version Control Hygiene

```bash
# ❌ BAD - Committing empty structure
git add src/features/future-feature/
git commit -m "Add folder structure for future feature"

# ✅ GOOD - Committing implemented features
git add src/features/auth/
git commit -m "Implement user authentication with login screen"
```

---

## Anti-Patterns to Avoid

### 1. Premature Structure Creation

**Anti-pattern:**
```
src/
├── features/
│   ├── feature1/  # Empty
│   ├── feature2/  # Empty
│   ├── feature3/  # Empty
│   └── feature4/  # Only one has code
```

**Better approach:**
```
src/
└── features/
    └── feature4/  # Only what's implemented
```

### 2. Placeholder Files

**Anti-pattern:**
```typescript
// ProfileScreen.tsx
// TODO: Implement profile screen
export const ProfileScreen = () => null;
```

**Better approach:**
Don't create ProfileScreen.tsx until you're ready to implement it.

### 3. Future-Proofing Folders

**Anti-pattern:**
```
src/
├── android-specific/  # Empty, "might need later"
├── ios-specific/      # Empty, "might need later"
├── web-specific/      # Empty, "might need later"
```

**Better approach:**
Create platform-specific folders only when you have platform-specific code.

### 4. Configuration File Sprawl

**Anti-pattern:**
Having 10+ configuration files that are mostly defaults or empty.

**Better approach:**
Start with minimal configuration, add config files only when defaults don't work.

### 5. The ".gitkeep" Anti-Pattern

**Anti-pattern:**
```
src/
├── components/.gitkeep
├── services/.gitkeep
├── utils/.gitkeep
```

**Better approach:**
Git tracks files, not folders. Create folders when you have files to put in them.

---

## Best Practices Summary

### DO:
- ✅ Create files with immediate, working implementation
- ✅ Build structure organically as features develop
- ✅ Delete unused code immediately
- ✅ Keep every file focused and purposeful
- ✅ Refactor structure when patterns emerge

### DON'T:
- ❌ Create empty folders "for later"
- ❌ Add placeholder or TODO files
- ❌ Keep commented-out code
- ❌ Maintain unused imports or exports
- ❌ Create structure before implementation

### The Golden Rule

> **"Every file and folder in your project should exist because it contains working code that provides immediate value."**

If you can't explain what value a file provides RIGHT NOW, it shouldn't exist in your codebase.