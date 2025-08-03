# Pet Software Idler - Technical Implementation Stories

## Overview
This document contains detailed technical stories broken down from the Product Owner's backlog. Each story includes specific implementation details, file structures, and code patterns that junior developers can follow.

## Project Setup Stories

### TECH-001: Initialize React Project with TypeScript
**Parent Story:** General Setup
**Estimated Time:** 2-4 hours
**Priority:** Blocker - Must complete first

**Technical Details:**
1. Create new React app with TypeScript template
2. Set up folder structure
3. Install required dependencies
4. Configure development environment

**Implementation Steps:**
```bash
# 1. Create the project
npx create-react-app pet-software-idler --template typescript

# 2. Install additional dependencies
cd pet-software-idler
npm install zustand immer
npm install --save-dev @types/node
```

**Folder Structure to Create:**
```
src/
├── components/
│   ├── game/
│   ├── ui/
│   └── shared/
├── store/
├── hooks/
├── utils/
├── types/
└── constants/
```

**Create Initial Files:**
- `src/types/game.types.ts` - Game type definitions
- `src/constants/game.constants.ts` - Game configuration values
- `src/store/gameStore.ts` - Zustand store setup
- `src/utils/formatting.ts` - Number formatting utilities

**Acceptance Criteria:**
- [ ] Project runs with `npm start`
- [ ] TypeScript compiles without errors
- [ ] Folder structure matches specification
- [ ] All base files created and empty

---

### TECH-002: Set Up Base Game Types and Constants
**Parent Story:** General Setup
**Estimated Time:** 2-3 hours
**Priority:** Blocker
**Dependencies:** TECH-001

**Implementation Details:**

Create `src/types/game.types.ts`:
```typescript
export interface GameState {
  // Resources
  linesOfCode: number;
  money: number;
  customerLeads: number;
  
  // Units
  units: {
    juniorDev: number;
    midDev: number;
    seniorDev: number;
    salesRep: number;
  };
  
  // Rates (per second)
  productionRates: {
    linesOfCode: number;
    customerLeads: number;
  };
  
  // Unlock states
  unlocks: {
    salesDepartment: boolean;
    midDevs: boolean;
    seniorDevs: boolean;
  };
  
  // Statistics
  stats: {
    totalLinesWritten: number;
    totalMoneyEarned: number;
    totalFeaturesShipped: number;
    totalClicks: number;
    gameStartTime: number;
    lastSaveTime: number;
  };
}

export interface Unit {
  id: string;
  name: string;
  baseCost: number;
  baseProduction: number;
  costMultiplier: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  requirement: (state: GameState) => boolean;
  unlocked: boolean;
}
```

Create `src/constants/game.constants.ts`:
```typescript
import { Unit } from '../types/game.types';

// Game balance constants
export const GAME_CONFIG = {
  MANUAL_LINES_PER_CLICK: 1,
  LINES_PER_FEATURE: 10,
  BASE_FEATURE_VALUE: 15,
  LEAD_FEATURE_VALUE: 50,
  COST_MULTIPLIER: 1.15,
  SAVE_INTERVAL_MS: 30000, // 30 seconds
  OFFLINE_CAP_HOURS: 12,
  MAX_FPS: 60,
} as const;

// Unit definitions
export const UNITS: Record<string, Unit> = {
  juniorDev: {
    id: 'juniorDev',
    name: 'Junior Developer',
    baseCost: 10,
    baseProduction: 0.1,
    costMultiplier: GAME_CONFIG.COST_MULTIPLIER,
  },
  midDev: {
    id: 'midDev',
    name: 'Mid-Level Developer',
    baseCost: 100,
    baseProduction: 0.5,
    costMultiplier: GAME_CONFIG.COST_MULTIPLIER,
  },
  seniorDev: {
    id: 'seniorDev',
    name: 'Senior Developer',
    baseCost: 1000,
    baseProduction: 2.5,
    costMultiplier: GAME_CONFIG.COST_MULTIPLIER,
  },
  salesRep: {
    id: 'salesRep',
    name: 'Sales Representative',
    baseCost: 100,
    baseProduction: 0.2, // leads per second
    costMultiplier: GAME_CONFIG.COST_MULTIPLIER,
  },
} as const;

// Unlock thresholds
export const UNLOCK_THRESHOLDS = {
  JUNIOR_DEV_BUTTON: 5, // After 5 manual clicks
  SALES_DEPARTMENT: 500, // $500 total earned
  MID_DEVS: 1000, // $1000 total earned
  SENIOR_DEVS: 5000, // $5000 total earned
} as const;
```

**Testing Requirements:**
- Create unit tests for type checking
- Verify all constants are properly typed
- No TypeScript errors in the codebase

**Acceptance Criteria:**
- [ ] All types defined with no TypeScript errors
- [ ] Constants file includes all game balance values
- [ ] Unit definitions complete with proper typing
- [ ] Exports work correctly when imported

---

## Core Gameplay Implementation Stories

### TECH-003: Implement Zustand Game Store
**Parent Story:** Story 1 - Basic Code Production
**Estimated Time:** 3-4 hours
**Priority:** Critical
**Dependencies:** TECH-002

**Implementation Details:**

Create `src/store/gameStore.ts`:
```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { GameState } from '../types/game.types';
import { GAME_CONFIG, UNITS } from '../constants/game.constants';

interface GameStore extends GameState {
  // Actions
  clickWriteCode: () => void;
  buyUnit: (unitId: string) => void;
  shipFeature: () => void;
  convertLeadToSale: () => void;
  tick: (deltaTime: number) => void;
  save: () => void;
  load: () => void;
  reset: () => void;
  
  // Computed values
  getUnitCost: (unitId: string, owned: number) => number;
  canAffordUnit: (unitId: string) => boolean;
  canShipFeature: () => boolean;
  canConvertLead: () => boolean;
}

const initialState: GameState = {
  linesOfCode: 0,
  money: 0,
  customerLeads: 0,
  units: {
    juniorDev: 0,
    midDev: 0,
    seniorDev: 0,
    salesRep: 0,
  },
  productionRates: {
    linesOfCode: 0,
    customerLeads: 0,
  },
  unlocks: {
    salesDepartment: false,
    midDevs: false,
    seniorDevs: false,
  },
  stats: {
    totalLinesWritten: 0,
    totalMoneyEarned: 0,
    totalFeaturesShipped: 0,
    totalClicks: 0,
    gameStartTime: Date.now(),
    lastSaveTime: Date.now(),
  },
};

export const useGameStore = create<GameStore>()(
  immer((set, get) => ({
    ...initialState,

    // Manual code writing
    clickWriteCode: () => set((state) => {
      state.linesOfCode += GAME_CONFIG.MANUAL_LINES_PER_CLICK;
      state.stats.totalLinesWritten += GAME_CONFIG.MANUAL_LINES_PER_CLICK;
      state.stats.totalClicks += 1;
    }),

    // Buy a unit
    buyUnit: (unitId: string) => set((state) => {
      const unit = UNITS[unitId];
      if (!unit) return;
      
      const owned = state.units[unitId as keyof typeof state.units];
      const cost = get().getUnitCost(unitId, owned);
      
      if (state.money >= cost) {
        state.money -= cost;
        state.units[unitId as keyof typeof state.units] += 1;
        
        // Update production rates
        if (unitId === 'salesRep') {
          state.productionRates.customerLeads += unit.baseProduction;
        } else {
          state.productionRates.linesOfCode += unit.baseProduction;
        }
      }
    }),

    // Ship a feature
    shipFeature: () => set((state) => {
      if (state.linesOfCode >= GAME_CONFIG.LINES_PER_FEATURE) {
        state.linesOfCode -= GAME_CONFIG.LINES_PER_FEATURE;
        state.money += GAME_CONFIG.BASE_FEATURE_VALUE;
        state.stats.totalMoneyEarned += GAME_CONFIG.BASE_FEATURE_VALUE;
        state.stats.totalFeaturesShipped += 1;
      }
    }),

    // Convert lead to sale
    convertLeadToSale: () => set((state) => {
      if (state.customerLeads >= 1 && state.linesOfCode >= GAME_CONFIG.LINES_PER_FEATURE) {
        state.customerLeads -= 1;
        state.linesOfCode -= GAME_CONFIG.LINES_PER_FEATURE;
        state.money += GAME_CONFIG.LEAD_FEATURE_VALUE;
        state.stats.totalMoneyEarned += GAME_CONFIG.LEAD_FEATURE_VALUE;
        state.stats.totalFeaturesShipped += 1;
      }
    }),

    // Game tick (called every frame)
    tick: (deltaTime: number) => set((state) => {
      const seconds = deltaTime / 1000;
      
      // Update resources based on production rates
      state.linesOfCode += state.productionRates.linesOfCode * seconds;
      state.customerLeads += state.productionRates.customerLeads * seconds;
      state.stats.totalLinesWritten += state.productionRates.linesOfCode * seconds;
      
      // Check for unlocks
      if (state.stats.totalMoneyEarned >= 500 && !state.unlocks.salesDepartment) {
        state.unlocks.salesDepartment = true;
      }
      if (state.stats.totalMoneyEarned >= 1000 && !state.unlocks.midDevs) {
        state.unlocks.midDevs = true;
      }
      if (state.stats.totalMoneyEarned >= 5000 && !state.unlocks.seniorDevs) {
        state.unlocks.seniorDevs = true;
      }
    }),

    // Calculate unit cost
    getUnitCost: (unitId: string, owned: number) => {
      const unit = UNITS[unitId];
      if (!unit) return 0;
      return Math.floor(unit.baseCost * Math.pow(unit.costMultiplier, owned));
    },

    // Check if player can afford unit
    canAffordUnit: (unitId: string) => {
      const state = get();
      const owned = state.units[unitId as keyof typeof state.units] || 0;
      const cost = state.getUnitCost(unitId, owned);
      return state.money >= cost;
    },

    // Check if player can ship feature
    canShipFeature: () => {
      return get().linesOfCode >= GAME_CONFIG.LINES_PER_FEATURE;
    },

    // Check if player can convert lead
    canConvertLead: () => {
      const state = get();
      return state.customerLeads >= 1 && state.linesOfCode >= GAME_CONFIG.LINES_PER_FEATURE;
    },

    // Save game
    save: () => {
      const state = get();
      const saveData = {
        ...state,
        saveVersion: 1,
        saveTime: Date.now(),
      };
      localStorage.setItem('petSoftwareIdler', JSON.stringify(saveData));
      set((state) => {
        state.stats.lastSaveTime = Date.now();
      });
    },

    // Load game
    load: () => {
      const saveString = localStorage.getItem('petSoftwareIdler');
      if (saveString) {
        try {
          const saveData = JSON.parse(saveString);
          set((state) => {
            Object.assign(state, saveData);
          });
        } catch (error) {
          console.error('Failed to load save:', error);
        }
      }
    },

    // Reset game
    reset: () => set(() => ({
      ...initialState,
      stats: {
        ...initialState.stats,
        gameStartTime: Date.now(),
      },
    })),
  }))
);
```

**Testing Requirements:**
- Test all store actions work correctly
- Verify calculations are accurate
- Test save/load functionality
- Ensure no state mutations outside of actions

**Acceptance Criteria:**
- [ ] Store initializes with correct default values
- [ ] All actions update state correctly
- [ ] Computed values calculate accurately
- [ ] Save/load works with localStorage
- [ ] No TypeScript errors

---

### TECH-004: Create Main Game Component and Layout
**Parent Story:** Story 1 - Basic Code Production
**Estimated Time:** 3-4 hours
**Priority:** Critical
**Dependencies:** TECH-003

**Implementation Details:**

Create `src/components/game/Game.tsx`:
```typescript
import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import ResourceDisplay from '../ui/ResourceDisplay';
import CodeButton from '../ui/CodeButton';
import ShipFeatureButton from '../ui/ShipFeatureButton';
import UnitsPanel from '../ui/UnitsPanel';
import StatsPanel from '../ui/StatsPanel';
import './Game.css';

const Game: React.FC = () => {
  const tick = useGameStore((state) => state.tick);
  const save = useGameStore((state) => state.save);
  const load = useGameStore((state) => state.load);
  
  const lastTimeRef = useRef<number>(Date.now());
  const saveIntervalRef = useRef<NodeJS.Timeout>();
  
  // Game loop
  useEffect(() => {
    let animationId: number;
    
    const gameLoop = () => {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;
      
      // Cap delta time to prevent huge jumps
      const cappedDelta = Math.min(deltaTime, 1000 / 30); // Max 30 FPS worth of progress
      tick(cappedDelta);
      
      animationId = requestAnimationFrame(gameLoop);
    };
    
    animationId = requestAnimationFrame(gameLoop);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [tick]);
  
  // Auto-save
  useEffect(() => {
    saveIntervalRef.current = setInterval(() => {
      save();
    }, 30000); // Every 30 seconds
    
    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [save]);
  
  // Load on mount
  useEffect(() => {
    load();
  }, [load]);
  
  return (
    <div className="game-container">
      <header className="game-header">
        <h1>Pet Software Idler</h1>
        <button onClick={save} className="save-button">Save Game</button>
      </header>
      
      <div className="game-layout">
        <div className="left-panel">
          <ResourceDisplay />
          <div className="action-buttons">
            <CodeButton />
            <ShipFeatureButton />
          </div>
        </div>
        
        <div className="center-panel">
          <UnitsPanel />
        </div>
        
        <div className="right-panel">
          <StatsPanel />
        </div>
      </div>
    </div>
  );
};

export default Game;
```

Create `src/components/game/Game.css`:
```css
.game-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #1a1a1a;
  color: #ffffff;
  font-family: 'Consolas', 'Monaco', monospace;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #2a2a2a;
  border-bottom: 2px solid #3a3a3a;
}

.game-header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #00ff00;
}

.save-button {
  padding: 0.5rem 1rem;
  background-color: #4a4a4a;
  color: #ffffff;
  border: 1px solid #5a5a5a;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.save-button:hover {
  background-color: #5a5a5a;
}

.game-layout {
  flex: 1;
  display: flex;
  gap: 1rem;
  padding: 1rem;
  overflow: hidden;
}

.left-panel,
.center-panel,
.right-panel {
  background-color: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 8px;
  padding: 1rem;
  overflow-y: auto;
}

.left-panel {
  flex: 0 0 300px;
}

.center-panel {
  flex: 1;
}

.right-panel {
  flex: 0 0 250px;
}

.action-buttons {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
```

**Testing Requirements:**
- Verify game loop runs at stable FPS
- Test auto-save functionality
- Ensure layout is responsive
- Check load on mount works

**Acceptance Criteria:**
- [ ] Game component renders without errors
- [ ] Game loop updates at ~60 FPS
- [ ] Auto-save triggers every 30 seconds
- [ ] Layout displays all three panels
- [ ] Save button works manually

---

### TECH-005: Implement Resource Display Component
**Parent Story:** Story 1 - Basic Code Production
**Estimated Time:** 2-3 hours
**Priority:** Critical
**Dependencies:** TECH-004

**Implementation Details:**

Create `src/utils/formatting.ts`:
```typescript
export const formatNumber = (num: number): string => {
  if (num < 1000) {
    return Math.floor(num).toString();
  } else if (num < 1000000) {
    return (num / 1000).toFixed(1) + 'K';
  } else if (num < 1000000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num < 1000000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  } else {
    return (num / 1000000000000).toFixed(1) + 'T';
  }
};

export const formatRate = (rate: number): string => {
  if (rate === 0) return '0';
  if (rate < 0.1) {
    return rate.toFixed(3);
  } else if (rate < 1) {
    return rate.toFixed(2);
  } else if (rate < 10) {
    return rate.toFixed(1);
  } else {
    return formatNumber(rate);
  }
};

export const formatMoney = (amount: number): string => {
  return '$' + formatNumber(amount);
};
```

Create `src/components/ui/ResourceDisplay.tsx`:
```typescript
import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { formatNumber, formatRate, formatMoney } from '../../utils/formatting';
import './ResourceDisplay.css';

interface ResourceItemProps {
  label: string;
  value: string;
  rate?: string;
  icon?: string;
}

const ResourceItem: React.FC<ResourceItemProps> = ({ label, value, rate, icon }) => {
  return (
    <div className="resource-item">
      <div className="resource-header">
        {icon && <span className="resource-icon">{icon}</span>}
        <span className="resource-label">{label}</span>
      </div>
      <div className="resource-value">
        <span className="value">{value}</span>
        {rate && <span className="rate">(+{rate}/s)</span>}
      </div>
    </div>
  );
};

const ResourceDisplay: React.FC = () => {
  const linesOfCode = useGameStore((state) => state.linesOfCode);
  const money = useGameStore((state) => state.money);
  const customerLeads = useGameStore((state) => state.customerLeads);
  const productionRates = useGameStore((state) => state.productionRates);
  const unlocks = useGameStore((state) => state.unlocks);

  return (
    <div className="resource-display">
      <h2>Resources</h2>
      
      <ResourceItem
        label="Lines of Code"
        value={formatNumber(linesOfCode)}
        rate={formatRate(productionRates.linesOfCode)}
        icon="💻"
      />
      
      <ResourceItem
        label="Money"
        value={formatMoney(money)}
        icon="💰"
      />
      
      {unlocks.salesDepartment && (
        <ResourceItem
          label="Customer Leads"
          value={formatNumber(customerLeads)}
          rate={formatRate(productionRates.customerLeads)}
          icon="📊"
        />
      )}
    </div>
  );
};

export default ResourceDisplay;
```

Create `src/components/ui/ResourceDisplay.css`:
```css
.resource-display {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.resource-display h2 {
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  color: #00ff00;
  border-bottom: 1px solid #3a3a3a;
  padding-bottom: 0.5rem;
}

.resource-item {
  background-color: #1a1a1a;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
  padding: 0.75rem;
  transition: border-color 0.2s;
}

.resource-item:hover {
  border-color: #4a4a4a;
}

.resource-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.resource-icon {
  font-size: 1.2rem;
}

.resource-label {
  font-size: 0.9rem;
  color: #aaaaaa;
}

.resource-value {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.value {
  font-size: 1.4rem;
  font-weight: bold;
  color: #ffffff;
}

.rate {
  font-size: 0.8rem;
  color: #00ff00;
}
```

**Testing Requirements:**
- Test number formatting for all ranges
- Verify rate display updates correctly
- Check conditional rendering of sales resources
- Test hover effects

**Acceptance Criteria:**
- [ ] Resources display with correct formatting
- [ ] Production rates show when > 0
- [ ] Customer leads only show when unlocked
- [ ] Icons display correctly
- [ ] Responsive to value changes

---

### TECH-006: Implement Code Writing Button with Animations
**Parent Story:** Story 1 - Basic Code Production
**Estimated Time:** 3-4 hours
**Priority:** Critical
**Dependencies:** TECH-005

**Implementation Details:**

Create `src/hooks/useAnimation.ts`:
```typescript
import { useState, useCallback } from 'react';

export const useAnimation = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  const triggerAnimation = useCallback((duration: number = 300) => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
    }, duration);
  }, []);
  
  return { isAnimating, triggerAnimation };
};

export const useNumberPopup = () => {
  const [popups, setPopups] = useState<Array<{
    id: number;
    value: string;
    x: number;
    y: number;
  }>>([]);
  
  const createPopup = useCallback((value: string, x: number, y: number) => {
    const id = Date.now() + Math.random();
    setPopups(prev => [...prev, { id, value, x, y }]);
    
    setTimeout(() => {
      setPopups(prev => prev.filter(p => p.id !== id));
    }, 1000);
  }, []);
  
  return { popups, createPopup };
};
```

Create `src/components/ui/CodeButton.tsx`:
```typescript
import React, { useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useAnimation, useNumberPopup } from '../../hooks/useAnimation';
import { GAME_CONFIG } from '../../constants/game.constants';
import './CodeButton.css';

const CodeButton: React.FC = () => {
  const clickWriteCode = useGameStore((state) => state.clickWriteCode);
  const totalClicks = useGameStore((state) => state.stats.totalClicks);
  const { isAnimating, triggerAnimation } = useAnimation();
  const { popups, createPopup } = useNumberPopup();
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    clickWriteCode();
    triggerAnimation();
    
    // Create number popup at click position
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      createPopup(`+${GAME_CONFIG.MANUAL_LINES_PER_CLICK}`, x, y);
    }
    
    // Play click sound (if implemented)
    // playSound('click');
  };
  
  return (
    <div className="code-button-container">
      <button
        ref={buttonRef}
        className={`code-button ${isAnimating ? 'animating' : ''}`}
        onClick={handleClick}
      >
        <span className="button-icon">⌨️</span>
        <span className="button-text">Write Code</span>
        <span className="button-count">({totalClicks} clicks)</span>
      </button>
      
      {/* Number popups */}
      {popups.map((popup) => (
        <div
          key={popup.id}
          className="number-popup"
          style={{
            left: popup.x + 'px',
            top: popup.y + 'px',
          }}
        >
          {popup.value}
        </div>
      ))}
    </div>
  );
};

export default CodeButton;
```

Create `src/components/ui/CodeButton.css`:
```css
.code-button-container {
  position: relative;
}

.code-button {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #4a9eff 0%, #3a7ecc 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.1s ease;
  box-shadow: 0 4px 0 #2a5e9c;
  position: relative;
  top: 0;
}

.code-button:hover {
  background: linear-gradient(135deg, #5aafff 0%, #4a8edc 100%);
}

.code-button:active {
  top: 2px;
  box-shadow: 0 2px 0 #2a5e9c;
}

.code-button.animating {
  animation: buttonPulse 0.3s ease;
}

@keyframes buttonPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
  }
}

.button-icon {
  font-size: 2rem;
}

.button-text {
  font-size: 1.2rem;
}

.button-count {
  font-size: 0.8rem;
  opacity: 0.8;
}

.number-popup {
  position: absolute;
  font-size: 1.5rem;
  font-weight: bold;
  color: #00ff00;
  text-shadow: 0 0 4px rgba(0, 255, 0, 0.5);
  pointer-events: none;
  animation: popupFloat 1s ease-out forwards;
  z-index: 10;
}

@keyframes popupFloat {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(-50px) scale(0.5);
    opacity: 0;
  }
}
```

**Testing Requirements:**
- Test button click triggers state update
- Verify animations play correctly
- Test number popup positioning
- Check click counter updates

**Acceptance Criteria:**
- [ ] Button clicks produce +1 line of code
- [ ] Click animation plays on press
- [ ] Number popup appears at click location
- [ ] Click counter displays total clicks
- [ ] Button has satisfying press effect

---

### TECH-007: Implement Ship Feature Button
**Parent Story:** Story 3 - Feature Shipping System
**Estimated Time:** 2-3 hours
**Priority:** High
**Dependencies:** TECH-006

**Implementation Details:**

Create `src/components/ui/ShipFeatureButton.tsx`:
```typescript
import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { useAnimation, useNumberPopup } from '../../hooks/useAnimation';
import { GAME_CONFIG, UNLOCK_THRESHOLDS } from '../../constants/game.constants';
import { formatMoney } from '../../utils/formatting';
import './ShipFeatureButton.css';

const ShipFeatureButton: React.FC = () => {
  const linesOfCode = useGameStore((state) => state.linesOfCode);
  const shipFeature = useGameStore((state) => state.shipFeature);
  const canShipFeature = useGameStore((state) => state.canShipFeature);
  const totalClicks = useGameStore((state) => state.stats.totalClicks);
  const units = useGameStore((state) => state.units);
  
  const { isAnimating, triggerAnimation } = useAnimation();
  const { popups, createPopup } = useNumberPopup();
  
  // Show button after first dev hired or enough manual clicks
  const showButton = units.juniorDev > 0 || totalClicks >= UNLOCK_THRESHOLDS.JUNIOR_DEV_BUTTON;
  
  if (!showButton) {
    return null;
  }
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (canShipFeature()) {
      shipFeature();
      triggerAnimation();
      
      // Create money popup
      const rect = e.currentTarget.getBoundingClientRect();
      const x = rect.width / 2;
      const y = rect.height / 2;
      createPopup(formatMoney(GAME_CONFIG.BASE_FEATURE_VALUE), x, y);
    }
  };
  
  const progress = Math.min((linesOfCode / GAME_CONFIG.LINES_PER_FEATURE) * 100, 100);
  
  return (
    <div className="ship-feature-container">
      <button
        className={`ship-feature-button ${!canShipFeature() ? 'disabled' : ''} ${isAnimating ? 'animating' : ''}`}
        onClick={handleClick}
        disabled={!canShipFeature()}
      >
        <span className="button-icon">📦</span>
        <span className="button-text">Ship Feature</span>
        <span className="button-info">
          {GAME_CONFIG.LINES_PER_FEATURE} lines → {formatMoney(GAME_CONFIG.BASE_FEATURE_VALUE)}
        </span>
        
        {/* Progress bar */}
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </button>
      
      {/* Money popups */}
      {popups.map((popup) => (
        <div
          key={popup.id}
          className="money-popup"
          style={{
            left: popup.x + 'px',
            top: popup.y + 'px',
          }}
        >
          {popup.value}
        </div>
      ))}
    </div>
  );
};

export default ShipFeatureButton;
```

Create `src/components/ui/ShipFeatureButton.css`:
```css
.ship-feature-container {
  position: relative;
}

.ship-feature-button {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #4fce5d 0%, #3fa64a 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.1s ease;
  box-shadow: 0 4px 0 #2f863a;
  position: relative;
  top: 0;
  overflow: hidden;
}

.ship-feature-button:hover:not(.disabled) {
  background: linear-gradient(135deg, #5fde6d 0%, #4fb65a 100%);
}

.ship-feature-button:active:not(.disabled) {
  top: 2px;
  box-shadow: 0 2px 0 #2f863a;
}

.ship-feature-button.disabled {
  background: linear-gradient(135deg, #5a5a5a 0%, #4a4a4a 100%);
  box-shadow: 0 4px 0 #3a3a3a;
  cursor: not-allowed;
  opacity: 0.7;
}

.ship-feature-button.animating {
  animation: shipPulse 0.3s ease;
}

@keyframes shipPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
  }
}

.button-icon {
  font-size: 1.5rem;
}

.button-text {
  font-size: 1.1rem;
}

.button-info {
  font-size: 0.8rem;
  opacity: 0.9;
}

.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background-color: rgba(0, 0, 0, 0.3);
}

.progress-fill {
  height: 100%;
  background-color: rgba(255, 255, 255, 0.3);
  transition: width 0.2s ease;
}

.money-popup {
  position: absolute;
  font-size: 1.8rem;
  font-weight: bold;
  color: #4fce5d;
  text-shadow: 0 0 4px rgba(79, 206, 93, 0.5);
  pointer-events: none;
  animation: moneyFloat 1s ease-out forwards;
  z-index: 10;
}

@keyframes moneyFloat {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(-60px) scale(1.2);
    opacity: 0;
  }
}
```

**Testing Requirements:**
- Test button only appears after conditions met
- Verify conversion math is correct
- Test disabled state when insufficient resources
- Check progress bar updates correctly

**Acceptance Criteria:**
- [ ] Button hidden until unlock condition met
- [ ] Converts 10 lines → $15
- [ ] Shows progress bar for lines needed
- [ ] Disabled state when can't ship
- [ ] Money popup animation on ship

---

### TECH-008: Implement Units Panel with Junior Developer
**Parent Story:** Story 2 - First Automation
**Estimated Time:** 4-5 hours
**Priority:** Critical
**Dependencies:** TECH-007

**Implementation Details:**

Create `src/components/ui/UnitCard.tsx`:
```typescript
import React from 'react';
import { Unit } from '../../types/game.types';
import { formatNumber, formatRate, formatMoney } from '../../utils/formatting';
import './UnitCard.css';

interface UnitCardProps {
  unit: Unit;
  owned: number;
  cost: number;
  canAfford: boolean;
  isUnlocked: boolean;
  onBuy: () => void;
  productionType: 'code' | 'leads';
}

const UnitCard: React.FC<UnitCardProps> = ({
  unit,
  owned,
  cost,
  canAfford,
  isUnlocked,
  onBuy,
  productionType,
}) => {
  if (!isUnlocked) {
    return null;
  }
  
  const totalProduction = owned * unit.baseProduction;
  const productionLabel = productionType === 'code' ? 'lines/s' : 'leads/s';
  
  return (
    <div className={`unit-card ${!canAfford ? 'cannot-afford' : ''}`}>
      <div className="unit-header">
        <h3>{unit.name}</h3>
        <span className="unit-owned">{owned}</span>
      </div>
      
      <div className="unit-stats">
        <div className="stat">
          <span className="stat-label">Production:</span>
          <span className="stat-value">
            {formatRate(unit.baseProduction)} {productionLabel}
          </span>
        </div>
        {owned > 0 && (
          <div className="stat">
            <span className="stat-label">Total:</span>
            <span className="stat-value">
              {formatRate(totalProduction)} {productionLabel}
            </span>
          </div>
        )}
      </div>
      
      <button
        className={`buy-button ${!canAfford ? 'disabled' : ''}`}
        onClick={onBuy}
        disabled={!canAfford}
      >
        <span className="buy-text">Hire</span>
        <span className="buy-cost">{formatMoney(cost)}</span>
      </button>
      
      {/* Visual representation */}
      <div className="unit-visuals">
        {Array.from({ length: Math.min(owned, 10) }).map((_, i) => (
          <div
            key={i}
            className="unit-sprite"
            style={{
              animationDelay: `${i * 0.1}s`,
            }}
          >
            {unit.id === 'juniorDev' && '👨‍💻'}
            {unit.id === 'midDev' && '👩‍💻'}
            {unit.id === 'seniorDev' && '🧑‍💻'}
            {unit.id === 'salesRep' && '💼'}
          </div>
        ))}
        {owned > 10 && (
          <span className="more-units">+{owned - 10}</span>
        )}
      </div>
    </div>
  );
};

export default UnitCard;
```

Create `src/components/ui/UnitCard.css`:
```css
.unit-card {
  background-color: #1a1a1a;
  border: 2px solid #3a3a3a;
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s ease;
}

.unit-card:hover {
  border-color: #4a4a4a;
  transform: translateY(-2px);
}

.unit-card.cannot-afford {
  opacity: 0.7;
}

.unit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.unit-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #ffffff;
}

.unit-owned {
  font-size: 1.5rem;
  font-weight: bold;
  color: #00ff00;
  background-color: #003300;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.unit-stats {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.stat {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.stat-label {
  color: #aaaaaa;
}

.stat-value {
  color: #ffffff;
  font-weight: bold;
}

.buy-button {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #ffaa00 0%, #ff8800 100%);
  border: none;
  border-radius: 6px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.1s ease;
  box-shadow: 0 3px 0 #cc6600;
  position: relative;
  top: 0;
}

.buy-button:hover:not(.disabled) {
  background: linear-gradient(135deg, #ffbb00 0%, #ff9900 100%);
}

.buy-button:active:not(.disabled) {
  top: 1px;
  box-shadow: 0 1px 0 #cc6600;
}

.buy-button.disabled {
  background: linear-gradient(135deg, #5a5a5a 0%, #4a4a4a 100%);
  box-shadow: 0 3px 0 #3a3a3a;
  cursor: not-allowed;
}

.buy-text {
  font-size: 1rem;
}

.buy-cost {
  font-size: 1.1rem;
}

.unit-visuals {
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  min-height: 40px;
}

.unit-sprite {
  font-size: 1.5rem;
  animation: unitBob 2s ease-in-out infinite;
}

@keyframes unitBob {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.more-units {
  font-size: 0.9rem;
  color: #aaaaaa;
  margin-left: 0.5rem;
}
```

Create `src/components/ui/UnitsPanel.tsx`:
```typescript
import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { UNITS, UNLOCK_THRESHOLDS } from '../../constants/game.constants';
import UnitCard from './UnitCard';
import './UnitsPanel.css';

const UnitsPanel: React.FC = () => {
  const units = useGameStore((state) => state.units);
  const unlocks = useGameStore((state) => state.unlocks);
  const totalClicks = useGameStore((state) => state.stats.totalClicks);
  const buyUnit = useGameStore((state) => state.buyUnit);
  const getUnitCost = useGameStore((state) => state.getUnitCost);
  const canAffordUnit = useGameStore((state) => state.canAffordUnit);
  
  // Determine which units are unlocked
  const isJuniorDevUnlocked = totalClicks >= UNLOCK_THRESHOLDS.JUNIOR_DEV_BUTTON;
  const isMidDevUnlocked = unlocks.midDevs;
  const isSeniorDevUnlocked = unlocks.seniorDevs;
  const isSalesRepUnlocked = unlocks.salesDepartment;
  
  return (
    <div className="units-panel">
      <h2>Your Team</h2>
      
      <div className="departments">
        <div className="department">
          <h3>🖥️ Development</h3>
          <div className="unit-list">
            <UnitCard
              unit={UNITS.juniorDev}
              owned={units.juniorDev}
              cost={getUnitCost('juniorDev', units.juniorDev)}
              canAfford={canAffordUnit('juniorDev')}
              isUnlocked={isJuniorDevUnlocked}
              onBuy={() => buyUnit('juniorDev')}
              productionType="code"
            />
            
            <UnitCard
              unit={UNITS.midDev}
              owned={units.midDev}
              cost={getUnitCost('midDev', units.midDev)}
              canAfford={canAffordUnit('midDev')}
              isUnlocked={isMidDevUnlocked}
              onBuy={() => buyUnit('midDev')}
              productionType="code"
            />
            
            <UnitCard
              unit={UNITS.seniorDev}
              owned={units.seniorDev}
              cost={getUnitCost('seniorDev', units.seniorDev)}
              canAfford={canAffordUnit('seniorDev')}
              isUnlocked={isSeniorDevUnlocked}
              onBuy={() => buyUnit('seniorDev')}
              productionType="code"
            />
          </div>
        </div>
        
        {isSalesRepUnlocked && (
          <div className="department">
            <h3>💼 Sales</h3>
            <div className="unit-list">
              <UnitCard
                unit={UNITS.salesRep}
                owned={units.salesRep}
                cost={getUnitCost('salesRep', units.salesRep)}
                canAfford={canAffordUnit('salesRep')}
                isUnlocked={true}
                onBuy={() => buyUnit('salesRep')}
                productionType="leads"
              />
            </div>
          </div>
        )}
      </div>
      
      {!isJuniorDevUnlocked && (
        <div className="unlock-hint">
          <p>Click "Write Code" {UNLOCK_THRESHOLDS.JUNIOR_DEV_BUTTON} times to unlock your first hire!</p>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(totalClicks / UNLOCK_THRESHOLDS.JUNIOR_DEV_BUTTON) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitsPanel;
```

Create `src/components/ui/UnitsPanel.css`:
```css
.units-panel {
  height: 100%;
}

.units-panel h2 {
  margin: 0 0 1rem 0;
  font-size: 1.3rem;
  color: #00ff00;
  border-bottom: 1px solid #3a3a3a;
  padding-bottom: 0.5rem;
}

.departments {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.department h3 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.unit-list {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
}

.unlock-hint {
  background-color: #1a1a1a;
  border: 1px solid #3a3a3a;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 2rem;
  text-align: center;
}

.unlock-hint p {
  margin: 0 0 1rem 0;
  color: #aaaaaa;
  font-size: 0.9rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #2a2a2a;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00ff00 0%, #00cc00 100%);
  transition: width 0.3s ease;
}
```

**Testing Requirements:**
- Test unit unlock conditions
- Verify cost scaling formula
- Test buy button states
- Check visual animations
- Verify production rate updates

**Acceptance Criteria:**
- [ ] Junior dev unlocks after 5 clicks
- [ ] Cost scales correctly with formula
- [ ] Visual sprites animate properly
- [ ] Buy button disabled when can't afford
- [ ] Production rates update on purchase

---

### TECH-009: Implement Lead Conversion System
**Parent Story:** Story 5 - Lead-to-Revenue Conversion
**Estimated Time:** 3-4 hours
**Priority:** High
**Dependencies:** TECH-008

**Implementation Details:**

Create `src/components/ui/ConversionButton.tsx`:
```typescript
import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useAnimation, useNumberPopup } from '../../hooks/useAnimation';
import { GAME_CONFIG } from '../../constants/game.constants';
import { formatMoney, formatNumber } from '../../utils/formatting';
import './ConversionButton.css';

const ConversionButton: React.FC = () => {
  const customerLeads = useGameStore((state) => state.customerLeads);
  const linesOfCode = useGameStore((state) => state.linesOfCode);
  const convertLeadToSale = useGameStore((state) => state.convertLeadToSale);
  const canConvertLead = useGameStore((state) => state.canConvertLead);
  const unlocks = useGameStore((state) => state.unlocks);
  
  const { isAnimating, triggerAnimation } = useAnimation();
  const { popups, createPopup } = useNumberPopup();
  const autoConvertRef = useRef<NodeJS.Timeout>();
  
  // Auto-convert when both resources available
  useEffect(() => {
    const checkAutoConvert = () => {
      if (canConvertLead()) {
        convertLeadToSale();
        triggerAnimation();
        
        // Create popup in center of button
        const button = document.querySelector('.conversion-button');
        if (button) {
          const rect = button.getBoundingClientRect();
          createPopup(
            formatMoney(GAME_CONFIG.LEAD_FEATURE_VALUE),
            rect.width / 2,
            rect.height / 2
          );
        }
      }
    };
    
    autoConvertRef.current = setInterval(checkAutoConvert, 100);
    
    return () => {
      if (autoConvertRef.current) {
        clearInterval(autoConvertRef.current);
      }
    };
  }, [canConvertLead, convertLeadToSale, triggerAnimation, createPopup]);
  
  if (!unlocks.salesDepartment) {
    return null;
  }
  
  const hasLead = customerLeads >= 1;
  const hasCode = linesOfCode >= GAME_CONFIG.LINES_PER_FEATURE;
  
  return (
    <div className="conversion-container">
      <div className={`conversion-button ${isAnimating ? 'converting' : ''}`}>
        <h4>Lead Conversion</h4>
        
        <div className="conversion-formula">
          <div className={`resource-requirement ${hasLead ? 'has-resource' : ''}`}>
            <span className="icon">📊</span>
            <span className="amount">1 Lead</span>
          </div>
          
          <span className="plus">+</span>
          
          <div className={`resource-requirement ${hasCode ? 'has-resource' : ''}`}>
            <span className="icon">💻</span>
            <span className="amount">{GAME_CONFIG.LINES_PER_FEATURE} Lines</span>
          </div>
          
          <span className="equals">=</span>
          
          <div className="conversion-result">
            <span className="icon">💰</span>
            <span className="amount">{formatMoney(GAME_CONFIG.LEAD_FEATURE_VALUE)}</span>
          </div>
        </div>
        
        <div className="conversion-status">
          {canConvertLead() ? (
            <span className="status-active">Converting automatically...</span>
          ) : (
            <span className="status-waiting">Waiting for resources...</span>
          )}
        </div>
      </div>
      
      {/* Money popups */}
      {popups.map((popup) => (
        <div
          key={popup.id}
          className="conversion-popup"
          style={{
            left: popup.x + 'px',
            top: popup.y + 'px',
          }}
        >
          {popup.value}
        </div>
      ))}
    </div>
  );
};

export default ConversionButton;
```

Create `src/components/ui/ConversionButton.css`:
```css
.conversion-container {
  position: relative;
  margin-top: 1rem;
}

.conversion-button {
  background-color: #1a1a1a;
  border: 2px solid #3a3a3a;
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s ease;
}

.conversion-button.converting {
  border-color: #00ff00;
  animation: conversionPulse 0.5s ease;
}

@keyframes conversionPulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(0, 255, 0, 0.4);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 0 0 10px rgba(0, 255, 0, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(0, 255, 0, 0);
  }
}

.conversion-button h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: #ffffff;
  text-align: center;
}

.conversion-formula {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.resource-requirement {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background-color: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.resource-requirement.has-resource {
  border-color: #00ff00;
  background-color: #003300;
}

.resource-requirement .icon,
.conversion-result .icon {
  font-size: 1.2rem;
}

.resource-requirement .amount,
.conversion-result .amount {
  font-size: 0.9rem;
  font-weight: bold;
  color: #ffffff;
}

.plus,
.equals {
  font-size: 1.2rem;
  color: #aaaaaa;
  font-weight: bold;
}

.conversion-result {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: linear-gradient(135deg, #4fce5d 0%, #3fa64a 100%);
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.conversion-status {
  text-align: center;
  font-size: 0.9rem;
}

.status-active {
  color: #00ff00;
  animation: statusBlink 1s ease-in-out infinite;
}

@keyframes statusBlink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.status-waiting {
  color: #aaaaaa;
}

.conversion-popup {
  position: absolute;
  font-size: 2rem;
  font-weight: bold;
  color: #4fce5d;
  text-shadow: 0 0 6px rgba(79, 206, 93, 0.8);
  pointer-events: none;
  animation: conversionFloat 1.2s ease-out forwards;
  z-index: 10;
}

@keyframes conversionFloat {
  0% {
    transform: translateY(0) scale(1) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(-80px) scale(1.3) rotate(5deg);
    opacity: 0;
  }
}
```

**Update** `src/components/ui/ResourceDisplay.tsx` to include the conversion button:
```typescript
// Add this import at the top
import ConversionButton from './ConversionButton';

// Update the return statement to include ConversionButton after resources
return (
  <div className="resource-display">
    <h2>Resources</h2>
    
    <ResourceItem
      label="Lines of Code"
      value={formatNumber(linesOfCode)}
      rate={formatRate(productionRates.linesOfCode)}
      icon="💻"
    />
    
    <ResourceItem
      label="Money"
      value={formatMoney(money)}
      icon="💰"
    />
    
    {unlocks.salesDepartment && (
      <>
        <ResourceItem
          label="Customer Leads"
          value={formatNumber(customerLeads)}
          rate={formatRate(productionRates.customerLeads)}
          icon="📊"
        />
        <ConversionButton />
      </>
    )}
  </div>
);
```

**Testing Requirements:**
- Test automatic conversion triggers
- Verify conversion math is correct
- Check visual feedback on conversion
- Test resource requirement indicators

**Acceptance Criteria:**
- [ ] Auto-converts when resources available
- [ ] Shows formula: 1 Lead + 10 Lines = $50
- [ ] Visual pulse on conversion
- [ ] Resource indicators show availability
- [ ] Money popup shows conversion value

---

### TECH-010: Implement Save System with Visual Feedback
**Parent Story:** Story 8 - Save System
**Estimated Time:** 3-4 hours
**Priority:** Critical
**Dependencies:** TECH-009

**Implementation Details:**

Create `src/components/ui/SaveIndicator.tsx`:
```typescript
import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import './SaveIndicator.css';

const SaveIndicator: React.FC = () => {
  const [showSaveAnimation, setShowSaveAnimation] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<number>(Date.now());
  const save = useGameStore((state) => state.save);
  
  // Listen for save events
  useEffect(() => {
    const originalSave = useGameStore.getState().save;
    
    // Wrap save function to trigger animation
    useGameStore.setState({
      save: () => {
        originalSave();
        setShowSaveAnimation(true);
        setLastSaveTime(Date.now());
        
        setTimeout(() => {
          setShowSaveAnimation(false);
        }, 2000);
      }
    });
    
    return () => {
      useGameStore.setState({ save: originalSave });
    };
  }, []);
  
  const getTimeSinceLastSave = () => {
    const seconds = Math.floor((Date.now() - lastSaveTime) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };
  
  return (
    <div className={`save-indicator ${showSaveAnimation ? 'saving' : ''}`}>
      {showSaveAnimation ? (
        <>
          <span className="save-icon">💾</span>
          <span className="save-text">Saving...</span>
        </>
      ) : (
        <span className="save-info">Saved {getTimeSinceLastSave()}</span>
      )}
    </div>
  );
};

export default SaveIndicator;
```

Create `src/components/ui/SaveIndicator.css`:
```css
.save-indicator {
  position: fixed;
  top: 1rem;
  right: 1rem;
  background-color: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.8;
  transition: all 0.3s ease;
  z-index: 100;
}

.save-indicator:hover {
  opacity: 1;
}

.save-indicator.saving {
  background-color: #003300;
  border-color: #00ff00;
  animation: saveGlow 2s ease;
}

@keyframes saveGlow {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 255, 0, 0.6);
  }
  50% {
    box-shadow: 0 0 20px 5px rgba(0, 255, 0, 0.3);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 255, 0, 0);
  }
}

.save-icon {
  font-size: 1.2rem;
  animation: saveRotate 1s ease;
}

@keyframes saveRotate {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.2);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}

.save-text {
  font-size: 0.9rem;
  color: #00ff00;
  font-weight: bold;
}

.save-info {
  font-size: 0.8rem;
  color: #aaaaaa;
}
```

**Update** `src/store/gameStore.ts` to add offline progress calculation:
```typescript
// Add this interface for save data
interface SaveData extends GameState {
  saveVersion: number;
  saveTime: number;
}

// Update the load function to calculate offline progress
load: () => {
  const saveString = localStorage.getItem('petSoftwareIdler');
  if (saveString) {
    try {
      const saveData: SaveData = JSON.parse(saveString);
      const currentTime = Date.now();
      const offlineTime = currentTime - saveData.saveTime;
      
      // Calculate offline progress (max 12 hours)
      const offlineSeconds = Math.min(offlineTime / 1000, GAME_CONFIG.OFFLINE_CAP_HOURS * 3600);
      
      if (offlineSeconds > 10) { // Only show if away for more than 10 seconds
        // Calculate offline earnings
        const offlineLines = saveData.productionRates.linesOfCode * offlineSeconds;
        const offlineLeads = saveData.productionRates.customerLeads * offlineSeconds;
        
        // Update save data with offline progress
        saveData.linesOfCode += offlineLines;
        saveData.customerLeads += offlineLeads;
        saveData.stats.totalLinesWritten += offlineLines;
        
        // Store offline earnings for display
        set((state) => {
          Object.assign(state, saveData);
          // You can add an offline earnings display here
        });
        
        // Show offline earnings popup (implement separately)
        console.log(`Welcome back! You earned ${Math.floor(offlineLines)} lines and ${Math.floor(offlineLeads)} leads while away.`);
      } else {
        set((state) => {
          Object.assign(state, saveData);
        });
      }
    } catch (error) {
      console.error('Failed to load save:', error);
    }
  }
},
```

**Update** `src/components/game/Game.tsx` to include SaveIndicator:
```typescript
// Add import
import SaveIndicator from '../ui/SaveIndicator';

// Add SaveIndicator to the render
return (
  <div className="game-container">
    <SaveIndicator />
    <header className="game-header">
      {/* ... existing header content ... */}
    </header>
    {/* ... rest of the component ... */}
  </div>
);
```

**Testing Requirements:**
- Test auto-save every 30 seconds
- Verify save animation triggers
- Test offline progress calculation
- Check save data persistence
- Verify offline cap at 12 hours

**Acceptance Criteria:**
- [ ] Auto-saves every 30 seconds
- [ ] Visual save indicator with animation
- [ ] Manual save button works
- [ ] Offline progress calculated on load
- [ ] Save time displayed correctly

---

### TECH-011: Implement Stats Panel
**Parent Story:** Story 16 - Core Loop Validation
**Estimated Time:** 2-3 hours
**Priority:** Medium
**Dependencies:** TECH-010

**Implementation Details:**

Create `src/components/ui/StatsPanel.tsx`:
```typescript
import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { formatNumber, formatMoney } from '../../utils/formatting';
import './StatsPanel.css';

const StatsPanel: React.FC = () => {
  const stats = useGameStore((state) => state.stats);
  
  const getPlayTime = () => {
    const seconds = Math.floor((Date.now() - stats.gameStartTime) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };
  
  const statItems = [
    {
      label: 'Play Time',
      value: getPlayTime(),
      icon: '⏱️',
    },
    {
      label: 'Total Clicks',
      value: formatNumber(stats.totalClicks),
      icon: '👆',
    },
    {
      label: 'Lines Written',
      value: formatNumber(stats.totalLinesWritten),
      icon: '💻',
    },
    {
      label: 'Money Earned',
      value: formatMoney(stats.totalMoneyEarned),
      icon: '💰',
    },
    {
      label: 'Features Shipped',
      value: formatNumber(stats.totalFeaturesShipped),
      icon: '📦',
    },
  ];
  
  return (
    <div className="stats-panel">
      <h2>Statistics</h2>
      
      <div className="stats-list">
        {statItems.map((stat, index) => (
          <div key={index} className="stat-item">
            <span className="stat-icon">{stat.icon}</span>
            <div className="stat-content">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="reset-section">
        <button 
          className="reset-button"
          onClick={() => {
            if (window.confirm('Are you sure you want to reset your game? This cannot be undone!')) {
              useGameStore.getState().reset();
            }
          }}
        >
          Reset Game
        </button>
      </div>
    </div>
  );
};

export default StatsPanel;
```

Create `src/components/ui/StatsPanel.css`:
```css
.stats-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.stats-panel h2 {
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  color: #00ff00;
  border-bottom: 1px solid #3a3a3a;
  padding-bottom: 0.5rem;
}

.stats-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background-color: #1a1a1a;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
  transition: border-color 0.2s;
}

.stat-item:hover {
  border-color: #4a4a4a;
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.8rem;
  color: #aaaaaa;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: bold;
  color: #ffffff;
}

.reset-section {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #3a3a3a;
}

.reset-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #aa0000;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.reset-button:hover {
  background-color: #cc0000;
}

.reset-button:active {
  background-color: #880000;
}
```

**Testing Requirements:**
- Test play time calculation
- Verify all stats update correctly
- Test reset functionality with confirmation
- Check formatting for large numbers

**Acceptance Criteria:**
- [ ] Shows accurate play time
- [ ] All statistics update in real-time
- [ ] Reset button requires confirmation
- [ ] Stats persist through save/load
- [ ] Number formatting works correctly

---

### TECH-012: Implement Achievement System Foundation
**Parent Story:** Story 10 - Achievement System
**Estimated Time:** 4-5 hours
**Priority:** Medium
**Dependencies:** TECH-011

**Implementation Details:**

Create `src/constants/achievements.ts`:
```typescript
import { Achievement, GameState } from '../types/game.types';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_click',
    name: 'Hello World!',
    description: 'Write your first line of code',
    requirement: (state: GameState) => state.stats.totalClicks >= 1,
    unlocked: false,
  },
  {
    id: 'first_hire',
    name: 'Growing Team',
    description: 'Hire your first developer',
    requirement: (state: GameState) => state.units.juniorDev >= 1,
    unlocked: false,
  },
  {
    id: 'first_feature',
    name: 'Shipped It!',
    description: 'Ship your first feature',
    requirement: (state: GameState) => state.stats.totalFeaturesShipped >= 1,
    unlocked: false,
  },
  {
    id: 'money_100',
    name: 'Startup Funds',
    description: 'Earn $100',
    requirement: (state: GameState) => state.stats.totalMoneyEarned >= 100,
    unlocked: false,
  },
  {
    id: 'money_1k',
    name: 'Profitable',
    description: 'Earn $1,000',
    requirement: (state: GameState) => state.stats.totalMoneyEarned >= 1000,
    unlocked: false,
  },
  {
    id: 'money_10k',
    name: 'Unicorn Dreams',
    description: 'Earn $10,000',
    requirement: (state: GameState) => state.stats.totalMoneyEarned >= 10000,
    unlocked: false,
  },
  {
    id: 'lines_1k',
    name: 'Prolific Coder',
    description: 'Write 1,000 lines of code',
    requirement: (state: GameState) => state.stats.totalLinesWritten >= 1000,
    unlocked: false,
  },
  {
    id: 'team_10',
    name: 'Team Lead',
    description: 'Have 10 total employees',
    requirement: (state: GameState) => {
      const total = state.units.juniorDev + state.units.midDev + 
                   state.units.seniorDev + state.units.salesRep;
      return total >= 10;
    },
    unlocked: false,
  },
  {
    id: 'sales_unlock',
    name: 'Business Expansion',
    description: 'Unlock the Sales department',
    requirement: (state: GameState) => state.unlocks.salesDepartment,
    unlocked: false,
  },
  {
    id: 'features_100',
    name: 'Feature Factory',
    description: 'Ship 100 features',
    requirement: (state: GameState) => state.stats.totalFeaturesShipped >= 100,
    unlocked: false,
  },
];
```

Create `src/store/achievementStore.ts`:
```typescript
import { create } from 'zustand';
import { Achievement } from '../types/game.types';
import { ACHIEVEMENTS } from '../constants/achievements';

interface AchievementStore {
  achievements: Achievement[];
  unlockedAchievements: Set<string>;
  recentUnlocks: Array<{ achievement: Achievement; timestamp: number }>;
  
  checkAchievements: (gameState: any) => void;
  getAchievement: (id: string) => Achievement | undefined;
  clearRecentUnlocks: () => void;
  saveAchievements: () => void;
  loadAchievements: () => void;
}

export const useAchievementStore = create<AchievementStore>((set, get) => ({
  achievements: ACHIEVEMENTS.map(a => ({ ...a })),
  unlockedAchievements: new Set<string>(),
  recentUnlocks: [],
  
  checkAchievements: (gameState) => {
    const { achievements, unlockedAchievements } = get();
    const newUnlocks: Achievement[] = [];
    
    achievements.forEach(achievement => {
      if (!unlockedAchievements.has(achievement.id) && 
          achievement.requirement(gameState)) {
        achievement.unlocked = true;
        unlockedAchievements.add(achievement.id);
        newUnlocks.push(achievement);
      }
    });
    
    if (newUnlocks.length > 0) {
      set((state) => ({
        achievements: [...state.achievements],
        unlockedAchievements: new Set(state.unlockedAchievements),
        recentUnlocks: [
          ...state.recentUnlocks,
          ...newUnlocks.map(a => ({ achievement: a, timestamp: Date.now() }))
        ],
      }));
      
      // Save after unlocking
      get().saveAchievements();
    }
  },
  
  getAchievement: (id) => {
    return get().achievements.find(a => a.id === id);
  },
  
  clearRecentUnlocks: () => {
    set({ recentUnlocks: [] });
  },
  
  saveAchievements: () => {
    const { unlockedAchievements } = get();
    localStorage.setItem('petSoftwareIdler_achievements', 
      JSON.stringify(Array.from(unlockedAchievements))
    );
  },
  
  loadAchievements: () => {
    const saved = localStorage.getItem('petSoftwareIdler_achievements');
    if (saved) {
      try {
        const unlockedIds = JSON.parse(saved) as string[];
        const unlockedSet = new Set(unlockedIds);
        
        set((state) => ({
          unlockedAchievements: unlockedSet,
          achievements: state.achievements.map(a => ({
            ...a,
            unlocked: unlockedSet.has(a.id),
          })),
        }));
      } catch (error) {
        console.error('Failed to load achievements:', error);
      }
    }
  },
}));
```

Create `src/components/ui/AchievementPopup.tsx`:
```typescript
import React, { useEffect } from 'react';
import { useAchievementStore } from '../../store/achievementStore';
import './AchievementPopup.css';

const AchievementPopup: React.FC = () => {
  const recentUnlocks = useAchievementStore((state) => state.recentUnlocks);
  const clearRecentUnlocks = useAchievementStore((state) => state.clearRecentUnlocks);
  
  useEffect(() => {
    if (recentUnlocks.length > 0) {
      // Clear old unlocks after animation
      const timer = setTimeout(() => {
        clearRecentUnlocks();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [recentUnlocks, clearRecentUnlocks]);
  
  return (
    <div className="achievement-popup-container">
      {recentUnlocks.map((unlock, index) => (
        <div
          key={`${unlock.achievement.id}-${unlock.timestamp}`}
          className="achievement-popup"
          style={{
            animationDelay: `${index * 0.2}s`,
          }}
        >
          <div className="achievement-icon">🏆</div>
          <div className="achievement-content">
            <h4>Achievement Unlocked!</h4>
            <p className="achievement-name">{unlock.achievement.name}</p>
            <p className="achievement-desc">{unlock.achievement.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AchievementPopup;
```

Create `src/components/ui/AchievementPopup.css`:
```css
.achievement-popup-container {
  position: fixed;
  top: 5rem;
  right: 1rem;
  z-index: 200;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.achievement-popup {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #1a1a1a;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(255, 215, 0, 0.5);
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 300px;
  animation: achievementSlideIn 0.5s ease forwards,
             achievementSlideOut 0.5s ease 4s forwards;
}

@keyframes achievementSlideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes achievementSlideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(400px);
    opacity: 0;
  }
}

.achievement-icon {
  font-size: 2.5rem;
  animation: achievementBounce 1s ease infinite;
}

@keyframes achievementBounce {
  0%, 100% {
    transform: scale(1) rotate(-5deg);
  }
  50% {
    transform: scale(1.1) rotate(5deg);
  }
}

.achievement-content h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  color: #666;
}

.achievement-name {
  margin: 0 0 0.25rem 0;
  font-size: 1.2rem;
  font-weight: bold;
}

.achievement-desc {
  margin: 0;
  font-size: 0.9rem;
  color: #444;
}
```

**Update** `src/components/game/Game.tsx` to check achievements:
```typescript
// Add imports
import { useAchievementStore } from '../../store/achievementStore';
import AchievementPopup from '../ui/AchievementPopup';

// Inside the component, add achievement checking
const checkAchievements = useAchievementStore((state) => state.checkAchievements);
const loadAchievements = useAchievementStore((state) => state.loadAchievements);

// Add to the game loop
useEffect(() => {
  let animationId: number;
  let achievementCheckTimer: NodeJS.Timeout;
  
  const gameLoop = () => {
    const currentTime = Date.now();
    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;
    
    const cappedDelta = Math.min(deltaTime, 1000 / 30);
    tick(cappedDelta);
    
    animationId = requestAnimationFrame(gameLoop);
  };
  
  // Check achievements every second
  achievementCheckTimer = setInterval(() => {
    const gameState = useGameStore.getState();
    checkAchievements(gameState);
  }, 1000);
  
  animationId = requestAnimationFrame(gameLoop);
  
  return () => {
    cancelAnimationFrame(animationId);
    clearInterval(achievementCheckTimer);
  };
}, [tick, checkAchievements]);

// Load achievements on mount
useEffect(() => {
  loadAchievements();
}, [loadAchievements]);

// Add to render
return (
  <div className="game-container">
    <SaveIndicator />
    <AchievementPopup />
    {/* ... rest of the component ... */}
  </div>
);
```

**Testing Requirements:**
- Test achievement unlock conditions
- Verify popup animations work
- Test achievement persistence
- Check multiple achievements at once
- Verify no duplicate unlocks

**Acceptance Criteria:**
- [ ] 10 achievements implemented
- [ ] Popup shows on unlock
- [ ] Achievements persist through save/load
- [ ] Multiple achievements can unlock at once
- [ ] No performance impact from checking

---

### TECH-013: Implement Basic Audio System
**Parent Story:** Story 12 - Audio Feedback
**Estimated Time:** 3-4 hours
**Priority:** Low
**Dependencies:** TECH-012

**Implementation Details:**

Create `src/utils/audio.ts`:
```typescript
interface Sound {
  audio: HTMLAudioElement;
  lastPlayed: number;
  minInterval: number;
}

class AudioManager {
  private sounds: Map<string, Sound> = new Map();
  private masterVolume: number = 0.5;
  private isMuted: boolean = false;
  
  constructor() {
    this.loadSounds();
    this.loadSettings();
  }
  
  private loadSounds() {
    // Define sound configurations
    const soundConfigs = [
      { id: 'click', url: '/sounds/click.wav', minInterval: 100 },
      { id: 'money', url: '/sounds/money.wav', minInterval: 200 },
      { id: 'buy', url: '/sounds/buy.wav', minInterval: 300 },
      { id: 'achievement', url: '/sounds/achievement.wav', minInterval: 1000 },
    ];
    
    soundConfigs.forEach(config => {
      const audio = new Audio(config.url);
      audio.volume = this.masterVolume;
      
      this.sounds.set(config.id, {
        audio,
        lastPlayed: 0,
        minInterval: config.minInterval,
      });
    });
  }
  
  private loadSettings() {
    const savedVolume = localStorage.getItem('petSoftwareIdler_volume');
    const savedMuted = localStorage.getItem('petSoftwareIdler_muted');
    
    if (savedVolume) {
      this.masterVolume = parseFloat(savedVolume);
    }
    
    if (savedMuted) {
      this.isMuted = savedMuted === 'true';
    }
  }
  
  play(soundId: string, volumeMultiplier: number = 1) {
    if (this.isMuted) return;
    
    const sound = this.sounds.get(soundId);
    if (!sound) return;
    
    const now = Date.now();
    if (now - sound.lastPlayed < sound.minInterval) return;
    
    sound.lastPlayed = now;
    
    // Clone and play the audio to allow overlapping sounds
    const audio = sound.audio.cloneNode() as HTMLAudioElement;
    audio.volume = this.masterVolume * volumeMultiplier;
    
    audio.play().catch(error => {
      console.warn('Failed to play sound:', error);
    });
  }
  
  setVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('petSoftwareIdler_volume', this.masterVolume.toString());
    
    // Update all sound volumes
    this.sounds.forEach(sound => {
      sound.audio.volume = this.masterVolume;
    });
  }
  
  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('petSoftwareIdler_muted', this.isMuted.toString());
  }
  
  getVolume() {
    return this.masterVolume;
  }
  
  isMutedStatus() {
    return this.isMuted;
  }
}

export const audioManager = new AudioManager();
```

Create `src/components/ui/AudioControls.tsx`:
```typescript
import React, { useState } from 'react';
import { audioManager } from '../../utils/audio';
import './AudioControls.css';

const AudioControls: React.FC = () => {
  const [volume, setVolume] = useState(audioManager.getVolume());
  const [isMuted, setIsMuted] = useState(audioManager.isMutedStatus());
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioManager.setVolume(newVolume);
  };
  
  const handleMuteToggle = () => {
    audioManager.toggleMute();
    setIsMuted(!isMuted);
  };
  
  return (
    <div className="audio-controls">
      <button
        className="mute-button"
        onClick={handleMuteToggle}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>
      
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={volume}
        onChange={handleVolumeChange}
        className="volume-slider"
        disabled={isMuted}
      />
      
      <span className="volume-label">
        {Math.round(volume * 100)}%
      </span>
    </div>
  );
};

export default AudioControls;
```

Create `src/components/ui/AudioControls.css`:
```css
.audio-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background-color: #1a1a1a;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
}

.mute-button {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s ease;
}

.mute-button:hover {
  transform: scale(1.1);
}

.mute-button:active {
  transform: scale(0.95);
}

.volume-slider {
  width: 100px;
  height: 4px;
  background: #3a3a3a;
  outline: none;
  border-radius: 2px;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  background: #00ff00;
  border-radius: 50%;
  cursor: pointer;
}

.volume-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  background: #00ff00;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.volume-slider:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.volume-label {
  font-size: 0.8rem;
  color: #aaaaaa;
  min-width: 35px;
  text-align: right;
}
```

**Create placeholder sound files** in `public/sounds/`:
- `click.wav` - Short click sound
- `money.wav` - Cash register sound
- `buy.wav` - Purchase confirmation sound
- `achievement.wav` - Achievement unlock sound

For testing, you can use these free sound resources or create simple tones.

**Update components to play sounds:**

In `src/components/ui/CodeButton.tsx`:
```typescript
import { audioManager } from '../../utils/audio';

// In handleClick function:
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  clickWriteCode();
  triggerAnimation();
  audioManager.play('click');
  
  // ... rest of the function
};
```

In `src/components/ui/ShipFeatureButton.tsx`:
```typescript
import { audioManager } from '../../utils/audio';

// In handleClick function:
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  if (canShipFeature()) {
    shipFeature();
    triggerAnimation();
    audioManager.play('money');
    
    // ... rest of the function
  }
};
```

**Testing Requirements:**
- Test sound playback on actions
- Verify volume control works
- Test mute functionality
- Check minimum interval prevents spam
- Verify settings persistence

**Acceptance Criteria:**
- [ ] Sounds play on click, purchase, money
- [ ] Volume control from 0-100%
- [ ] Mute button works
- [ ] No sound spam (rate limiting)
- [ ] Settings save to localStorage

---

### TECH-014: Performance Optimization
**Parent Story:** Story 15 - Performance Optimization
**Estimated Time:** 3-4 hours
**Priority:** High
**Dependencies:** TECH-013

**Implementation Details:**

Create `src/utils/performance.ts`:
```typescript
export class PerformanceMonitor {
  private frameCount: number = 0;
  private lastTime: number = performance.now();
  private fps: number = 0;
  
  updateFPS() {
    this.frameCount++;
    const currentTime = performance.now();
    
    if (currentTime >= this.lastTime + 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
    
    return this.fps;
  }
  
  getFPS() {
    return this.fps;
  }
}

// Memoization helper for expensive calculations
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  getCacheKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = getCacheKey ? getCacheKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    // Limit cache size
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  }) as T;
}

// Debounce helper for frequent updates
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Throttle helper for rate limiting
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): T {
  let inThrottle: boolean = false;
  let lastResult: ReturnType<T>;
  
  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      inThrottle = true;
      lastResult = fn(...args);
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
    
    return lastResult;
  }) as T;
}
```

Create `src/components/ui/PerformanceDisplay.tsx` (for development):
```typescript
import React, { useEffect, useState } from 'react';
import { PerformanceMonitor } from '../../utils/performance';
import './PerformanceDisplay.css';

const performanceMonitor = new PerformanceMonitor();

const PerformanceDisplay: React.FC = () => {
  const [fps, setFPS] = useState(0);
  const [showPerf, setShowPerf] = useState(false);
  
  useEffect(() => {
    // Check if in development mode
    const isDev = process.env.NODE_ENV === 'development';
    setShowPerf(isDev);
    
    if (!isDev) return;
    
    let animationId: number;
    
    const updatePerformance = () => {
      const currentFPS = performanceMonitor.updateFPS();
      setFPS(currentFPS);
      animationId = requestAnimationFrame(updatePerformance);
    };
    
    animationId = requestAnimationFrame(updatePerformance);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);
  
  if (!showPerf) return null;
  
  const fpsColor = fps >= 55 ? '#00ff00' : fps >= 30 ? '#ffff00' : '#ff0000';
  
  return (
    <div className="performance-display">
      <span style={{ color: fpsColor }}>FPS: {fps}</span>
    </div>
  );
};

export default PerformanceDisplay;
```

**Optimize number formatting with memoization:**
Update `src/utils/formatting.ts`:
```typescript
import { memoize } from './performance';

export const formatNumber = memoize((num: number): string => {
  if (num < 1000) {
    return Math.floor(num).toString();
  } else if (num < 1000000) {
    return (num / 1000).toFixed(1) + 'K';
  } else if (num < 1000000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num < 1000000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  } else {
    return (num / 1000000000000).toFixed(1) + 'T';
  }
});

export const formatRate = memoize((rate: number): string => {
  if (rate === 0) return '0';
  if (rate < 0.1) {
    return rate.toFixed(3);
  } else if (rate < 1) {
    return rate.toFixed(2);
  } else if (rate < 10) {
    return rate.toFixed(1);
  } else {
    return formatNumber(rate);
  }
});

export const formatMoney = memoize((amount: number): string => {
  return '$' + formatNumber(amount);
});
```

**Optimize React components with React.memo:**
Update `src/components/ui/ResourceItem.tsx` (extract from ResourceDisplay):
```typescript
import React from 'react';

interface ResourceItemProps {
  label: string;
  value: string;
  rate?: string;
  icon?: string;
}

export const ResourceItem = React.memo<ResourceItemProps>(({ 
  label, 
  value, 
  rate, 
  icon 
}) => {
  return (
    <div className="resource-item">
      <div className="resource-header">
        {icon && <span className="resource-icon">{icon}</span>}
        <span className="resource-label">{label}</span>
      </div>
      <div className="resource-value">
        <span className="value">{value}</span>
        {rate && <span className="rate">(+{rate}/s)</span>}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return prevProps.value === nextProps.value && 
         prevProps.rate === nextProps.rate;
});
```

**Optimize game loop with RAF scheduling:**
Update `src/components/game/Game.tsx`:
```typescript
// Optimize game loop to skip frames when tab is not visible
useEffect(() => {
  let animationId: number;
  let lastFrameTime = performance.now();
  
  const gameLoop = (currentTime: number) => {
    // Skip if tab is not visible
    if (document.hidden) {
      animationId = requestAnimationFrame(gameLoop);
      return;
    }
    
    const deltaTime = currentTime - lastFrameTime;
    
    // Skip frame if running too fast (> 120 FPS)
    if (deltaTime < 8.33) {
      animationId = requestAnimationFrame(gameLoop);
      return;
    }
    
    lastFrameTime = currentTime;
    
    // Cap delta time to prevent huge jumps
    const cappedDelta = Math.min(deltaTime, 1000 / 30);
    tick(cappedDelta);
    
    animationId = requestAnimationFrame(gameLoop);
  };
  
  animationId = requestAnimationFrame(gameLoop);
  
  return () => {
    cancelAnimationFrame(animationId);
  };
}, [tick]);
```

**Testing Requirements:**
- Test FPS stays above 55 on average hardware
- Verify no memory leaks over 1 hour
- Test with many units (100+)
- Check performance with large numbers
- Verify optimizations don't break functionality

**Acceptance Criteria:**
- [ ] Maintains 60 FPS on 5-year-old devices
- [ ] No memory leaks in 1-hour session
- [ ] Number formatting is performant
- [ ] Smooth animations with many units
- [ ] Game loop optimized for performance

---

## Implementation Order Summary

**Phase 1 - Core Foundation (Days 1-2)**
1. TECH-001: Project Setup
2. TECH-002: Types and Constants
3. TECH-003: Game Store
4. TECH-004: Main Game Layout

**Phase 2 - Basic Gameplay (Days 3-4)**
5. TECH-005: Resource Display
6. TECH-006: Code Writing Button
7. TECH-007: Ship Feature Button
8. TECH-008: Units Panel

**Phase 3 - Advanced Features (Days 5-6)**
9. TECH-009: Lead Conversion
10. TECH-010: Save System
11. TECH-011: Stats Panel
12. TECH-012: Achievements

**Phase 4 - Polish (Day 7)**
13. TECH-013: Audio System
14. TECH-014: Performance Optimization

## Testing Strategy

### Unit Tests
- Store actions and calculations
- Utility functions (formatting, performance)
- Achievement requirements
- Save/load functionality

### Integration Tests
- Game loop and tick updates
- Resource production chains
- Department interactions
- Achievement unlocking

### Performance Tests
- FPS monitoring
- Memory usage over time
- Large number handling
- Many units performance

### User Acceptance Tests
- Core loop understood in 5 minutes
- Can reach $10K in 10 minutes active play
- All features discoverable
- Smooth performance throughout

## Deployment Checklist

- [ ] Remove development performance display
- [ ] Minify and optimize bundle
- [ ] Add proper error boundaries
- [ ] Test on multiple browsers
- [ ] Add analytics (optional)
- [ ] Create production build
- [ ] Test offline functionality
- [ ] Verify all assets load correctly