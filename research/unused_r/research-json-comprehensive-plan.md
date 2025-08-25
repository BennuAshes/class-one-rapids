# Research.json Comprehensive Implementation Plan

## **Executive Summary**

Transform the current markdown-file-scanning research system into a high-performance, structured JSON index that provides 10-50x faster lookups, better reliability, and enables advanced features like conflict detection and template generation.

## **Current System Analysis**

### **Current Research Structure**
```
research/
├── tech/*.md (expo.md, react-native.md, solid.md, etc.)
├── planning/*.md (vertical-slicing.md, etc.)
└── agentic/*.md
```

### **Current Performance Issues**
- **File scanning**: O(n) files × O(m) average file size = O(n×m)
- **No caching**: Full scan every command execution
- **Fragile parsing**: Regex-based extraction from markdown
- **Estimated overhead**: 200-500ms per command for research validation

### **Current Reliability Issues**
- Pattern matching inconsistencies
- Version extraction logic duplicated across commands
- No detection of stale research data
- Error-prone markdown parsing

## **Proposed research.json Structure**

### **Core Schema Design**
```json
{
  "metadata": {
    "version": "1.0.0",
    "generated_at": "2025-01-15T10:00:00Z",
    "source_hash": "abc123...",
    "generator_version": "1.2.3"
  },
  "packages": {
    "@legendapp/state": {
      "version": "@beta",
      "source_file": "research/tech/legend-state.md",
      "source_lines": [45, 67],
      "install_command": "npm install @legendapp/state@beta",
      "confidence": "high",
      "last_validated": "2025-01-15T10:00:00Z",
      "notes": "Beta version required for React 18 compatibility",
      "alternatives": ["zustand", "valtio"],
      "deprecation_status": null,
      "platform_specific": {
        "ios": "requires iOS 13+",
        "android": "requires API 24+"
      },
      "breaking_changes": ["new observable API", "removed deprecated methods"]
    }
  },
  "patterns": {
    "vertical-slicing": {
      "source_file": "research/planning/vertical-slicing.md",
      "source_lines": [83, 84],
      "description": "Feature-based folder organization",
      "rules": [
        {
          "type": "folder_structure",
          "check": "no root-level entities/ or services/ folders",
          "correction": "move to features/*/entities/ or features/*/services/",
          "severity": "error",
          "auto_fix": true
        }
      ],
      "template_structure": {
        "src/": {
          "features/": {
            "{feature-name}/": {
              "components/": {},
              "hooks/": {},
              "services/": {},
              "state/": {},
              "types/": {}
            }
          },
          "shared/": {
            "utils/": {},
            "types/": {},
            "hooks/": {}
          }
        }
      },
      "code_examples": {
        "good": "src/features/auth/components/LoginForm.tsx",
        "bad": "src/components/LoginForm.tsx",
        "reason": "Components should be feature-scoped"
      }
    }
  },
  "compatibility_matrix": {
    "react-native@0.76": {
      "compatible_with": {
        "@legendapp/state": "@beta",
        "expo": "~52.0.0"
      },
      "incompatible_with": {
        "react-native-reanimated": "<3.0.0"
      },
      "known_issues": [
        "Metro bundler requires additional config for Legend State"
      ]
    }
  },
  "validation_rules": {
    "package_installation": [
      {
        "pattern": "npm install @legendapp/state$",
        "correction": "npm install @legendapp/state@beta",
        "reason": "Beta version required for React 18 compatibility",
        "confidence": "high"
      }
    ],
    "folder_structure": [
      {
        "forbidden_patterns": ["src/entities/", "src/services/"],
        "correction": "move to features/*/entities/ or features/*/services/",
        "severity": "error",
        "auto_fix": true
      }
    ]
  },
  "templates": {
    "react-native-expo-legend": {
      "description": "React Native + Expo + Legend State project template",
      "folder_structure": {...},
      "initial_packages": ["@legendapp/state@beta", "expo@~52.0.0"],
      "config_files": {
        "tsconfig.json": "...template content...",
        "package.json": "...base package.json..."
      }
    }
  },
  "deprecations": {
    "packages": [
      {
        "name": "react-native-elements",
        "replacement": "@react-native-community/elements",
        "deprecated_since": "2024-01-01",
        "removal_date": "2025-01-01"
      }
    ]
  }
}
```

## **Technical Implementation Details**

### **1. Generation Algorithm**

```typescript
interface ResearchScanner {
  scanResearchFiles(): Promise<ResearchIndex>;
  extractPackageInfo(content: string, filename: string): PackageInfo[];
  extractPatterns(content: string, filename: string): PatternInfo[];
  validateExtractedData(data: ResearchIndex): ValidationResult;
  generateCompatibilityMatrix(packages: PackageInfo[]): CompatibilityMatrix;
}

async function generateResearchIndex(): Promise<ResearchIndex> {
  const index = new ResearchIndex();
  
  // Scan all research files with hash tracking
  const researchFiles = await glob('research/**/*.md');
  
  for (const file of researchFiles) {
    const content = await readFile(file);
    const hash = hashContent(content);
    
    // Extract structured data with provenance tracking
    const packages = extractPackages(content, file);
    const patterns = extractPatterns(content, file);
    const technologies = extractTechnologies(content, file);
    
    // Add to index with full provenance
    index.addPackages(packages, { file, hash, timestamp: Date.now() });
    index.addPatterns(patterns, { file, hash, timestamp: Date.now() });
    index.addTechnologies(technologies, { file, hash, timestamp: Date.now() });
  }
  
  // Generate derived data
  index.compatibilityMatrix = generateCompatibilityMatrix(index.packages);
  index.validationRules = generateValidationRules(index.packages, index.patterns);
  index.templates = generateTemplates(index.patterns, index.packages);
  
  return index;
}
```

### **2. Incremental Update System**

```typescript
interface ChangeDetector {
  detectChanges(currentIndex: ResearchIndex): Promise<ChangeSet>;
  getFileHashes(files: string[]): Promise<Map<string, string>>;
  determineUpdateStrategy(changes: ChangeSet): UpdateStrategy;
}

async function updateResearchIndex(existingIndex: ResearchIndex): Promise<ResearchIndex> {
  const changes = await detectChanges(existingIndex);
  
  if (changes.isEmpty()) {
    return existingIndex; // No changes, return cached
  }
  
  // Only re-process changed files
  const updatedIndex = cloneIndex(existingIndex);
  
  for (const file of changes.modified.concat(changes.added)) {
    const content = await readFile(file);
    const extractedData = extractFromFile(content, file);
    updatedIndex.updateFile(file, extractedData);
  }
  
  for (const file of changes.deleted) {
    updatedIndex.removeFile(file);
  }
  
  // Regenerate only affected derived data
  updatedIndex.regenerateDerivedData(changes.affectedSections);
  
  return updatedIndex;
}
```

### **3. Query Interface Design**

```typescript
interface ResearchQuery {
  // Package queries
  getPackageVersion(packageName: string): PackageInfo | null;
  getCompatiblePackages(packageName: string): PackageInfo[];
  validatePackageInstall(command: string): ValidationResult;
  
  // Pattern queries  
  getPattern(patternName: string): PatternInfo | null;
  validateFolderStructure(structure: FolderStructure): ValidationResult[];
  getTemplateStructure(templateName: string): TemplateStructure | null;
  
  // Advanced queries
  getConflicts(packages: string[]): ConflictResult[];
  suggestAlternatives(packageName: string): PackageInfo[];
  getUpgradePath(from: string, to: string): UpgradePath | null;
}

// Usage examples
const query = new ResearchQuery(researchIndex);

// Package validation
const validation = query.validatePackageInstall('npm install @legendapp/state');
// Returns: { valid: false, correction: 'npm install @legendapp/state@beta', reason: '...' }

// Pattern validation
const violations = query.validateFolderStructure(projectStructure);
// Returns array of violations with specific corrections

// Conflict detection
const conflicts = query.getConflicts(['react-native@0.75', '@legendapp/state@beta']);
// Returns compatibility issues and resolutions
```

### **4. Performance Analysis**

| Operation | Current System | research.json System | Improvement |
|-----------|---------------|---------------------|-------------|
| Package lookup | 200-500ms (file scan) | 5-20ms (hash lookup) | **10-50x faster** |
| Pattern validation | 100-300ms (regex parsing) | 1-5ms (pre-compiled) | **20-100x faster** |
| Conflict detection | Not available | 10-50ms | **New capability** |
| Memory usage | Variable (file reads) | Predictable (single JSON) | **More efficient** |
| Consistency | Variable (parsing differences) | Guaranteed (structured) | **100% consistent** |

### **5. Data Integrity System**

```typescript
interface ValidationLayer {
  syntaxValidation(): ValidationResult;      // JSON structure valid
  semanticValidation(): ValidationResult;   // Logical consistency 
  sourceValidation(): ValidationResult;     // Sources still exist and match
  compatibilityValidation(): ValidationResult; // No package conflicts
  integrityValidation(): ValidationResult;  // Hash and timestamp consistency
}

interface ProvenanceTracking {
  source_file: string;
  source_lines: number[];
  extracted_at: Date;
  confidence_score: number;
  validation_method: string;
  manual_overrides: ManualOverride[];
}
```

## **Advanced Features Enabled**

### **1. Intelligent Conflict Resolution**
```json
{
  "conflicts": [
    {
      "packages": ["react-native@0.75", "@legendapp/state@beta"],
      "conflict_type": "version_incompatibility", 
      "resolution_options": [
        {
          "action": "upgrade",
          "package": "react-native",
          "to_version": "0.76+",
          "confidence": "high",
          "breaking_changes": ["new architecture required"]
        },
        {
          "action": "downgrade", 
          "package": "@legendapp/state",
          "to_version": "stable",
          "confidence": "medium",
          "limitations": ["missing React 18 features"]
        }
      ]
    }
  ]
}
```

### **2. Smart Template Generation**
```json
{
  "project_templates": {
    "react-native-idle-game": {
      "description": "Idle game with React Native + Expo + Legend State",
      "folder_structure": {
        "src/features/gameCore": ["components/", "state/", "hooks/"],
        "src/features/resources": ["components/", "state/", "services/"],
        "src/shared": ["utils/", "types/", "hooks/"]
      },
      "required_packages": {
        "@legendapp/state": "@beta",
        "expo": "~52.0.0",
        "react-native": "0.76+"
      },
      "config_templates": {
        "tsconfig.json": {...},
        "babel.config.js": {...}
      },
      "validation_rules": ["vertical-slicing", "modular-observables"]
    }
  }
}
```

### **3. Dependency Graph Analysis**
```json
{
  "dependency_analysis": {
    "react-native": {
      "direct_deps": ["metro", "hermes-engine"],
      "peer_deps": ["react"],
      "dev_deps": ["@react-native/metro-config"],
      "dependency_chain": {
        "depth": 3,
        "total_packages": 847,
        "security_vulnerabilities": 0,
        "outdated_packages": 12
      }
    }
  }
}
```

## **Migration Strategy**

### **Phase 1: Parallel Implementation (Week 1-2)**
- Generate research.json alongside existing system
- Commands check for research.json first, fallback to file scanning
- Validate research.json accuracy against current system
- Add `--force-regenerate` flag for testing

### **Phase 2: Gradual Migration (Week 3-4)**  
- Migrate package validation to research.json only
- Add architecture pattern validation from research.json
- Implement incremental update system
- Add CLI tools for research.json management

### **Phase 3: Feature Enhancement (Week 5-6)**
- Add conflict detection and resolution
- Implement template generation
- Add compatibility matrix features
- Enhanced error messages with provenance

### **Phase 4: Full Migration (Week 7-8)**
- Remove file scanning fallback
- Optimize performance further
- Add advanced features (dependency analysis, etc.)
- Complete documentation and examples

## **Developer Experience Improvements**

### **CLI Tooling**
```bash
# Index management
research-index generate                    # Generate from scratch
research-index update                      # Incremental update
research-index validate                    # Validate integrity

# Queries
research-index get-package @legendapp/state
research-index list-patterns
research-index check-conflicts react-native@0.75 expo@51

# Debugging
research-index debug-package @legendapp/state
research-index show-sources vertical-slicing
research-index verify-links
research-index stats                       # Show index statistics
```

### **Integration with Existing Commands**
```typescript
// Before (slow file scanning)
const researchData = await scanResearchFiles();
const packageInfo = findPackageInResearch(researchData, '@legendapp/state');

// After (fast structured lookup)
const researchIndex = await loadResearchIndex();
const packageInfo = researchIndex.getPackage('@legendapp/state');
```

## **Error Handling and Recovery**

### **Index Corruption Recovery**
```typescript
interface RecoveryStrategy {
  validateIndexIntegrity(): IntegrityResult;
  repairMinorCorruption(): RepairResult;
  regenerateFromScratch(): GenerationResult;
  backupAndRestore(): RestoreResult;
}

// Automatic recovery flow
if (!researchIndex.validateIntegrity()) {
  if (researchIndex.canRepair()) {
    researchIndex.repair();
  } else {
    researchIndex.regenerateFromScratch();
  }
}
```

### **Partial Index Support**
- If some research files fail to parse, mark as "needs_manual_review"
- Continue with successfully parsed sections
- Provide graceful degradation paths
- Clear error reporting for failed extractions

## **Benefits Summary**

### **Performance Benefits**
- **10-50x faster** research validation
- **Near-instant** package lookups
- **Predictable memory usage**
- **Scalable** to large research bases

### **Reliability Benefits**  
- **Consistent parsing** - no runtime variations
- **Source tracking** - know exactly where data comes from
- **Version control** - track research changes explicitly
- **Validation layers** - multiple integrity checks

### **Developer Experience Benefits**
- **Faster commands** - no waiting for research validation
- **Better errors** - structured messages with provenance
- **Rich tooling** - CLI tools for research management
- **Advanced features** - conflict detection, templates, etc.

### **Maintenance Benefits**
- **Change detection** - know exactly what research changed
- **Impact analysis** - see which projects affected by changes
- **Quality control** - automated consistency validation
- **Documentation** - self-documenting through metadata

## **Implementation Estimate**

| Phase | Duration | Key Deliverables | Risk Level |
|-------|----------|------------------|------------|
| Phase 1 | 2 weeks | Basic research.json generation, parallel operation | Low |
| Phase 2 | 2 weeks | Package validation migration, CLI tools | Medium |
| Phase 3 | 2 weeks | Advanced features, conflict detection | Medium |
| Phase 4 | 2 weeks | Full migration, optimization, documentation | Low |

**Total Estimate**: 8 weeks for complete implementation

This research.json system represents a fundamental architectural improvement that will enable much more sophisticated research management while dramatically improving performance and reliability.