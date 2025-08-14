# Phase 04: Quality - Polish, Performance Optimization, Testing

## Objectives

- Optimize performance for smooth 60fps gameplay
- Implement comprehensive testing strategy
- Add polish features (audio, animations, UI improvements)
- Complete remaining departments (Product, Design, QA, Marketing)
- Implement prestige system foundation
- Ensure production-ready stability

## Success Criteria

- [ ] Consistent 60fps performance on target devices
- [ ] Comprehensive test coverage for core functionality
- [ ] Audio system with dynamic sound effects
- [ ] All 7 departments fully implemented
- [ ] Prestige system functional
- [ ] No memory leaks or crashes
- [ ] Production-ready build configuration

## Time Estimate: 1 Week

---

## Task 1: Performance Optimization

### 1.1 Performance Monitoring Setup (1 hour)

**Objective**: Implement performance monitoring and optimization tools

**Create src/core/PerformanceMonitor.ts**:
```typescript
interface PerformanceMetrics {
  frameRate: number;
  memoryUsage: number;
  eventBusLoad: number;
  renderTime: number;
  stateUpdateTime: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    frameRate: 60,
    memoryUsage: 0,
    eventBusLoad: 0,
    renderTime: 0,
    stateUpdateTime: 0
  };

  private isMonitoring = false;
  private frameCount = 0;
  private lastFrameTime = performance.now();
  private eventCount = 0;
  private eventStartTime = Date.now();

  public startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.monitorFrameRate();
    this.monitorMemoryUsage();
    this.monitorEventBus();
  }

  public stopMonitoring(): void {
    this.isMonitoring = false;
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public logMetrics(): void {
    console.log('Performance Metrics:', {
      'Frame Rate': `${this.metrics.frameRate.toFixed(1)} fps`,
      'Memory Usage': `${this.metrics.memoryUsage.toFixed(1)} MB`,
      'Event Bus Load': `${this.metrics.eventBusLoad.toFixed(1)} events/sec`,
      'Render Time': `${this.metrics.renderTime.toFixed(2)} ms`,
      'State Update Time': `${this.metrics.stateUpdateTime.toFixed(2)} ms`
    });
  }

  private monitorFrameRate(): void {
    const measureFrame = () => {
      if (!this.isMonitoring) return;

      const currentTime = performance.now();
      const deltaTime = currentTime - this.lastFrameTime;
      
      this.frameCount++;
      
      // Calculate FPS every second
      if (this.frameCount >= 60) {
        this.metrics.frameRate = 1000 / (deltaTime / this.frameCount);
        this.frameCount = 0;
      }
      
      this.lastFrameTime = currentTime;
      requestAnimationFrame(measureFrame);
    };
    
    requestAnimationFrame(measureFrame);
  }

  private monitorMemoryUsage(): void {
    if ('memory' in performance) {
      setInterval(() => {
        if (!this.isMonitoring) return;
        
        const memory = (performance as any).memory;
        this.metrics.memoryUsage = memory.usedJSHeapSize / (1024 * 1024);
      }, 1000);
    }
  }

  private monitorEventBus(): void {
    setInterval(() => {
      if (!this.isMonitoring) return;
      
      const currentTime = Date.now();
      const timeWindow = currentTime - this.eventStartTime;
      
      if (timeWindow >= 1000) {
        this.metrics.eventBusLoad = (this.eventCount / timeWindow) * 1000;
        this.eventCount = 0;
        this.eventStartTime = currentTime;
      }
    }, 1000);
  }

  public trackEvent(): void {
    this.eventCount++;
  }

  public trackRenderTime(startTime: number): void {
    this.metrics.renderTime = performance.now() - startTime;
  }

  public trackStateUpdateTime(startTime: number): void {
    this.metrics.stateUpdateTime = performance.now() - startTime;
  }
}

export const performanceMonitor = new PerformanceMonitor();
```

### 1.2 EventBus Optimization (1.5 hours)

**Objective**: Optimize event system for high-frequency updates

**Update src/core/EventBus.ts**:
```typescript
// Add to existing EventBus class

export class EventBus {
  private handlers = new Map<string, Set<EventHandler>>();
  private isDestroyed = false;
  private eventQueue: Array<{ event: string; data: any }> = [];
  private isProcessingQueue = false;
  private batchSize = 10;
  private performanceMode = false;

  // Enable performance optimizations
  public enablePerformanceMode(): void {
    this.performanceMode = true;
  }

  // Batched emit for high-frequency events
  public emitBatched<T>(event: string, data: T): void {
    if (this.performanceMode) {
      this.eventQueue.push({ event, data });
      this.processQueueAsync();
    } else {
      this.emit(event, data);
    }
  }

  private async processQueueAsync(): Promise<void> {
    if (this.isProcessingQueue || this.eventQueue.length === 0) return;
    
    this.isProcessingQueue = true;
    
    while (this.eventQueue.length > 0) {
      const batch = this.eventQueue.splice(0, this.batchSize);
      
      // Process batch
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          batch.forEach(({ event, data }) => {
            const eventHandlers = this.handlers.get(event);
            if (eventHandlers) {
              eventHandlers.forEach(handler => {
                try {
                  handler(data);
                } catch (error) {
                  console.error(`EventBus: Error in handler for ${event}:`, error);
                }
              });
            }
          });
          resolve(void 0);
        });
      });
      
      // Yield control to prevent blocking
      if (this.eventQueue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    this.isProcessingQueue = false;
  }

  // Enhanced emit with performance tracking
  public emit<T>(event: string, data: T): void {
    if (this.isDestroyed) return;
    
    performanceMonitor.trackEvent();
    
    const eventHandlers = this.handlers.get(event);
    if (!eventHandlers) return;

    const startTime = performance.now();
    
    // Execute handlers
    eventHandlers.forEach(async (handler) => {
      try {
        await handler(data);
      } catch (error) {
        console.error(`EventBus: Error in handler for ${event}:`, error);
      }
    });
    
    performanceMonitor.trackStateUpdateTime(startTime);
  }

  // Debounced emit to prevent spam
  private debouncedEmits = new Map<string, NodeJS.Timeout>();
  
  public emitDebounced<T>(event: string, data: T, delay: number = 100): void {
    const existingTimer = this.debouncedEmits.get(event);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    const timer = setTimeout(() => {
      this.emit(event, data);
      this.debouncedEmits.delete(event);
    }, delay);
    
    this.debouncedEmits.set(event, timer);
  }

  public destroy(): void {
    // Clear debounced timers
    this.debouncedEmits.forEach(timer => clearTimeout(timer));
    this.debouncedEmits.clear();
    
    this.handlers.clear();
    this.eventQueue = [];
    this.isDestroyed = true;
  }
}
```

### 1.3 State Update Optimization (2 hours)

**Objective**: Optimize Legend-State usage for better performance

**Create src/core/OptimizedStateManager.ts**:
```typescript
import { observable, computed, batch } from '@legendapp/state';
import { performanceMonitor } from './PerformanceMonitor';

// Optimized base service with performance enhancements
export abstract class OptimizedBaseService {
  protected abstract _state$: any;
  private updateQueue: Array<() => void> = [];
  private isProcessingUpdates = false;

  // Batch multiple state updates
  protected batchUpdate(updates: Array<() => void>): void {
    const startTime = performance.now();
    
    batch(() => {
      updates.forEach(update => update());
    });
    
    performanceMonitor.trackStateUpdateTime(startTime);
  }

  // Queue non-critical updates
  protected queueUpdate(update: () => void): void {
    this.updateQueue.push(update);
    this.processUpdateQueue();
  }

  private processUpdateQueue(): void {
    if (this.isProcessingUpdates || this.updateQueue.length === 0) return;
    
    this.isProcessingUpdates = true;
    
    requestIdleCallback(() => {
      const updates = this.updateQueue.splice(0, 5); // Process 5 at a time
      this.batchUpdate(updates);
      this.isProcessingUpdates = false;
      
      // Continue processing if more updates are queued
      if (this.updateQueue.length > 0) {
        this.processUpdateQueue();
      }
    });
  }

  // Computed with caching for expensive calculations
  protected createCachedComputed<T>(computation: () => T, dependencies: any[]): any {
    let cachedValue: T;
    let lastDependencySnapshot = JSON.stringify(dependencies.map(dep => dep.peek()));
    
    return computed(() => {
      const currentSnapshot = JSON.stringify(dependencies.map(dep => dep.peek()));
      
      if (currentSnapshot !== lastDependencySnapshot) {
        cachedValue = computation();
        lastDependencySnapshot = currentSnapshot;
      }
      
      return cachedValue;
    });
  }

  // Memory-efficient cleanup
  public destroy(): void {
    this.updateQueue = [];
    // Override in subclasses for specific cleanup
  }
}

// Performance utilities
export const StateUtils = {
  // Throttled observable updates
  createThrottledObservable<T>(initialValue: T, throttleMs: number = 100) {
    const state$ = observable(initialValue);
    let lastUpdate = 0;
    
    return {
      get: () => state$.get(),
      peek: () => state$.peek(),
      set: (value: T) => {
        const now = Date.now();
        if (now - lastUpdate >= throttleMs) {
          state$.set(value);
          lastUpdate = now;
        }
      },
      onChange: (callback: (value: T) => void) => state$.onChange(callback)
    };
  },

  // Debounced computed values
  createDebouncedComputed<T>(computation: () => T, debounceMs: number = 50) {
    let timeoutId: NodeJS.Timeout;
    let cachedValue: T = computation();
    
    return computed(() => {
      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        cachedValue = computation();
      }, debounceMs);
      
      return cachedValue;
    });
  }
};
```

**Validation**: Frame rate remains at 60fps with all systems active

---

## Task 2: Audio System Implementation

### 2.1 Audio Service (2 hours)

**Objective**: Implement dynamic audio system with sound effects

**Create src/features/audio/AudioService.ts**:
```typescript
import { Audio } from 'expo-av';
import { observable } from '@legendapp/state';
import { BaseService } from '../../core/StateManager';
import { eventBus } from '../../core/EventBus';
import type { AudioState, SoundEffect, AudioSettings } from './types/AudioTypes';

export class AudioService extends BaseService {
  protected _state$ = observable<AudioState>({
    settings: {
      masterVolume: 0.7,
      sfxVolume: 0.8,
      musicVolume: 0.5,
      enabled: true,
      pitchVariation: true
    },
    loadedSounds: new Map(),
    recentSounds: [],
    soundCooldowns: new Map(),
    statistics: {
      totalSoundsPlayed: 0,
      favoriteSound: '',
      sessionVolume: 0
    }
  });

  private soundEffects: Map<string, SoundEffect> = new Map();

  constructor() {
    super();
    this._initializeSounds();
    this._setupEventListeners();
  }

  public async playSound(soundId: string, options?: { 
    volume?: number; 
    pitch?: number; 
    interrupt?: boolean 
  }): Promise<void> {
    const settings = this._state$.settings.peek();
    
    if (!settings.enabled) return;

    // Check cooldown to prevent sound spam
    const lastPlayed = this._state$.soundCooldowns.get(soundId) || 0;
    const now = Date.now();
    const cooldownPeriod = this._getSoundCooldown(soundId);
    
    if (now - lastPlayed < cooldownPeriod && !options?.interrupt) {
      return;
    }

    try {
      const sound = await this._getSound(soundId);
      if (!sound) return;

      // Calculate final volume
      const baseVolume = options?.volume || 1.0;
      const finalVolume = baseVolume * settings.sfxVolume * settings.masterVolume;

      // Apply pitch variation if enabled
      let pitchCorrection = 1.0;
      if (settings.pitchVariation && soundId === 'click') {
        pitchCorrection = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
      }
      if (options?.pitch) {
        pitchCorrection = options.pitch;
      }

      // Play sound
      await sound.setVolumeAsync(finalVolume);
      if (pitchCorrection !== 1.0) {
        await sound.setRateAsync(pitchCorrection, true);
      }
      
      await sound.replayAsync();

      // Update statistics
      this._updateStatistics(soundId);
      this._state$.soundCooldowns.set(soundId, now);

    } catch (error) {
      console.error('Error playing sound:', soundId, error);
    }
  }

  public setMasterVolume(volume: number): void {
    this._state$.settings.masterVolume.set(Math.max(0, Math.min(1, volume)));
  }

  public setSfxVolume(volume: number): void {
    this._state$.settings.sfxVolume.set(Math.max(0, Math.min(1, volume)));
  }

  public toggleAudio(): void {
    this._state$.settings.enabled.set(current => !current);
  }

  public getSettings() {
    return this._state$.settings.peek();
  }

  private async _initializeSounds(): Promise<void> {
    const soundDefinitions = [
      { id: 'click', file: require('../../assets/sounds/click.wav'), cooldown: 50 },
      { id: 'purchase', file: require('../../assets/sounds/purchase.wav'), cooldown: 200 },
      { id: 'unlock', file: require('../../assets/sounds/unlock.wav'), cooldown: 1000 },
      { id: 'upgrade', file: require('../../assets/sounds/upgrade.wav'), cooldown: 500 },
      { id: 'prestige', file: require('../../assets/sounds/prestige.wav'), cooldown: 2000 },
      { id: 'notification', file: require('../../assets/sounds/notification.wav'), cooldown: 300 },
      { id: 'error', file: require('../../assets/sounds/error.wav'), cooldown: 500 }
    ];

    for (const soundDef of soundDefinitions) {
      try {
        const { sound } = await Audio.Sound.createAsync(soundDef.file, {
          shouldPlay: false,
          isLooping: false,
          volume: 1.0
        });

        this.soundEffects.set(soundDef.id, {
          id: soundDef.id,
          sound,
          cooldown: soundDef.cooldown,
          volume: 1.0
        });

        this._state$.loadedSounds.set(soundDef.id, true);
      } catch (error) {
        console.error(`Failed to load sound: ${soundDef.id}`, error);
      }
    }
  }

  private async _getSound(soundId: string): Promise<Audio.Sound | null> {
    const soundEffect = this.soundEffects.get(soundId);
    return soundEffect?.sound || null;
  }

  private _getSoundCooldown(soundId: string): number {
    const soundEffect = this.soundEffects.get(soundId);
    return soundEffect?.cooldown || 100;
  }

  private _updateStatistics(soundId: string): void {
    this._state$.statistics.totalSoundsPlayed.set(current => current + 1);
    
    // Track recent sounds
    const recent = this._state$.recentSounds.peek();
    recent.push({ soundId, timestamp: Date.now() });
    
    // Keep only last 50 sounds
    if (recent.length > 50) {
      recent.shift();
    }
    
    // Update favorite sound
    const soundCounts = recent.reduce((counts, item) => {
      counts[item.soundId] = (counts[item.soundId] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    const favorite = Object.entries(soundCounts)
      .sort(([,a], [,b]) => b - a)[0];
      
    if (favorite) {
      this._state$.statistics.favoriteSound.set(favorite[0]);
    }
  }

  private _setupEventListeners(): void {
    // Click sounds
    eventBus.on('click.executed', (data: { value: number; isCritical: boolean }) => {
      if (data.isCritical) {
        this.playSound('click', { pitch: 1.5, volume: 1.2 });
      } else {
        this.playSound('click');
      }
    });

    // Purchase sounds
    eventBus.on('employee.hired', () => {
      this.playSound('purchase');
    });

    // Unlock sounds
    eventBus.on('department.unlocked', () => {
      this.playSound('unlock');
    });

    // Upgrade sounds
    eventBus.on('upgrade.purchased', () => {
      this.playSound('upgrade');
    });

    // Achievement sounds
    eventBus.on('achievement.earned', (data: { tier: string }) => {
      if (data.tier === 'legendary') {
        this.playSound('prestige');
      } else {
        this.playSound('notification');
      }
    });

    // Combo sounds
    eventBus.on('combo.achieved', () => {
      this.playSound('click', { pitch: 1.3, volume: 1.1 });
    });

    // Error sounds
    eventBus.on('funds.insufficient', () => {
      this.playSound('error');
    });
  }

  public async destroy(): Promise<void> {
    // Unload all sounds
    for (const [, soundEffect] of this.soundEffects) {
      try {
        await soundEffect.sound.unloadAsync();
      } catch (error) {
        console.error('Error unloading sound:', error);
      }
    }
    
    this.soundEffects.clear();
    super.destroy();
  }
}
```

**Create src/features/audio/types/AudioTypes.ts**:
```typescript
import { Audio } from 'expo-av';

export interface AudioState {
  settings: AudioSettings;
  loadedSounds: Map<string, boolean>;
  recentSounds: SoundEvent[];
  soundCooldowns: Map<string, number>;
  statistics: AudioStatistics;
}

export interface AudioSettings {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  enabled: boolean;
  pitchVariation: boolean;
}

export interface SoundEffect {
  id: string;
  sound: Audio.Sound;
  cooldown: number;
  volume: number;
}

export interface SoundEvent {
  soundId: string;
  timestamp: number;
}

export interface AudioStatistics {
  totalSoundsPlayed: number;
  favoriteSound: string;
  sessionVolume: number;
}
```

### 2.2 Audio Assets Setup (30 minutes)

**Objective**: Add placeholder audio files for development

**Create audio directories**:
```bash
mkdir -p src/assets/sounds
```

**Create placeholder sound files** (or use actual audio assets):
- click.wav (short click sound)
- purchase.wav (purchase confirmation)
- unlock.wav (achievement/unlock fanfare)
- upgrade.wav (upgrade sound)
- prestige.wav (dramatic prestige sound)
- notification.wav (gentle notification)
- error.wav (error/warning sound)

**Validation**: Audio plays correctly with dynamic pitch and volume

---

## Task 3: Remaining Departments Implementation

### 3.1 Product Department (2 hours)

**Objective**: Implement Product department with insights and specifications

**Create src/features/departments/product/ProductService.ts**:
```typescript
import { observable, computed } from '@legendapp/state';
import { OptimizedBaseService } from '../../../core/OptimizedStateManager';
import { eventBus } from '../../../core/EventBus';
import { Result } from '../../../core/Result';
import type { ProductState, InsightConversionResult } from './types/ProductTypes';

export class ProductService extends OptimizedBaseService {
  protected _state$ = observable<ProductState>({
    unlocked: false,
    unlockThreshold: 25000,
    employees: {
      productAnalyst: { owned: 0, baseCost: 500, insightGeneration: 0.2 },
      productManager: { owned: 0, baseCost: 5000, specConversion: 0.1 },
      seniorPM: { owned: 0, baseCost: 50000, premiumSpecs: 0.05 },
      cpo: { owned: 0, baseCost: 500000, globalMultiplier: 1.1 }
    },
    insights: 0,
    specifications: 0,
    enhancedFeatures: 0,
    roadmap: {
      plannedFeatures: [],
      inDevelopment: [],
      completed: []
    },
    departmentBonus: 1.0,
    statistics: {
      totalInsights: 0,
      totalSpecs: 0,
      enhancementRate: 1.0
    }
  });

  private _displayData$ = this.createCachedComputed(() => {
    const state = this._state$.peek();
    return {
      unlocked: state.unlocked,
      employees: Object.entries(state.employees).map(([type, employee]) => ({
        type,
        name: this._getEmployeeName(type),
        owned: employee.owned,
        cost: this._calculateCost(employee.baseCost, employee.owned),
        production: this._calculateProduction(type, employee),
        description: this._getEmployeeDescription(type)
      })),
      insights: Math.floor(state.insights),
      specifications: Math.floor(state.specifications),
      enhancedFeatures: Math.floor(state.enhancedFeatures),
      enhancementMultiplier: this._calculateEnhancementMultiplier(),
      roadmapProgress: this._getRoadmapProgress()
    };
  }, [this._state$]);

  constructor() {
    super();
    this._setupEventListeners();
    this._startInsightGeneration();
    this._startSpecConversion();
  }

  public async hireEmployee(employeeType: string): Promise<Result<void, Error>> {
    const employee = this._state$.employees[employeeType].peek();
    const cost = this._calculateCost(employee.baseCost, employee.owned);

    return new Promise((resolve) => {
      const subscription = eventBus.once('funds.response', (response: { success: boolean; error?: string }) => {
        if (response.success) {
          this.batchUpdate([
            () => this._state$.employees[employeeType].owned.set(current => current + 1),
            () => this._updateDepartmentBonus()
          ]);
          
          eventBus.emit('employee.hired', {
            department: 'product',
            employeeType,
            cost,
            newCount: this._state$.employees[employeeType].owned.peek()
          });
          
          resolve(Result.ok(undefined));
        } else {
          resolve(Result.err(new Error(response.error || 'Insufficient funds')));
        }
      });

      eventBus.emit('funds.requested', {
        amount: cost,
        purpose: 'hire_product_employee',
        requester: 'product'
      });
    });
  }

  public getDisplayData() {
    return this._displayData$.peek();
  }

  private _getEmployeeName(type: string): string {
    const names = {
      productAnalyst: 'Product Analyst',
      productManager: 'Product Manager',
      seniorPM: 'Senior PM',
      cpo: 'Chief Product Officer'
    };
    return names[type] || type;
  }

  private _getEmployeeDescription(type: string): string {
    const descriptions = {
      productAnalyst: 'Generates market insights',
      productManager: 'Converts insights to specifications',
      seniorPM: 'Creates premium feature specs',
      cpo: 'Provides global product vision'
    };
    return descriptions[type] || '';
  }

  private _calculateCost(baseCost: number, owned: number): number {
    return Math.floor(baseCost * Math.pow(1.15, owned));
  }

  private _calculateProduction(type: string, employee: any): number {
    const bonus = this._state$.departmentBonus.peek();
    
    switch (type) {
      case 'productAnalyst':
        return employee.owned * employee.insightGeneration * bonus;
      case 'productManager':
        return employee.owned * employee.specConversion * bonus;
      case 'seniorPM':
        return employee.owned * employee.premiumSpecs * bonus;
      default:
        return 0;
    }
  }

  private _updateDepartmentBonus(): void {
    const cpoCount = this._state$.employees.cpo.owned.peek();
    const bonus = 1 + (cpoCount * 0.1); // 10% per CPO
    this._state$.departmentBonus.set(bonus);
  }

  private _calculateEnhancementMultiplier(): number {
    const specs = this._state$.specifications.peek();
    return 1 + (specs * 0.01); // 1% per specification
  }

  private _getRoadmapProgress(): any {
    // Simplified roadmap calculation
    const insights = this._state$.insights.peek();
    return {
      nextMilestone: Math.ceil(insights / 100) * 100,
      progress: insights % 100
    };
  }

  private _startInsightGeneration(): void {
    setInterval(() => {
      const analyst = this._state$.employees.productAnalyst.peek();
      const production = this._calculateProduction('productAnalyst', analyst);
      
      if (production > 0) {
        this.queueUpdate(() => {
          this._state$.insights.set(current => current + production);
          this._state$.statistics.totalInsights.set(current => current + production);
        });
        
        eventBus.emitDebounced('insights.generated', {
          amount: production,
          source: 'product_team'
        });
      }
    }, 1000);
  }

  private _startSpecConversion(): void {
    setInterval(() => {
      const insights = this._state$.insights.peek();
      const pmProduction = this._calculateProduction('productManager', this._state$.employees.productManager.peek());
      
      if (insights >= 10 && pmProduction > 0) {
        const conversions = Math.min(Math.floor(insights / 10), pmProduction);
        
        this.batchUpdate([
          () => this._state$.insights.set(current => current - (conversions * 10)),
          () => this._state$.specifications.set(current => current + conversions),
          () => this._state$.statistics.totalSpecs.set(current => current + conversions)
        ]);
        
        eventBus.emitDebounced('specifications.generated', {
          amount: conversions,
          insightsConsumed: conversions * 10
        });
      }
    }, 1000);
  }

  private _setupEventListeners(): void {
    // Department unlock
    eventBus.on('revenue.milestone', (data: { total: number }) => {
      if (!this._state$.unlocked.peek() && data.total >= this._state$.unlockThreshold.peek()) {
        this._state$.unlocked.set(true);
        eventBus.emit('department.unlocked', {
          department: 'product',
          milestone: this._state$.unlockThreshold.peek()
        });
      }
    });

    // Feature enhancement
    eventBus.on('features.enhancing', (data: { features: any[] }) => {
      const enhancementMultiplier = this._calculateEnhancementMultiplier();
      data.features.forEach(feature => {
        feature.value *= enhancementMultiplier;
      });
    });
  }
}
```

### 3.2 Design Department (1.5 hours)

**Create src/features/departments/design/DesignService.ts**:
```typescript
import { observable, computed } from '@legendapp/state';
import { OptimizedBaseService } from '../../../core/OptimizedStateManager';
import { eventBus } from '../../../core/EventBus';
import { Result } from '../../../core/Result';
import type { DesignState } from './types/DesignTypes';

export class DesignService extends OptimizedBaseService {
  protected _state$ = observable<DesignState>({
    unlocked: false,
    unlockThreshold: 100000,
    employees: {
      uiDesigner: { owned: 0, baseCost: 1000, polishGeneration: 0.3 },
      uxDesigner: { owned: 0, baseCost: 10000, experienceGeneration: 0.2 },
      designLead: { owned: 0, baseCost: 100000, teamMultiplier: 1.15 },
      creativeDirector: { owned: 0, baseCost: 1000000, globalPolish: 1.2 }
    },
    polishPoints: 0,
    experiencePoints: 0,
    designSystem: {
      unlocked: false,
      progress: 0,
      threshold: 50,
      globalMultiplier: 2.0
    },
    qualityMultiplier: 1.0,
    conversionBonus: 1.0,
    departmentBonus: 1.0
  });

  private _displayData$ = this.createCachedComputed(() => {
    const state = this._state$.peek();
    return {
      unlocked: state.unlocked,
      employees: Object.entries(state.employees).map(([type, employee]) => ({
        type,
        name: this._getEmployeeName(type),
        owned: employee.owned,
        cost: this._calculateCost(employee.baseCost, employee.owned),
        production: this._calculateProduction(type, employee),
        description: this._getEmployeeDescription(type)
      })),
      polishPoints: Math.floor(state.polishPoints),
      experiencePoints: Math.floor(state.experiencePoints),
      qualityMultiplier: state.qualityMultiplier,
      conversionBonus: state.conversionBonus,
      designSystem: {
        ...state.designSystem,
        progress: this._calculateDesignSystemProgress()
      }
    };
  }, [this._state$]);

  constructor() {
    super();
    this._setupEventListeners();
    this._startPolishGeneration();
  }

  public async hireEmployee(employeeType: string): Promise<Result<void, Error>> {
    const employee = this._state$.employees[employeeType].peek();
    const cost = this._calculateCost(employee.baseCost, employee.owned);

    return new Promise((resolve) => {
      const subscription = eventBus.once('funds.response', (response: { success: boolean; error?: string }) => {
        if (response.success) {
          this.batchUpdate([
            () => this._state$.employees[employeeType].owned.set(current => current + 1),
            () => this._updateDepartmentBonus(),
            () => this._checkDesignSystemUnlock()
          ]);
          
          resolve(Result.ok(undefined));
        } else {
          resolve(Result.err(new Error(response.error || 'Insufficient funds')));
        }
      });

      eventBus.emit('funds.requested', {
        amount: cost,
        purpose: 'hire_design_employee',
        requester: 'design'
      });
    });
  }

  private _getEmployeeName(type: string): string {
    const names = {
      uiDesigner: 'UI Designer',
      uxDesigner: 'UX Designer',
      designLead: 'Design Lead',
      creativeDirector: 'Creative Director'
    };
    return names[type] || type;
  }

  private _getEmployeeDescription(type: string): string {
    const descriptions = {
      uiDesigner: 'Creates visual polish',
      uxDesigner: 'Improves user experience',
      designLead: 'Manages design team',
      creativeDirector: 'Sets global design vision'
    };
    return descriptions[type] || '';
  }

  private _calculateCost(baseCost: number, owned: number): number {
    return Math.floor(baseCost * Math.pow(1.15, owned));
  }

  private _calculateProduction(type: string, employee: any): number {
    const bonus = this._state$.departmentBonus.peek();
    
    switch (type) {
      case 'uiDesigner':
        return employee.owned * employee.polishGeneration * bonus;
      case 'uxDesigner':
        return employee.owned * employee.experienceGeneration * bonus;
      default:
        return 0;
    }
  }

  private _updateDepartmentBonus(): void {
    const leadCount = this._state$.employees.designLead.owned.peek();
    const directorCount = this._state$.employees.creativeDirector.owned.peek();
    
    let bonus = 1.0;
    bonus *= Math.pow(1.15, leadCount); // 15% per Design Lead
    bonus *= Math.pow(1.2, directorCount); // 20% per Creative Director
    
    this._state$.departmentBonus.set(bonus);
  }

  private _calculateDesignSystemProgress(): number {
    const totalDesigners = Object.values(this._state$.employees.peek())
      .reduce((sum, emp) => sum + emp.owned, 0);
    return Math.min(100, (totalDesigners / this._state$.designSystem.threshold.peek()) * 100);
  }

  private _checkDesignSystemUnlock(): void {
    const totalDesigners = Object.values(this._state$.employees.peek())
      .reduce((sum, emp) => sum + emp.owned, 0);
      
    if (!this._state$.designSystem.unlocked.peek() && 
        totalDesigners >= this._state$.designSystem.threshold.peek()) {
      
      this._state$.designSystem.unlocked.set(true);
      
      eventBus.emit('designSystem.unlocked', {
        globalMultiplier: this._state$.designSystem.globalMultiplier.peek(),
        teamSize: totalDesigners
      });
    }
  }

  private _startPolishGeneration(): void {
    setInterval(() => {
      const uiProduction = this._calculateProduction('uiDesigner', this._state$.employees.uiDesigner.peek());
      const uxProduction = this._calculateProduction('uxDesigner', this._state$.employees.uxDesigner.peek());
      
      if (uiProduction > 0 || uxProduction > 0) {
        this.batchUpdate([
          () => this._state$.polishPoints.set(current => current + uiProduction),
          () => this._state$.experiencePoints.set(current => current + uxProduction),
          () => this._updateQualityMultipliers()
        ]);
      }
    }, 1000);
  }

  private _updateQualityMultipliers(): void {
    const polishPoints = this._state$.polishPoints.peek();
    const experiencePoints = this._state$.experiencePoints.peek();
    
    // Polish improves feature quality
    const qualityMultiplier = 1 + (polishPoints * 0.001); // 0.1% per polish point
    this._state$.qualityMultiplier.set(qualityMultiplier);
    
    // Experience improves sales conversion
    const conversionBonus = 1 + (experiencePoints * 0.0005); // 0.05% per experience point
    this._state$.conversionBonus.set(conversionBonus);
  }

  private _setupEventListeners(): void {
    // Department unlock
    eventBus.on('revenue.milestone', (data: { total: number }) => {
      if (!this._state$.unlocked.peek() && data.total >= this._state$.unlockThreshold.peek()) {
        this._state$.unlocked.set(true);
        eventBus.emit('department.unlocked', {
          department: 'design',
          milestone: this._state$.unlockThreshold.peek()
        });
      }
    });

    // Apply quality multipliers
    eventBus.on('features.valuing', (data: { value: number }) => {
      data.value *= this._state$.qualityMultiplier.peek();
    });

    eventBus.on('sales.converting', (data: { rate: number }) => {
      data.rate *= this._state$.conversionBonus.peek();
    });
  }
}
```

### 3.3 QA Department (1.5 hours)

**Create src/features/departments/qa/QAService.ts**:
```typescript
import { observable, computed } from '@legendapp/state';
import { OptimizedBaseService } from '../../../core/OptimizedStateManager';
import { eventBus } from '../../../core/EventBus';
import { Result } from '../../../core/Result';
import type { QAState, BugDetectionResult } from './types/QATypes';

export class QAService extends OptimizedBaseService {
  protected _state$ = observable<QAState>({
    unlocked: false,
    unlockThreshold: 250000,
    employees: {
      qaTester: { owned: 0, baseCost: 750, bugDetection: 0.1 },
      qaEngineer: { owned: 0, baseCost: 7500, bugPrevention: 0.05 },
      qaLead: { owned: 0, baseCost: 75000, processImprovement: 0.02 },
      qaDirector: { owned: 0, baseCost: 750000, zeroDefectBonus: 0.01 }
    },
    bugDetectionRate: 0,
    bugPreventionRate: 0,
    qualityScore: 0.5,
    defectMetrics: {
      bugsFound: 0,
      bugsPrevented: 0,
      costSavings: 0,
      qualityImprovement: 0
    },
    processes: {
      testingEfficiency: 1.0,
      preventionEfficiency: 1.0,
      zeroDefectBonus: false
    }
  });

  private _displayData$ = this.createCachedComputed(() => {
    const state = this._state$.peek();
    return {
      unlocked: state.unlocked,
      employees: Object.entries(state.employees).map(([type, employee]) => ({
        type,
        name: this._getEmployeeName(type),
        owned: employee.owned,
        cost: this._calculateCost(employee.baseCost, employee.owned),
        production: this._calculateProduction(type, employee),
        description: this._getEmployeeDescription(type)
      })),
      bugDetectionRate: state.bugDetectionRate,
      bugPreventionRate: state.bugPreventionRate,
      qualityScore: state.qualityScore,
      costSavings: Math.floor(state.defectMetrics.costSavings),
      ticketReduction: this._calculateTicketReduction()
    };
  }, [this._state$]);

  constructor() {
    super();
    this._setupEventListeners();
    this._startQualityMonitoring();
  }

  public async hireEmployee(employeeType: string): Promise<Result<void, Error>> {
    const employee = this._state$.employees[employeeType].peek();
    const cost = this._calculateCost(employee.baseCost, employee.owned);

    return new Promise((resolve) => {
      const subscription = eventBus.once('funds.response', (response: { success: boolean; error?: string }) => {
        if (response.success) {
          this.batchUpdate([
            () => this._state$.employees[employeeType].owned.set(current => current + 1),
            () => this._updateQualityMetrics()
          ]);
          
          resolve(Result.ok(undefined));
        } else {
          resolve(Result.err(new Error(response.error || 'Insufficient funds')));
        }
      });

      eventBus.emit('funds.requested', {
        amount: cost,
        purpose: 'hire_qa_employee',
        requester: 'qa'
      });
    });
  }

  private _getEmployeeName(type: string): string {
    const names = {
      qaTester: 'QA Tester',
      qaEngineer: 'QA Engineer',
      qaLead: 'QA Lead',
      qaDirector: 'QA Director'
    };
    return names[type] || type;
  }

  private _getEmployeeDescription(type: string): string {
    const descriptions = {
      qaTester: 'Finds and reports bugs',
      qaEngineer: 'Prevents bugs through process',
      qaLead: 'Improves testing processes',
      qaDirector: 'Achieves zero-defect quality'
    };
    return descriptions[type] || '';
  }

  private _calculateCost(baseCost: number, owned: number): number {
    return Math.floor(baseCost * Math.pow(1.15, owned));
  }

  private _calculateProduction(type: string, employee: any): number {
    switch (type) {
      case 'qaTester':
        return employee.owned * employee.bugDetection;
      case 'qaEngineer':
        return employee.owned * employee.bugPrevention;
      case 'qaLead':
        return employee.owned * employee.processImprovement;
      case 'qaDirector':
        return employee.owned * employee.zeroDefectBonus;
      default:
        return 0;
    }
  }

  private _updateQualityMetrics(): void {
    const employees = this._state$.employees.peek();
    
    const detectionRate = this._calculateProduction('qaTester', employees.qaTester);
    const preventionRate = this._calculateProduction('qaEngineer', employees.qaEngineer);
    
    this.batchUpdate([
      () => this._state$.bugDetectionRate.set(detectionRate),
      () => this._state$.bugPreventionRate.set(preventionRate),
      () => this._updateQualityScore()
    ]);
  }

  private _updateQualityScore(): void {
    const detectionRate = this._state$.bugDetectionRate.peek();
    const preventionRate = this._state$.bugPreventionRate.peek();
    
    // Quality improves with both detection and prevention
    const qualityIncrease = (detectionRate + preventionRate) * 0.01;
    const currentQuality = this._state$.qualityScore.peek();
    const newQuality = Math.min(1.0, currentQuality + qualityIncrease);
    
    this._state$.qualityScore.set(newQuality);
  }

  private _calculateTicketReduction(): number {
    const qualityScore = this._state$.qualityScore.peek();
    return Math.min(0.5, qualityScore * 0.8); // Max 50% reduction
  }

  private _startQualityMonitoring(): void {
    setInterval(() => {
      this._processQualityImprovements();
    }, 1000);
  }

  private _processQualityImprovements(): void {
    const detectionRate = this._state$.bugDetectionRate.peek();
    
    if (detectionRate > 0) {
      // Simulate bug detection and cost savings
      const bugsFound = detectionRate;
      const costSavings = bugsFound * 100; // Each bug costs $100 if not caught
      
      this.batchUpdate([
        () => this._state$.defectMetrics.bugsFound.set(current => current + bugsFound),
        () => this._state$.defectMetrics.costSavings.set(current => current + costSavings)
      ]);
      
      eventBus.emitDebounced('bugs.detected', {
        count: bugsFound,
        savings: costSavings
      });
    }
  }

  private _setupEventListeners(): void {
    // Department unlock
    eventBus.on('revenue.milestone', (data: { total: number }) => {
      if (!this._state$.unlocked.peek() && data.total >= this._state$.unlockThreshold.peek()) {
        this._state$.unlocked.set(true);
        eventBus.emit('department.unlocked', {
          department: 'qa',
          milestone: this._state$.unlockThreshold.peek()
        });
      }
    });

    // Quality impact on development
    eventBus.on('development.calculating', (data: { qualityMultiplier: number }) => {
      const preventionRate = this._state$.bugPreventionRate.peek();
      data.qualityMultiplier *= (1 + preventionRate);
    });

    // Quality impact on customer satisfaction
    eventBus.on('satisfaction.calculating', (data: { baseScore: number }) => {
      const qualityScore = this._state$.qualityScore.peek();
      data.baseScore += (qualityScore - 0.5) * 0.2;
    });

    // Ticket reduction
    eventBus.on('tickets.generating', (data: { count: number }) => {
      const reductionRate = this._calculateTicketReduction();
      data.count *= (1 - reductionRate);
    });
  }
}
```

**Validation**: All departments implemented with unique mechanics and unlock progression

---

## Task 4: Testing Implementation

### 4.1 Unit Testing Setup (2 hours)

**Objective**: Implement comprehensive unit testing for core services

**Create __tests__/setup.ts**:
```typescript
import 'react-native';
import { jest } from '@jest/globals';

// Mock EventBus for testing
export class MockEventBus {
  private handlers = new Map<string, Function[]>();
  public lastEmit: { event: string; data: any } | null = null;

  emit(event: string, data: any): void {
    this.lastEmit = { event, data };
    const eventHandlers = this.handlers.get(event) || [];
    eventHandlers.forEach(handler => handler(data));
  }

  on(event: string, handler: Function): { unsubscribe: () => void } {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
    
    return {
      unsubscribe: () => {
        const handlers = this.handlers.get(event) || [];
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  once(event: string, handler: Function): { unsubscribe: () => void } {
    const subscription = this.on(event, (data: any) => {
      handler(data);
      subscription.unsubscribe();
    });
    return subscription;
  }

  clear(): void {
    this.handlers.clear();
    this.lastEmit = null;
  }
}

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock Audio
jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(() => Promise.resolve({
        sound: {
          setVolumeAsync: jest.fn(),
          setRateAsync: jest.fn(),
          replayAsync: jest.fn(),
          unloadAsync: jest.fn()
        }
      }))
    }
  }
}));
```

**Create __tests__/features/currency/CurrencyService.test.ts**:
```typescript
import { CurrencyService } from '../../../src/features/currency/CurrencyService';
import { MockEventBus } from '../../setup';

describe('CurrencyService', () => {
  let service: CurrencyService;
  let mockEventBus: MockEventBus;

  beforeEach(() => {
    mockEventBus = new MockEventBus();
    // Inject mock EventBus (would need dependency injection in actual implementation)
    service = new CurrencyService();
  });

  afterEach(() => {
    service.destroy();
    mockEventBus.clear();
  });

  describe('Resource Management', () => {
    it('should add resources correctly', () => {
      const result = service.addResource('linesOfCode', 100);
      
      expect(result.success).toBe(true);
      expect(service.getBalance('linesOfCode')).toBe(100);
    });

    it('should spend resources when sufficient funds available', () => {
      service.addResource('revenue', 1000);
      
      const result = service.spendResource('revenue', 500);
      
      expect(result.success).toBe(true);
      expect(service.getBalance('revenue')).toBe(1500); // 1000 starting + 1000 added - 500 spent
    });

    it('should fail to spend when insufficient funds', () => {
      const result = service.spendResource('revenue', 2000);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
    });

    it('should check affordability correctly', () => {
      service.addResource('revenue', 500);
      
      expect(service.canAfford('revenue', 300)).toBe(true);
      expect(service.canAfford('revenue', 2000)).toBe(false);
    });
  });

  describe('Resource Conversion', () => {
    it('should convert lines to basic features', () => {
      service.addResource('linesOfCode', 50);
      
      service.convertResources();
      
      expect(service.getBalance('basicFeatures')).toBe(5); // 50 / 10 = 5
      expect(service.getBalance('linesOfCode')).toBe(0);
    });

    it('should prioritize premium conversions', () => {
      service.addResource('linesOfCode', 1500);
      
      service.convertResources();
      
      expect(service.getBalance('premiumFeatures')).toBe(1); // 1000 lines -> 1 premium
      expect(service.getBalance('advancedFeatures')).toBe(5); // 500 lines -> 5 advanced
      expect(service.getBalance('linesOfCode')).toBe(0);
    });
  });

  describe('Display Data', () => {
    it('should format numbers correctly', () => {
      service.addResource('linesOfCode', 1234567);
      
      const displayData = service.getDisplayData();
      
      expect(displayData.linesOfCode).toBe('1.2M');
    });

    it('should format currency correctly', () => {
      service.addResource('revenue', 1500000);
      
      const displayData = service.getDisplayData();
      
      expect(displayData.revenue).toBe('$2.5M'); // 1000 starting + 1500000
    });
  });

  describe('Event Integration', () => {
    it('should emit events when resources are generated', () => {
      service.addResource('linesOfCode', 10);
      
      expect(mockEventBus.lastEmit?.event).toBe('resources.generated');
      expect(mockEventBus.lastEmit?.data.amount).toBe(10);
    });

    it('should respond to funds requests', () => {
      service.addResource('revenue', 1000);
      
      // Simulate funds request event
      mockEventBus.emit('funds.requested', { amount: 500, purpose: 'test' });
      
      expect(mockEventBus.lastEmit?.event).toBe('funds.response');
      expect(mockEventBus.lastEmit?.data.success).toBe(true);
    });
  });

  describe('Statistics', () => {
    it('should track resource generation statistics', () => {
      service.addResource('linesOfCode', 100);
      service.addResource('linesOfCode', 50);
      
      const stats = service._state$.statistics.peek();
      expect(stats.totalGenerated.get('linesOfCode')).toBe(150);
    });

    it('should track all-time highs', () => {
      service.addResource('revenue', 5000);
      
      const stats = service._state$.statistics.peek();
      expect(stats.allTimeHigh.get('revenue')).toBe(6000); // 1000 starting + 5000
    });
  });
});
```

**Create __tests__/features/employees/EmployeesService.test.ts**:
```typescript
import { EmployeesService } from '../../../src/features/employees/EmployeesService';
import { MockEventBus } from '../../setup';

describe('EmployeesService', () => {
  let service: EmployeesService;
  let mockEventBus: MockEventBus;

  beforeEach(() => {
    mockEventBus = new MockEventBus();
    service = new EmployeesService();
  });

  afterEach(() => {
    service.destroy();
    mockEventBus.clear();
  });

  describe('Cost Calculation', () => {
    it('should calculate base cost correctly', () => {
      const cost = service.getCost('development', 'juniorDev');
      expect(cost).toBe(10); // Base cost for first hire
    });

    it('should scale cost correctly', () => {
      // Simulate owning 1 junior dev
      service._state$.departments.development.juniorDev.owned.set(1);
      
      const cost = service.getCost('development', 'juniorDev');
      expect(cost).toBe(Math.floor(10 * 1.15)); // 11
    });

    it('should scale cost exponentially', () => {
      // Simulate owning 5 junior devs
      service._state$.departments.development.juniorDev.owned.set(5);
      
      const cost = service.getCost('development', 'juniorDev');
      const expectedCost = Math.floor(10 * Math.pow(1.15, 5));
      expect(cost).toBe(expectedCost);
    });
  });

  describe('Production Calculation', () => {
    it('should calculate zero production with no employees', () => {
      const rate = service.getProductionRate('development');
      expect(rate).toBe(0);
    });

    it('should calculate production correctly', () => {
      service._state$.departments.development.juniorDev.owned.set(2);
      service._state$.departments.development.midDev.owned.set(1);
      
      // Force production rate update
      service._updateProductionRate('development');
      
      const rate = service.getProductionRate('development');
      const expectedRate = (2 * 0.1) + (1 * 0.5); // 0.7
      expect(rate).toBe(expectedRate);
    });
  });

  describe('Hiring Process', () => {
    it('should hire employee when funds are available', async () => {
      // Mock successful funds response
      setTimeout(() => {
        mockEventBus.emit('funds.response', { success: true });
      }, 0);
      
      const result = await service.hireEmployee('development', 'juniorDev');
      
      expect(result.success).toBe(true);
      expect(service._state$.departments.development.juniorDev.owned.peek()).toBe(1);
    });

    it('should fail to hire when funds are insufficient', async () => {
      // Mock insufficient funds response
      setTimeout(() => {
        mockEventBus.emit('funds.response', { 
          success: false, 
          error: 'Insufficient funds' 
        });
      }, 0);
      
      const result = await service.hireEmployee('development', 'juniorDev');
      
      expect(result.success).toBe(false);
      expect(service._state$.departments.development.juniorDev.owned.peek()).toBe(0);
    });

    it('should emit hire event on successful hire', async () => {
      setTimeout(() => {
        mockEventBus.emit('funds.response', { success: true });
      }, 0);
      
      await service.hireEmployee('development', 'juniorDev');
      
      expect(mockEventBus.lastEmit?.event).toBe('employee.hired');
      expect(mockEventBus.lastEmit?.data.department).toBe('development');
      expect(mockEventBus.lastEmit?.data.employeeType).toBe('juniorDev');
    });
  });

  describe('Display Data', () => {
    it('should provide correct display data structure', () => {
      const displayData = service.getDisplayData();
      
      expect(displayData).toHaveProperty('development');
      expect(displayData.development).toHaveProperty('juniorDev');
      expect(displayData.development.juniorDev).toHaveProperty('owned');
      expect(displayData.development.juniorDev).toHaveProperty('cost');
      expect(displayData.development.juniorDev).toHaveProperty('production');
    });

    it('should update display data when employees are hired', () => {
      service._state$.departments.development.juniorDev.owned.set(3);
      
      const displayData = service.getDisplayData();
      
      expect(displayData.development.juniorDev.owned).toBe(3);
      expect(displayData.development.juniorDev.production).toBe(0.3); // 3 * 0.1
    });
  });
});
```

### 4.2 Integration Testing (1.5 hours)

**Create __tests__/integration/GameFlow.test.ts**:
```typescript
import { ClickingService } from '../../src/features/clicking/ClickingService';
import { CurrencyService } from '../../src/features/currency/CurrencyService';
import { EmployeesService } from '../../src/features/employees/EmployeesService';
import { MockEventBus } from '../setup';

describe('Game Flow Integration', () => {
  let clickingService: ClickingService;
  let currencyService: CurrencyService;
  let employeesService: EmployeesService;
  let mockEventBus: MockEventBus;

  beforeEach(() => {
    mockEventBus = new MockEventBus();
    clickingService = new ClickingService();
    currencyService = new CurrencyService();
    employeesService = new EmployeesService();
  });

  afterEach(() => {
    clickingService.destroy();
    currencyService.destroy();
    employeesService.destroy();
    mockEventBus.clear();
  });

  describe('Click to Resource Flow', () => {
    it('should generate lines of code from clicking', () => {
      const initialLines = currencyService.getBalance('linesOfCode');
      
      const clickResult = clickingService.executeClick({ x: 100, y: 100 });
      
      expect(clickResult.success).toBe(true);
      if (clickResult.success) {
        // Simulate the event being received by currency service
        currencyService.addResource('linesOfCode', clickResult.data.value);
        
        const newLines = currencyService.getBalance('linesOfCode');
        expect(newLines).toBeGreaterThan(initialLines);
      }
    });

    it('should convert lines to features automatically', () => {
      currencyService.addResource('linesOfCode', 25);
      
      currencyService.convertResources();
      
      expect(currencyService.getBalance('basicFeatures')).toBe(2); // 25 / 10 = 2 (floored)
      expect(currencyService.getBalance('linesOfCode')).toBe(5); // 25 % 10 = 5 remaining
    });
  });

  describe('Hiring and Production Flow', () => {
    it('should complete full hiring process', async () => {
      // Give enough money to hire
      currencyService.addResource('revenue', 1000);
      
      // Mock the hiring flow
      const hirePromise = employeesService.hireEmployee('development', 'juniorDev');
      
      // Simulate currency service responding to funds request
      setTimeout(() => {
        mockEventBus.emit('funds.response', { success: true });
      }, 0);
      
      const result = await hirePromise;
      
      expect(result.success).toBe(true);
      expect(employeesService.getProductionRate('development')).toBeGreaterThan(0);
    });

    it('should generate resources from employee production', () => {
      // Simulate having employees
      employeesService._state$.departments.development.juniorDev.owned.set(5);
      employeesService._updateProductionRate('development');
      
      const productionRate = employeesService.getProductionRate('development');
      expect(productionRate).toBe(0.5); // 5 * 0.1
      
      // Simulate production event
      currencyService.addResource('linesOfCode', productionRate);
      
      expect(currencyService.getBalance('linesOfCode')).toBeGreaterThan(0);
    });
  });

  describe('Progression Flow', () => {
    it('should progress from clicking to automation', () => {
      // Start with clicking
      const clickResult = clickingService.executeClick({ x: 50, y: 50 });
      expect(clickResult.success).toBe(true);
      
      // Add generated lines
      if (clickResult.success) {
        currencyService.addResource('linesOfCode', clickResult.data.value);
      }
      
      // Convert to features
      currencyService.convertResources();
      
      // Should have some basic features now
      expect(currencyService.getBalance('basicFeatures')).toBeGreaterThanOrEqual(0);
      
      // Simulate having enough money to hire
      currencyService.addResource('revenue', 1000);
      
      // Should be able to afford first employee
      expect(currencyService.canAfford('revenue', 10)).toBe(true);
    });

    it('should unlock departments at correct thresholds', () => {
      // Simulate reaching $500 revenue for sales unlock
      currencyService.addResource('revenue', 500);
      
      // This would trigger sales department unlock event
      mockEventBus.emit('revenue.milestone', { total: 1500 }); // 1000 starting + 500
      
      // Sales department should receive unlock event
      expect(mockEventBus.lastEmit?.event).toBe('revenue.milestone');
      expect(mockEventBus.lastEmit?.data.total).toBe(1500);
    });
  });

  describe('Error Handling', () => {
    it('should handle insufficient funds gracefully', async () => {
      // Try to hire without enough money
      const hirePromise = employeesService.hireEmployee('development', 'seniorDev');
      
      // Simulate insufficient funds response
      setTimeout(() => {
        mockEventBus.emit('funds.response', { 
          success: false, 
          error: 'Insufficient funds' 
        });
      }, 0);
      
      const result = await hirePromise;
      
      expect(result.success).toBe(false);
      expect(employeesService._state$.departments.development.seniorDev.owned.peek()).toBe(0);
    });

    it('should handle service destruction properly', () => {
      // Create subscriptions
      const subscription = currencyService.subscribe(() => {});
      
      // Destroy services
      currencyService.destroy();
      employeesService.destroy();
      clickingService.destroy();
      
      // Should not throw errors
      expect(() => {
        currencyService.addResource('linesOfCode', 10);
      }).not.toThrow();
    });
  });
});
```

**Validation**: All tests pass, core functionality verified

---

## Task 5: Prestige System Foundation

### 5.1 Prestige Service Implementation (2 hours)

**Objective**: Implement basic prestige system with IP bonuses

**Create src/features/prestige/PrestigeService.ts**:
```typescript
import { observable, computed } from '@legendapp/state';
import { OptimizedBaseService } from '../../core/OptimizedStateManager';
import { eventBus } from '../../core/EventBus';
import { Result } from '../../core/Result';
import type { PrestigeState, PrestigeResult, PrestigeBonuses } from './types/PrestigeTypes';

export class PrestigeService extends OptimizedBaseService {
  protected _state$ = observable<PrestigeState>({
    totalIP: 0,
    lifetimeIP: 0,
    currentValuation: 0,
    unlocked: false,
    unlockThreshold: 10000000, // $10M
    superUnits: new Set<string>(),
    bonuses: {
      startingCapital: 0,
      globalSpeed: 0,
      departmentSynergy: 0
    },
    prestigeHistory: [],
    milestones: new Map<number, boolean>()
  });

  private _displayData$ = this.createCachedComputed(() => {
    const state = this._state$.peek();
    return {
      unlocked: state.unlocked,
      unlockProgress: this._calculateUnlockProgress(),
      totalIP: state.totalIP,
      lifetimeIP: state.lifetimeIP,
      currentValuation: state.currentValuation,
      ipGainPreview: this._calculateIPGain(state.currentValuation),
      bonuses: {
        startingCapital: this._formatPercentage(state.bonuses.startingCapital),
        globalSpeed: this._formatPercentage(state.bonuses.globalSpeed),
        departmentSynergy: this._formatPercentage(state.bonuses.departmentSynergy)
      },
      nextMilestones: this._getNextMilestones(),
      canPrestige: state.unlocked && state.currentValuation >= state.unlockThreshold
    };
  }, [this._state$]);

  constructor() {
    super();
    this._setupEventListeners();
    this._applyPrestigeBonuses();
  }

  public calculateIPGain(valuation: number): number {
    return Math.floor(valuation / 1000000); // 1 IP per $1M
  }

  public previewBonuses(ipCount: number): PrestigeBonuses {
    return {
      startingCapital: ipCount * 0.1, // 10% per IP
      globalSpeed: ipCount * 0.01, // 1% per IP
      departmentSynergy: Math.floor(ipCount / 10) * 0.02 // 2% per 10 IP
    };
  }

  public async executePrestige(): Promise<Result<PrestigeResult, Error>> {
    const state = this._state$.peek();
    
    if (!state.unlocked) {
      return Result.err(new Error('Prestige not unlocked'));
    }
    
    if (state.currentValuation < state.unlockThreshold) {
      return Result.err(new Error('Insufficient valuation for prestige'));
    }

    try {
      const ipGain = this._calculateIPGain(state.currentValuation);
      const newBonuses = this.previewBonuses(state.totalIP + ipGain);
      
      // Create prestige record
      const prestigeRecord = {
        id: Date.now().toString(),
        timestamp: new Date(),
        valuationAchieved: state.currentValuation,
        ipGained: ipGain,
        timeToPrestige: this._calculatePrestigeTime(),
        milestonesReached: Array.from(state.milestones.entries())
          .filter(([, achieved]) => achieved)
          .map(([milestone]) => milestone.toString())
      };

      // Update state
      this.batchUpdate([
        () => this._state$.totalIP.set(current => current + ipGain),
        () => this._state$.lifetimeIP.set(current => current + ipGain),
        () => this._state$.bonuses.set(newBonuses),
        () => this._state$.prestigeHistory.push(prestigeRecord),
        () => this._checkSuperUnitUnlocks(state.totalIP + ipGain)
      ]);

      // Emit prestige event
      eventBus.emit('prestige.executed', {
        ipGained: ipGain,
        newTotal: state.totalIP + ipGain,
        bonuses: newBonuses
      });

      // Reset game state (would be handled by game coordinator)
      eventBus.emit('game.reset', {
        bonuses: newBonuses,
        preserveIP: true
      });

      const result: PrestigeResult = {
        ipGained: ipGain,
        newTotal: state.totalIP + ipGain,
        bonuses: newBonuses,
        superUnitsUnlocked: Array.from(state.superUnits)
      };

      return Result.ok(result);
    } catch (error) {
      return Result.err(error as Error);
    }
  }

  public getDisplayData() {
    return this._displayData$.peek();
  }

  private _calculateUnlockProgress(): number {
    const current = this._state$.currentValuation.peek();
    const threshold = this._state$.unlockThreshold.peek();
    return Math.min(100, (current / threshold) * 100);
  }

  private _calculateIPGain(valuation: number): number {
    return Math.floor(valuation / 1000000);
  }

  private _calculatePrestigeTime(): number {
    // Calculate time since game start - would need game start tracking
    return Date.now() - (Date.now() - 3600000); // Placeholder: 1 hour
  }

  private _formatPercentage(value: number): string {
    return `+${(value * 100).toFixed(1)}%`;
  }

  private _getNextMilestones(): Array<{ ip: number; reward: string }> {
    const currentIP = this._state$.totalIP.peek();
    return [
      { ip: 100, reward: 'Super Unit: Quantum Computer' },
      { ip: 1000, reward: 'Super Unit: AI Assistant' },
      { ip: 10000, reward: 'Super Unit: Neural Network' }
    ].filter(milestone => milestone.ip > currentIP);
  }

  private _checkSuperUnitUnlocks(ipCount: number): void {
    const milestones = [100, 1000, 10000];
    const units = ['quantum_computer', 'ai_assistant', 'neural_network'];
    
    milestones.forEach((milestone, index) => {
      if (ipCount >= milestone && !this._state$.superUnits.has(units[index])) {
        this._state$.superUnits.add(units[index]);
        
        eventBus.emit('superUnit.unlocked', {
          unitId: units[index],
          ipRequirement: milestone
        });
      }
    });
  }

  private _applyPrestigeBonuses(): void {
    const bonuses = this._state$.bonuses.peek();
    
    // Apply starting capital bonus
    if (bonuses.startingCapital > 0) {
      eventBus.emit('prestige.startingCapital', {
        multiplier: 1 + bonuses.startingCapital
      });
    }
    
    // Apply global speed bonus
    if (bonuses.globalSpeed > 0) {
      eventBus.emit('prestige.globalSpeed', {
        multiplier: 1 + bonuses.globalSpeed
      });
    }
    
    // Apply department synergy bonus
    if (bonuses.departmentSynergy > 0) {
      eventBus.emit('prestige.departmentSynergy', {
        multiplier: 1 + bonuses.departmentSynergy
      });
    }
  }

  private _setupEventListeners(): void {
    // Track current valuation
    eventBus.on('revenue.updated', (data: { total: number }) => {
      this._state$.currentValuation.set(data.total);
      
      // Check unlock
      if (!this._state$.unlocked.peek() && data.total >= this._state$.unlockThreshold.peek()) {
        this._state$.unlocked.set(true);
        eventBus.emit('prestige.unlocked', {
          valuation: data.total,
          ipGain: this._calculateIPGain(data.total)
        });
      }
    });

    // Track milestones
    eventBus.on('milestone.reached', (data: { type: string; value: number }) => {
      this._state$.milestones.set(data.value, true);
    });
  }

  public destroy(): void {
    super.destroy();
  }
}
```

**Create src/features/prestige/types/PrestigeTypes.ts**:
```typescript
export interface PrestigeState {
  totalIP: number;
  lifetimeIP: number;
  currentValuation: number;
  unlocked: boolean;
  unlockThreshold: number;
  superUnits: Set<string>;
  bonuses: PrestigeBonuses;
  prestigeHistory: PrestigeRun[];
  milestones: Map<number, boolean>;
}

export interface PrestigeBonuses {
  startingCapital: number;    // +10% per IP
  globalSpeed: number;        // +1% per IP
  departmentSynergy: number;  // +2% per 10 IP
}

export interface PrestigeRun {
  id: string;
  timestamp: Date;
  valuationAchieved: number;
  ipGained: number;
  timeToPrestige: number;
  milestonesReached: string[];
}

export interface PrestigeResult {
  ipGained: number;
  newTotal: number;
  bonuses: PrestigeBonuses;
  superUnitsUnlocked: string[];
}
```

**Validation**: Prestige system unlocks at $10M, calculates IP correctly, applies bonuses

---

## Deliverables

### Performance Optimization
- [ ] Performance monitoring system implemented
- [ ] EventBus optimized for high-frequency updates
- [ ] State management optimized with batching and caching
- [ ] Consistent 60fps performance achieved
- [ ] Memory usage optimized and monitored

### Audio System
- [ ] Dynamic audio system with 7 core sound types
- [ ] Pitch variation and volume control
- [ ] Sound cooldowns to prevent spam
- [ ] Audio settings and user controls
- [ ] Event-driven sound triggering

### Remaining Departments
- [ ] Product department with insights and specifications
- [ ] Design department with polish and UX improvements
- [ ] QA department with bug detection and prevention
- [ ] Marketing department foundation (if time permits)
- [ ] All departments integrated with unlock progression

### Testing Infrastructure
- [ ] Comprehensive unit test suite
- [ ] Integration tests for core game flows
- [ ] Mock services for isolated testing
- [ ] Performance testing setup
- [ ] Test coverage reports

### Prestige System
- [ ] Basic prestige system functional
- [ ] IP calculation and bonuses working
- [ ] Super unit unlock framework
- [ ] Prestige history tracking
- [ ] Game reset mechanics

---

## Validation Checklist

- [ ] Performance consistently at 60fps with all systems active
- [ ] Memory usage remains under 100MB target
- [ ] Audio plays correctly with proper timing and effects
- [ ] All departments unlock and function correctly
- [ ] Unit tests achieve >80% code coverage
- [ ] Integration tests verify core game flows
- [ ] Prestige system calculates bonuses correctly
- [ ] No memory leaks or crashes during extended play
- [ ] Build process creates optimized production bundle

---

## Troubleshooting

### Performance Issues
```bash
# Profile performance
npx expo start --dev-client
# Use React DevTools Profiler
# Monitor with PerformanceMonitor.logMetrics()
```

### Audio Problems
```typescript
// Debug audio loading
console.log('Loaded sounds:', audioService._state$.loadedSounds.peek());

// Check audio permissions on device
// Verify sound files are properly bundled
```

### Test Failures
```bash
# Run specific test suite
npm test -- --testPathPattern=CurrencyService

# Run with coverage
npm test -- --coverage

# Debug test issues
npm test -- --verbose
```

### Memory Leaks
```typescript
// Check service cleanup
performanceMonitor.getMetrics();

// Verify event subscriptions are cleaned up
// Use React DevTools to inspect component lifecycle
```

---

**Next Phase**: Proceed to [05-deployment.md](./05-deployment.md) for build, release, and launch preparation.