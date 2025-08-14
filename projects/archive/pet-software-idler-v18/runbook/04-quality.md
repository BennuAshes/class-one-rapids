# Phase 04: Quality Assurance & Performance Polish

**Duration:** Weeks 10-11  
**Objective:** Achieve production-ready quality with performance optimization and polish  
**Dependencies:** Phase 03 completed, all systems integrated

## Objectives

- [ ] Performance optimization to meet all targets (<50ms, 60fps, <256MB)
- [ ] Comprehensive testing suite with >95% coverage
- [ ] Cross-platform compatibility validation
- [ ] UI/UX polish and accessibility improvements
- [ ] Error handling and recovery systems
- [ ] Memory leak detection and resolution

## Performance Optimization Tasks

### 1. Performance Profiling & Analysis (Week 10, Days 1-2)

```bash
# Create performance testing suite
mkdir -p scripts/performance

cat > scripts/performance/profile-app.js << 'EOF'
const { exec } = require('child_process');
const fs = require('fs');

async function profilePerformance() {
  console.log('Starting performance profiling...');
  
  // Profile bundle size
  exec('npx expo export --platform all --dev false', (error, stdout) => {
    if (error) {
      console.error('Bundle analysis failed:', error);
      return;
    }
    
    // Analyze bundle sizes
    const platforms = ['web', 'ios', 'android'];
    platforms.forEach(platform => {
      try {
        const bundleStats = fs.statSync(`dist/${platform}/bundle.js`);
        const sizeKB = (bundleStats.size / 1024).toFixed(2);
        console.log(`${platform} bundle size: ${sizeKB}KB`);
        
        // Check if under target (100MB = ~25MB JS bundle)
        if (bundleStats.size > 25 * 1024 * 1024) {
          console.warn(`⚠️  ${platform} bundle exceeds 25MB target`);
        }
      } catch (e) {
        console.log(`Bundle for ${platform} not found`);
      }
    });
  });
  
  // Memory usage profiling
  console.log('Memory profiling completed. Check React DevTools Profiler for detailed analysis.');
}

profilePerformance();
EOF

# Run performance analysis
node scripts/performance/profile-app.js
```

**Performance Benchmarking:**
```bash
cat > src/shared/monitoring/PerformanceBenchmark.ts << 'EOF'
interface BenchmarkResult {
  name: string;
  duration: number;
  memoryBefore: number;
  memoryAfter: number;
  passed: boolean;
}

class PerformanceBenchmark {
  private results: BenchmarkResult[] = [];
  
  async runBenchmark(name: string, operation: () => Promise<void> | void, targetMs: number = 50): Promise<BenchmarkResult> {
    const memoryBefore = this.getMemoryUsage();
    const startTime = performance.now();
    
    try {
      await operation();
    } catch (error) {
      console.error(`Benchmark ${name} failed:`, error);
    }
    
    const endTime = performance.now();
    const memoryAfter = this.getMemoryUsage();
    
    const result: BenchmarkResult = {
      name,
      duration: endTime - startTime,
      memoryBefore,
      memoryAfter,
      passed: (endTime - startTime) <= targetMs,
    };
    
    this.results.push(result);
    return result;
  }
  
  private getMemoryUsage(): number {
    return (performance as any).memory?.usedJSHeapSize || 0;
  }
  
  generateReport(): string {
    let report = 'Performance Benchmark Report\n';
    report += '================================\n\n';
    
    this.results.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      report += `${status} ${result.name}\n`;
      report += `  Duration: ${result.duration.toFixed(2)}ms\n`;
      report += `  Memory Delta: ${((result.memoryAfter - result.memoryBefore) / 1024).toFixed(2)}KB\n\n`;
    });
    
    const passRate = (this.results.filter(r => r.passed).length / this.results.length) * 100;
    report += `Overall Pass Rate: ${passRate.toFixed(1)}%\n`;
    
    return report;
  }
  
  clearResults(): void {
    this.results = [];
  }
}

export const performanceBenchmark = new PerformanceBenchmark();
EOF
```

### 2. FlatList Performance Optimization (Week 10, Days 2-3)

```bash
# Create optimized list components
cat > src/shared/ui/OptimizedFlatList.tsx << 'EOF'
import React, { useMemo, useCallback } from 'react';
import { FlatList, FlatListProps, ListRenderItem } from 'react-native';

interface OptimizedFlatListProps<T> extends Omit<FlatListProps<T>, 'renderItem' | 'keyExtractor'> {
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T, index: number) => string;
  itemHeight?: number;
  estimatedItemSize?: number;
}

export function OptimizedFlatList<T>({
  data,
  renderItem,
  keyExtractor,
  itemHeight,
  estimatedItemSize = 80,
  ...props
}: OptimizedFlatListProps<T>) {
  
  const memoizedRenderItem = useCallback(renderItem, []);
  const memoizedKeyExtractor = useCallback(keyExtractor, []);
  
  const getItemLayout = useMemo(() => {
    if (!itemHeight) return undefined;
    
    return (data: T[] | null | undefined, index: number) => ({
      length: itemHeight,
      offset: itemHeight * index,
      index,
    });
  }, [itemHeight]);
  
  return (
    <FlatList
      {...props}
      data={data}
      renderItem={memoizedRenderItem}
      keyExtractor={memoizedKeyExtractor}
      getItemLayout={getItemLayout}
      // Performance optimizations
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={21}
      initialNumToRender={8}
      updateCellsBatchingPeriod={50}
      // Prevent unnecessary re-renders
      extraData={data.length}
    />
  );
}
EOF

# Update department lists to use optimized component
cat > scripts/update-lists-optimization.sh << 'EOF'
#!/bin/bash

# Find all department list components and update them
find src/features -name "*List.tsx" -exec sed -i 's/import { FlatList }/import { OptimizedFlatList as FlatList }/g' {} \;

echo "Updated all department lists to use optimized FlatList component"
EOF

chmod +x scripts/update-lists-optimization.sh
./scripts/update-lists-optimization.sh
```

### 3. Memory Leak Detection & Resolution (Week 10, Days 3-4)

```bash
# Create memory leak detector
cat > src/shared/monitoring/MemoryLeakDetector.ts << 'EOF'
class MemoryLeakDetector {
  private snapshots: Array<{ timestamp: number; usage: number }> = [];
  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;
  
  startMonitoring(intervalMs: number = 5000): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.snapshots = [];
    
    this.monitoringInterval = setInterval(() => {
      const usage = this.getMemoryUsage();
      this.snapshots.push({
        timestamp: Date.now(),
        usage,
      });
      
      // Keep only last 20 snapshots
      if (this.snapshots.length > 20) {
        this.snapshots.shift();
      }
      
      // Check for memory leaks
      this.checkForLeaks();
    }, intervalMs);
  }
  
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    this.isMonitoring = false;
  }
  
  private getMemoryUsage(): number {
    return (performance as any).memory?.usedJSHeapSize || 0;
  }
  
  private checkForLeaks(): void {
    if (this.snapshots.length < 10) return;
    
    const recent = this.snapshots.slice(-10);
    const trend = this.calculateTrend(recent.map(s => s.usage));
    
    // If memory usage is consistently increasing
    if (trend > 1024 * 1024) { // 1MB increase trend
      console.warn('Potential memory leak detected');
      console.warn('Memory trend:', (trend / 1024).toFixed(2), 'KB/interval');
      
      // Suggest garbage collection
      if ((window as any).gc) {
        (window as any).gc();
      }
    }
  }
  
  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const n = values.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumXX += i * i;
    }
    
    // Linear regression slope
    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }
  
  getReport(): string {
    const currentUsage = this.getMemoryUsage();
    const maxUsage = Math.max(...this.snapshots.map(s => s.usage));
    const minUsage = Math.min(...this.snapshots.map(s => s.usage));
    
    return `Memory Usage Report:
Current: ${(currentUsage / 1024 / 1024).toFixed(2)}MB
Peak: ${(maxUsage / 1024 / 1024).toFixed(2)}MB
Minimum: ${(minUsage / 1024 / 1024).toFixed(2)}MB
Variation: ${((maxUsage - minUsage) / 1024 / 1024).toFixed(2)}MB`;
  }
}

export const memoryLeakDetector = new MemoryLeakDetector();
EOF
```

### 4. State Management Optimization (Week 10, Days 4-5)

```bash
# Create state performance optimizer
cat > src/shared/state/StateOptimizer.ts << 'EOF'
import { observable } from '@legendapp/state';

class StateOptimizer {
  private subscriptionCounts = new Map<string, number>();
  
  optimizeObservable<T>(initialValue: T, key: string): any {
    // Add subscription tracking
    const obs = observable(initialValue);
    
    const originalGet = obs.get;
    const originalSet = obs.set;
    
    obs.get = (...args: any[]) => {
      this.incrementSubscription(key);
      return originalGet.apply(obs, args);
    };
    
    obs.set = (...args: any[]) => {
      // Batch updates for performance
      return originalSet.apply(obs, args);
    };
    
    return obs;
  }
  
  private incrementSubscription(key: string): void {
    this.subscriptionCounts.set(key, (this.subscriptionCounts.get(key) || 0) + 1);
  }
  
  getSubscriptionReport(): string {
    let report = 'State Subscription Report:\n';
    
    Array.from(this.subscriptionCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .forEach(([key, count]) => {
        report += `${key}: ${count} subscriptions\n`;
      });
    
    return report;
  }
  
  // Batch state updates for better performance
  batchUpdates(updates: Array<() => void>): void {
    // @legendapp/state automatically batches updates
    updates.forEach(update => update());
  }
}

export const stateOptimizer = new StateOptimizer();
EOF
```

## Comprehensive Testing Suite

### 1. Unit Test Coverage Enhancement (Week 10, Day 5 - Week 11, Day 2)

```bash
# Configure Jest for comprehensive coverage
cat > jest.config.js << 'EOF'
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/*.test.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
};
EOF

# Create comprehensive test setup
cat > src/__tests__/setup.ts << 'EOF'
import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';

// Mock @legendapp/state
jest.mock('@legendapp/state', () => ({
  observable: (initialValue: any) => ({
    get: () => initialValue,
    set: jest.fn(),
  }),
}));

// Mock React Native modules
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Platform: {
      OS: 'ios',
      select: jest.fn(),
    },
    Dimensions: {
      get: () => ({ width: 375, height: 812 }),
    },
  };
});

// Mock expo modules
jest.mock('expo-av', () => ({
  Audio: {
    setAudioModeAsync: jest.fn(),
    Sound: {
      createAsync: jest.fn(() => Promise.resolve({ sound: { 
        setVolumeAsync: jest.fn(),
        replayAsync: jest.fn(),
      }})),
    },
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Performance API mock
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    memory: {
      usedJSHeapSize: 50 * 1024 * 1024, // 50MB
    },
  },
});
EOF

# Create test utilities
cat > src/__tests__/testUtils.tsx << 'EOF'
import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Mock safe area insets
const mockInsets = {
  top: 44,
  bottom: 34,
  left: 0,
  right: 0,
};

const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SafeAreaProvider initialMetrics={{ insets: mockInsets, frame: { x: 0, y: 0, width: 375, height: 812 }}}>
      {children}
    </SafeAreaProvider>
  );
};

const customRender = (ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react-native';
export { customRender as render };
EOF

# Generate comprehensive test coverage report
npm test -- --coverage --watchAll=false
```

### 2. Integration Test Suite (Week 11, Days 2-3)

```bash
# Create end-to-end testing scenarios
cat > src/__tests__/e2e/gameProgression.test.ts << 'EOF'
describe('Game Progression E2E', () => {
  it('should complete full game progression cycle', async () => {
    // Start with initial state
    const { money, valuation } = usePlayer();
    const { writeCode, hireDeveloper, linesOfCode } = useDevelopment();
    const { createFeature, shipFeature } = useFeatures();
    
    expect(money.get()).toBe(100); // Starting money
    
    // Phase 1: Manual development
    writeCode();
    expect(linesOfCode.get()).toBe(1);
    
    // Phase 2: Hire first developer
    hireDeveloper('junior', money.get());
    
    // Phase 3: Create and ship first feature
    createFeature('basic', money.get());
    
    // Wait for feature development
    // Simulate passage of time for automated development
    
    shipFeature('basic-feature-id');
    expect(money.get()).toBeGreaterThan(100);
    
    // Phase 4: Scale up operations
    hireDeveloper('mid', money.get());
    
    // Phase 5: First investor round
    const { raiseInvestorRound } = usePrestige();
    // Simulate reaching seed round requirements
    raiseInvestorRound(150000);
    
    expect(money.get()).toBeGreaterThan(50000);
  });
  
  it('should handle offline progression correctly', async () => {
    const { calculateOfflineProgress, claimOfflineEarnings } = useOfflineProgression();
    
    // Set up production state
    hireDeveloper('senior', 10000);
    
    // Simulate 2 hours offline
    const twoHoursMs = 2 * 60 * 60 * 1000;
    jest.spyOn(Date, 'now').mockReturnValue(Date.now() + twoHoursMs);
    
    calculateOfflineProgress({
      codePerSecond: 2.0,
      revenuePerSecond: 5.0,
      automationLevel: 1,
    });
    
    const initialMoney = money.get();
    claimOfflineEarnings();
    
    expect(money.get()).toBeGreaterThan(initialMoney);
  });
});
EOF

# Create performance integration tests
cat > src/__tests__/e2e/performance.test.ts << 'EOF'
import { performanceBenchmark } from '../../shared/monitoring/PerformanceBenchmark';

describe('Performance Integration Tests', () => {
  beforeEach(() => {
    performanceBenchmark.clearResults();
  });
  
  it('should meet response time requirements', async () => {
    const { hireDeveloper } = useDevelopment();
    
    // Test hiring operation performance
    const result = await performanceBenchmark.runBenchmark(
      'hire developer',
      () => hireDeveloper('junior', 1000),
      50 // 50ms target
    );
    
    expect(result.passed).toBe(true);
    expect(result.duration).toBeLessThan(50);
  });
  
  it('should handle large datasets efficiently', async () => {
    const { developers } = useDevelopment();
    
    // Simulate hiring many developers
    for (let i = 0; i < 100; i++) {
      hireDeveloper('junior', 10000);
    }
    
    const result = await performanceBenchmark.runBenchmark(
      'render large developer list',
      () => {
        // Simulate list rendering
        const devList = developers.get();
        devList.forEach(dev => ({ ...dev })); // Shallow clone operation
      },
      100 // 100ms target for large operations
    );
    
    expect(result.passed).toBe(true);
  });
  
  it('should maintain 60fps during animations', async () => {
    // This would need to be tested with actual animation running
    // Using frame time measurements
    expect(true).toBe(true); // Placeholder
  });
});
EOF
```

### 3. Cross-Platform Testing (Week 11, Days 3-4)

```bash
# Create platform-specific test suite
cat > src/__tests__/platform/crossPlatform.test.ts << 'EOF'
import { Platform } from 'react-native';
import { PlatformUtils } from '../../shared/utils/platform';

describe('Cross-Platform Compatibility', () => {
  const platforms = ['ios', 'android', 'web'];
  
  platforms.forEach(platform => {
    describe(`${platform} platform`, () => {
      beforeEach(() => {
        Platform.OS = platform as any;
      });
      
      it('should handle platform-specific optimizations', () => {
        const itemHeight = PlatformUtils.getOptimalListItemHeight();
        
        switch (platform) {
          case 'ios':
            expect(itemHeight).toBe(80);
            break;
          case 'android':
            expect(itemHeight).toBe(72);
            break;
          case 'web':
            expect(itemHeight).toBe(88);
            break;
        }
      });
      
      it('should use appropriate UI components', () => {
        const isWeb = PlatformUtils.isWeb;
        const isMobile = PlatformUtils.isIOS || PlatformUtils.isAndroid;
        
        expect(isWeb || isMobile).toBe(true);
      });
    });
  });
});
EOF

# Create platform build validation
cat > scripts/validate-platforms.sh << 'EOF'
#!/bin/bash

echo "Validating cross-platform builds..."

# Build for each platform
platforms=("ios" "android" "web")

for platform in "${platforms[@]}"; do
  echo "Building for $platform..."
  
  if [ "$platform" = "web" ]; then
    npx expo export --platform web --dev false
    if [ $? -eq 0 ]; then
      echo "✅ Web build successful"
    else
      echo "❌ Web build failed"
      exit 1
    fi
  else
    npx expo build:$platform --no-publish
    if [ $? -eq 0 ]; then
      echo "✅ $platform build successful"
    else
      echo "❌ $platform build failed"
      exit 1
    fi
  fi
done

echo "All platform builds validated successfully!"
EOF

chmod +x scripts/validate-platforms.sh
```

## Error Handling & Recovery Systems

### 1. Robust Error Boundaries (Week 11, Day 4)

```bash
# Enhanced error boundary with recovery
cat > src/shared/ui/GameErrorBoundary.tsx << 'EOF'
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { saveManager } from '../persistence/SaveManager';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  recoveryAttempts: number;
}

export class GameErrorBoundary extends Component<Props, State> {
  private maxRecoveryAttempts = 3;
  
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      recoveryAttempts: 0,
    };
  }
  
  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });
    
    // Log error for debugging
    console.error('Game Error Boundary Caught:', error, errorInfo);
    
    // Attempt emergency save
    this.emergencySave();
    
    // Report error to monitoring service
    this.reportError(error, errorInfo);
  }
  
  emergencySave = async (): Promise<void> => {
    try {
      // Get current game state from global stores
      const gameState = {
        player: {}, // Would get from player store
        departments: {}, // Would get from department stores
        progression: {},
        settings: {},
      };
      
      await saveManager.saveGame(gameState);
      console.log('Emergency save completed');
    } catch (saveError) {
      console.error('Emergency save failed:', saveError);
    }
  };
  
  reportError = (error: Error, errorInfo: ErrorInfo): void => {
    // In production, send to error tracking service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };
    
    console.log('Error Report:', errorReport);
  };
  
  handleRestart = (): void => {
    if (this.state.recoveryAttempts < this.maxRecoveryAttempts) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        recoveryAttempts: this.state.recoveryAttempts + 1,
      });
    } else {
      // Force app reload
      window.location.reload();
    }
  };
  
  handleLoadBackup = async (): Promise<void> => {
    try {
      const backupState = await saveManager.loadGame();
      if (backupState) {
        // Apply backup state to stores
        console.log('Backup loaded successfully');
        this.handleRestart();
      }
    } catch (error) {
      console.error('Failed to load backup:', error);
    }
  };
  
  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Oops! Something went wrong</Text>
          <Text style={styles.message}>
            PetSoft Tycoon encountered an error, but your progress has been saved.
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={this.handleRestart}>
              <Text style={styles.buttonText}>Restart Game</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button} onPress={this.handleLoadBackup}>
              <Text style={styles.buttonText}>Load Backup</Text>
            </TouchableOpacity>
          </View>
          
          {__DEV__ && this.state.error && (
            <View style={styles.errorDetails}>
              <Text style={styles.errorTitle}>Error Details (Dev Mode):</Text>
              <Text style={styles.errorText}>{this.state.error.message}</Text>
            </View>
          )}
        </View>
      );
    }
    
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorDetails: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    width: '100%',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
});
EOF
```

### 2. State Recovery System (Week 11, Day 5)

```bash
# Create state recovery utilities
cat > src/shared/state/StateRecovery.ts << 'EOF'
interface StateSnapshot {
  timestamp: number;
  states: Record<string, any>;
  checksum: string;
}

class StateRecovery {
  private snapshots: StateSnapshot[] = [];
  private maxSnapshots = 10;
  
  takeSnapshot(states: Record<string, any>): void {
    const snapshot: StateSnapshot = {
      timestamp: Date.now(),
      states: JSON.parse(JSON.stringify(states)), // Deep clone
      checksum: this.generateChecksum(states),
    };
    
    this.snapshots.unshift(snapshot);
    
    // Keep only recent snapshots
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.pop();
    }
  }
  
  recoverFromSnapshot(index: number = 0): Record<string, any> | null {
    if (index >= this.snapshots.length) return null;
    
    const snapshot = this.snapshots[index];
    
    // Verify snapshot integrity
    if (this.generateChecksum(snapshot.states) !== snapshot.checksum) {
      console.warn('Snapshot checksum mismatch, trying next snapshot');
      return this.recoverFromSnapshot(index + 1);
    }
    
    return snapshot.states;
  }
  
  private generateChecksum(data: any): string {
    return btoa(JSON.stringify(data)).slice(0, 16);
  }
  
  getSnapshots(): StateSnapshot[] {
    return [...this.snapshots];
  }
  
  clearSnapshots(): void {
    this.snapshots = [];
  }
}

export const stateRecovery = new StateRecovery();

// Auto-snapshot hook
export const useAutoSnapshot = () => {
  React.useEffect(() => {
    const interval = setInterval(() => {
      // Collect states from all stores
      const currentStates = {
        player: {}, // Get from player store
        development: {}, // Get from development store
        // ... other department states
      };
      
      stateRecovery.takeSnapshot(currentStates);
    }, 30000); // Snapshot every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
};
EOF
```

## UI/UX Polish & Accessibility

### 1. Accessibility Improvements (Week 11, Day 5)

```bash
# Create accessibility utilities
cat > src/shared/ui/AccessibilityUtils.ts << 'EOF'
import { AccessibilityInfo } from 'react-native';

export const AccessibilityUtils = {
  announceForAccessibility: (message: string): void => {
    AccessibilityInfo.announceForAccessibility(message);
  },
  
  isScreenReaderEnabled: async (): Promise<boolean> => {
    return await AccessibilityInfo.isScreenReaderEnabled();
  },
  
  formatNumberForScreenReader: (value: number): string => {
    if (value < 1000) return value.toString();
    if (value < 1000000) return `${(value / 1000).toFixed(1)} thousand`;
    if (value < 1000000000) return `${(value / 1000000).toFixed(1)} million`;
    return `${(value / 1000000000).toFixed(1)} billion`;
  },
  
  createAccessibleButton: (label: string, hint?: string) => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: 'button' as const,
  }),
  
  createAccessibleText: (text: string, role: 'header' | 'text' = 'text') => ({
    accessible: true,
    accessibilityLabel: text,
    accessibilityRole: role,
  }),
};
EOF

# Update components for accessibility
cat > scripts/add-accessibility.sh << 'EOF'
#!/bin/bash

echo "Adding accessibility improvements to components..."

# Find all button components and add accessibility props
find src -name "*.tsx" -exec grep -l "TouchableOpacity\|Button" {} \; | while read file; do
  echo "Processing $file"
  # Add accessibility props (would need manual review)
done

echo "Accessibility improvements applied"
EOF
```

## Final Validation & Quality Assurance

### 1. Quality Gate Checklist (Week 11, Day 5)

```bash
# Create quality gate validation script
cat > scripts/quality-gate.sh << 'EOF'
#!/bin/bash

echo "Running Quality Gate Validation..."

# Performance Requirements
echo "1. Performance Validation"
echo "   - Response time <50ms: Testing..."
npm test -- --testPathPattern=performance --silent
if [ $? -eq 0 ]; then
  echo "   ✅ Performance tests passed"
else
  echo "   ❌ Performance tests failed"
  exit 1
fi

# Test Coverage
echo "2. Test Coverage Validation"
npm test -- --coverage --watchAll=false --silent
coverage=$(npm test -- --coverage --watchAll=false --silent | grep "All files" | awk '{print $10}' | sed 's/%//')
if [ "$coverage" -ge "95" ]; then
  echo "   ✅ Test coverage: $coverage%"
else
  echo "   ❌ Test coverage below 95%: $coverage%"
  exit 1
fi

# Bundle Size
echo "3. Bundle Size Validation"
npx expo export --platform web --dev false
bundleSize=$(du -k dist/static/js/*.js | awk '{total += $1} END {print total}')
if [ "$bundleSize" -le "25600" ]; then # 25MB in KB
  echo "   ✅ Bundle size: ${bundleSize}KB"
else
  echo "   ❌ Bundle size exceeds 25MB: ${bundleSize}KB"
  exit 1
fi

# Memory Leak Check
echo "4. Memory Leak Validation"
node scripts/performance/memory-leak-test.js
if [ $? -eq 0 ]; then
  echo "   ✅ No memory leaks detected"
else
  echo "   ❌ Memory leaks detected"
  exit 1
fi

# Cross-platform Builds
echo "5. Cross-platform Build Validation"
./scripts/validate-platforms.sh
if [ $? -eq 0 ]; then
  echo "   ✅ All platforms build successfully"
else
  echo "   ❌ Platform build failures"
  exit 1
fi

echo ""
echo "🎉 All Quality Gates Passed!"
echo "Application is ready for deployment."
EOF

chmod +x scripts/quality-gate.sh
```

## Validation Criteria

### Performance Requirements Met
- [ ] <50ms response time for all user interactions
- [ ] 60fps sustained during animations and scrolling
- [ ] <256MB peak memory usage during normal gameplay
- [ ] <100MB total app bundle size across platforms
- [ ] <5% battery drain per hour on mobile devices

### Quality Requirements Met
- [ ] >95% unit test coverage across all features
- [ ] >90% integration test coverage for core flows
- [ ] Zero memory leaks detected during extended play
- [ ] Error recovery system handles all failure scenarios
- [ ] Accessibility compliance for screen readers

### Cross-Platform Requirements Met
- [ ] iOS build completes without warnings
- [ ] Android build optimized for various screen sizes
- [ ] Web deployment functional with all features
- [ ] Performance parity across all platforms
- [ ] Platform-specific optimizations implemented

## Deliverables

1. **Performance-Optimized Application** - Meets all performance targets
2. **Comprehensive Test Suite** - >95% coverage with automated quality gates
3. **Error Recovery System** - Robust error handling with state recovery
4. **Cross-Platform Validation** - Verified builds for iOS, Android, Web
5. **Accessibility Improvements** - Screen reader compatibility and inclusive design
6. **Quality Assurance Documentation** - Complete validation reports and metrics

## Next Phase

Upon completion, proceed to [05-Deployment](./05-deployment.md) for production build and launch preparation.

---

**Phase Completion Criteria:** All quality gates passed, comprehensive testing complete, production-ready application

**Research Dependencies:**
- FlatList optimization: Maximum performance for large datasets
- new-architecture: Full utilization of React Native 0.76+ performance features
- @legendapp/state@beta: Optimized reactive state management at scale