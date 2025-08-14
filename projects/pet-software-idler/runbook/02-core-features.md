# Phase 2: Core Features & Game Loop

## Overview

This phase expands the basic clicking game into a fully functional idle clicker with core revenue generation loop. It implements the Sales and Customer Experience departments following vertical slicing patterns, establishing the foundation for all subsequent departments.

**Duration**: 2-3 weeks (2 sprints)  
**Team Size**: 2-3 senior engineers  
**Dependencies**: Foundation phase completion

## Sprint 3: Sales Department (Week 5-6)

### Objectives
- [ ] Implement sales department as complete vertical slice
- [ ] Create feature consumption and revenue generation mechanics
- [ ] Add lead generation and conversion systems
- [ ] Establish cross-department resource coordination patterns

### Tasks & Implementation

#### Task 3.1: Sales Department State Management
**Time Estimate**: 6 hours  
**Description**: Create sales-specific state management following vertical slicing patterns

Create `src/features/sales/state/salesStore.ts`:
```typescript
import { observable } from '@legendapp/state';

export type SalesRepType = 'rep' | 'manager' | 'director' | 'vpSales';

export interface SalesUnits {
  rep: number;
  manager: number;
  director: number;
  vpSales: number;
}

export interface SalesUpgrades {
  betterCRM: boolean;
  salesTraining: boolean;
  marketResearch: boolean;
}

export interface RevenueMetrics {
  leadsPerSecond: number;
  totalRevenue: number;
  conversionRates: {
    basic: number;
    advanced: number;
    premium: number;
  };
}

interface SalesState {
  units: SalesUnits;
  upgrades: SalesUpgrades;
  metrics: RevenueMetrics;
  lastConversion: number;
}

const salesState$ = observable<SalesState>({
  units: { rep: 0, manager: 0, director: 0, vpSales: 0 },
  upgrades: { betterCRM: false, salesTraining: false, marketResearch: false },
  metrics: {
    leadsPerSecond: 0,
    totalRevenue: 0,
    conversionRates: { basic: 0.1, advanced: 0.05, premium: 0.01 },
  },
  lastConversion: 0,
});

// Cost calculations for sales reps
const getSalesRepCost = (type: SalesRepType, currentCount: number): number => {
  const baseCosts = {
    rep: 100,
    manager: 1000,
    director: 10000,
    vpSales: 100000,
  };
  
  return Math.floor(baseCosts[type] * Math.pow(1.2, currentCount));
};

// Lead generation rate calculations
const calculateLeadGeneration = (units: SalesUnits, upgrades: SalesUpgrades): number => {
  const baseRates = {
    rep: 0.2,
    manager: 1.0,
    director: 5.0,
    vpSales: 20.0,
  };
  
  let totalRate = 0;
  Object.entries(units).forEach(([type, count]) => {
    totalRate += baseRates[type as SalesRepType] * count;
  });
  
  // Apply upgrades
  let multiplier = 1.0;
  if (upgrades.betterCRM) multiplier *= 1.3;
  if (upgrades.salesTraining) multiplier *= 1.5;
  if (upgrades.marketResearch) multiplier *= 1.2;
  
  // VP Sales department bonus
  if (units.vpSales > 0) multiplier *= 1.15;
  
  return totalRate * multiplier;
};

// Revenue conversion calculations
const calculateRevenue = (
  leads: number,
  features: { basic: number; advanced: number; premium: number },
  conversionRates: { basic: number; advanced: number; premium: number }
): number => {
  if (leads === 0) return 0;
  
  // Calculate how many features can be converted
  const basicSales = Math.min(features.basic, Math.floor(leads * conversionRates.basic));
  const advancedSales = Math.min(features.advanced, Math.floor(leads * conversionRates.advanced));
  const premiumSales = Math.min(features.premium, Math.floor(leads * conversionRates.premium));
  
  // Revenue values per feature type
  const revenue = basicSales * 10 + advancedSales * 100 + premiumSales * 1000;
  
  return revenue;
};

export const useSales = () => {
  return {
    // Read-only state access
    units: salesState$.units.get(),
    upgrades: salesState$.upgrades.get(),
    metrics: salesState$.metrics.get(),
    
    // Actions
    hireSalesRep: (type: SalesRepType, playerMoney: number): boolean => {
      const currentCount = salesState$.units[type].get();
      const cost = getSalesRepCost(type, currentCount);
      
      if (playerMoney >= cost) {
        salesState$.units[type].set(currentCount + 1);
        
        // Recalculate lead generation
        const newRate = calculateLeadGeneration(
          salesState$.units.get(),
          salesState$.upgrades.get()
        );
        salesState$.metrics.leadsPerSecond.set(newRate);
        
        return true;
      }
      
      return false;
    },
    
    getSalesRepCost: (type: SalesRepType): number => {
      const currentCount = salesState$.units[type].get();
      return getSalesRepCost(type, currentCount);
    },
    
    generateLeads: (deltaTime: number): number => {
      const rate = salesState$.metrics.leadsPerSecond.get();
      const leads = rate * (deltaTime / 1000);
      return leads;
    },
    
    convertRevenue: (
      leads: number,
      features: { basic: number; advanced: number; premium: number }
    ): { revenue: number; consumedFeatures: typeof features; consumedLeads: number } => {
      const conversionRates = salesState$.metrics.conversionRates.get();
      const revenue = calculateRevenue(leads, features, conversionRates);
      
      // Calculate consumed resources
      const basicUsed = Math.min(features.basic, Math.floor(leads * conversionRates.basic));
      const advancedUsed = Math.min(features.advanced, Math.floor(leads * conversionRates.advanced));
      const premiumUsed = Math.min(features.premium, Math.floor(leads * conversionRates.premium));
      
      const consumedFeatures = {
        basic: basicUsed,
        advanced: advancedUsed,
        premium: premiumUsed,
      };
      
      const totalLeadsUsed = basicUsed + advancedUsed + premiumUsed;
      
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
    
    // Upgrade purchases
    purchaseUpgrade: (
      upgrade: keyof SalesUpgrades,
      cost: number,
      playerMoney: number
    ): boolean => {
      if (playerMoney >= cost && !salesState$.upgrades[upgrade].get()) {
        salesState$.upgrades[upgrade].set(true);
        
        // Recalculate lead generation with new upgrade
        const newRate = calculateLeadGeneration(
          salesState$.units.get(),
          salesState$.upgrades.get()
        );
        salesState$.metrics.leadsPerSecond.set(newRate);
        
        return true;
      }
      return false;
    },
  };
};

export const salesState = salesState$;
```

**Validation Criteria**:
- [ ] Sales state updates correctly when hiring reps
- [ ] Lead generation rates calculate properly
- [ ] Revenue conversion consumes appropriate resources
- [ ] Upgrades apply multipliers correctly

#### Task 3.2: Feature Generation System
**Time Estimate**: 4 hours  
**Description**: Enhance development department to generate different feature types

Update `src/features/development/state/developmentStore.ts`:
```typescript
// Add to existing DevelopmentState interface
interface DevelopmentState {
  developers: DeveloperUnits;
  upgrades: DepartmentUpgrades;
  production: {
    linesPerSecond: number;
    totalProduced: number;
  };
  featureGeneration: {
    basicPerSecond: number;
    advancedPerSecond: number;
    premiumPerSecond: number;
  };
}

// Update initial state
const developmentState$ = observable<DevelopmentState>({
  developers: { junior: 0, mid: 0, senior: 0, techLead: 0 },
  upgrades: { betterIdes: false, pairProgramming: false, codeReviews: false },
  production: { linesPerSecond: 0, totalProduced: 0 },
  featureGeneration: { basicPerSecond: 0, advancedPerSecond: 0, premiumPerSecond: 0 },
});

// Update feature generation calculations
const calculateFeatureGeneration = (linesPerSecond: number) => {
  // Convert lines of code to features with diminishing returns
  const basicPerSecond = linesPerSecond * 0.1; // Every 10 lines = 1 basic feature
  const advancedPerSecond = linesPerSecond * 0.01; // Every 100 lines = 1 advanced feature
  const premiumPerSecond = linesPerSecond * 0.001; // Every 1000 lines = 1 premium feature
  
  return { basicPerSecond, advancedPerSecond, premiumPerSecond };
};

// Add to useDevelopment hook
export const useDevelopment = () => {
  return {
    // ... existing methods
    
    generateFeatures: (deltaTime: number): { basic: number; advanced: number; premium: number } => {
      const rates = developmentState$.featureGeneration.get();
      const timeMultiplier = deltaTime / 1000;
      
      return {
        basic: rates.basicPerSecond * timeMultiplier,
        advanced: rates.advancedPerSecond * timeMultiplier,
        premium: rates.premiumPerSecond * timeMultiplier,
      };
    },
    
    // Update hireDeveloper to recalculate feature generation
    hireDeveloper: (type: DeveloperType, playerMoney: number): boolean => {
      const currentCount = developmentState$.developers[type].get();
      const cost = getDeveloperCost(type, currentCount);
      
      if (playerMoney >= cost) {
        developmentState$.developers[type].set(currentCount + 1);
        
        // Recalculate production
        const newRate = calculateProductionRate(
          developmentState$.developers.get(),
          developmentState$.upgrades.get()
        );
        developmentState$.production.linesPerSecond.set(newRate);
        
        // Recalculate feature generation
        const featureRates = calculateFeatureGeneration(newRate);
        developmentState$.featureGeneration.set(featureRates);
        
        return true;
      }
      
      return false;
    },
  };
};
```

**Validation Criteria**:
- [ ] Feature generation rates scale with code production
- [ ] Different feature types generate at appropriate rates
- [ ] Feature generation updates when hiring developers

#### Task 3.3: Sales Department UI Components
**Time Estimate**: 6 hours  
**Description**: Create sales department UI following vertical slicing patterns

Create `src/features/sales/components/SalesTab.tsx`:
```typescript
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSales } from '../state/salesStore';
import { usePlayer } from '@/features/core/state/playerStore';
import { Button } from '@/shared/ui/Button';
import { AnimatedNumber } from '@/shared/ui/AnimatedNumber';
import { SalesRepType } from '../state/salesStore';
import { AudioManager } from '@/shared/audio/AudioManager';

const salesRepInfo = {
  rep: { name: 'Sales Rep', description: '0.2 leads/sec' },
  manager: { name: 'Sales Manager', description: '1.0 leads/sec' },
  director: { name: 'Sales Director', description: '5.0 leads/sec' },
  vpSales: { name: 'VP Sales', description: '20.0 leads/sec + 15% dept bonus' },
};

const upgradeInfo = {
  betterCRM: { name: 'Better CRM', description: '+30% leads', cost: 5000 },
  salesTraining: { name: 'Sales Training', description: '+50% leads', cost: 25000 },
  marketResearch: { name: 'Market Research', description: '+20% leads', cost: 100000 },
};

export const SalesTab: React.FC = () => {
  const sales = useSales();
  const player = usePlayer();
  const { money, leads, features } = player.resources;
  
  const handleHireSalesRep = (type: SalesRepType) => {
    const cost = sales.getSalesRepCost(type);
    const success = sales.hireSalesRep(type, money);
    
    if (success) {
      player.modifyResource('money', -cost);
      AudioManager.playSound('levelup');
    }
  };
  
  const handleConvertRevenue = () => {
    if (leads > 0 && (features.basic > 0 || features.advanced > 0 || features.premium > 0)) {
      const result = sales.convertRevenue(leads, features);
      
      if (result.revenue > 0) {
        player.modifyResource('money', result.revenue);
        player.modifyResource('leads', -result.consumedLeads);
        player.modifyResource('features', {
          basic: -result.consumedFeatures.basic,
          advanced: -result.consumedFeatures.advanced,
          premium: -result.consumedFeatures.premium,
        });
        AudioManager.playSound('cash');
      }
    }
  };
  
  const handlePurchaseUpgrade = (upgrade: keyof typeof upgradeInfo) => {
    const cost = upgradeInfo[upgrade].cost;
    const success = sales.purchaseUpgrade(upgrade, cost, money);
    
    if (success) {
      player.modifyResource('money', -cost);
      AudioManager.playSound('levelup');
    }
  };
  
  const canConvert = leads > 0 && (features.basic > 0 || features.advanced > 0 || features.premium > 0);
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Sales Department</Text>
      
      <View style={styles.metrics}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Lead Generation</Text>
          <Text style={styles.metricValue}>
            {sales.metrics.leadsPerSecond.toFixed(1)} leads/sec
          </Text>
        </View>
        
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Total Revenue</Text>
          <AnimatedNumber 
            value={sales.metrics.totalRevenue}
            style={styles.metricValue}
            formatter={(n) => `$${n.toLocaleString()}`}
          />
        </View>
      </View>
      
      <View style={styles.conversionSection}>
        <Text style={styles.sectionTitle}>Revenue Conversion</Text>
        <Text style={styles.conversionInfo}>
          Leads: {Math.floor(leads)} | Features: {features.basic}B, {features.advanced}A, {features.premium}P
        </Text>
        <Button
          title="Convert to Revenue"
          onPress={handleConvertRevenue}
          disabled={!canConvert}
          variant={canConvert ? 'primary' : 'secondary'}
        />
      </View>
      
      <Text style={styles.sectionTitle}>Hire Sales Team</Text>
      {Object.entries(salesRepInfo).map(([type, info]) => {
        const repType = type as SalesRepType;
        const count = sales.units[repType];
        const cost = sales.getSalesRepCost(repType);
        const canAfford = money >= cost;
        
        return (
          <View key={type} style={styles.repRow}>
            <View style={styles.repInfo}>
              <Text style={styles.repName}>
                {info.name} ({count})
              </Text>
              <Text style={styles.repDescription}>
                {info.description}
              </Text>
            </View>
            <Button
              title="Hire"
              onPress={() => handleHireSalesRep(repType)}
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
        const purchased = sales.upgrades[upgradeKey];
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
  conversionSection: {
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 20,
  },
  conversionInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  repRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
  },
  repInfo: {
    flex: 1,
    marginRight: 12,
  },
  repName: {
    fontSize: 16,
    fontWeight: '600',
  },
  repDescription: {
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

**Validation Criteria**:
- [ ] Sales department UI displays correctly
- [ ] Hiring sales reps updates lead generation
- [ ] Revenue conversion works with proper resource consumption
- [ ] Upgrades purchase correctly and apply bonuses

## Sprint 4: Customer Experience Department (Week 7-8)

### Objectives
- [ ] Implement customer experience department for revenue optimization
- [ ] Create support ticket generation and resolution mechanics
- [ ] Add customer satisfaction multipliers
- [ ] Establish referral lead generation system

### Tasks & Implementation

#### Task 4.1: Customer Experience State Management
**Time Estimate**: 6 hours  
**Description**: Create customer experience vertical slice

Create `src/features/customer-exp/state/customerStore.ts`:
```typescript
import { observable } from '@legendapp/state';

export type SupportType = 'support' | 'specialist' | 'manager' | 'director';

export interface SupportUnits {
  support: number;
  specialist: number;
  manager: number;
  director: number;
}

export interface CustomerUpgrades {
  betterTools: boolean;
  customerTraining: boolean;
  priorityQueue: boolean;
}

interface CustomerState {
  units: SupportUnits;
  upgrades: CustomerUpgrades;
  metrics: {
    ticketsPerSecond: number;
    satisfactionMultiplier: number;
    referralLeadsPerSecond: number;
    ticketsResolved: number;
  };
}

const customerState$ = observable<CustomerState>({
  units: { support: 0, specialist: 0, manager: 0, director: 0 },
  upgrades: { betterTools: false, customerTraining: false, priorityQueue: false },
  metrics: {
    ticketsPerSecond: 0,
    satisfactionMultiplier: 1.0,
    referralLeadsPerSecond: 0,
    ticketsResolved: 0,
  },
});

const getSupportRepCost = (type: SupportType, currentCount: number): number => {
  const baseCosts = {
    support: 200,
    specialist: 2000,
    manager: 20000,
    director: 200000,
  };
  
  return Math.floor(baseCosts[type] * Math.pow(1.18, currentCount));
};

const calculateSatisfactionMetrics = (
  units: SupportUnits, 
  upgrades: CustomerUpgrades,
  revenueActivity: number
) => {
  // Calculate ticket resolution rate
  const resolutionRates = {
    support: 0.5,
    specialist: 2.0,
    manager: 8.0,
    director: 30.0,
  };
  
  let totalResolution = 0;
  Object.entries(units).forEach(([type, count]) => {
    totalResolution += resolutionRates[type as SupportType] * count;
  });
  
  // Apply upgrades
  let efficiencyMultiplier = 1.0;
  if (upgrades.betterTools) efficiencyMultiplier *= 1.4;
  if (upgrades.customerTraining) efficiencyMultiplier *= 1.6;
  if (upgrades.priorityQueue) efficiencyMultiplier *= 1.3;
  
  // Director department bonus
  if (units.director > 0) efficiencyMultiplier *= 1.2;
  
  totalResolution *= efficiencyMultiplier;
  
  // Calculate satisfaction multiplier based on support coverage
  // More revenue activity generates more tickets, need more support
  const ticketGeneration = Math.max(0.1, revenueActivity * 0.01);
  const coverage = totalResolution / Math.max(ticketGeneration, 0.1);
  const satisfactionMultiplier = Math.min(3.0, 1.0 + Math.log(coverage + 1) * 0.5);
  
  // Referral leads based on satisfaction
  const referralRate = Math.max(0, (satisfactionMultiplier - 1.0) * totalResolution * 0.1);
  
  return {
    ticketsPerSecond: totalResolution,
    satisfactionMultiplier,
    referralLeadsPerSecond: referralRate,
  };
};

export const useCustomerExp = () => {
  return {
    // Read-only state access
    units: customerState$.units.get(),
    upgrades: customerState$.upgrades.get(),
    metrics: customerState$.metrics.get(),
    
    // Actions
    hireSupportRep: (type: SupportType, playerMoney: number): boolean => {
      const currentCount = customerState$.units[type].get();
      const cost = getSupportRepCost(type, currentCount);
      
      if (playerMoney >= cost) {
        customerState$.units[type].set(currentCount + 1);
        return true;
      }
      
      return false;
    },
    
    getSupportRepCost: (type: SupportType): number => {
      const currentCount = customerState$.units[type].get();
      return getSupportRepCost(type, currentCount);
    },
    
    updateMetrics: (revenueActivity: number): void => {
      const newMetrics = calculateSatisfactionMetrics(
        customerState$.units.get(),
        customerState$.upgrades.get(),
        revenueActivity
      );
      
      customerState$.metrics.ticketsPerSecond.set(newMetrics.ticketsPerSecond);
      customerState$.metrics.satisfactionMultiplier.set(newMetrics.satisfactionMultiplier);
      customerState$.metrics.referralLeadsPerSecond.set(newMetrics.referralLeadsPerSecond);
    },
    
    generateReferralLeads: (deltaTime: number): number => {
      const rate = customerState$.metrics.referralLeadsPerSecond.get();
      return rate * (deltaTime / 1000);
    },
    
    purchaseUpgrade: (
      upgrade: keyof CustomerUpgrades,
      cost: number,
      playerMoney: number
    ): boolean => {
      if (playerMoney >= cost && !customerState$.upgrades[upgrade].get()) {
        customerState$.upgrades[upgrade].set(true);
        return true;
      }
      return false;
    },
  };
};

export const customerState = customerState$;
```

#### Task 4.2: Revenue Multiplier Integration
**Time Estimate**: 4 hours  
**Description**: Update sales system to use customer satisfaction multipliers

Update `src/features/sales/state/salesStore.ts` to include satisfaction multipliers:
```typescript
// Add to convertRevenue method
convertRevenue: (
  leads: number,
  features: { basic: number; advanced: number; premium: number },
  satisfactionMultiplier: number = 1.0
): { revenue: number; consumedFeatures: typeof features; consumedLeads: number } => {
  const conversionRates = salesState$.metrics.conversionRates.get();
  const baseRevenue = calculateRevenue(leads, features, conversionRates);
  
  // Apply satisfaction multiplier
  const revenue = Math.floor(baseRevenue * satisfactionMultiplier);
  
  // Calculate consumed resources (same as before)
  const basicUsed = Math.min(features.basic, Math.floor(leads * conversionRates.basic));
  const advancedUsed = Math.min(features.advanced, Math.floor(leads * conversionRates.advanced));
  const premiumUsed = Math.min(features.premium, Math.floor(leads * conversionRates.premium));
  
  const consumedFeatures = {
    basic: basicUsed,
    advanced: advancedUsed,
    premium: premiumUsed,
  };
  
  const totalLeadsUsed = basicUsed + advancedUsed + premiumUsed;
  
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

#### Task 4.3: Production Loop Integration
**Time Estimate**: 4 hours  
**Description**: Update main game loop to coordinate all departments

Update `src/features/core/components/MainClicker.tsx`:
```typescript
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { usePlayer } from '../state/playerStore';
import { useDevelopment } from '@/features/development/state/developmentStore';
import { useSales } from '@/features/sales/state/salesStore';
import { useCustomerExp } from '@/features/customer-exp/state/customerStore';
import { Button } from '@/shared/ui/Button';
import { AnimatedNumber } from '@/shared/ui/AnimatedNumber';
import { AudioManager } from '@/shared/audio/AudioManager';

export const MainClicker: React.FC = () => {
  const player = usePlayer();
  const development = useDevelopment();
  const sales = useSales();
  const customerExp = useCustomerExp();
  
  const { linesOfCode, money, leads, features } = player.resources;
  
  // Integrated production loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Development: Generate lines of code and features
      const linesProduced = development.updateProduction(1000);
      const featuresGenerated = development.generateFeatures(1000);
      
      if (linesProduced > 0) {
        player.modifyResource('linesOfCode', linesProduced);
        player.modifyResource('features', featuresGenerated);
      }
      
      // Sales: Generate leads
      const leadsGenerated = sales.generateLeads(1000);
      if (leadsGenerated > 0) {
        player.modifyResource('leads', leadsGenerated);
      }
      
      // Customer Experience: Update satisfaction and generate referrals
      customerExp.updateMetrics(sales.metrics.totalRevenue);
      const referralLeads = customerExp.generateReferralLeads(1000);
      if (referralLeads > 0) {
        player.modifyResource('leads', referralLeads);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleClick = () => {
    player.modifyResource('linesOfCode', 1);
    AudioManager.playSound('click');
  };
  
  const handleAutoConvert = () => {
    // Auto-convert revenue with satisfaction multiplier
    if (leads > 0 && (features.basic > 0 || features.advanced > 0 || features.premium > 0)) {
      const satisfactionMultiplier = customerExp.metrics.satisfactionMultiplier;
      const result = sales.convertRevenue(leads, features, satisfactionMultiplier);
      
      if (result.revenue > 0) {
        player.modifyResource('money', result.revenue);
        player.modifyResource('leads', -result.consumedLeads);
        player.modifyResource('features', {
          basic: -result.consumedFeatures.basic,
          advanced: -result.consumedFeatures.advanced,
          premium: -result.consumedFeatures.premium,
        });
        AudioManager.playSound('cash');
      }
    }
  };
  
  const satisfactionBonus = customerExp.metrics.satisfactionMultiplier;
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>PetSoft Tycoon</Text>
      
      <View style={styles.resourceDisplay}>
        <View style={styles.resourceRow}>
          <View style={styles.resource}>
            <Text style={styles.resourceLabel}>Lines of Code</Text>
            <AnimatedNumber value={linesOfCode} style={styles.resourceValue} />
          </View>
          
          <View style={styles.resource}>
            <Text style={styles.resourceLabel}>Money</Text>
            <AnimatedNumber 
              value={money} 
              style={styles.resourceValue}
              formatter={(n) => `$${n.toLocaleString()}`}
            />
          </View>
        </View>
        
        <View style={styles.resourceRow}>
          <View style={styles.resource}>
            <Text style={styles.resourceLabel}>Leads</Text>
            <AnimatedNumber value={Math.floor(leads)} style={styles.resourceValue} />
          </View>
          
          <View style={styles.resource}>
            <Text style={styles.resourceLabel}>Features</Text>
            <Text style={styles.resourceValue}>
              {features.basic}B {features.advanced}A {features.premium}P
            </Text>
          </View>
        </View>
      </View>
      
      {satisfactionBonus > 1.0 && (
        <View style={styles.bonusDisplay}>
          <Text style={styles.bonusText}>
            Customer Satisfaction: {satisfactionBonus.toFixed(2)}x revenue!
          </Text>
        </View>
      )}
      
      <TouchableOpacity style={styles.clickButton} onPress={handleClick}>
        <Text style={styles.clickText}>✨ CLICK TO CODE ✨</Text>
      </TouchableOpacity>
      
      <View style={styles.actions}>
        <Button
          title="Auto-Convert Revenue"
          onPress={handleAutoConvert}
          disabled={leads === 0 || (features.basic === 0 && features.advanced === 0 && features.premium === 0)}
          variant="primary"
        />
      </View>
      
      <View style={styles.productionStats}>
        <Text style={styles.statText}>
          Code: {development.production.linesPerSecond.toFixed(1)}/sec
        </Text>
        <Text style={styles.statText}>
          Leads: {sales.metrics.leadsPerSecond.toFixed(1)}/sec
        </Text>
        <Text style={styles.statText}>
          Support: {customerExp.metrics.ticketsPerSecond.toFixed(1)}/sec
        </Text>
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
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  resourceDisplay: {
    marginBottom: 30,
  },
  resourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  resource: {
    alignItems: 'center',
  },
  resourceLabel: {
    fontSize: 14,
    color: '#666',
  },
  resourceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  bonusDisplay: {
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  bonusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#228B22',
  },
  clickButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 50,
    paddingVertical: 30,
    paddingHorizontal: 40,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  clickText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  actions: {
    marginBottom: 20,
  },
  productionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
});
```

#### Task 4.4: Tab Navigation System
**Time Estimate**: 4 hours  
**Description**: Create navigation between department tabs

```bash
# Install navigation dependencies
npm install @react-navigation/native @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context
```

Create `src/app/navigation/MainTabs.tsx`:
```typescript
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { MainClicker } from '@/features/core/components/MainClicker';
import { DeveloperList } from '@/features/development/components/DeveloperList';
import { SalesTab } from '@/features/sales/components/SalesTab';
import { CustomerTab } from '@/features/customer-exp/components/CustomerTab';

const Tab = createBottomTabNavigator();

export const MainTabs: React.FC = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: { height: 80, paddingBottom: 20, paddingTop: 10 },
          headerStyle: { backgroundColor: '#007AFF' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Tab.Screen 
          name="Game" 
          component={MainClicker} 
          options={{
            title: 'Main Game',
            tabBarLabel: 'Game',
          }}
        />
        <Tab.Screen 
          name="Development" 
          component={DeveloperList} 
          options={{
            title: 'Development Dept',
            tabBarLabel: 'Dev',
          }}
        />
        <Tab.Screen 
          name="Sales" 
          component={SalesTab} 
          options={{
            title: 'Sales Department',
            tabBarLabel: 'Sales',
          }}
        />
        <Tab.Screen 
          name="Support" 
          component={CustomerTab} 
          options={{
            title: 'Customer Experience',
            tabBarLabel: 'Support',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
```

## Validation & Testing

### Functional Testing
- [ ] Development department generates features correctly
- [ ] Sales department consumes features and generates revenue
- [ ] Customer experience provides satisfaction multipliers
- [ ] Cross-department resource flows work properly
- [ ] Tab navigation functions without errors

### Performance Testing
- [ ] Game maintains 30+ FPS with three departments active
- [ ] Memory usage stays under 150MB
- [ ] Production loops don't cause frame drops
- [ ] Tab switching is smooth and responsive

### Integration Testing
- [ ] Save/load preserves all department states
- [ ] Production rates calculate correctly
- [ ] Resource consumption balances properly
- [ ] UI updates reflect state changes accurately

## Deliverables

At the end of Core Features phase:

1. **Complete Revenue Loop**: Full cycle from code → features → leads → revenue
2. **Three Departments**: Development, Sales, and Customer Experience working together  
3. **Cross-Department Coordination**: Resource flows and multiplier effects
4. **Tab Navigation**: Easy switching between department management screens
5. **Integrated Production**: All departments running in coordinated game loop

## Next Steps

Core Features completion enables:
- **Integration Phase**: Add remaining four departments (Product, Design, QA, Marketing)
- **Advanced Systems**: Prestige mechanics and super units
- **Quality Phase**: Performance optimization and polish
- **Deployment Phase**: Production builds and release

---

**Core Features Complete**: Foundational idle clicker mechanics established with three-department ecosystem and integrated resource management following vertical slicing architecture.