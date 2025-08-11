# Phase 3: Department Integration

**Duration**: 8-10 days  
**Status**: Not Started  
**Prerequisites**: Phase 2 (Core Features) completed

## Objectives

1. Implement all 7 departments (Sales, Customer Experience, Product, Design, QA, Marketing)
2. Create comprehensive employee management system with 28 unit types
3. Implement department synergies and cross-department bonuses
4. Build prestige system foundation with investor points
5. Create achievement system with milestone rewards
6. Add department unlock progression and upgrade systems

## Tasks Overview

### Day 1-2: Department Architecture
- [ ] Expand department models for all 7 types
- [ ] Create unit configurations for all 28 employee types
- [ ] Implement department unlock system
- [ ] Add department-specific production calculations

### Day 3-4: Sales & Customer Experience
- [ ] Implement Sales department (Sales Rep, Account Manager, Sales Director, VP Sales)
- [ ] Implement Customer Experience department (Support Agent, CX Specialist, CX Manager, CX Director)
- [ ] Add department-specific bonuses and mechanics
- [ ] Create department interaction systems

### Day 5-6: Product, Design & QA Departments
- [ ] Implement Product department (Product Analyst, Product Manager, Senior PM, CPO)
- [ ] Implement Design department (UI Designer, UX Designer, Design Lead, Creative Director)  
- [ ] Implement QA department (QA Tester, QA Engineer, QA Lead, QA Director)
- [ ] Add visual differentiation and department themes

### Day 7: Marketing Department & Synergies
- [ ] Implement Marketing department (Content Writer, Marketing Manager, Growth Hacker, CMO)
- [ ] Create department synergy system
- [ ] Implement cross-department multipliers
- [ ] Add synergy visualization

### Day 8-9: Prestige System
- [ ] Implement prestige mechanics and investor points calculation
- [ ] Create prestige upgrades and bonuses
- [ ] Add prestige reset functionality
- [ ] Implement prestige progress tracking

### Day 10: Achievement System
- [ ] Create achievement framework
- [ ] Implement milestone achievements
- [ ] Add achievement notifications and rewards
- [ ] Create achievement progress tracking

## Detailed Implementation

### Step 1: Expanded Department Architecture

#### 1.1 Update Department Types and Configurations
**File**: `src/core/state/gameStore.ts` (Major expansion)

```typescript
export type DepartmentType = 
  | 'development' 
  | 'sales' 
  | 'customerExperience' 
  | 'product' 
  | 'design' 
  | 'qa' 
  | 'marketing';

export type UnitType = 
  // Development (existing)
  | 'juniorDev' | 'midDev' | 'seniorDev' | 'techLead'
  // Sales
  | 'salesRep' | 'accountManager' | 'salesDirector' | 'vpSales'
  // Customer Experience
  | 'supportAgent' | 'cxSpecialist' | 'cxManager' | 'cxDirector'
  // Product
  | 'productAnalyst' | 'productManager' | 'seniorPM' | 'cpo'
  // Design
  | 'uiDesigner' | 'uxDesigner' | 'designLead' | 'creativeDirector'
  // QA
  | 'qaTester' | 'qaEngineer' | 'qaLead' | 'qaDirector'
  // Marketing
  | 'contentWriter' | 'marketingManager' | 'growthHacker' | 'cmo';

export const DEPARTMENT_CONFIG: Record<DepartmentType, {
  name: string;
  emoji: string;
  description: string;
  unlockCost: BigNumber;
  baseMultiplier: number;
  color: string;
}> = {
  development: {
    name: 'Development Team',
    emoji: '💻',
    description: 'Build and maintain your software products',
    unlockCost: new BigNumber(0),
    baseMultiplier: 1,
    color: '#007AFF',
  },
  sales: {
    name: 'Sales Department',
    emoji: '💼',
    description: 'Generate revenue through customer acquisition',
    unlockCost: new BigNumber(100),
    baseMultiplier: 1.2,
    color: '#34C759',
  },
  customerExperience: {
    name: 'Customer Experience',
    emoji: '🎧',
    description: 'Keep customers happy and reduce churn',
    unlockCost: new BigNumber(500),
    baseMultiplier: 0.8,
    color: '#FF9500',
  },
  product: {
    name: 'Product Management',
    emoji: '📊',
    description: 'Define product strategy and roadmap',
    unlockCost: new BigNumber(1000),
    baseMultiplier: 1.5,
    color: '#AF52DE',
  },
  design: {
    name: 'Design Team',
    emoji: '🎨',
    description: 'Create beautiful and intuitive user experiences',
    unlockCost: new BigNumber(2000),
    baseMultiplier: 1.1,
    color: '#FF2D92',
  },
  qa: {
    name: 'Quality Assurance',
    emoji: '🧪',
    description: 'Ensure product quality and reliability',
    unlockCost: new BigNumber(5000),
    baseMultiplier: 0.9,
    color: '#5856D6',
  },
  marketing: {
    name: 'Marketing Department',
    emoji: '📢',
    description: 'Drive awareness and customer acquisition',
    unlockCost: new BigNumber(10000),
    baseMultiplier: 2.0,
    color: '#FF3B30',
  },
};

export const UNIT_CONFIG: Record<UnitType, {
  name: string;
  baseCost: BigNumber;
  baseProduction: BigNumber;
  costMultiplier: number;
  emoji: string;
  department: DepartmentType;
}> = {
  // Development (existing)
  juniorDev: {
    name: 'Junior Developer',
    baseCost: new BigNumber(10),
    baseProduction: new BigNumber(1),
    costMultiplier: 1.15,
    emoji: '👨‍💻',
    department: 'development',
  },
  midDev: {
    name: 'Mid-Level Developer',
    baseCost: new BigNumber(100),
    baseProduction: new BigNumber(10),
    costMultiplier: 1.15,
    emoji: '👩‍💻',
    department: 'development',
  },
  seniorDev: {
    name: 'Senior Developer',
    baseCost: new BigNumber(1000),
    baseProduction: new BigNumber(100),
    costMultiplier: 1.15,
    emoji: '🧑‍💼',
    department: 'development',
  },
  techLead: {
    name: 'Tech Lead',
    baseCost: new BigNumber(10000),
    baseProduction: new BigNumber(1000),
    costMultiplier: 1.15,
    emoji: '👨‍🚀',
    department: 'development',
  },
  
  // Sales Department
  salesRep: {
    name: 'Sales Representative',
    baseCost: new BigNumber(50),
    baseProduction: new BigNumber(5),
    costMultiplier: 1.15,
    emoji: '👔',
    department: 'sales',
  },
  accountManager: {
    name: 'Account Manager',
    baseCost: new BigNumber(500),
    baseProduction: new BigNumber(50),
    costMultiplier: 1.15,
    emoji: '🤝',
    department: 'sales',
  },
  salesDirector: {
    name: 'Sales Director',
    baseCost: new BigNumber(5000),
    baseProduction: new BigNumber(500),
    costMultiplier: 1.15,
    emoji: '📈',
    department: 'sales',
  },
  vpSales: {
    name: 'VP of Sales',
    baseCost: new BigNumber(50000),
    baseProduction: new BigNumber(5000),
    costMultiplier: 1.15,
    emoji: '💼',
    department: 'sales',
  },
  
  // Customer Experience Department
  supportAgent: {
    name: 'Support Agent',
    baseCost: new BigNumber(25),
    baseProduction: new BigNumber(2),
    costMultiplier: 1.15,
    emoji: '🎧',
    department: 'customerExperience',
  },
  cxSpecialist: {
    name: 'CX Specialist',
    baseCost: new BigNumber(250),
    baseProduction: new BigNumber(20),
    costMultiplier: 1.15,
    emoji: '💬',
    department: 'customerExperience',
  },
  cxManager: {
    name: 'CX Manager',
    baseCost: new BigNumber(2500),
    baseProduction: new BigNumber(200),
    costMultiplier: 1.15,
    emoji: '📞',
    department: 'customerExperience',
  },
  cxDirector: {
    name: 'CX Director',
    baseCost: new BigNumber(25000),
    baseProduction: new BigNumber(2000),
    costMultiplier: 1.15,
    emoji: '🌟',
    department: 'customerExperience',
  },
  
  // Product Management Department
  productAnalyst: {
    name: 'Product Analyst',
    baseCost: new BigNumber(75),
    baseProduction: new BigNumber(7),
    costMultiplier: 1.15,
    emoji: '📊',
    department: 'product',
  },
  productManager: {
    name: 'Product Manager',
    baseCost: new BigNumber(750),
    baseProduction: new BigNumber(75),
    costMultiplier: 1.15,
    emoji: '🎯',
    department: 'product',
  },
  seniorPM: {
    name: 'Senior PM',
    baseCost: new BigNumber(7500),
    baseProduction: new BigNumber(750),
    costMultiplier: 1.15,
    emoji: '🚀',
    department: 'product',
  },
  cpo: {
    name: 'Chief Product Officer',
    baseCost: new BigNumber(75000),
    baseProduction: new BigNumber(7500),
    costMultiplier: 1.15,
    emoji: '👨‍💼',
    department: 'product',
  },
  
  // Design Department
  uiDesigner: {
    name: 'UI Designer',
    baseCost: new BigNumber(60),
    baseProduction: new BigNumber(6),
    costMultiplier: 1.15,
    emoji: '🎨',
    department: 'design',
  },
  uxDesigner: {
    name: 'UX Designer',
    baseCost: new BigNumber(600),
    baseProduction: new BigNumber(60),
    costMultiplier: 1.15,
    emoji: '✨',
    department: 'design',
  },
  designLead: {
    name: 'Design Lead',
    baseCost: new BigNumber(6000),
    baseProduction: new BigNumber(600),
    costMultiplier: 1.15,
    emoji: '🏆',
    department: 'design',
  },
  creativeDirector: {
    name: 'Creative Director',
    baseCost: new BigNumber(60000),
    baseProduction: new BigNumber(6000),
    costMultiplier: 1.15,
    emoji: '🎭',
    department: 'design',
  },
  
  // QA Department
  qaTester: {
    name: 'QA Tester',
    baseCost: new BigNumber(40),
    baseProduction: new BigNumber(4),
    costMultiplier: 1.15,
    emoji: '🧪',
    department: 'qa',
  },
  qaEngineer: {
    name: 'QA Engineer',
    baseCost: new BigNumber(400),
    baseProduction: new BigNumber(40),
    costMultiplier: 1.15,
    emoji: '⚙️',
    department: 'qa',
  },
  qaLead: {
    name: 'QA Lead',
    baseCost: new BigNumber(4000),
    baseProduction: new BigNumber(400),
    costMultiplier: 1.15,
    emoji: '🔍',
    department: 'qa',
  },
  qaDirector: {
    name: 'QA Director',
    baseCost: new BigNumber(40000),
    baseProduction: new BigNumber(4000),
    costMultiplier: 1.15,
    emoji: '🛡️',
    department: 'qa',
  },
  
  // Marketing Department
  contentWriter: {
    name: 'Content Writer',
    baseCost: new BigNumber(80),
    baseProduction: new BigNumber(8),
    costMultiplier: 1.15,
    emoji: '✍️',
    department: 'marketing',
  },
  marketingManager: {
    name: 'Marketing Manager',
    baseCost: new BigNumber(800),
    baseProduction: new BigNumber(80),
    costMultiplier: 1.15,
    emoji: '📢',
    department: 'marketing',
  },
  growthHacker: {
    name: 'Growth Hacker',
    baseCost: new BigNumber(8000),
    baseProduction: new BigNumber(800),
    costMultiplier: 1.15,
    emoji: '🚀',
    department: 'marketing',
  },
  cmo: {
    name: 'Chief Marketing Officer',
    baseCost: new BigNumber(80000),
    baseProduction: new BigNumber(8000),
    costMultiplier: 1.15,
    emoji: '👩‍💼',
    department: 'marketing',
  },
};
```

#### 1.2 Add Department Unlock System to Game Store
```typescript
// Add to GameState interface
export interface GameState {
  // ... existing properties
  unlockedDepartments: DepartmentType[];
  departmentSynergies: SynergyBonus[];
}

export interface SynergyBonus {
  id: string;
  name: string;
  description: string;
  departments: DepartmentType[];
  multiplier: number;
  isActive: boolean;
}

// Add to store actions
unlockDepartment: (departmentType: DepartmentType) => set(state => {
  const config = DEPARTMENT_CONFIG[departmentType];
  
  if (state.money.greaterThan(config.unlockCost) && 
      !state.unlockedDepartments.includes(departmentType)) {
    
    // Deduct unlock cost
    state.money = state.money.subtract(config.unlockCost);
    
    // Unlock department
    state.unlockedDepartments.push(departmentType);
    
    // Create department instance
    const units: Unit[] = Object.entries(UNIT_CONFIG)
      .filter(([_, unitConfig]) => unitConfig.department === departmentType)
      .map(([type, unitConfig]) => ({
        id: type,
        type: type as UnitType,
        count: 0,
        baseCost: unitConfig.baseCost,
        currentCost: unitConfig.baseCost,
        baseProduction: unitConfig.baseProduction,
      }));
    
    const newDepartment: Department = {
      id: departmentType,
      name: config.name,
      type: departmentType,
      units,
      production: {
        baseRate: new BigNumber(0),
        multiplier: config.baseMultiplier,
        currentRate: new BigNumber(0),
      },
    };
    
    state.departments.push(newDepartment);
  }
}),

hireEmployee: (departmentType: DepartmentType, unitType: UnitType) => set(state => {
  const department = state.departments.find(d => d.type === departmentType);
  if (!department) return;
  
  const unit = department.units.find(u => u.type === unitType);
  if (!unit) return;
  
  if (state.money.greaterThan(unit.currentCost)) {
    // Deduct money
    state.money = state.money.subtract(unit.currentCost);
    
    // Add unit
    unit.count += 1;
    
    // Increase cost for next purchase
    const config = UNIT_CONFIG[unitType];
    unit.currentCost = unit.currentCost.multiply(config.costMultiplier);
    
    // Recalculate department production with synergies
    const totalProduction = department.units.reduce((total, u) => 
      total.add(u.baseProduction.multiply(u.count)), new BigNumber(0)
    );
    
    const synergyMultiplier = state.calculateSynergyMultiplier(department.type);
    department.production.currentRate = totalProduction
      .multiply(department.production.multiplier)
      .multiply(synergyMultiplier);
  }
}),

calculateSynergyMultiplier: (departmentType: DepartmentType) => get => {
  const state = get();
  let multiplier = 1;
  
  // Example synergy: Development + QA = 1.2x multiplier
  if (departmentType === 'development' && 
      state.departments.find(d => d.type === 'qa')?.units.some(u => u.count > 0)) {
    multiplier *= 1.2;
  }
  
  // Sales + Marketing synergy
  if ((departmentType === 'sales' || departmentType === 'marketing') &&
      state.departments.find(d => d.type === 'sales')?.units.some(u => u.count > 0) &&
      state.departments.find(d => d.type === 'marketing')?.units.some(u => u.count > 0)) {
    multiplier *= 1.3;
  }
  
  // Product + Design synergy
  if ((departmentType === 'product' || departmentType === 'design') &&
      state.departments.find(d => d.type === 'product')?.units.some(u => u.count > 0) &&
      state.departments.find(d => d.type === 'design')?.units.some(u => u.count > 0)) {
    multiplier *= 1.25;
  }
  
  return multiplier;
},
```

### Step 2: Department Unlock UI

#### 2.1 Create Department Unlock Component
**File**: `src/features/departments/components/DepartmentUnlock.tsx`

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DepartmentType, DEPARTMENT_CONFIG, useGameStore } from '../../../core/state/gameStore';
import { BaseButton } from '../../../shared/components/BaseButton';
import { MoneyDisplay } from '../../../shared/components/MoneyDisplay';

interface DepartmentUnlockProps {
  departmentType: DepartmentType;
}

export function DepartmentUnlock({ departmentType }: DepartmentUnlockProps) {
  const { money, unlockDepartment, unlockedDepartments } = useGameStore();
  const config = DEPARTMENT_CONFIG[departmentType];
  
  const isUnlocked = unlockedDepartments.includes(departmentType);
  const canAfford = money.greaterThan(config.unlockCost);
  
  if (isUnlocked) {
    return null; // Don't show unlock card for unlocked departments
  }
  
  const handleUnlock = () => {
    unlockDepartment(departmentType);
  };
  
  return (
    <View style={[styles.container, { borderColor: config.color }]}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{config.emoji}</Text>
        <View style={styles.info}>
          <Text style={styles.name}>{config.name}</Text>
          <Text style={styles.description}>{config.description}</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <View style={styles.costContainer}>
          <Text style={styles.unlockLabel}>Unlock Cost:</Text>
          <MoneyDisplay amount={config.unlockCost} size="small" animated={false} />
        </View>
        <BaseButton
          title="Unlock"
          onPress={handleUnlock}
          disabled={!canAfford}
          variant={canAfford ? 'primary' : 'secondary'}
          size="medium"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 32,
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costContainer: {
    flex: 1,
  },
  unlockLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
});
```

### Step 3: Prestige System Implementation

#### 3.1 Add Prestige to Game State
**File**: `src/core/state/gameStore.ts` (Add to existing)

```typescript
export interface PrestigeState {
  investorPoints: BigNumber;
  level: number;
  totalPrestigeCount: number;
  availableUpgrades: PrestigeUpgrade[];
  purchasedUpgrades: string[];
}

export interface PrestigeUpgrade {
  id: string;
  name: string;
  description: string;
  cost: BigNumber;
  effect: PrestigeEffect;
}

export interface PrestigeEffect {
  type: 'multiplier' | 'startingMoney' | 'clickPower';
  value: number;
  target?: DepartmentType;
}

export const PRESTIGE_UPGRADES: PrestigeUpgrade[] = [
  {
    id: 'click_power_1',
    name: 'Better Clicking',
    description: 'Increase click value by 2x',
    cost: new BigNumber(1),
    effect: { type: 'clickPower', value: 2 },
  },
  {
    id: 'starting_money_1',
    name: 'Angel Investment',
    description: 'Start each prestige with $1000',
    cost: new BigNumber(2),
    effect: { type: 'startingMoney', value: 1000 },
  },
  {
    id: 'dev_multiplier_1',
    name: 'Development Boost',
    description: 'Development department generates 2x more revenue',
    cost: new BigNumber(3),
    effect: { type: 'multiplier', value: 2, target: 'development' },
  },
  {
    id: 'all_multiplier_1',
    name: 'Company Growth',
    description: 'All departments generate 1.5x more revenue',
    cost: new BigNumber(5),
    effect: { type: 'multiplier', value: 1.5 },
  },
];

// Add to GameState
export interface GameState {
  // ... existing properties
  prestige: PrestigeState;
}

// Add to store actions
calculateInvestorPoints: () => get => {
  const state = get();
  const totalEarned = state.statistics.totalEarned;
  
  // Formula: log10(totalEarned) - 6 (minimum $1M for 1 investor point)
  const logValue = Math.log10(totalEarned.getValue() * Math.pow(10, totalEarned.getExponent()));
  const investorPoints = Math.max(0, Math.floor(logValue - 6));
  
  return new BigNumber(investorPoints);
},

canPrestige: () => get => {
  const availablePoints = get().calculateInvestorPoints();
  return availablePoints.greaterThan(new BigNumber(0));
},

performPrestige: () => set(state => {
  const investorPoints = state.calculateInvestorPoints();
  
  if (investorPoints.greaterThan(new BigNumber(0))) {
    // Add investor points
    state.prestige.investorPoints = state.prestige.investorPoints.add(investorPoints);
    state.prestige.level += 1;
    state.prestige.totalPrestigeCount += 1;
    
    // Calculate starting money with upgrades
    let startingMoney = new BigNumber(100); // Base starting money
    for (const upgradeId of state.prestige.purchasedUpgrades) {
      const upgrade = PRESTIGE_UPGRADES.find(u => u.id === upgradeId);
      if (upgrade?.effect.type === 'startingMoney') {
        startingMoney = startingMoney.add(new BigNumber(upgrade.effect.value));
      }
    }
    
    // Reset game state
    state.money = startingMoney;
    state.departments = [];
    state.unlockedDepartments = ['development']; // Always start with development
    state.statistics.totalClicks = 0;
    state.statistics.playTime = 0;
    // Keep totalEarned for investor point calculation
    
    // Re-initialize development department
    state.initializeDevelopmentDepartment();
  }
}),

purchasePrestigeUpgrade: (upgradeId: string) => set(state => {
  const upgrade = PRESTIGE_UPGRADES.find(u => u.id === upgradeId);
  if (!upgrade) return;
  
  if (state.prestige.investorPoints.greaterThan(upgrade.cost) &&
      !state.prestige.purchasedUpgrades.includes(upgradeId)) {
    
    // Deduct cost
    state.prestige.investorPoints = state.prestige.investorPoints.subtract(upgrade.cost);
    
    // Add upgrade
    state.prestige.purchasedUpgrades.push(upgradeId);
  }
}),
```

### Step 4: Achievement System

#### 4.1 Create Achievement Framework
**File**: `src/features/achievements/achievementSystem.ts`

```typescript
import { BigNumber } from '../../shared/utils/BigNumber';
import { GameState, DepartmentType } from '../../core/state/gameStore';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: AchievementCategory;
  requirement: AchievementRequirement;
  reward: AchievementReward;
  isUnlocked: boolean;
  progress: number;
  maxProgress: number;
}

export type AchievementCategory = 'earning' | 'clicking' | 'hiring' | 'departments' | 'prestige';

export interface AchievementRequirement {
  type: 'totalEarned' | 'totalClicks' | 'totalEmployees' | 'departmentCount' | 'prestigeLevel';
  value: BigNumber | number;
  department?: DepartmentType;
}

export interface AchievementReward {
  type: 'money' | 'multiplier' | 'clickPower';
  value: BigNumber | number;
  target?: DepartmentType;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_dollar',
    name: 'First Dollar',
    description: 'Earn your first dollar',
    emoji: '💵',
    category: 'earning',
    requirement: { type: 'totalEarned', value: new BigNumber(1) },
    reward: { type: 'money', value: new BigNumber(10) },
    isUnlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'first_hire',
    name: 'Welcome to the Team',
    description: 'Hire your first employee',
    emoji: '👥',
    category: 'hiring',
    requirement: { type: 'totalEmployees', value: 1 },
    reward: { type: 'money', value: new BigNumber(50) },
    isUnlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'click_master',
    name: 'Click Master',
    description: 'Click 1000 times',
    emoji: '👆',
    category: 'clicking',
    requirement: { type: 'totalClicks', value: 1000 },
    reward: { type: 'clickPower', value: 2 },
    isUnlocked: false,
    progress: 0,
    maxProgress: 1000,
  },
  {
    id: 'millionaire',
    name: 'Millionaire',
    description: 'Earn $1,000,000 total',
    emoji: '💰',
    category: 'earning',
    requirement: { type: 'totalEarned', value: new BigNumber(1000000) },
    reward: { type: 'multiplier', value: 1.1 },
    isUnlocked: false,
    progress: 0,
    maxProgress: 1000000,
  },
  {
    id: 'department_collector',
    name: 'Department Collector',
    description: 'Unlock all 7 departments',
    emoji: '🏢',
    category: 'departments',
    requirement: { type: 'departmentCount', value: 7 },
    reward: { type: 'multiplier', value: 1.25 },
    isUnlocked: false,
    progress: 0,
    maxProgress: 7,
  },
];

export class AchievementChecker {
  static checkAchievements(gameState: GameState, achievements: Achievement[]): Achievement[] {
    return achievements.map(achievement => {
      const progress = this.calculateProgress(achievement, gameState);
      const isUnlocked = progress >= achievement.maxProgress;
      
      return {
        ...achievement,
        progress: Math.min(progress, achievement.maxProgress),
        isUnlocked: isUnlocked || achievement.isUnlocked,
      };
    });
  }
  
  private static calculateProgress(achievement: Achievement, gameState: GameState): number {
    const { requirement } = achievement;
    
    switch (requirement.type) {
      case 'totalEarned':
        const earned = gameState.statistics.totalEarned;
        const target = requirement.value as BigNumber;
        return earned.greaterThan(target) ? achievement.maxProgress : 
               earned.getValue() * Math.pow(10, earned.getExponent() - target.getExponent());
      
      case 'totalClicks':
        return gameState.statistics.totalClicks;
      
      case 'totalEmployees':
        return gameState.departments.reduce((total, dept) => 
          total + dept.units.reduce((sum, unit) => sum + unit.count, 0), 0);
      
      case 'departmentCount':
        return gameState.departments.length;
      
      case 'prestigeLevel':
        return gameState.prestige.level;
      
      default:
        return 0;
    }
  }
}
```

### Step 5: Update Main Game Screen

#### 5.1 Add Department Unlocks and Management
**File**: `app/(tabs)/index.tsx` (Major update)

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useGameStore, DEPARTMENT_CONFIG, DepartmentType } from '../../src/core/state/gameStore';
import { BaseButton } from '../../src/shared/components/BaseButton';
import { MoneyDisplay } from '../../src/shared/components/MoneyDisplay';
import { DepartmentView } from '../../src/features/departments/components/DepartmentView';
import { DepartmentUnlock } from '../../src/features/departments/components/DepartmentUnlock';
import { PrestigePanel } from '../../src/features/prestige/components/PrestigePanel';

const { width } = Dimensions.get('window');

const DEPARTMENT_ORDER: DepartmentType[] = [
  'development',
  'sales', 
  'customerExperience',
  'product',
  'design',
  'qa',
  'marketing',
];

export default function GameScreen() {
  const [showPrestige, setShowPrestige] = useState(false);
  const { 
    money, 
    click, 
    statistics, 
    departments, 
    unlockedDepartments,
    initializeDevelopmentDepartment,
    canPrestige
  } = useGameStore();
  
  React.useEffect(() => {
    // Initialize development department on first render
    if (!unlockedDepartments.includes('development')) {
      initializeDevelopmentDepartment();
    }
  }, []);
  
  const totalProduction = departments.reduce((total, dept) => 
    total.add(dept.production.currentRate), money.constructor(0));
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Stats */}
        <View style={styles.headerStats}>
          <View style={styles.moneySection}>
            <MoneyDisplay amount={money} size="large" />
            <Text style={styles.subtitle}>Company Revenue</Text>
          </View>
          
          {totalProduction.greaterThan(money.constructor(0)) && (
            <View style={styles.productionSection}>
              <MoneyDisplay amount={totalProduction} size="small" />
              <Text style={styles.productionLabel}>per second</Text>
            </View>
          )}
        </View>
        
        {/* Click Button */}
        <View style={styles.clickSection}>
          <BaseButton
            title="💰 Earn Money"
            onPress={click}
            variant="success"
            size="large"
            style={styles.clickButton}
          />
          <Text style={styles.clickStats}>
            Total Clicks: {statistics.totalClicks.toLocaleString()}
          </Text>
        </View>
        
        {/* Prestige Button */}
        {canPrestige() && (
          <View style={styles.prestigeSection}>
            <BaseButton
              title="✨ Prestige Available!"
              onPress={() => setShowPrestige(true)}
              variant="warning"
              size="large"
            />
          </View>
        )}
        
        {/* Departments Section */}
        <View style={styles.departmentsSection}>
          <Text style={styles.sectionTitle}>
            Departments ({departments.length}/7)
          </Text>
          
          {/* Unlocked Departments */}
          {DEPARTMENT_ORDER
            .filter(deptType => unlockedDepartments.includes(deptType))
            .map(deptType => {
              const department = departments.find(d => d.type === deptType);
              return department ? (
                <DepartmentView key={department.id} department={department} />
              ) : null;
            })
          }
          
          {/* Department Unlocks */}
          {DEPARTMENT_ORDER
            .filter(deptType => !unlockedDepartments.includes(deptType))
            .map(deptType => (
              <DepartmentUnlock key={deptType} departmentType={deptType} />
            ))
          }
        </View>
        
        {/* Stats Footer */}
        <View style={styles.statsFooter}>
          <Text style={styles.statItem}>
            Total Earned: ${statistics.totalEarned.toString()}
          </Text>
          <Text style={styles.statItem}>
            Play Time: {Math.floor(statistics.playTime / 60000)}m
          </Text>
        </View>
      </ScrollView>
      
      {/* Prestige Modal */}
      {showPrestige && (
        <PrestigePanel onClose={() => setShowPrestige(false)} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  headerStats: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  moneySection: {
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 8,
  },
  productionSection: {
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  productionLabel: {
    fontSize: 12,
    color: '#34C759',
    marginTop: 4,
  },
  clickSection: {
    alignItems: 'center',
    paddingVertical: 24,
    marginHorizontal: 16,
  },
  clickButton: {
    width: width * 0.6,
    minHeight: 60,
    borderRadius: 30,
  },
  clickStats: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 12,
  },
  prestigeSection: {
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  departmentsSection: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 16,
  },
  statsFooter: {
    marginHorizontal: 16,
    marginVertical: 24,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  statItem: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
});
```

## Testing & Validation

### Phase 3 Completion Checklist

#### Department System Validation
```bash
# Test department unlock functionality
npm test -- department-unlock.test.tsx

# Test employee hiring across all departments  
npm test -- hiring-system.test.tsx

# Test synergy calculations
npm test -- synergy.test.ts
```

#### Prestige System Validation
```bash
# Test investor point calculations
npm test -- prestige.test.ts

# Test prestige reset functionality
npm test -- prestige-reset.test.tsx

# Test prestige upgrade purchases
npm test -- prestige-upgrades.test.tsx
```

#### Achievement System Validation
```bash
# Test achievement progress tracking
npm test -- achievements.test.ts

# Test achievement unlocks and rewards
npm test -- achievement-rewards.test.tsx
```

## Phase 3 Completion Criteria

- [ ] All 7 departments implemented with 28 unit types
- [ ] Department unlock system functional with proper cost progression
- [ ] Employee hiring system works across all departments
- [ ] Department synergy system providing cross-department bonuses
- [ ] Prestige system with investor points and upgrades implemented
- [ ] Achievement system tracking player milestones
- [ ] UI responsive and performant with all departments
- [ ] Save/load system preserves all new game state
- [ ] Test coverage >70% for all new features
- [ ] Performance maintains >55 FPS with all departments active

## Next Steps

Upon Phase 3 completion:

1. **Update progress.json**: Mark Phase 3 as completed  
2. **Proceed to Phase 4**: [04-quality.md](./04-quality.md)
3. **Full system validation**: Test complete game flow
4. **Performance optimization**: Ensure smooth experience with all features

## Time Estimation

- **Day 1-2**: Department architecture expansion (16 hours)
- **Day 3-4**: Sales & Customer Experience implementation (16 hours)  
- **Day 5-6**: Product, Design & QA departments (16 hours)
- **Day 7**: Marketing & synergy system (8 hours)
- **Day 8-9**: Prestige system implementation (16 hours)
- **Day 10**: Achievement system and testing (8 hours)

**Total Estimated Time**: 80 hours over 10 days