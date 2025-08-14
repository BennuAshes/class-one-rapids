# Phase 03: Integration - Department Systems and Upgrades

## Objectives

- Implement all 7 departments with unique mechanics
- Create comprehensive upgrade system
- Add manager automation for all departments
- Implement department unlock progression
- Establish prestige system foundation

## Success Criteria

- [ ] All 7 departments operational with unique mechanics
- [ ] Progressive unlock system working (Sales at $500, etc.)
- [ ] Upgrade trees providing meaningful bonuses
- [ ] Manager automation reducing manual interaction
- [ ] Department synergies and cross-department effects
- [ ] Revenue pipeline: Features + Leads = Revenue

## Time Estimate: 2 Weeks

---

## Task 1: Sales Department Implementation

### 1.1 Sales Service (3 hours)

**Objective**: Implement lead generation and revenue conversion

**Create src/features/departments/sales/SalesService.ts**:
```typescript
import { observable, computed } from '@legendapp/state';
import { BaseService } from '../../../core/StateManager';
import { eventBus } from '../../../core/EventBus';
import { Result } from '../../../core/Result';
import type { SalesState, LeadConversionResult } from './types/SalesTypes';

export class SalesService extends BaseService {
  protected _state$ = observable<SalesState>({
    unlocked: false,
    unlockThreshold: 500,
    employees: {
      salesRep: { owned: 0, baseCost: 100, leadGeneration: 0.2 },
      accountManager: { owned: 0, baseCost: 1000, leadGeneration: 1.0 },
      salesDirector: { owned: 0, baseCost: 10000, leadGeneration: 5.0 },
      vpSales: { owned: 0, baseCost: 100000, leadGeneration: 20.0 }
    },
    leads: 0,
    totalLeadGeneration: 0,
    conversionRate: 1.0,
    departmentBonus: 1.0,
    statistics: {
      totalLeadsGenerated: 0,
      totalRevenueGenerated: 0,
      conversionHistory: []
    }
  });

  private _displayData$ = computed(() => {
    const state = this._state$.peek();
    return {
      unlocked: state.unlocked,
      unlockProgress: this._calculateUnlockProgress(),
      employees: Object.entries(state.employees).map(([type, employee]) => ({
        type,
        name: this._getEmployeeName(type),
        owned: employee.owned,
        cost: this._calculateCost(employee.baseCost, employee.owned),
        leadGeneration: employee.owned * employee.leadGeneration * state.departmentBonus,
        description: this._getEmployeeDescription(type)
      })),
      leads: Math.floor(state.leads),
      leadGeneration: state.totalLeadGeneration,
      conversionRate: state.conversionRate,
      nextRevenueEstimate: this._estimateNextRevenue()
    };
  });

  constructor() {
    super();
    this._setupEventListeners();
    this._startLeadGeneration();
    this._startRevenueConversion();
  }

  public hireEmployee(employeeType: string): Promise<Result<void, Error>> {
    const employee = this._state$.employees[employeeType].peek();
    const cost = this._calculateCost(employee.baseCost, employee.owned);

    return new Promise((resolve) => {
      const subscription = eventBus.once('funds.response', (response: { success: boolean; error?: string }) => {
        if (response.success) {
          this._state$.employees[employeeType].owned.set(current => current + 1);
          this._updateLeadGeneration();
          
          eventBus.emit('employee.hired', {
            department: 'sales',
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
        purpose: 'hire_sales_employee',
        requester: 'sales'
      });
    });
  }

  public getDisplayData() {
    return this._displayData$.peek();
  }

  public subscribe(callback: (data: any) => void) {
    return this._displayData$.onChange(callback);
  }

  private _calculateUnlockProgress(): number {
    // This will be updated by event listener
    return 0;
  }

  private _getEmployeeName(type: string): string {
    const names = {
      salesRep: 'Sales Rep',
      accountManager: 'Account Manager',
      salesDirector: 'Sales Director',
      vpSales: 'VP Sales'
    };
    return names[type] || type;
  }

  private _getEmployeeDescription(type: string): string {
    const descriptions = {
      salesRep: 'Entry-level sales, generates leads',
      accountManager: 'Manages existing accounts',
      salesDirector: 'Leads sales team strategy',
      vpSales: 'Department leader, provides 15% boost'
    };
    return descriptions[type] || '';
  }

  private _calculateCost(baseCost: number, owned: number): number {
    return Math.floor(baseCost * Math.pow(1.15, owned));
  }

  private _updateLeadGeneration(): void {
    const state = this._state$.peek();
    let total = 0;
    
    Object.entries(state.employees).forEach(([type, employee]) => {
      total += employee.owned * employee.leadGeneration;
    });
    
    // Apply department bonus (VP Sales provides 15% boost)
    const vpSalesCount = state.employees.vpSales.owned;
    const departmentBonus = 1 + (vpSalesCount * 0.15);
    
    this._state$.totalLeadGeneration.set(total * departmentBonus);
    this._state$.departmentBonus.set(departmentBonus);
  }

  private _startLeadGeneration(): void {
    setInterval(() => {
      const leadGeneration = this._state$.totalLeadGeneration.peek();
      if (leadGeneration > 0) {
        this._state$.leads.set(current => current + leadGeneration);
        this._state$.statistics.totalLeadsGenerated.set(current => current + leadGeneration);
        
        eventBus.emit('leads.generated', {
          amount: leadGeneration,
          source: 'sales_team'
        });
      }
    }, 1000);
  }

  private _startRevenueConversion(): void {
    setInterval(() => {
      this._convertLeadsToRevenue();
    }, 1000);
  }

  private _convertLeadsToRevenue(): void {
    const leads = this._state$.leads.peek();
    if (leads < 1) return;

    // Get available features for conversion
    eventBus.emit('features.request', {});
    eventBus.once('features.response', (features: { basic: number; advanced: number; premium: number }) => {
      const result = this._calculateRevenue(leads, features);
      
      if (result.revenue > 0) {
        // Consume leads and features
        this._state$.leads.set(current => Math.max(0, current - result.leadsUsed));
        
        // Generate revenue
        eventBus.emit('resources.generated', {
          type: 'revenue',
          amount: result.revenue,
          source: 'sales_conversion'
        });
        
        // Consume features
        eventBus.emit('features.consumed', {
          basic: result.featuresUsed.basic,
          advanced: result.featuresUsed.advanced,
          premium: result.featuresUsed.premium
        });
        
        this._state$.statistics.totalRevenueGenerated.set(current => current + result.revenue);
      }
    });
  }

  private _calculateRevenue(leads: number, features: { basic: number; advanced: number; premium: number }): LeadConversionResult {
    const conversionRate = this._state$.conversionRate.peek();
    const effectiveLeads = Math.floor(leads * conversionRate);
    
    let revenue = 0;
    let leadsUsed = 0;
    const featuresUsed = { basic: 0, advanced: 0, premium: 0 };
    
    // Convert with premium features first (highest value)
    const premiumConversions = Math.min(effectiveLeads, features.premium);
    revenue += premiumConversions * 5000;
    leadsUsed += premiumConversions;
    featuresUsed.premium = premiumConversions;
    
    // Then advanced features
    const remainingLeads = effectiveLeads - premiumConversions;
    const advancedConversions = Math.min(remainingLeads, features.advanced);
    revenue += advancedConversions * 500;
    leadsUsed += advancedConversions;
    featuresUsed.advanced = advancedConversions;
    
    // Finally basic features
    const stillRemainingLeads = remainingLeads - advancedConversions;
    const basicConversions = Math.min(stillRemainingLeads, features.basic);
    revenue += basicConversions * 50;
    leadsUsed += basicConversions;
    featuresUsed.basic = basicConversions;
    
    return {
      revenue,
      leadsUsed,
      featuresUsed
    };
  }

  private _estimateNextRevenue(): number {
    const leads = this._state$.leads.peek();
    if (leads < 1) return 0;
    
    // Simple estimation - would be more sophisticated in real implementation
    return Math.floor(leads * 50); // Assuming basic features
  }

  private _setupEventListeners(): void {
    // Listen for unlock trigger
    eventBus.on('revenue.milestone', (data: { total: number }) => {
      if (!this._state$.unlocked.peek() && data.total >= this._state$.unlockThreshold.peek()) {
        this._state$.unlocked.set(true);
        eventBus.emit('department.unlocked', {
          department: 'sales',
          milestone: this._state$.unlockThreshold.peek()
        });
      }
    });
    
    // Listen for upgrade effects
    eventBus.on('upgrade.sales', (data: { type: string; multiplier: number }) => {
      if (data.type === 'conversionRate') {
        this._state$.conversionRate.set(current => current * data.multiplier);
      }
    });
  }

  public destroy(): void {
    super.destroy();
  }
}
```

**Create src/features/departments/sales/types/SalesTypes.ts**:
```typescript
export interface SalesEmployee {
  owned: number;
  baseCost: number;
  leadGeneration: number;
}

export interface SalesState {
  unlocked: boolean;
  unlockThreshold: number;
  employees: {
    salesRep: SalesEmployee;
    accountManager: SalesEmployee;
    salesDirector: SalesEmployee;
    vpSales: SalesEmployee;
  };
  leads: number;
  totalLeadGeneration: number;
  conversionRate: number;
  departmentBonus: number;
  statistics: {
    totalLeadsGenerated: number;
    totalRevenueGenerated: number;
    conversionHistory: ConversionRecord[];
  };
}

export interface LeadConversionResult {
  revenue: number;
  leadsUsed: number;
  featuresUsed: {
    basic: number;
    advanced: number;
    premium: number;
  };
}

export interface ConversionRecord {
  timestamp: number;
  leads: number;
  features: { basic: number; advanced: number; premium: number };
  revenue: number;
}
```

### 1.2 Sales Department Component (2 hours)

**Create src/features/departments/sales/components/SalesDepartment.tsx**:
```typescript
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { observer } from '@legendapp/state/react';
import { SalesService } from '../SalesService';
import { CurrencyService } from '../../../currency/CurrencyService';
import { HireButton } from '../../../employees/components/HireButton';
import { ProgressBar } from '../../../ui/components/ProgressBar';

interface SalesDepartmentProps {
  salesService: SalesService;
  currencyService: CurrencyService;
}

export const SalesDepartment = observer(({ salesService, currencyService }: SalesDepartmentProps) => {
  const salesData = salesService.getDisplayData();

  if (!salesData.unlocked) {
    return (
      <View style={styles.lockedContainer}>
        <Text style={styles.lockedTitle}>Sales Department</Text>
        <Text style={styles.lockedDescription}>
          Unlock at $500 total revenue to start generating leads and converting features to revenue.
        </Text>
        <ProgressBar 
          current={salesData.unlockProgress} 
          target={500} 
          label="Revenue needed"
        />
      </View>
    );
  }

  const handleHire = async (employeeType: string) => {
    const result = await salesService.hireEmployee(employeeType);
    if (!result.success) {
      console.log('Cannot hire:', result.error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sales Department</Text>
        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Leads</Text>
            <Text style={styles.metricValue}>{salesData.leads}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Lead Generation</Text>
            <Text style={styles.metricValue}>{salesData.leadGeneration.toFixed(1)}/sec</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Next Revenue</Text>
            <Text style={styles.metricValue}>${salesData.nextRevenueEstimate}</Text>
          </View>
        </View>
      </View>

      {salesData.employees.map((employee) => (
        <View key={employee.type} style={styles.employeeCard}>
          <View style={styles.employeeInfo}>
            <Text style={styles.employeeName}>{employee.name}</Text>
            <Text style={styles.employeeDescription}>{employee.description}</Text>
            
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Owned</Text>
                <Text style={styles.statValue}>{employee.owned}</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Lead Gen</Text>
                <Text style={styles.statValue}>{employee.leadGeneration.toFixed(1)}/sec</Text>
              </View>
            </View>
          </View>

          <HireButton
            cost={employee.cost}
            canAfford={currencyService.canAfford('revenue', employee.cost)}
            onPress={() => handleHire(employee.type)}
          />
        </View>
      ))}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  lockedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  lockedDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  employeeCard: {
    backgroundColor: 'white',
    margin: 8,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  employeeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
  },
  stat: {
    marginRight: 20,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});
```

**Validation**: Sales department unlocks at $500, generates leads, converts to revenue

---

## Task 2: Customer Experience Department

### 2.1 Customer Experience Service (3 hours)

**Objective**: Implement support ticket resolution and satisfaction multipliers

**Create src/features/departments/customerExperience/CustomerExperienceService.ts**:
```typescript
import { observable, computed } from '@legendapp/state';
import { BaseService } from '../../../core/StateManager';
import { eventBus } from '../../../core/EventBus';
import { Result } from '../../../core/Result';
import type { CustomerExperienceState, TicketResolutionResult } from './types/CustomerExperienceTypes';

export class CustomerExperienceService extends BaseService {
  protected _state$ = observable<CustomerExperienceState>({
    unlocked: false,
    unlockThreshold: 2500, // Unlocks after Sales
    employees: {
      supportAgent: { owned: 0, baseCost: 250, ticketResolution: 0.1 },
      cxSpecialist: { owned: 0, baseCost: 2500, ticketResolution: 0.5 },
      cxManager: { owned: 0, baseCost: 25000, ticketResolution: 2.5 },
      cxDirector: { owned: 0, baseCost: 250000, ticketResolution: 10.0 }
    },
    tickets: 0,
    ticketResolutionRate: 0,
    customerSatisfaction: 0.5, // 0-1 scale
    retentionMultiplier: 1.0,
    departmentBonus: 1.0,
    statistics: {
      totalTicketsResolved: 0,
      averageSatisfaction: 0.5,
      retentionHistory: []
    }
  });

  private _displayData$ = computed(() => {
    const state = this._state$.peek();
    return {
      unlocked: state.unlocked,
      unlockProgress: this._calculateUnlockProgress(),
      employees: Object.entries(state.employees).map(([type, employee]) => ({
        type,
        name: this._getEmployeeName(type),
        owned: employee.owned,
        cost: this._calculateCost(employee.baseCost, employee.owned),
        ticketResolution: employee.owned * employee.ticketResolution * state.departmentBonus,
        description: this._getEmployeeDescription(type)
      })),
      tickets: Math.floor(state.tickets),
      ticketResolutionRate: state.ticketResolutionRate,
      customerSatisfaction: state.customerSatisfaction,
      revenueMultiplier: this._calculateRevenueMultiplier(),
      retentionRate: this._calculateRetentionRate()
    };
  });

  constructor() {
    super();
    this._setupEventListeners();
    this._startTicketResolution();
  }

  public hireEmployee(employeeType: string): Promise<Result<void, Error>> {
    const employee = this._state$.employees[employeeType].peek();
    const cost = this._calculateCost(employee.baseCost, employee.owned);

    return new Promise((resolve) => {
      const subscription = eventBus.once('funds.response', (response: { success: boolean; error?: string }) => {
        if (response.success) {
          this._state$.employees[employeeType].owned.set(current => current + 1);
          this._updateTicketResolution();
          
          eventBus.emit('employee.hired', {
            department: 'customerExperience',
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
        purpose: 'hire_cx_employee',
        requester: 'customerExperience'
      });
    });
  }

  public getDisplayData() {
    return this._displayData$.peek();
  }

  public subscribe(callback: (data: any) => void) {
    return this._displayData$.onChange(callback);
  }

  private _getEmployeeName(type: string): string {
    const names = {
      supportAgent: 'Support Agent',
      cxSpecialist: 'CX Specialist', 
      cxManager: 'CX Manager',
      cxDirector: 'CX Director'
    };
    return names[type] || type;
  }

  private _getEmployeeDescription(type: string): string {
    const descriptions = {
      supportAgent: 'Resolves basic customer issues',
      cxSpecialist: 'Handles complex customer problems',
      cxManager: 'Improves support processes',
      cxDirector: 'Department leader, retention bonus'
    };
    return descriptions[type] || '';
  }

  private _calculateCost(baseCost: number, owned: number): number {
    return Math.floor(baseCost * Math.pow(1.15, owned));
  }

  private _calculateUnlockProgress(): number {
    // Will be updated by event listener
    return 0;
  }

  private _updateTicketResolution(): void {
    const state = this._state$.peek();
    let total = 0;
    
    Object.entries(state.employees).forEach(([type, employee]) => {
      total += employee.owned * employee.ticketResolution;
    });
    
    // CX Director provides retention bonus
    const cxDirectorCount = state.employees.cxDirector.owned;
    const departmentBonus = 1 + (cxDirectorCount * 0.2); // 20% boost
    
    this._state$.ticketResolutionRate.set(total * departmentBonus);
    this._state$.departmentBonus.set(departmentBonus);
  }

  private _startTicketResolution(): void {
    setInterval(() => {
      const tickets = this._state$.tickets.peek();
      const resolutionRate = this._state$.ticketResolutionRate.peek();
      
      if (tickets > 0 && resolutionRate > 0) {
        const ticketsResolved = Math.min(tickets, resolutionRate);
        
        this._state$.tickets.set(current => current - ticketsResolved);
        this._state$.statistics.totalTicketsResolved.set(current => current + ticketsResolved);
        
        // Update customer satisfaction based on resolution
        this._updateCustomerSatisfaction(ticketsResolved);
        
        eventBus.emit('tickets.resolved', {
          amount: ticketsResolved,
          newSatisfaction: this._state$.customerSatisfaction.peek()
        });
      }
    }, 1000);
  }

  private _updateCustomerSatisfaction(ticketsResolved: number): void {
    const currentSatisfaction = this._state$.customerSatisfaction.peek();
    const tickets = this._state$.tickets.peek();
    
    // Satisfaction improves when tickets are resolved quickly
    // Satisfaction decreases when tickets pile up
    let satisfactionChange = 0;
    
    if (ticketsResolved > 0) {
      satisfactionChange += ticketsResolved * 0.001; // Small positive impact
    }
    
    if (tickets > 100) {
      satisfactionChange -= 0.001; // Negative impact from backlog
    }
    
    const newSatisfaction = Math.max(0, Math.min(1, currentSatisfaction + satisfactionChange));
    this._state$.customerSatisfaction.set(newSatisfaction);
    
    // Update average satisfaction
    const totalResolved = this._state$.statistics.totalTicketsResolved.peek();
    if (totalResolved > 0) {
      const avgSatisfaction = this._state$.statistics.averageSatisfaction.peek();
      const newAvg = (avgSatisfaction * (totalResolved - ticketsResolved) + newSatisfaction * ticketsResolved) / totalResolved;
      this._state$.statistics.averageSatisfaction.set(newAvg);
    }
  }

  private _calculateRevenueMultiplier(): number {
    const satisfaction = this._state$.customerSatisfaction.peek();
    // Satisfaction ranges from 0.5 (1.0x) to 1.0 (3.0x)
    return 1.0 + (satisfaction - 0.5) * 4.0;
  }

  private _calculateRetentionRate(): number {
    const satisfaction = this._state$.customerSatisfaction.peek();
    return Math.min(1.0, satisfaction * 1.8); // Max 90% retention
  }

  private _setupEventListeners(): void {
    // Generate tickets from revenue (customers create support requests)
    eventBus.on('revenue.generated', (data: { amount: number }) => {
      if (data.amount > 0) {
        const newTickets = data.amount * 0.0001; // 0.01% of revenue becomes tickets
        this._state$.tickets.set(current => current + newTickets);
      }
    });

    // Apply satisfaction multiplier to revenue
    eventBus.on('revenue.calculating', (data: { multiplier: number }) => {
      const revenueMultiplier = this._calculateRevenueMultiplier();
      data.multiplier *= revenueMultiplier;
    });

    // Unlock trigger
    eventBus.on('revenue.milestone', (data: { total: number }) => {
      if (!this._state$.unlocked.peek() && data.total >= this._state$.unlockThreshold.peek()) {
        this._state$.unlocked.set(true);
        eventBus.emit('department.unlocked', {
          department: 'customerExperience',
          milestone: this._state$.unlockThreshold.peek()
        });
      }
    });
  }

  public destroy(): void {
    super.destroy();
  }
}
```

**Validation**: Customer experience department processes tickets, improves satisfaction

---

## Task 3: Upgrade System Implementation

### 3.1 Upgrade Service (4 hours)

**Objective**: Create comprehensive upgrade system with prerequisites

**Create src/features/upgrades/UpgradeService.ts**:
```typescript
import { observable, computed } from '@legendapp/state';
import { BaseService } from '../../core/StateManager';
import { eventBus } from '../../core/EventBus';
import { Result } from '../../core/Result';
import { upgradeDefinitions } from './data/UpgradeDefinitions';
import type { UpgradeState, Upgrade, UpgradeEffect } from './types/UpgradeTypes';

export class UpgradeService extends BaseService {
  protected _state$ = observable<UpgradeState>({
    purchasedUpgrades: new Set<string>(),
    availableUpgrades: new Map<string, Upgrade>(),
    departmentEffects: new Map<string, UpgradeEffect[]>(),
    globalEffects: [],
    categories: ['development', 'sales', 'customerExperience', 'global']
  });

  private _displayData$ = computed(() => {
    const state = this._state$.peek();
    return {
      categories: state.categories.map(category => ({
        name: category,
        upgrades: this._getUpgradesForCategory(category),
        purchasedCount: this._getPurchasedCountForCategory(category),
        totalCount: this._getTotalCountForCategory(category)
      })),
      totalPurchased: state.purchasedUpgrades.size,
      nextRecommended: this._getNextRecommendedUpgrade()
    };
  });

  constructor() {
    super();
    this._initializeUpgrades();
    this._setupEventListeners();
  }

  public purchaseUpgrade(upgradeId: string): Promise<Result<void, Error>> {
    const upgrade = upgradeDefinitions.find(u => u.id === upgradeId);
    if (!upgrade) {
      return Promise.resolve(Result.err(new Error('Upgrade not found')));
    }

    // Check prerequisites
    const prereqResult = this._checkPrerequisites(upgrade);
    if (!prereqResult.satisfied) {
      return Promise.resolve(Result.err(new Error(`Prerequisites not met: ${prereqResult.missing.join(', ')}`)));
    }

    // Check if already purchased
    if (this._state$.purchasedUpgrades.has(upgradeId)) {
      return Promise.resolve(Result.err(new Error('Upgrade already purchased')));
    }

    return new Promise((resolve) => {
      const subscription = eventBus.once('funds.response', (response: { success: boolean; error?: string }) => {
        if (response.success) {
          // Purchase successful
          this._state$.purchasedUpgrades.add(upgradeId);
          this._applyUpgradeEffects(upgrade);
          
          eventBus.emit('upgrade.purchased', {
            upgradeId,
            upgrade,
            effects: upgrade.effects
          });
          
          resolve(Result.ok(undefined));
        } else {
          resolve(Result.err(new Error(response.error || 'Insufficient funds')));
        }
      });

      eventBus.emit('funds.requested', {
        amount: upgrade.cost,
        purpose: 'purchase_upgrade',
        requester: 'upgrades'
      });
    });
  }

  public getUpgradesForDepartment(department: string): Upgrade[] {
    return upgradeDefinitions.filter(upgrade => 
      upgrade.department === department && 
      this._checkPrerequisites(upgrade).satisfied
    );
  }

  public isPurchased(upgradeId: string): boolean {
    return this._state$.purchasedUpgrades.has(upgradeId);
  }

  public getDisplayData() {
    return this._displayData$.peek();
  }

  public subscribe(callback: (data: any) => void) {
    return this._displayData$.onChange(callback);
  }

  private _initializeUpgrades(): void {
    upgradeDefinitions.forEach(upgrade => {
      this._state$.availableUpgrades.set(upgrade.id, upgrade);
    });
  }

  private _checkPrerequisites(upgrade: Upgrade): { satisfied: boolean; missing: string[] } {
    const missing: string[] = [];

    upgrade.prerequisites.forEach(prereq => {
      switch (prereq.type) {
        case 'upgrade':
          if (!this._state$.purchasedUpgrades.has(prereq.upgradeId)) {
            missing.push(`Upgrade: ${prereq.upgradeId}`);
          }
          break;
        case 'employee_count':
          // This would check with the employee service
          // For now, assume satisfied
          break;
        case 'revenue_total':
          // This would check with the currency service
          // For now, assume satisfied
          break;
      }
    });

    return {
      satisfied: missing.length === 0,
      missing
    };
  }

  private _applyUpgradeEffects(upgrade: Upgrade): void {
    upgrade.effects.forEach(effect => {
      switch (effect.type) {
        case 'multiplier':
          this._applyMultiplierEffect(effect, upgrade.department);
          break;
        case 'additive':
          this._applyAdditiveEffect(effect, upgrade.department);
          break;
        case 'threshold':
          this._applyThresholdEffect(effect, upgrade.department);
          break;
        case 'unlock':
          this._applyUnlockEffect(effect);
          break;
      }
    });
  }

  private _applyMultiplierEffect(effect: UpgradeEffect, department: string): void {
    eventBus.emit(`upgrade.${department || 'global'}`, {
      type: effect.target,
      multiplier: effect.value,
      upgradeType: 'multiplier'
    });
  }

  private _applyAdditiveEffect(effect: UpgradeEffect, department: string): void {
    eventBus.emit(`upgrade.${department || 'global'}`, {
      type: effect.target,
      addition: effect.value,
      upgradeType: 'additive'
    });
  }

  private _applyThresholdEffect(effect: UpgradeEffect, department: string): void {
    eventBus.emit(`upgrade.${department || 'global'}`, {
      type: effect.target,
      threshold: effect.value,
      upgradeType: 'threshold'
    });
  }

  private _applyUnlockEffect(effect: UpgradeEffect): void {
    eventBus.emit('feature.unlocked', {
      feature: effect.target,
      source: 'upgrade'
    });
  }

  private _getUpgradesForCategory(category: string): any[] {
    return upgradeDefinitions
      .filter(upgrade => upgrade.department === category)
      .map(upgrade => ({
        ...upgrade,
        purchased: this._state$.purchasedUpgrades.has(upgrade.id),
        canPurchase: this._checkPrerequisites(upgrade).satisfied,
        prerequisites: this._checkPrerequisites(upgrade)
      }));
  }

  private _getPurchasedCountForCategory(category: string): number {
    return upgradeDefinitions
      .filter(upgrade => upgrade.department === category)
      .filter(upgrade => this._state$.purchasedUpgrades.has(upgrade.id))
      .length;
  }

  private _getTotalCountForCategory(category: string): number {
    return upgradeDefinitions.filter(upgrade => upgrade.department === category).length;
  }

  private _getNextRecommendedUpgrade(): Upgrade | null {
    // Find the cheapest available upgrade
    const available = upgradeDefinitions.filter(upgrade => 
      !this._state$.purchasedUpgrades.has(upgrade.id) &&
      this._checkPrerequisites(upgrade).satisfied
    );

    if (available.length === 0) return null;

    return available.reduce((cheapest, current) => 
      current.cost < cheapest.cost ? current : cheapest
    );
  }

  private _setupEventListeners(): void {
    // Listen for department state changes to update upgrade availability
    eventBus.on('department.unlocked', () => {
      // Trigger recomputation of available upgrades
      this._displayData$.get(); // Force recompute
    });
  }

  public destroy(): void {
    super.destroy();
  }
}
```

### 3.2 Upgrade Definitions (2 hours)

**Create src/features/upgrades/data/UpgradeDefinitions.ts**:
```typescript
import type { Upgrade } from '../types/UpgradeTypes';

export const upgradeDefinitions: Upgrade[] = [
  // Development Department Upgrades
  {
    id: 'dev_better_ides',
    name: 'Better IDEs',
    description: 'Improved development tools increase coding speed by 25%',
    cost: 1000,
    department: 'development',
    tier: 1,
    prerequisites: [
      { type: 'employee_count', department: 'development', count: 5 }
    ],
    effects: [
      { type: 'multiplier', target: 'productionRate', value: 1.25 }
    ]
  },
  {
    id: 'dev_advanced_ides',
    name: 'Advanced IDEs',
    description: 'Top-tier development tools increase coding speed by 50%',
    cost: 10000,
    department: 'development',
    tier: 2,
    prerequisites: [
      { type: 'upgrade', upgradeId: 'dev_better_ides' },
      { type: 'employee_count', department: 'development', count: 15 }
    ],
    effects: [
      { type: 'multiplier', target: 'productionRate', value: 1.5 }
    ]
  },
  {
    id: 'dev_ai_tools',
    name: 'AI-Powered Tools',
    description: 'AI assistance doubles development productivity',
    cost: 100000,
    department: 'development',
    tier: 3,
    prerequisites: [
      { type: 'upgrade', upgradeId: 'dev_advanced_ides' },
      { type: 'employee_count', department: 'development', count: 30 }
    ],
    effects: [
      { type: 'multiplier', target: 'productionRate', value: 2.0 }
    ]
  },
  {
    id: 'dev_pair_programming',
    name: 'Pair Programming',
    description: 'Doubles efficiency when you have 25+ developers',
    cost: 25000,
    department: 'development',
    tier: 2,
    prerequisites: [
      { type: 'employee_count', department: 'development', count: 25 }
    ],
    effects: [
      { type: 'threshold', target: 'teamBonus', value: 2.0, condition: { minEmployees: 25 } }
    ]
  },
  {
    id: 'dev_code_reviews',
    name: 'Code Reviews',
    description: 'Reduces bugs by 50% when you have 50+ developers',
    cost: 75000,
    department: 'development',
    tier: 3,
    prerequisites: [
      { type: 'employee_count', department: 'development', count: 50 }
    ],
    effects: [
      { type: 'additive', target: 'bugReduction', value: 0.5, condition: { minEmployees: 50 } }
    ]
  },

  // Sales Department Upgrades
  {
    id: 'sales_crm_system',
    name: 'CRM System',
    description: 'Customer relationship management increases lead generation by 30%',
    cost: 5000,
    department: 'sales',
    tier: 1,
    prerequisites: [
      { type: 'department_unlocked', department: 'sales' }
    ],
    effects: [
      { type: 'multiplier', target: 'leadGeneration', value: 1.3 }
    ]
  },
  {
    id: 'sales_training',
    name: 'Sales Training',
    description: 'Doubles sales effectiveness with 25+ sales reps',
    cost: 50000,
    department: 'sales',
    tier: 2,
    prerequisites: [
      { type: 'employee_count', department: 'sales', count: 25 }
    ],
    effects: [
      { type: 'threshold', target: 'teamBonus', value: 2.0, condition: { minEmployees: 25 } }
    ]
  },
  {
    id: 'sales_partnerships',
    name: 'Partnership Deals',
    description: 'Strategic partnerships increase revenue by 50%',
    cost: 100000,
    department: 'sales',
    tier: 3,
    prerequisites: [
      { type: 'upgrade', upgradeId: 'sales_crm_system' },
      { type: 'revenue_total', amount: 1000000 }
    ],
    effects: [
      { type: 'multiplier', target: 'revenueConversion', value: 1.5 }
    ]
  },

  // Customer Experience Upgrades
  {
    id: 'cx_help_desk',
    name: 'Help Desk Software',
    description: 'Organized support system increases ticket resolution by 40%',
    cost: 7500,
    department: 'customerExperience',
    tier: 1,
    prerequisites: [
      { type: 'department_unlocked', department: 'customerExperience' }
    ],
    effects: [
      { type: 'multiplier', target: 'ticketResolution', value: 1.4 }
    ]
  },
  {
    id: 'cx_knowledge_base',
    name: 'Knowledge Base',
    description: 'Self-service portal auto-resolves 25% of tickets',
    cost: 25000,
    department: 'customerExperience',
    tier: 2,
    prerequisites: [
      { type: 'upgrade', upgradeId: 'cx_help_desk' },
      { type: 'employee_count', department: 'customerExperience', count: 15 }
    ],
    effects: [
      { type: 'additive', target: 'autoResolution', value: 0.25 }
    ]
  },
  {
    id: 'cx_customer_success',
    name: 'Customer Success Team',
    description: 'Proactive support increases customer retention by 50%',
    cost: 100000,
    department: 'customerExperience',
    tier: 3,
    prerequisites: [
      { type: 'upgrade', upgradeId: 'cx_knowledge_base' },
      { type: 'employee_count', department: 'customerExperience', count: 30 }
    ],
    effects: [
      { type: 'multiplier', target: 'customerRetention', value: 1.5 }
    ]
  },

  // Global Upgrades
  {
    id: 'global_office_space',
    name: 'Bigger Office',
    description: 'Improved workspace increases all productivity by 15%',
    cost: 50000,
    department: 'global',
    tier: 1,
    prerequisites: [
      { type: 'total_employees', count: 50 }
    ],
    effects: [
      { type: 'multiplier', target: 'globalProductivity', value: 1.15 }
    ]
  },
  {
    id: 'global_company_culture',
    name: 'Company Culture',
    description: 'Great culture increases all efficiency by 25%',
    cost: 250000,
    department: 'global',
    tier: 2,
    prerequisites: [
      { type: 'upgrade', upgradeId: 'global_office_space' },
      { type: 'total_employees', count: 100 }
    ],
    effects: [
      { type: 'multiplier', target: 'globalEfficiency', value: 1.25 }
    ]
  }
];
```

**Create src/features/upgrades/types/UpgradeTypes.ts**:
```typescript
export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  department: string;
  tier: number;
  prerequisites: Prerequisite[];
  effects: UpgradeEffect[];
}

export interface Prerequisite {
  type: 'upgrade' | 'employee_count' | 'revenue_total' | 'department_unlocked' | 'total_employees';
  upgradeId?: string;
  department?: string;
  count?: number;
  amount?: number;
}

export interface UpgradeEffect {
  type: 'multiplier' | 'additive' | 'threshold' | 'unlock';
  target: string;
  value: number;
  condition?: UpgradeCondition;
}

export interface UpgradeCondition {
  minEmployees?: number;
  minRevenue?: number;
  department?: string;
}

export interface UpgradeState {
  purchasedUpgrades: Set<string>;
  availableUpgrades: Map<string, Upgrade>;
  departmentEffects: Map<string, UpgradeEffect[]>;
  globalEffects: UpgradeEffect[];
  categories: string[];
}
```

**Validation**: Upgrades can be purchased, effects apply correctly, prerequisites work

---

## Task 4: Manager Automation System

### 4.1 Manager Service (3 hours)

**Objective**: Implement automatic purchasing for all departments

**Create src/features/managers/ManagerService.ts**:
```typescript
import { observable, computed } from '@legendapp/state';
import { BaseService } from '../../core/StateManager';
import { eventBus } from '../../core/EventBus';
import { Result } from '../../core/Result';
import type { ManagerState, Manager, AutoBuyDecision } from './types/ManagerTypes';

export class ManagerService extends BaseService {
  protected _state$ = observable<ManagerState>({
    unlocked: false,
    unlockThreshold: 50000,
    managers: new Map<string, Manager>(),
    globalSettings: {
      pauseAll: false,
      defaultEfficiency: 'balanced',
      autoBuyInterval: 5000 // 5 seconds
    },
    autoBuyQueue: [],
    purchaseHistory: []
  });

  private _displayData$ = computed(() => {
    const state = this._state$.peek();
    return {
      unlocked: state.unlocked,
      unlockProgress: this._calculateUnlockProgress(),
      managers: Array.from(state.managers.values()).map(manager => ({
        ...manager,
        cost: this._calculateManagerCost(manager.department, manager.tier),
        canAfford: this._canAffordManager(manager.department, manager.tier),
        nextPurchase: this._getNextPurchase(manager.department)
      })),
      globalPaused: state.globalSettings.pauseAll,
      activeManagers: Array.from(state.managers.values()).filter(m => m.active).length
    };
  });

  constructor() {
    super();
    this._setupEventListeners();
    this._startAutoBuyLoop();
  }

  public hireManager(department: string): Promise<Result<void, Error>> {
    const existingManager = this._state$.managers.get(department);
    const tier = existingManager ? existingManager.tier + 1 : 1;
    const cost = this._calculateManagerCost(department, tier);

    return new Promise((resolve) => {
      const subscription = eventBus.once('funds.response', (response: { success: boolean; error?: string }) => {
        if (response.success) {
          const manager: Manager = {
            department,
            tier,
            cost,
            efficiencyMode: this._state$.globalSettings.defaultEfficiency.peek(),
            active: true,
            purchaseHistory: [],
            settings: {
              minCashReserve: cost * 2, // Keep 2x manager cost in reserve
              maxPurchasePercent: 0.5, // Spend max 50% of available funds
              priorityOrder: this._getDefaultPriorityOrder(department)
            }
          };

          this._state$.managers.set(department, manager);
          
          eventBus.emit('manager.hired', {
            department,
            tier,
            cost,
            manager
          });
          
          resolve(Result.ok(undefined));
        } else {
          resolve(Result.err(new Error(response.error || 'Insufficient funds')));
        }
      });

      eventBus.emit('funds.requested', {
        amount: cost,
        purpose: 'hire_manager',
        requester: 'managers'
      });
    });
  }

  public setEfficiencyMode(department: string, mode: 'conservative' | 'balanced' | 'aggressive'): void {
    const manager = this._state$.managers.get(department);
    if (manager) {
      manager.efficiencyMode = mode;
      this._updateManagerSettings(manager);
    }
  }

  public pauseManager(department: string): void {
    const manager = this._state$.managers.get(department);
    if (manager) {
      manager.active = false;
    }
  }

  public resumeManager(department: string): void {
    const manager = this._state$.managers.get(department);
    if (manager) {
      manager.active = true;
    }
  }

  public pauseAll(): void {
    this._state$.globalSettings.pauseAll.set(true);
  }

  public resumeAll(): void {
    this._state$.globalSettings.pauseAll.set(false);
  }

  public getDisplayData() {
    return this._displayData$.peek();
  }

  public subscribe(callback: (data: any) => void) {
    return this._displayData$.onChange(callback);
  }

  private _calculateManagerCost(department: string, tier: number): number {
    const baseCosts = {
      development: 1000,
      sales: 1000,
      customerExperience: 1000,
      product: 1000,
      design: 1000,
      qa: 1000,
      marketing: 1000
    };
    
    const baseCost = baseCosts[department] || 1000;
    // Each tier costs 10x more: $1K, $10K, $100K, $1M, etc.
    return baseCost * Math.pow(10, tier - 1);
  }

  private _canAffordManager(department: string, tier: number): boolean {
    const cost = this._calculateManagerCost(department, tier);
    // This would check with currency service
    return true; // Placeholder
  }

  private _calculateUnlockProgress(): number {
    // Will be updated by event listener
    return 0;
  }

  private _getDefaultPriorityOrder(department: string): string[] {
    const priorities = {
      development: ['juniorDev', 'midDev', 'seniorDev', 'techLead'],
      sales: ['salesRep', 'accountManager', 'salesDirector', 'vpSales'],
      customerExperience: ['supportAgent', 'cxSpecialist', 'cxManager', 'cxDirector']
    };
    
    return priorities[department] || [];
  }

  private _updateManagerSettings(manager: Manager): void {
    switch (manager.efficiencyMode) {
      case 'conservative':
        manager.settings.minCashReserve = manager.cost * 5;
        manager.settings.maxPurchasePercent = 0.2;
        break;
      case 'balanced':
        manager.settings.minCashReserve = manager.cost * 2;
        manager.settings.maxPurchasePercent = 0.5;
        break;
      case 'aggressive':
        manager.settings.minCashReserve = manager.cost;
        manager.settings.maxPurchasePercent = 0.8;
        break;
    }
  }

  private _startAutoBuyLoop(): void {
    setInterval(() => {
      if (!this._state$.unlocked.peek() || this._state$.globalSettings.pauseAll.peek()) {
        return;
      }

      this._processAutoBuying();
    }, this._state$.globalSettings.autoBuyInterval.peek());
  }

  private _processAutoBuying(): void {
    const managers = Array.from(this._state$.managers.values()).filter(m => m.active);
    
    managers.forEach(manager => {
      this._processManagerBuying(manager);
    });
  }

  private _processManagerBuying(manager: Manager): void {
    // Get available funds
    eventBus.emit('funds.query', { purpose: 'manager_auto_buy' });
    eventBus.once('funds.query.response', (data: { available: number }) => {
      const decision = this._calculateBestPurchase(manager, data.available);
      
      if (decision && decision.viable) {
        this._executePurchase(manager, decision);
      }
    });
  }

  private _calculateBestPurchase(manager: Manager, availableFunds: number): AutoBuyDecision | null {
    const reserveAmount = manager.settings.minCashReserve;
    const maxSpend = availableFunds * manager.settings.maxPurchasePercent;
    const spendableFunds = Math.min(maxSpend, availableFunds - reserveAmount);
    
    if (spendableFunds <= 0) return null;

    // Find the best purchase based on cost efficiency
    const candidates = this._getAffordablePurchases(manager.department, spendableFunds);
    if (candidates.length === 0) return null;

    // Sort by efficiency (production per cost)
    candidates.sort((a, b) => (b.efficiency || 0) - (a.efficiency || 0));
    
    return candidates[0];
  }

  private _getAffordablePurchases(department: string, budget: number): AutoBuyDecision[] {
    // This would query the department service for available purchases
    // For now, return empty array
    return [];
  }

  private _executePurchase(manager: Manager, decision: AutoBuyDecision): void {
    eventBus.emit('auto.purchase', {
      department: decision.department,
      employeeType: decision.employeeType,
      cost: decision.cost,
      managedBy: manager.department
    });

    // Record purchase
    manager.purchaseHistory.push({
      timestamp: Date.now(),
      employeeType: decision.employeeType,
      cost: decision.cost,
      efficiency: decision.efficiency || 0
    });

    // Keep history limited
    if (manager.purchaseHistory.length > 100) {
      manager.purchaseHistory = manager.purchaseHistory.slice(-50);
    }
  }

  private _getNextPurchase(department: string): string | null {
    const manager = this._state$.managers.get(department);
    if (!manager) return null;

    // Return the first item in priority order that can be afforded
    return manager.settings.priorityOrder[0] || null;
  }

  private _setupEventListeners(): void {
    // Unlock managers at revenue threshold
    eventBus.on('revenue.milestone', (data: { total: number }) => {
      if (!this._state$.unlocked.peek() && data.total >= this._state$.unlockThreshold.peek()) {
        this._state$.unlocked.set(true);
        eventBus.emit('managers.unlocked', {
          threshold: this._state$.unlockThreshold.peek(),
          departments: ['development', 'sales', 'customerExperience']
        });
      }
    });

    // Handle auto-purchase requests
    eventBus.on('auto.purchase', (data: { department: string; employeeType: string; cost: number }) => {
      eventBus.emit(`${data.department}.hire`, {
        employeeType: data.employeeType,
        source: 'manager'
      });
    });
  }

  public destroy(): void {
    super.destroy();
  }
}
```

**Create src/features/managers/types/ManagerTypes.ts**:
```typescript
export interface Manager {
  department: string;
  tier: number;
  cost: number;
  efficiencyMode: 'conservative' | 'balanced' | 'aggressive';
  active: boolean;
  purchaseHistory: ManagerPurchase[];
  settings: {
    minCashReserve: number;
    maxPurchasePercent: number;
    priorityOrder: string[];
  };
}

export interface ManagerState {
  unlocked: boolean;
  unlockThreshold: number;
  managers: Map<string, Manager>;
  globalSettings: {
    pauseAll: boolean;
    defaultEfficiency: 'conservative' | 'balanced' | 'aggressive';
    autoBuyInterval: number;
  };
  autoBuyQueue: AutoBuyDecision[];
  purchaseHistory: ManagerPurchase[];
}

export interface AutoBuyDecision {
  department: string;
  employeeType: string;
  cost: number;
  priority: number;
  efficiency?: number;
  viable: boolean;
}

export interface ManagerPurchase {
  timestamp: number;
  employeeType: string;
  cost: number;
  efficiency: number;
}
```

**Validation**: Managers automatically purchase employees based on efficiency settings

---

## Task 5: Integration and Testing

### 5.1 Updated Game Screen (2 hours)

**Objective**: Integrate all department systems

**Update src/screens/GameScreen.tsx**:
```typescript
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Components
import { ClickButton } from '../features/clicking/components/ClickButton';
import { CurrencyDisplay } from '../features/currency/components/CurrencyDisplay';
import { DevelopmentDepartment } from '../features/employees/components/DevelopmentDepartment';
import { SalesDepartment } from '../features/departments/sales/components/SalesDepartment';
import { CustomerExperienceDepartment } from '../features/departments/customerExperience/components/CustomerExperienceDepartment';
import { UpgradeStore } from '../features/upgrades/components/UpgradeStore';
import { ManagerHub } from '../features/managers/components/ManagerHub';

// Services
import { ClickingService } from '../features/clicking/ClickingService';
import { CurrencyService } from '../features/currency/CurrencyService';
import { EmployeesService } from '../features/employees/EmployeesService';
import { SalesService } from '../features/departments/sales/SalesService';
import { CustomerExperienceService } from '../features/departments/customerExperience/CustomerExperienceService';
import { UpgradeService } from '../features/upgrades/UpgradeService';
import { ManagerService } from '../features/managers/ManagerService';

const Tab = createBottomTabNavigator();

export const GameScreen = () => {
  const [services] = useState(() => ({
    clicking: new ClickingService(),
    currency: new CurrencyService(),
    employees: new EmployeesService(),
    sales: new SalesService(),
    customerExperience: new CustomerExperienceService(),
    upgrades: new UpgradeService(),
    managers: new ManagerService()
  }));

  useEffect(() => {
    // Cleanup services on unmount
    return () => {
      Object.values(services).forEach(service => service.destroy());
    };
  }, [services]);

  const ClickingScreen = () => (
    <SafeAreaView style={styles.container}>
      <CurrencyDisplay currencyService={services.currency} />
      <View style={styles.clickArea}>
        <ClickButton clickingService={services.clicking} />
      </View>
    </SafeAreaView>
  );

  const DepartmentsScreen = () => (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <DevelopmentDepartment 
          employeesService={services.employees}
          currencyService={services.currency}
        />
        <SalesDepartment 
          salesService={services.sales}
          currencyService={services.currency}
        />
        <CustomerExperienceDepartment 
          customerExperienceService={services.customerExperience}
          currencyService={services.currency}
        />
      </ScrollView>
    </SafeAreaView>
  );

  const UpgradesScreen = () => (
    <SafeAreaView style={styles.container}>
      <UpgradeStore 
        upgradeService={services.upgrades}
        currencyService={services.currency}
      />
    </SafeAreaView>
  );

  const ManagersScreen = () => (
    <SafeAreaView style={styles.container}>
      <ManagerHub 
        managerService={services.managers}
        currencyService={services.currency}
      />
    </SafeAreaView>
  );

  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Click" component={ClickingScreen} />
        <Tab.Screen name="Departments" component={DepartmentsScreen} />
        <Tab.Screen name="Upgrades" component={UpgradesScreen} />
        <Tab.Screen name="Managers" component={ManagersScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  clickArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

### 5.2 Add Missing Dependencies (30 minutes)

**Install navigation dependencies**:
```bash
npx expo install @react-navigation/native @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context
```

### 5.3 Integration Testing (1 hour)

**Validation Checklist**:
- [ ] All departments unlock at correct revenue thresholds
- [ ] Employee hiring works across all departments
- [ ] Resource conversion chains function properly
- [ ] Upgrades provide intended effects
- [ ] Manager automation reduces manual clicks
- [ ] Cross-department synergies work
- [ ] Performance remains smooth with all systems active

---

## Deliverables

### Department Systems
- [ ] Sales department with lead generation and revenue conversion
- [ ] Customer Experience department with ticket resolution and satisfaction
- [ ] Progressive unlock system working correctly
- [ ] Department-specific employee types and bonuses
- [ ] Cross-department resource dependencies

### Upgrade System
- [ ] Comprehensive upgrade definitions with prerequisites
- [ ] Tier-based progression with meaningful effects
- [ ] Department-specific and global upgrades
- [ ] Prerequisite validation system
- [ ] Effect application system

### Manager Automation
- [ ] Manager hiring system with tier progression
- [ ] Automated purchasing with efficiency modes
- [ ] Configurable automation settings
- [ ] Purchase history and statistics
- [ ] Global pause/resume functionality

### Integration
- [ ] Tabbed navigation between game sections
- [ ] All services properly integrated
- [ ] Event-driven coordination working
- [ ] Performance optimized for multiple systems
- [ ] Clean service lifecycle management

---

## Validation Checklist

- [ ] Sales unlocks at $500 revenue and generates leads
- [ ] Customer Experience unlocks after Sales, processes tickets
- [ ] Upgrades can be purchased and effects apply immediately
- [ ] Managers unlock at $50K revenue and auto-purchase employees
- [ ] All departments work together in resource pipeline
- [ ] No performance degradation with all systems active
- [ ] Services communicate only through events
- [ ] UI updates reactively across all features
- [ ] Memory usage remains under target limits

---

## Troubleshooting

### Department Unlock Issues
```typescript
// Verify unlock thresholds are being checked
eventBus.on('revenue.milestone', (data) => {
  console.log('Revenue milestone:', data.total);
});

// Check unlock status
console.log('Sales unlocked:', salesService.getDisplayData().unlocked);
```

### Manager Automation Problems
```typescript
// Debug auto-buy decisions
eventBus.on('auto.purchase', (data) => {
  console.log('Manager purchasing:', data);
});

// Check manager status
console.log('Manager settings:', managerService.getDisplayData().managers);
```

### Performance Issues
```bash
# Profile performance with all systems
npx expo start --dev-client
# Use React DevTools Profiler
```

### Cross-Feature Communication
```typescript
// Trace event flow
const originalEmit = eventBus.emit;
eventBus.emit = function(event, data) {
  console.log('Event:', event, data);
  return originalEmit.call(this, event, data);
};
```

---

**Next Phase**: Proceed to [04-quality.md](./04-quality.md) for polish, performance optimization, and testing.