# Phase 3: Integration & Advanced Department Systems

## Overview

This phase completes the PetSoft Tycoon department ecosystem by implementing the four remaining departments (Product, Design, QA, Marketing) and establishing complex cross-department synergies. Each department follows vertical slicing patterns while contributing unique mechanics to the overall game balance.

**Duration**: 4-5 weeks (4 sprints)  
**Team Size**: 2-3 senior engineers  
**Dependencies**: Core Features phase completion

## Sprint 5: Product Department (Week 9-10)

### Objectives
- [ ] Implement Product department for feature enhancement system
- [ ] Create insights generation and specification mechanics
- [ ] Add enhanced feature creation (2x value features)
- [ ] Establish product-development department synergy

### Tasks & Implementation

#### Task 5.1: Product Department State Management
**Time Estimate**: 6 hours  
**Description**: Create product department with insights and enhancement mechanics

Create `src/features/product/state/productStore.ts`:
```typescript
import { observable } from '@legendapp/state';

export type ProductRoleType = 'analyst' | 'manager' | 'senior' | 'cpo';

export interface ProductUnits {
  analyst: number;
  manager: number;
  senior: number;
  cpo: number;
}

export interface ProductUpgrades {
  marketAnalysis: boolean;
  userResearch: boolean;
  dataScience: boolean;
}

interface ProductState {
  units: ProductUnits;
  upgrades: ProductUpgrades;
  metrics: {
    insightsPerSecond: number;
    totalInsights: number;
    enhancedFeatures: number;
    roadmapBonuses: number;
  };
}

const productState$ = observable<ProductState>({
  units: { analyst: 0, manager: 0, senior: 0, cpo: 0 },
  upgrades: { marketAnalysis: false, userResearch: false, dataScience: false },
  metrics: {
    insightsPerSecond: 0,
    totalInsights: 0,
    enhancedFeatures: 0,
    roadmapBonuses: 0,
  },
});

const getProductRoleCost = (role: ProductRoleType, currentCount: number): number => {
  const baseCosts = {
    analyst: 1000,
    manager: 15000,
    senior: 100000,
    cpo: 1000000,
  };
  
  return Math.floor(baseCosts[role] * Math.pow(1.25, currentCount));
};

const calculateInsightGeneration = (units: ProductUnits, upgrades: ProductUpgrades): number => {
  const baseRates = {
    analyst: 0.3,
    manager: 1.5,
    senior: 7.5,
    cpo: 30.0,
  };
  
  let totalRate = 0;
  Object.entries(units).forEach(([role, count]) => {
    totalRate += baseRates[role as ProductRoleType] * count;
  });
  
  // Apply upgrades
  let multiplier = 1.0;
  if (upgrades.marketAnalysis) multiplier *= 1.5;
  if (upgrades.userResearch) multiplier *= 2.0;
  if (upgrades.dataScience) multiplier *= 1.8;
  
  // CPO department bonus
  if (units.cpo > 0) multiplier *= 1.25;
  
  return totalRate * multiplier;
};

// Enhanced feature creation costs
const getEnhancementCost = (featureType: 'basic' | 'advanced' | 'premium'): number => {
  const costs = {
    basic: 10,    // 10 insights per enhanced basic feature
    advanced: 50, // 50 insights per enhanced advanced feature
    premium: 200, // 200 insights per enhanced premium feature
  };
  return costs[featureType];
};

export const useProduct = () => {
  return {
    // Read-only state access
    units: productState$.units.get(),
    upgrades: productState$.upgrades.get(),
    metrics: productState$.metrics.get(),
    
    // Actions
    hireProductRole: (role: ProductRoleType, playerMoney: number): boolean => {
      const currentCount = productState$.units[role].get();
      const cost = getProductRoleCost(role, currentCount);
      
      if (playerMoney >= cost) {
        productState$.units[role].set(currentCount + 1);
        
        // Recalculate insight generation
        const newRate = calculateInsightGeneration(
          productState$.units.get(),
          productState$.upgrades.get()
        );
        productState$.metrics.insightsPerSecond.set(newRate);
        
        return true;
      }
      
      return false;
    },
    
    getProductRoleCost: (role: ProductRoleType): number => {
      const currentCount = productState$.units[role].get();
      return getProductRoleCost(role, currentCount);
    },
    
    generateInsights: (deltaTime: number): number => {
      const rate = productState$.metrics.insightsPerSecond.get();
      const insights = rate * (deltaTime / 1000);
      
      const currentTotal = productState$.metrics.totalInsights.get();
      productState$.metrics.totalInsights.set(currentTotal + insights);
      
      return insights;
    },
    
    enhanceFeature: (
      featureType: 'basic' | 'advanced' | 'premium',
      playerInsights: number,
      playerFeatures: number
    ): boolean => {
      const insightCost = getEnhancementCost(featureType);
      
      if (playerInsights >= insightCost && playerFeatures >= 1) {
        // Enhancement successful
        const currentEnhanced = productState$.metrics.enhancedFeatures.get();
        productState$.metrics.enhancedFeatures.set(currentEnhanced + 1);
        
        return true;
      }
      
      return false;
    },
    
    getEnhancementCost,
    
    // Calculate development bonus from product insights
    getDevelopmentBonus: (): number => {
      const totalInsights = productState$.metrics.totalInsights.get();
      // Every 1000 insights provides 1% bonus to development production
      return 1.0 + (Math.floor(totalInsights / 1000) * 0.01);
    },
    
    purchaseUpgrade: (
      upgrade: keyof ProductUpgrades,
      cost: number,
      playerMoney: number
    ): boolean => {
      if (playerMoney >= cost && !productState$.upgrades[upgrade].get()) {
        productState$.upgrades[upgrade].set(true);
        
        // Recalculate insight generation
        const newRate = calculateInsightGeneration(
          productState$.units.get(),
          productState$.upgrades.get()
        );
        productState$.metrics.insightsPerSecond.set(newRate);
        
        return true;
      }
      return false;
    },
  };
};

export const productState = productState$;
```

**Validation Criteria**:
- [ ] Product roles hire correctly and update insight generation
- [ ] Enhanced features create with proper resource consumption
- [ ] Development bonuses calculate based on insights
- [ ] Upgrades apply proper multipliers

#### Task 5.2: Enhanced Feature Integration
**Time Estimate**: 4 hours  
**Description**: Update sales system to handle enhanced features with 2x revenue

Update `src/features/sales/state/salesStore.ts`:
```typescript
// Add enhanced feature handling to revenue conversion
convertRevenue: (
  leads: number,
  features: { basic: number; advanced: number; premium: number; enhanced: number },
  satisfactionMultiplier: number = 1.0
): { revenue: number; consumedFeatures: typeof features; consumedLeads: number } => {
  const conversionRates = salesState$.metrics.conversionRates.get();
  
  // Calculate revenue from regular features
  const basicSales = Math.min(features.basic, Math.floor(leads * conversionRates.basic));
  const advancedSales = Math.min(features.advanced, Math.floor(leads * conversionRates.advanced));
  const premiumSales = Math.min(features.premium, Math.floor(leads * conversionRates.premium));
  
  // Enhanced features have 2x value and higher conversion rate
  const enhancedSales = Math.min(features.enhanced, Math.floor(leads * conversionRates.premium * 2));
  
  const baseRevenue = 
    basicSales * 10 + 
    advancedSales * 100 + 
    premiumSales * 1000 + 
    enhancedSales * 2000; // 2x premium value
  
  // Apply satisfaction multiplier
  const revenue = Math.floor(baseRevenue * satisfactionMultiplier);
  
  const consumedFeatures = {
    basic: basicSales,
    advanced: advancedSales,
    premium: premiumSales,
    enhanced: enhancedSales,
  };
  
  const totalLeadsUsed = basicSales + advancedSales + premiumSales + enhancedSales;
  
  // Update metrics
  const currentRevenue = salesState$.metrics.totalRevenue.get();
  salesState$.metrics.totalRevenue.set(currentRevenue + revenue);
  salesState$.lastConversion.set(Date.now());
  
  return {
    revenue,
    consumedFeatures,
    consumedLeads: totalLeadsUsed,
  };
},
```

#### Task 5.3: Product Department UI
**Time Estimate**: 6 hours  
**Description**: Create product department interface with enhancement mechanics

Create `src/features/product/components/ProductTab.tsx`:
```typescript
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useProduct } from '../state/productStore';
import { usePlayer } from '@/features/core/state/playerStore';
import { Button } from '@/shared/ui/Button';
import { AnimatedNumber } from '@/shared/ui/AnimatedNumber';
import { ProductRoleType } from '../state/productStore';
import { AudioManager } from '@/shared/audio/AudioManager';

const productRoleInfo = {
  analyst: { name: 'Product Analyst', description: '0.3 insights/sec' },
  manager: { name: 'Product Manager', description: '1.5 insights/sec' },
  senior: { name: 'Senior PM', description: '7.5 insights/sec' },
  cpo: { name: 'Chief Product Officer', description: '30.0 insights/sec + 25% dept bonus' },
};

const upgradeInfo = {
  marketAnalysis: { name: 'Market Analysis', description: '+50% insights', cost: 50000 },
  userResearch: { name: 'User Research', description: '+100% insights', cost: 250000 },
  dataScience: { name: 'Data Science', description: '+80% insights', cost: 1000000 },
};

export const ProductTab: React.FC = () => {
  const product = useProduct();
  const player = usePlayer();
  const { money, insights, features } = player.resources;
  
  const handleHireRole = (role: ProductRoleType) => {
    const cost = product.getProductRoleCost(role);
    const success = product.hireProductRole(role, money);
    
    if (success) {
      player.modifyResource('money', -cost);
      AudioManager.playSound('levelup');
    }
  };
  
  const handleEnhanceFeature = (featureType: 'basic' | 'advanced' | 'premium') => {
    const insightCost = product.getEnhancementCost(featureType);
    const featureCount = features[featureType];
    
    const success = product.enhanceFeature(featureType, insights, featureCount);
    
    if (success) {
      player.modifyResource('insights', -insightCost);
      player.modifyResource('features', { [featureType]: -1, enhanced: 1 });
      AudioManager.playSound('levelup');
    }
  };
  
  const handlePurchaseUpgrade = (upgrade: keyof typeof upgradeInfo) => {
    const cost = upgradeInfo[upgrade].cost;
    const success = product.purchaseUpgrade(upgrade, cost, money);
    
    if (success) {
      player.modifyResource('money', -cost);
      AudioManager.playSound('levelup');
    }
  };
  
  const developmentBonus = product.getDevelopmentBonus();
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Product Department</Text>
      
      <View style={styles.metrics}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Insight Generation</Text>
          <Text style={styles.metricValue}>
            {product.metrics.insightsPerSecond.toFixed(1)} insights/sec
          </Text>
        </View>
        
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Enhanced Features</Text>
          <AnimatedNumber 
            value={product.metrics.enhancedFeatures}
            style={styles.metricValue}
          />
        </View>
      </View>
      
      {developmentBonus > 1.0 && (
        <View style={styles.bonusDisplay}>
          <Text style={styles.bonusText}>
            Development Bonus: {((developmentBonus - 1) * 100).toFixed(0)}%
          </Text>
        </View>
      )}
      
      <Text style={styles.sectionTitle}>Feature Enhancement</Text>
      <Text style={styles.sectionDescription}>
        Convert regular features to enhanced features (2x revenue)
      </Text>
      
      <View style={styles.enhancementSection}>
        {(['basic', 'advanced', 'premium'] as const).map((type) => {
          const cost = product.getEnhancementCost(type);
          const available = features[type];
          const canEnhance = insights >= cost && available > 0;
          
          return (
            <View key={type} style={styles.enhancementRow}>
              <View style={styles.enhancementInfo}>
                <Text style={styles.enhancementName}>
                  Enhance {type} ({available} available)
                </Text>
                <Text style={styles.enhancementCost}>
                  Cost: {cost} insights
                </Text>
              </View>
              <Button
                title="Enhance"
                onPress={() => handleEnhanceFeature(type)}
                disabled={!canEnhance}
                variant={canEnhance ? 'primary' : 'secondary'}
              />
            </View>
          );
        })}
      </View>
      
      <Text style={styles.sectionTitle}>Hire Product Team</Text>
      {Object.entries(productRoleInfo).map(([role, info]) => {
        const roleType = role as ProductRoleType;
        const count = product.units[roleType];
        const cost = product.getProductRoleCost(roleType);
        const canAfford = money >= cost;
        
        return (
          <View key={role} style={styles.roleRow}>
            <View style={styles.roleInfo}>
              <Text style={styles.roleName}>
                {info.name} ({count})
              </Text>
              <Text style={styles.roleDescription}>
                {info.description}
              </Text>
            </View>
            <Button
              title="Hire"
              onPress={() => handleHireRole(roleType)}
              cost={cost}
              canAfford={canAfford}
              variant={canAfford ? 'primary' : 'secondary'}
            />
          </View>
        );
      })}
      
      <Text style={styles.sectionTitle}>Upgrades</Text>
      {Object.entries(upgradeInfo).map(([key, upgrade]) => {
        const upgradeKey = key as keyof typeof upgradeInfo;
        const purchased = product.upgrades[upgradeKey];
        const canAfford = money >= upgrade.cost;
        
        return (
          <View key={key} style={styles.upgradeRow}>
            <View style={styles.upgradeInfo}>
              <Text style={styles.upgradeName}>
                {upgrade.name} {purchased ? '✓' : ''}
              </Text>
              <Text style={styles.upgradeDescription}>
                {upgrade.description}
              </Text>
            </View>
            <Button
              title={purchased ? 'Owned' : 'Buy'}
              onPress={() => handlePurchaseUpgrade(upgradeKey)}
              disabled={purchased || !canAfford}
              cost={purchased ? undefined : upgrade.cost}
              canAfford={canAfford}
              variant={!purchased && canAfford ? 'primary' : 'secondary'}
            />
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  bonusDisplay: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  bonusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF8F00',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 20,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  enhancementSection: {
    backgroundColor: '#F8F4FF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  enhancementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  enhancementInfo: {
    flex: 1,
    marginRight: 12,
  },
  enhancementName: {
    fontSize: 16,
    fontWeight: '600',
  },
  enhancementCost: {
    fontSize: 14,
    color: '#666',
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
  },
  roleInfo: {
    flex: 1,
    marginRight: 12,
  },
  roleName: {
    fontSize: 16,
    fontWeight: '600',
  },
  roleDescription: {
    fontSize: 14,
    color: '#666',
  },
  upgradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 12,
  },
  upgradeInfo: {
    flex: 1,
    marginRight: 12,
  },
  upgradeName: {
    fontSize: 16,
    fontWeight: '600',
  },
  upgradeDescription: {
    fontSize: 14,
    color: '#666',
  },
});
```

## Sprint 6: Design Department (Week 10-11)

### Objectives
- [ ] Implement Design department for user experience systems
- [ ] Create experience point generation and polish mechanics
- [ ] Add global multipliers and design system bonuses
- [ ] Establish design-product department synergy

### Tasks & Implementation

#### Task 6.1: Design Department State Management
**Time Estimate**: 5 hours  
**Description**: Create design department with experience and polish systems

Create `src/features/design/state/designStore.ts`:
```typescript
import { observable } from '@legendapp/state';

export type DesignRoleType = 'designer' | 'senior' | 'lead' | 'director';

export interface DesignUnits {
  designer: number;
  senior: number;
  lead: number;
  director: number;
}

export interface DesignUpgrades {
  designSystem: boolean;
  userTesting: boolean;
  accessibilityFocus: boolean;
}

interface DesignState {
  units: DesignUnits;
  upgrades: DesignUpgrades;
  metrics: {
    experiencePerSecond: number;
    totalExperience: number;
    polishMultiplier: number;
    systemsBonuses: number;
  };
}

const designState$ = observable<DesignState>({
  units: { designer: 0, senior: 0, lead: 0, director: 0 },
  upgrades: { designSystem: false, userTesting: false, accessibilityFocus: false },
  metrics: {
    experiencePerSecond: 0,
    totalExperience: 0,
    polishMultiplier: 1.0,
    systemsBonuses: 0,
  },
});

const getDesignRoleCost = (role: DesignRoleType, currentCount: number): number => {
  const baseCosts = {
    designer: 2000,
    senior: 25000,
    lead: 200000,
    director: 2000000,
  };
  
  return Math.floor(baseCosts[role] * Math.pow(1.3, currentCount));
};

const calculateExperienceGeneration = (units: DesignUnits, upgrades: DesignUpgrades): number => {
  const baseRates = {
    designer: 0.4,
    senior: 2.0,
    lead: 10.0,
    director: 40.0,
  };
  
  let totalRate = 0;
  Object.entries(units).forEach(([role, count]) => {
    totalRate += baseRates[role as DesignRoleType] * count;
  });
  
  // Apply upgrades
  let multiplier = 1.0;
  if (upgrades.designSystem) multiplier *= 2.0;
  if (upgrades.userTesting) multiplier *= 1.6;
  if (upgrades.accessibilityFocus) multiplier *= 1.4;
  
  // Director department bonus
  if (units.director > 0) multiplier *= 1.3;
  
  return totalRate * multiplier;
};

const calculatePolishMultiplier = (totalExperience: number): number => {
  // Experience points provide global multipliers
  // Every 5000 experience = +10% to all production
  return 1.0 + Math.floor(totalExperience / 5000) * 0.1;
};

export const useDesign = () => {
  return {
    // Read-only state access
    units: designState$.units.get(),
    upgrades: designState$.upgrades.get(),
    metrics: designState$.metrics.get(),
    
    // Actions
    hireDesignRole: (role: DesignRoleType, playerMoney: number): boolean => {
      const currentCount = designState$.units[role].get();
      const cost = getDesignRoleCost(role, currentCount);
      
      if (playerMoney >= cost) {
        designState$.units[role].set(currentCount + 1);
        
        // Recalculate experience generation
        const newRate = calculateExperienceGeneration(
          designState$.units.get(),
          designState$.upgrades.get()
        );
        designState$.metrics.experiencePerSecond.set(newRate);
        
        return true;
      }
      
      return false;
    },
    
    getDesignRoleCost: (role: DesignRoleType): number => {
      const currentCount = designState$.units[role].get();
      return getDesignRoleCost(role, currentCount);
    },
    
    generateExperience: (deltaTime: number): number => {
      const rate = designState$.metrics.experiencePerSecond.get();
      const experience = rate * (deltaTime / 1000);
      
      const currentTotal = designState$.metrics.totalExperience.get();
      const newTotal = currentTotal + experience;
      designState$.metrics.totalExperience.set(newTotal);
      
      // Update polish multiplier
      const newMultiplier = calculatePolishMultiplier(newTotal);
      designState$.metrics.polishMultiplier.set(newMultiplier);
      
      return experience;
    },
    
    // Global multiplier for all departments
    getGlobalMultiplier: (): number => {
      return designState$.metrics.polishMultiplier.get();
    },
    
    // Special bonus for product department
    getProductBonus: (): number => {
      const totalExperience = designState$.metrics.totalExperience.get();
      // Every 2000 experience = +5% insight generation
      return 1.0 + Math.floor(totalExperience / 2000) * 0.05;
    },
    
    purchaseUpgrade: (
      upgrade: keyof DesignUpgrades,
      cost: number,
      playerMoney: number
    ): boolean => {
      if (playerMoney >= cost && !designState$.upgrades[upgrade].get()) {
        designState$.upgrades[upgrade].set(true);
        
        // Recalculate experience generation
        const newRate = calculateExperienceGeneration(
          designState$.units.get(),
          designState$.upgrades.get()
        );
        designState$.metrics.experiencePerSecond.set(newRate);
        
        return true;
      }
      return false;
    },
  };
};

export const designState = designState$;
```

## Sprint 7: QA Department (Week 11-12)

### Objectives
- [ ] Implement QA department for bug detection and prevention
- [ ] Create quality assurance mechanics and testing systems
- [ ] Add bug reduction bonuses and quality multipliers
- [ ] Establish QA-development department synergy

### Tasks & Implementation

#### Task 7.1: QA Department Implementation
**Time Estimate**: 5 hours  
**Description**: Create QA department with bug management systems

Create `src/features/qa/state/qaStore.ts`:
```typescript
import { observable } from '@legendapp/state';

export type QARoleType = 'tester' | 'automation' | 'lead' | 'director';

export interface QAUnits {
  tester: number;
  automation: number;
  lead: number;
  director: number;
}

export interface QAUpgrades {
  testAutomation: boolean;
  performanceTesting: boolean;
  securityAudits: boolean;
}

interface QAState {
  units: QAUnits;
  upgrades: QAUpgrades;
  metrics: {
    testingPerSecond: number;
    bugsFoundPerSecond: number;
    qualityMultiplier: number;
    preventionRate: number;
  };
}

const qaState$ = observable<QAState>({
  units: { tester: 0, automation: 0, lead: 0, director: 0 },
  upgrades: { testAutomation: false, performanceTesting: false, securityAudits: false },
  metrics: {
    testingPerSecond: 0,
    bugsFoundPerSecond: 0,
    qualityMultiplier: 1.0,
    preventionRate: 0,
  },
});

const getQARoleCost = (role: QARoleType, currentCount: number): number => {
  const baseCosts = {
    tester: 1500,
    automation: 20000,
    lead: 150000,
    director: 1500000,
  };
  
  return Math.floor(baseCosts[role] * Math.pow(1.28, currentCount));
};

const calculateQAMetrics = (
  units: QAUnits, 
  upgrades: QAUpgrades,
  developmentActivity: number
): { testingRate: number; bugDetection: number; qualityMultiplier: number } => {
  const testingRates = {
    tester: 0.6,
    automation: 3.0,
    lead: 12.0,
    director: 50.0,
  };
  
  let totalTesting = 0;
  Object.entries(units).forEach(([role, count]) => {
    totalTesting += testingRates[role as QARoleType] * count;
  });
  
  // Apply upgrades
  let multiplier = 1.0;
  if (upgrades.testAutomation) multiplier *= 2.5;
  if (upgrades.performanceTesting) multiplier *= 1.7;
  if (upgrades.securityAudits) multiplier *= 1.5;
  
  // Director department bonus
  if (units.director > 0) multiplier *= 1.4;
  
  const testingRate = totalTesting * multiplier;
  
  // Bug detection rate based on development activity
  const bugDetection = Math.min(testingRate, developmentActivity * 0.1);
  
  // Quality multiplier - reduces bug impact on other departments
  const coverage = testingRate / Math.max(developmentActivity, 1);
  const qualityMultiplier = 1.0 + Math.min(1.0, coverage * 0.5);
  
  return { testingRate, bugDetection, qualityMultiplier };
};

export const useQA = () => {
  return {
    // Read-only state access
    units: qaState$.units.get(),
    upgrades: qaState$.upgrades.get(),
    metrics: qaState$.metrics.get(),
    
    // Actions
    hireQARole: (role: QARoleType, playerMoney: number): boolean => {
      const currentCount = qaState$.units[role].get();
      const cost = getQARoleCost(role, currentCount);
      
      if (playerMoney >= cost) {
        qaState$.units[role].set(currentCount + 1);
        return true;
      }
      
      return false;
    },
    
    getQARoleCost: (role: QARoleType): number => {
      const currentCount = qaState$.units[role].get();
      return getQARoleCost(role, currentCount);
    },
    
    updateMetrics: (developmentActivity: number): void => {
      const metrics = calculateQAMetrics(
        qaState$.units.get(),
        qaState$.upgrades.get(),
        developmentActivity
      );
      
      qaState$.metrics.testingPerSecond.set(metrics.testingRate);
      qaState$.metrics.bugsFoundPerSecond.set(metrics.bugDetection);
      qaState$.metrics.qualityMultiplier.set(metrics.qualityMultiplier);
      qaState$.metrics.preventionRate.set(metrics.bugDetection / Math.max(developmentActivity, 1));
    },
    
    // Quality bonus for development
    getDevelopmentQualityBonus: (): number => {
      return qaState$.metrics.qualityMultiplier.get();
    },
    
    purchaseUpgrade: (
      upgrade: keyof QAUpgrades,
      cost: number,
      playerMoney: number
    ): boolean => {
      if (playerMoney >= cost && !qaState$.upgrades[upgrade].get()) {
        qaState$.upgrades[upgrade].set(true);
        return true;
      }
      return false;
    },
  };
};

export const qaState = qaState$;
```

## Sprint 8: Marketing Department (Week 12-13)

### Objectives
- [ ] Implement Marketing department for brand building and viral growth
- [ ] Create brand value generation and campaign multipliers
- [ ] Add viral coefficient mechanics for exponential lead generation
- [ ] Complete seven-department ecosystem with all synergies

### Tasks & Implementation

#### Task 8.1: Marketing Department Implementation
**Time Estimate**: 6 hours  
**Description**: Create marketing department with viral mechanics

Create `src/features/marketing/state/marketingStore.ts`:
```typescript
import { observable } from '@legendapp/state';

export type MarketingRoleType = 'specialist' | 'manager' | 'director' | 'cmo';

export interface MarketingUnits {
  specialist: number;
  manager: number;
  director: number;
  cmo: number;
}

export interface MarketingUpgrades {
  socialMedia: boolean;
  contentMarketing: boolean;
  influencerPartnerships: boolean;
}

interface MarketingState {
  units: MarketingUnits;
  upgrades: MarketingUpgrades;
  metrics: {
    brandPerSecond: number;
    totalBrand: number;
    campaignMultipliers: number;
    viralCoefficient: number;
  };
}

const marketingState$ = observable<MarketingState>({
  units: { specialist: 0, manager: 0, director: 0, cmo: 0 },
  upgrades: { socialMedia: false, contentMarketing: false, influencerPartnerships: false },
  metrics: {
    brandPerSecond: 0,
    totalBrand: 0,
    campaignMultipliers: 1.0,
    viralCoefficient: 1.0,
  },
});

const getMarketingRoleCost = (role: MarketingRoleType, currentCount: number): number => {
  const baseCosts = {
    specialist: 3000,
    manager: 30000,
    director: 300000,
    cmo: 3000000,
  };
  
  return Math.floor(baseCosts[role] * Math.pow(1.35, currentCount));
};

const calculateMarketingMetrics = (
  units: MarketingUnits,
  upgrades: MarketingUpgrades
): { brandRate: number; campaignMultiplier: number; viralCoeff: number } => {
  const brandRates = {
    specialist: 0.8,
    manager: 4.0,
    director: 20.0,
    cmo: 80.0,
  };
  
  let totalBrand = 0;
  Object.entries(units).forEach(([role, count]) => {
    totalBrand += brandRates[role as MarketingRoleType] * count;
  });
  
  // Apply upgrades
  let multiplier = 1.0;
  if (upgrades.socialMedia) multiplier *= 2.0;
  if (upgrades.contentMarketing) multiplier *= 1.8;
  if (upgrades.influencerPartnerships) multiplier *= 2.5;
  
  // CMO department bonus
  if (units.cmo > 0) multiplier *= 1.5;
  
  const brandRate = totalBrand * multiplier;
  
  // Campaign multiplier affects sales lead generation
  const campaignMultiplier = 1.0 + Math.sqrt(totalBrand) * 0.1;
  
  // Viral coefficient - exponential growth factor
  const viralCoeff = 1.0 + (totalBrand / 10000) * Math.log(totalBrand + 1);
  
  return { brandRate, campaignMultiplier, viralCoeff };
};

export const useMarketing = () => {
  return {
    // Read-only state access
    units: marketingState$.units.get(),
    upgrades: marketingState$.upgrades.get(),
    metrics: marketingState$.metrics.get(),
    
    // Actions
    hireMarketingRole: (role: MarketingRoleType, playerMoney: number): boolean => {
      const currentCount = marketingState$.units[role].get();
      const cost = getMarketingRoleCost(role, currentCount);
      
      if (playerMoney >= cost) {
        marketingState$.units[role].set(currentCount + 1);
        
        // Recalculate marketing metrics
        const metrics = calculateMarketingMetrics(
          marketingState$.units.get(),
          marketingState$.upgrades.get()
        );
        
        marketingState$.metrics.brandPerSecond.set(metrics.brandRate);
        marketingState$.metrics.campaignMultipliers.set(metrics.campaignMultiplier);
        marketingState$.metrics.viralCoefficient.set(metrics.viralCoeff);
        
        return true;
      }
      
      return false;
    },
    
    getMarketingRoleCost: (role: MarketingRoleType): number => {
      const currentCount = marketingState$.units[role].get();
      return getMarketingRoleCost(role, currentCount);
    },
    
    generateBrand: (deltaTime: number): number => {
      const rate = marketingState$.metrics.brandPerSecond.get();
      const brand = rate * (deltaTime / 1000);
      
      const currentTotal = marketingState$.metrics.totalBrand.get();
      marketingState$.metrics.totalBrand.set(currentTotal + brand);
      
      return brand;
    },
    
    // Sales lead generation multiplier
    getSalesMultiplier: (): number => {
      const campaignBonus = marketingState$.metrics.campaignMultipliers.get();
      const viralBonus = marketingState$.metrics.viralCoefficient.get();
      return campaignBonus * viralBonus;
    },
    
    purchaseUpgrade: (
      upgrade: keyof MarketingUpgrades,
      cost: number,
      playerMoney: number
    ): boolean => {
      if (playerMoney >= cost && !marketingState$.upgrades[upgrade].get()) {
        marketingState$.upgrades[upgrade].set(true);
        
        // Recalculate marketing metrics
        const metrics = calculateMarketingMetrics(
          marketingState$.units.get(),
          marketingState$.upgrades.get()
        );
        
        marketingState$.metrics.brandPerSecond.set(metrics.brandRate);
        marketingState$.metrics.campaignMultipliers.set(metrics.campaignMultiplier);
        marketingState$.metrics.viralCoefficient.set(metrics.viralCoeff);
        
        return true;
      }
      return false;
    },
  };
};

export const marketingState = marketingState$;
```

#### Task 8.2: Complete Integration & Production Loop
**Time Estimate**: 6 hours  
**Description**: Update main game loop with all seven departments and synergies

Update `src/features/core/components/MainClicker.tsx`:
```typescript
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { usePlayer } from '../state/playerStore';
import { useDevelopment } from '@/features/development/state/developmentStore';
import { useSales } from '@/features/sales/state/salesStore';
import { useCustomerExp } from '@/features/customer-exp/state/customerStore';
import { useProduct } from '@/features/product/state/productStore';
import { useDesign } from '@/features/design/state/designStore';
import { useQA } from '@/features/qa/state/qaStore';
import { useMarketing } from '@/features/marketing/state/marketingStore';
import { Button } from '@/shared/ui/Button';
import { AnimatedNumber } from '@/shared/ui/AnimatedNumber';
import { AudioManager } from '@/shared/audio/AudioManager';

export const MainClicker: React.FC = () => {
  const player = usePlayer();
  const development = useDevelopment();
  const sales = useSales();
  const customerExp = useCustomerExp();
  const product = useProduct();
  const design = useDesign();
  const qa = useQA();
  const marketing = useMarketing();
  
  const { linesOfCode, money, leads, features, insights, experiencePoints, bugs, brandValue } = player.resources;
  
  // Complete integrated production loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Get all multipliers and bonuses
      const globalMultiplier = design.getGlobalMultiplier();
      const developmentBonus = product.getDevelopmentBonus();
      const qualityBonus = qa.getDevelopmentQualityBonus();
      const salesMultiplier = marketing.getSalesMultiplier();
      const satisfactionMultiplier = customerExp.metrics.satisfactionMultiplier;
      const productInsightBonus = design.getProductBonus();
      
      // Development: Generate lines of code and features
      const baseLinesProduced = development.updateProduction(1000);
      const linesProduced = baseLinesProduced * globalMultiplier * developmentBonus * qualityBonus;
      const featuresGenerated = development.generateFeatures(1000);
      
      if (linesProduced > 0) {
        player.modifyResource('linesOfCode', linesProduced);
        player.modifyResource('features', {
          basic: featuresGenerated.basic * globalMultiplier,
          advanced: featuresGenerated.advanced * globalMultiplier,
          premium: featuresGenerated.premium * globalMultiplier,
        });
      }
      
      // Sales: Generate leads with marketing multiplier
      const baseLeadsGenerated = sales.generateLeads(1000);
      const leadsGenerated = baseLeadsGenerated * salesMultiplier * globalMultiplier;
      if (leadsGenerated > 0) {
        player.modifyResource('leads', leadsGenerated);
      }
      
      // Customer Experience: Update satisfaction and generate referrals
      customerExp.updateMetrics(sales.metrics.totalRevenue);
      const referralLeads = customerExp.generateReferralLeads(1000);
      if (referralLeads > 0) {
        player.modifyResource('leads', referralLeads * globalMultiplier);
      }
      
      // Product: Generate insights with design bonus
      const baseInsights = product.generateInsights(1000);
      const insights = baseInsights * productInsightBonus * globalMultiplier;
      if (insights > 0) {
        player.modifyResource('insights', insights);
      }
      
      // Design: Generate experience points
      const experience = design.generateExperience(1000);
      if (experience > 0) {
        player.modifyResource('experiencePoints', experience * globalMultiplier);
      }
      
      // QA: Update testing metrics
      qa.updateMetrics(development.production.linesPerSecond);
      
      // Marketing: Generate brand value
      const brand = marketing.generateBrand(1000);
      if (brand > 0) {
        player.modifyResource('brandValue', brand * globalMultiplier);
      }
      
      // Auto-convert revenue if enabled
      if (leads > 10 && (features.basic > 0 || features.advanced > 0 || features.premium > 0 || features.enhanced > 0)) {
        const result = sales.convertRevenue(leads, features, satisfactionMultiplier);
        
        if (result.revenue > 0) {
          player.modifyResource('money', result.revenue);
          player.modifyResource('leads', -result.consumedLeads);
          player.modifyResource('features', {
            basic: -result.consumedFeatures.basic,
            advanced: -result.consumedFeatures.advanced,
            premium: -result.consumedFeatures.premium,
            enhanced: -result.consumedFeatures.enhanced,
          });
        }
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleClick = () => {
    const clickBonus = design.getGlobalMultiplier() * product.getDevelopmentBonus();
    player.modifyResource('linesOfCode', clickBonus);
    AudioManager.playSound('click');
  };
  
  const totalMultiplier = design.getGlobalMultiplier() * marketing.getSalesMultiplier() * customerExp.metrics.satisfactionMultiplier;
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>PetSoft Tycoon</Text>
      
      <View style={styles.resourceGrid}>
        <View style={styles.resourceRow}>
          <View style={styles.resource}>
            <Text style={styles.resourceLabel}>Money</Text>
            <AnimatedNumber 
              value={money} 
              style={styles.resourceValue}
              formatter={(n) => `$${n.toLocaleString()}`}
            />
          </View>
          
          <View style={styles.resource}>
            <Text style={styles.resourceLabel}>Lines of Code</Text>
            <AnimatedNumber value={linesOfCode} style={styles.resourceValue} />
          </View>
        </View>
        
        <View style={styles.resourceRow}>
          <View style={styles.resource}>
            <Text style={styles.resourceLabel}>Leads</Text>
            <AnimatedNumber value={Math.floor(leads)} style={styles.resourceValue} />
          </View>
          
          <View style={styles.resource}>
            <Text style={styles.resourceLabel}>Features</Text>
            <Text style={styles.featureText}>
              {Math.floor(features.basic)}B {Math.floor(features.advanced)}A {Math.floor(features.premium)}P {Math.floor(features.enhanced)}E
            </Text>
          </View>
        </View>
        
        <View style={styles.resourceRow}>
          <View style={styles.resource}>
            <Text style={styles.resourceLabel}>Insights</Text>
            <AnimatedNumber value={Math.floor(insights)} style={styles.resourceValue} />
          </View>
          
          <View style={styles.resource}>
            <Text style={styles.resourceLabel}>Experience</Text>
            <AnimatedNumber value={Math.floor(experiencePoints)} style={styles.resourceValue} />
          </View>
        </View>
        
        <View style={styles.resourceRow}>
          <View style={styles.resource}>
            <Text style={styles.resourceLabel}>Brand Value</Text>
            <AnimatedNumber value={Math.floor(brandValue)} style={styles.resourceValue} />
          </View>
          
          <View style={styles.resource}>
            <Text style={styles.resourceLabel}>Total Multiplier</Text>
            <Text style={styles.multiplierText}>{totalMultiplier.toFixed(2)}x</Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity style={styles.clickButton} onPress={handleClick}>
        <Text style={styles.clickText}>🚀 DEVELOP SOFTWARE 🚀</Text>
        <Text style={styles.clickBonus}>
          +{(design.getGlobalMultiplier() * product.getDevelopmentBonus()).toFixed(1)} lines
        </Text>
      </TouchableOpacity>
      
      <View style={styles.departmentStats}>
        <Text style={styles.statText}>Dev: {development.production.linesPerSecond.toFixed(1)}/sec</Text>
        <Text style={styles.statText}>Sales: {sales.metrics.leadsPerSecond.toFixed(1)}/sec</Text>
        <Text style={styles.statText}>Support: {customerExp.metrics.satisfactionMultiplier.toFixed(2)}x</Text>
        <Text style={styles.statText}>Product: {product.metrics.insightsPerSecond.toFixed(1)}/sec</Text>
        <Text style={styles.statText}>Design: {design.metrics.polishMultiplier.toFixed(2)}x</Text>
        <Text style={styles.statText}>QA: {qa.metrics.qualityMultiplier.toFixed(2)}x</Text>
        <Text style={styles.statText}>Marketing: {marketing.metrics.viralCoefficient.toFixed(2)}x</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  resourceGrid: {
    marginBottom: 30,
  },
  resourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  resource: {
    alignItems: 'center',
    flex: 1,
  },
  resourceLabel: {
    fontSize: 12,
    color: '#666',
  },
  resourceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  featureText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  multiplierText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  clickButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 50,
    paddingVertical: 25,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  clickText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  clickBonus: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  departmentStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  statText: {
    fontSize: 10,
    color: '#666',
    marginHorizontal: 4,
    marginVertical: 2,
  },
});
```

## Validation & Testing

### Integration Testing
- [ ] All seven departments work together without conflicts
- [ ] Cross-department bonuses apply correctly
- [ ] Resource flows maintain proper balance
- [ ] UI updates reflect all state changes accurately

### Performance Testing
- [ ] Game maintains 30+ FPS with all departments active
- [ ] Memory usage stays under 200MB
- [ ] Complex production calculations don't cause frame drops
- [ ] Save/load handles complete game state properly

### Balance Testing
- [ ] Department progression feels rewarding
- [ ] No department becomes overpowered or obsolete
- [ ] Multipliers create meaningful progression
- [ ] Resource consumption rates are balanced

## Deliverables

At the end of Integration phase:

1. **Complete Department Ecosystem**: All seven departments working in harmony
2. **Complex Synergies**: Cross-department bonuses and multipliers
3. **Advanced Mechanics**: Enhanced features, experience systems, viral growth
4. **Integrated UI**: Navigation between all departments
5. **Balanced Progression**: Meaningful advancement through all systems

## Next Steps

Integration phase completion enables:
- **Quality Phase**: Performance optimization, audio implementation, and polish
- **Deployment Phase**: Production builds, testing, and release preparation
- **Post-Launch**: Additional features like prestige system and super units

---

**Integration Complete**: Full seven-department idle clicker with complex synergies and balanced progression following vertical slicing architecture patterns.