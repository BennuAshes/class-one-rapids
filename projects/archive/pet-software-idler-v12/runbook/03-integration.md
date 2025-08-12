# Phase 3: Integration
## Department Systems and Idle Game Mechanics

**Estimated Time**: 3-4 days  
**Prerequisites**: Core features completed with stable 60 FPS gameplay  
**Deliverables**: All 7 departments functional, complete idle mechanics, prestige system

---

## Objectives

1. **Implement All 7 Departments**: Development, Sales, Marketing, HR, Finance, Operations, Executive
2. **Create Department-Specific Mechanics**: Unique upgrade trees, synergies, and progression paths
3. **Add Prestige System**: Company valuation-based reset with investor points
4. **Implement Achievement System**: Milestone tracking and reward mechanisms
5. **Balance Progression Curves**: Ensure engaging gameplay without infinite scaling issues

---

## Task Checklist

### Department System Architecture
- [ ] **Create Department Base Classes** (3 hours)
  ```bash
  # Create department types and interfaces
  cat > src/features/departments/types/department.types.ts << 'EOF'
  export interface BaseDepartment {
    name: string;
    employees: EmployeeCount;
    upgrades: Record<string, UpgradeLevel>;
    production: ProductionMetrics;
    unlocked: boolean;
    unlockRequirement?: UnlockRequirement;
  }
  
  export interface EmployeeCount {
    intern?: number;
    junior: number;
    mid: number;
    senior: number;
    lead: number;
    manager?: number;
    director?: number;
  }
  
  export interface UpgradeLevel {
    level: number;
    maxLevel: number;
    purchased: boolean;
  }
  
  export interface ProductionMetrics {
    baseRate: number;
    efficiency: number;
    multiplier: number;
  }
  
  export interface UnlockRequirement {
    type: 'currency' | 'valuation' | 'employees' | 'achievement';
    value: string | number;
    department?: string;
  }
  
  export interface DepartmentUpgrade {
    id: string;
    name: string;
    description: string;
    cost: string;
    costMultiplier: number;
    maxLevel: number;
    effect: UpgradeEffect;
  }
  
  export interface UpgradeEffect {
    type: 'productivity' | 'efficiency' | 'unlock' | 'synergy';
    value: number;
    target?: string;
  }
  
  // Specific department interfaces
  export interface DevelopmentDepartment extends BaseDepartment {
    upgrades: {
      betterIde: UpgradeLevel;
      pairProgramming: UpgradeLevel;
      codeReviews: UpgradeLevel;
      advancedFrameworks: UpgradeLevel;
      cloudInfrastructure: UpgradeLevel;
    };
  }
  
  export interface SalesDepartment extends BaseDepartment {
    upgrades: {
      crmSystem: UpgradeLevel;
      salesTraining: UpgradeLevel;
      leadGeneration: UpgradeLevel;
      customerSupport: UpgradeLevel;
      partnerNetwork: UpgradeLevel;
    };
  }
  
  export interface MarketingDepartment extends BaseDepartment {
    upgrades: {
      socialMedia: UpgradeLevel;
      contentMarketing: UpgradeLevel;
      seoOptimization: UpgradeLevel;
      paidAdvertising: UpgradeLevel;
      brandingCampaign: UpgradeLevel;
    };
  }
  
  export interface HRDepartment extends BaseDepartment {
    upgrades: {
      talentAcquisition: UpgradeLevel;
      employeeTraining: UpgradeLevel;
      performanceManagement: UpgradeLevel;
      companyCulture: UpgradeLevel;
      retentionPrograms: UpgradeLevel;
    };
  }
  
  export interface FinanceDepartment extends BaseDepartment {
    upgrades: {
      financialReporting: UpgradeLevel;
      costOptimization: UpgradeLevel;
      investmentStrategy: UpgradeLevel;
      riskManagement: UpgradeLevel;
      auditCompliance: UpgradeLevel;
    };
  }
  
  export interface OperationsDepartment extends BaseDepartment {
    upgrades: {
      processOptimization: UpgradeLevel;
      qualityAssurance: UpgradeLevel;
      supplychainManagement: UpgradeLevel;
      automationTools: UpgradeLevel;
      dataAnalytics: UpgradeLevel;
    };
  }
  
  export interface ExecutiveDepartment extends BaseDepartment {
    upgrades: {
      strategicPlanning: UpgradeLevel;
      boardOfDirectors: UpgradeLevel;
      investorRelations: UpgradeLevel;
      corporateGovernance: UpgradeLevel;
      acquisitionStrategy: UpgradeLevel;
    };
  }
  
  export type DepartmentType = 
    | 'development' 
    | 'sales' 
    | 'marketing' 
    | 'hr' 
    | 'finance' 
    | 'operations' 
    | 'executive';
  
  export interface DepartmentStore {
    development: DevelopmentDepartment;
    sales: SalesDepartment;
    marketing: MarketingDepartment;
    hr: HRDepartment;
    finance: FinanceDepartment;
    operations: OperationsDepartment;
    executive: ExecutiveDepartment;
  }
  EOF
  ```

- [ ] **Create Department Store with All 7 Departments** (4 hours)
  ```bash
  # Create comprehensive department store
  cat > src/features/departments/state/departmentStore.ts << 'EOF'
  import { observable, computed } from '@legendapp/state';
  import { GameMath } from '../../../shared/utils/BigNumber';
  import type { 
    DepartmentStore, 
    DepartmentType, 
    DepartmentUpgrade,
    EmployeeCount 
  } from '../types/department.types';
  
  // Initial department configurations
  const createInitialDepartments = (): DepartmentStore => ({
    development: {
      name: 'Development',
      employees: { junior: 0, mid: 0, senior: 0, lead: 0 },
      upgrades: {
        betterIde: { level: 0, maxLevel: 3, purchased: false },
        pairProgramming: { level: 0, maxLevel: 1, purchased: false },
        codeReviews: { level: 0, maxLevel: 1, purchased: false },
        advancedFrameworks: { level: 0, maxLevel: 2, purchased: false },
        cloudInfrastructure: { level: 0, maxLevel: 3, purchased: false }
      },
      production: { baseRate: 1, efficiency: 1, multiplier: 1 },
      unlocked: true
    },
    
    sales: {
      name: 'Sales',
      employees: { junior: 0, mid: 0, senior: 0, lead: 0 },
      upgrades: {
        crmSystem: { level: 0, maxLevel: 2, purchased: false },
        salesTraining: { level: 0, maxLevel: 3, purchased: false },
        leadGeneration: { level: 0, maxLevel: 2, purchased: false },
        customerSupport: { level: 0, maxLevel: 2, purchased: false },
        partnerNetwork: { level: 0, maxLevel: 1, purchased: false }
      },
      production: { baseRate: 0, efficiency: 1, multiplier: 1 },
      unlocked: false,
      unlockRequirement: { type: 'currency', value: '50000' }
    },
    
    marketing: {
      name: 'Marketing',
      employees: { junior: 0, mid: 0, senior: 0, lead: 0 },
      upgrades: {
        socialMedia: { level: 0, maxLevel: 3, purchased: false },
        contentMarketing: { level: 0, maxLevel: 2, purchased: false },
        seoOptimization: { level: 0, maxLevel: 2, purchased: false },
        paidAdvertising: { level: 0, maxLevel: 3, purchased: false },
        brandingCampaign: { level: 0, maxLevel: 1, purchased: false }
      },
      production: { baseRate: 0, efficiency: 1, multiplier: 1 },
      unlocked: false,
      unlockRequirement: { type: 'currency', value: '100000' }
    },
    
    hr: {
      name: 'Human Resources',
      employees: { junior: 0, mid: 0, senior: 0, lead: 0 },
      upgrades: {
        talentAcquisition: { level: 0, maxLevel: 3, purchased: false },
        employeeTraining: { level: 0, maxLevel: 2, purchased: false },
        performanceManagement: { level: 0, maxLevel: 2, purchased: false },
        companyculture: { level: 0, maxLevel: 1, purchased: false },
        retentionPrograms: { level: 0, maxLevel: 2, purchased: false }
      },
      production: { baseRate: 0, efficiency: 1, multiplier: 1 },
      unlocked: false,
      unlockRequirement: { type: 'employees', value: 20, department: 'development' }
    },
    
    finance: {
      name: 'Finance',
      employees: { junior: 0, mid: 0, senior: 0, lead: 0 },
      upgrades: {
        financialReporting: { level: 0, maxLevel: 2, purchased: false },
        costOptimization: { level: 0, maxLevel: 3, purchased: false },
        investmentStrategy: { level: 0, maxLevel: 2, purchased: false },
        riskManagement: { level: 0, maxLevel: 2, purchased: false },
        auditCompliance: { level: 0, maxLevel: 1, purchased: false }
      },
      production: { baseRate: 0, efficiency: 1, multiplier: 1 },
      unlocked: false,
      unlockRequirement: { type: 'valuation', value: '1000000' }
    },
    
    operations: {
      name: 'Operations',
      employees: { junior: 0, mid: 0, senior: 0, lead: 0 },
      upgrades: {
        processOptimization: { level: 0, maxLevel: 3, purchased: false },
        qualityAssurance: { level: 0, maxLevel: 2, purchased: false },
        supplychainManagement: { level: 0, maxLevel: 2, purchased: false },
        automationTools: { level: 0, maxLevel: 3, purchased: false },
        dataAnalytics: { level: 0, maxLevel: 2, purchased: false }
      },
      production: { baseRate: 0, efficiency: 1, multiplier: 1 },
      unlocked: false,
      unlockRequirement: { type: 'valuation', value: '5000000' }
    },
    
    executive: {
      name: 'Executive',
      employees: { junior: 0, mid: 0, senior: 0, lead: 0, director: 0 },
      upgrades: {
        strategicPlanning: { level: 0, maxLevel: 2, purchased: false },
        boardOfDirectors: { level: 0, maxLevel: 1, purchased: false },
        investorRelations: { level: 0, maxLevel: 2, purchased: false },
        corporateGovernance: { level: 0, maxLevel: 1, purchased: false },
        acquisitionStrategy: { level: 0, maxLevel: 3, purchased: false }
      },
      production: { baseRate: 0, efficiency: 1, multiplier: 1 },
      unlocked: false,
      unlockRequirement: { type: 'valuation', value: '50000000' }
    }
  });
  
  // Department observable store
  export const departmentStore$ = observable<DepartmentStore>(createInitialDepartments());
  
  // Computed values for each department
  export const departmentMetrics$ = computed(() => {
    const departments = departmentStore$.peek();
    const metrics: Record<DepartmentType, any> = {} as any;
    
    Object.entries(departments).forEach(([key, dept]) => {
      const deptType = key as DepartmentType;
      metrics[deptType] = {
        totalEmployees: getTotalEmployees(dept.employees),
        productionRate: calculateProductionRate(deptType, dept),
        efficiency: dept.production.efficiency,
        unlocked: dept.unlocked,
        canUnlock: canUnlockDepartment(deptType, dept)
      };
    });
    
    return metrics;
  });
  
  // Helper functions
  function getTotalEmployees(employees: EmployeeCount): number {
    return Object.values(employees).reduce((sum, count) => sum + (count || 0), 0);
  }
  
  function calculateProductionRate(deptType: DepartmentType, dept: any): number {
    if (!dept.unlocked) return 0;
    
    const employees = dept.employees;
    let baseProduction = 0;
    
    switch (deptType) {
      case 'development':
        baseProduction = employees.junior * 1 + employees.mid * 3 + 
                        employees.senior * 8 + employees.lead * 20;
        break;
      case 'sales':
        baseProduction = employees.junior * 2 + employees.mid * 5 + 
                        employees.senior * 12 + employees.lead * 25;
        break;
      case 'marketing':
        baseProduction = employees.junior * 1.5 + employees.mid * 4 + 
                        employees.senior * 10 + employees.lead * 22;
        break;
      case 'hr':
        // HR boosts other departments' efficiency
        baseProduction = employees.junior * 0.5 + employees.mid * 1.5 + 
                        employees.senior * 3 + employees.lead * 6;
        break;
      case 'finance':
        // Finance provides cost reduction and investment returns
        baseProduction = employees.junior * 3 + employees.mid * 8 + 
                        employees.senior * 18 + employees.lead * 40;
        break;
      case 'operations':
        // Operations provides efficiency multipliers
        baseProduction = employees.junior * 2 + employees.mid * 6 + 
                        employees.senior * 15 + employees.lead * 35;
        break;
      case 'executive':
        // Executive provides company-wide multipliers
        baseProduction = employees.junior * 10 + employees.mid * 25 + 
                        employees.senior * 50 + (employees.director || 0) * 100;
        break;
    }
    
    return baseProduction * dept.production.efficiency * dept.production.multiplier;
  }
  
  function canUnlockDepartment(deptType: DepartmentType, dept: any): boolean {
    if (dept.unlocked) return true;
    if (!dept.unlockRequirement) return false;
    
    const req = dept.unlockRequirement;
    // This would need access to gameState$ - will implement in gameStore
    return false; // Placeholder
  }
  
  // Department actions
  export const departmentActions = {
    hireDeveloper: (department: DepartmentType, level: keyof EmployeeCount) => {
      const dept = departmentStore$[department].peek();
      if (!dept.unlocked) return;
      
      const cost = calculateHireCost(department, level, dept.employees[level] || 0);
      // This would integrate with currency system in gameStore
      console.log(`Hiring ${level} in ${department} for $${cost.toString()}`);
    },
    
    purchaseUpgrade: (department: DepartmentType, upgradeId: string) => {
      const dept = departmentStore$[department].peek();
      const upgrade = dept.upgrades[upgradeId];
      
      if (!upgrade || upgrade.level >= upgrade.maxLevel) return;
      
      const cost = calculateUpgradeCost(department, upgradeId, upgrade.level);
      console.log(`Purchasing ${upgradeId} upgrade for $${cost.toString()}`);
    },
    
    unlockDepartment: (department: DepartmentType) => {
      departmentStore$[department].unlocked.set(true);
    }
  };
  
  function calculateHireCost(department: DepartmentType, level: keyof EmployeeCount, currentCount: number): GameMath {
    const baseCosts: Record<DepartmentType, Record<string, number>> = {
      development: { junior: 100, mid: 500, senior: 2000, lead: 8000 },
      sales: { junior: 150, mid: 750, senior: 3000, lead: 12000 },
      marketing: { junior: 120, mid: 600, senior: 2400, lead: 9600 },
      hr: { junior: 200, mid: 1000, senior: 4000, lead: 16000 },
      finance: { junior: 250, mid: 1250, senior: 5000, lead: 20000 },
      operations: { junior: 180, mid: 900, senior: 3600, lead: 14400 },
      executive: { junior: 500, mid: 2500, senior: 10000, lead: 40000, director: 100000 }
    };
    
    const baseCost = baseCosts[department][level] || 1000;
    return GameMath.calculateUpgradeCost(baseCost, currentCount, 1.15);
  }
  
  function calculateUpgradeCost(department: DepartmentType, upgradeId: string, currentLevel: number): GameMath {
    const baseCosts: Record<string, number> = {
      betterIde: 5000,
      pairProgramming: 25000,
      codeReviews: 50000,
      advancedFrameworks: 100000,
      cloudInfrastructure: 200000,
      crmSystem: 15000,
      salesTraining: 30000,
      leadGeneration: 40000,
      socialMedia: 20000,
      contentMarketing: 35000,
      talentAcquisition: 75000,
      // ... more upgrade costs
    };
    
    const baseCost = baseCosts[upgradeId] || 10000;
    return GameMath.calculateUpgradeCost(baseCost, currentLevel, 2.0);
  }
  EOF
  ```

### Department Screen Implementation
- [ ] **Create Department Management UI** (5 hours)
  ```bash
  # Create department screen component
  cat > src/features/departments/DepartmentScreen.tsx << 'EOF'
  import React, { useState } from 'react';
  import { View, ScrollView, Text, StyleSheet } from 'react-native';
  import { use$, observer } from '@legendapp/state/react';
  import { departmentStore$, departmentMetrics$ } from './state/departmentStore';
  import { gameState$, enhancedGameActions } from '../../core/state/gameStore';
  import { DepartmentCard } from './components/DepartmentCard';
  import { BaseButton } from '../../shared/components/ui/BaseButton';
  import { CurrencyDisplay } from '../../shared/components/game/CurrencyDisplay';
  import type { DepartmentType } from './types/department.types';
  
  const DepartmentScreen = observer(() => {
    const departments = use$(departmentStore$);
    const metrics = use$(departmentMetrics$);
    const currency = use$(gameState$.player.currency);
    const [selectedDepartment, setSelectedDepartment] = useState<DepartmentType>('development');
    
    const availableDepartments = Object.entries(departments).filter(
      ([_, dept]) => dept.unlocked
    ) as [DepartmentType, any][];
    
    const lockedDepartments = Object.entries(departments).filter(
      ([_, dept]) => !dept.unlocked && canUnlockDepartment(dept)
    ) as [DepartmentType, any][];
    
    function canUnlockDepartment(dept: any): boolean {
      if (!dept.unlockRequirement) return false;
      
      const req = dept.unlockRequirement;
      const gameState = gameState$.peek();
      
      switch (req.type) {
        case 'currency':
          return GameMath.greaterThanOrEqual(gameState.player.currency, req.value);
        case 'valuation':
          const totalVal = totalValuation$.peek();
          return GameMath.greaterThanOrEqual(totalVal, req.value);
        case 'employees':
          if (req.department) {
            const targetDept = departments[req.department as DepartmentType];
            const totalEmployees = Object.values(targetDept.employees).reduce((sum, count) => sum + count, 0);
            return totalEmployees >= req.value;
          }
          return false;
        default:
          return false;
      }
    }
    
    const handleUnlockDepartment = (deptType: DepartmentType) => {
      const dept = departments[deptType];
      const req = dept.unlockRequirement;
      
      if (req?.type === 'currency') {
        const cost = GameMath.currency(req.value);
        const currentCurrency = GameMath.currency(currency);
        
        if (currentCurrency.gte(cost)) {
          batch(() => {
            gameState$.player.currency.set(currentCurrency.minus(cost).toString());
            departmentStore$[deptType].unlocked.set(true);
          });
        }
      } else {
        departmentStore$[deptType].unlocked.set(true);
      }
    };
    
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <CurrencyDisplay
            value={currency}
            label="Available Budget"
            prefix="$"
          />
        </View>
        
        {/* Department Selection Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.tabContainer}
        >
          {availableDepartments.map(([deptType, dept]) => (
            <BaseButton
              key={deptType}
              title={dept.name}
              subtitle={`${metrics[deptType]?.totalEmployees || 0} employees`}
              onPress={() => setSelectedDepartment(deptType)}
              variant={selectedDepartment === deptType ? 'primary' : 'secondary'}
              style={[
                styles.tabButton,
                selectedDepartment === deptType && styles.activeTab
              ]}
            />
          ))}
        </ScrollView>
        
        {/* Selected Department Details */}
        {selectedDepartment && departments[selectedDepartment]?.unlocked && (
          <DepartmentCard
            department={departments[selectedDepartment]}
            departmentType={selectedDepartment}
            metrics={metrics[selectedDepartment]}
          />
        )}
        
        {/* Locked Departments */}
        {lockedDepartments.length > 0 && (
          <View style={styles.lockedContainer}>
            <Text style={styles.sectionTitle}>Unlock New Departments</Text>
            {lockedDepartments.map(([deptType, dept]) => (
              <View key={deptType} style={styles.lockedDepartment}>
                <View style={styles.lockedInfo}>
                  <Text style={styles.lockedName}>{dept.name}</Text>
                  <Text style={styles.unlockRequirement}>
                    {getUnlockRequirementText(dept.unlockRequirement)}
                  </Text>
                </View>
                <BaseButton
                  title="Unlock"
                  onPress={() => handleUnlockDepartment(deptType)}
                  disabled={!canUnlockDepartment(dept)}
                  variant="success"
                  style={styles.unlockButton}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    );
  });
  
  function getUnlockRequirementText(req: any): string {
    if (!req) return '';
    
    switch (req.type) {
      case 'currency':
        return `Requires $${GameMath.formatCurrency(req.value)}`;
      case 'valuation':
        return `Requires $${GameMath.formatCurrency(req.value)} company value`;
      case 'employees':
        return `Requires ${req.value} employees in ${req.department}`;
      default:
        return 'Special requirement';
    }
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#0a0a0a',
      padding: 16
    },
    header: {
      marginBottom: 16
    },
    tabContainer: {
      marginBottom: 20
    },
    tabButton: {
      marginRight: 8,
      minWidth: 120,
      paddingHorizontal: 12
    },
    activeTab: {
      borderWidth: 2,
      borderColor: '#007AFF'
    },
    sectionTitle: {
      color: '#ffffff',
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 12
    },
    lockedContainer: {
      marginTop: 20
    },
    lockedDepartment: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#1a1a1a',
      padding: 16,
      borderRadius: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: '#333333',
      opacity: 0.7
    },
    lockedInfo: {
      flex: 1
    },
    lockedName: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4
    },
    unlockRequirement: {
      color: '#8E8E93',
      fontSize: 14
    },
    unlockButton: {
      minWidth: 80,
      paddingHorizontal: 12
    }
  });
  
  export default DepartmentScreen;
  EOF
  ```

### Individual Department Cards
- [ ] **Create Department Card Component** (3 hours)
  ```bash
  # Create detailed department card
  cat > src/features/departments/components/DepartmentCard.tsx << 'EOF'
  import React from 'react';
  import { View, Text, StyleSheet } from 'react-native';
  import { observer } from '@legendapp/state/react';
  import { BaseButton } from '../../../shared/components/ui/BaseButton';
  import { CurrencyDisplay } from '../../../shared/components/game/CurrencyDisplay';
  import { GameMath } from '../../../shared/utils/BigNumber';
  import type { BaseDepartment, DepartmentType, EmployeeCount } from '../types/department.types';
  
  interface DepartmentCardProps {
    department: BaseDepartment;
    departmentType: DepartmentType;
    metrics: any;
  }
  
  export const DepartmentCard = observer(({ 
    department, 
    departmentType, 
    metrics 
  }: DepartmentCardProps) => {
    const employeeTypes = Object.entries(department.employees) as [keyof EmployeeCount, number][];
    const upgradeEntries = Object.entries(department.upgrades);
    
    const getHireCost = (level: keyof EmployeeCount, currentCount: number) => {
      const baseCosts = {
        development: { junior: 100, mid: 500, senior: 2000, lead: 8000 },
        sales: { junior: 150, mid: 750, senior: 3000, lead: 12000 },
        marketing: { junior: 120, mid: 600, senior: 2400, lead: 9600 },
        hr: { junior: 200, mid: 1000, senior: 4000, lead: 16000 },
        finance: { junior: 250, mid: 1250, senior: 5000, lead: 20000 },
        operations: { junior: 180, mid: 900, senior: 3600, lead: 14400 },
        executive: { junior: 500, mid: 2500, senior: 10000, lead: 40000, director: 100000 }
      };
      
      const baseCost = baseCosts[departmentType]?.[level] || 1000;
      return GameMath.calculateUpgradeCost(baseCost, currentCount, 1.15);
    };
    
    const formatEmployeeLevel = (level: string) => {
      return level.charAt(0).toUpperCase() + level.slice(1);
    };
    
    const getUpgradeDescription = (upgradeId: string) => {
      const descriptions: Record<string, string> = {
        betterIde: 'Increases coding efficiency by 25% per level',
        pairProgramming: 'Boosts team productivity by 50%',
        codeReviews: 'Improves code quality and efficiency by 30%',
        advancedFrameworks: 'Unlocks advanced development capabilities',
        cloudInfrastructure: 'Scales development capacity infinitely',
        crmSystem: 'Improves customer relationship management',
        salesTraining: 'Increases sales conversion rates',
        leadGeneration: 'Generates more qualified leads',
        socialMedia: 'Expands brand reach and engagement',
        contentMarketing: 'Creates valuable content for customers',
        talentAcquisition: 'Improves hiring speed and quality',
        employeeTraining: 'Increases employee performance',
        financialReporting: 'Provides better financial insights',
        costOptimization: 'Reduces operational costs',
        processOptimization: 'Streamlines business operations',
        qualityAssurance: 'Ensures product quality',
        strategicPlanning: 'Improves long-term decision making',
        boardOfDirectors: 'Unlocks strategic guidance'
      };
      
      return descriptions[upgradeId] || 'Provides department-specific benefits';
    };
    
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.departmentName}>{department.name}</Text>
          <View style={styles.productionInfo}>
            <CurrencyDisplay
              value={metrics.productionRate.toFixed(1)}
              label="Production Rate"
              suffix="/sec"
              animated={false}
            />
            <CurrencyDisplay
              value={metrics.totalEmployees}
              label="Total Employees"
              animated={false}
            />
          </View>
        </View>
        
        {/* Employee Hiring Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Employees</Text>
          <View style={styles.employeeGrid}>
            {employeeTypes.map(([level, count]) => (
              <View key={level} style={styles.employeeRow}>
                <View style={styles.employeeInfo}>
                  <Text style={styles.employeeLevel}>{formatEmployeeLevel(level)}</Text>
                  <Text style={styles.employeeCount}>{count}</Text>
                </View>
                <BaseButton
                  title="Hire"
                  subtitle={`$${GameMath.formatCurrency(getHireCost(level, count))}`}
                  onPress={() => {
                    // Will integrate with gameActions
                    console.log(`Hiring ${level} for ${departmentType}`);
                  }}
                  variant="primary"
                  style={styles.hireButton}
                />
              </View>
            ))}
          </View>
        </View>
        
        {/* Upgrades Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upgrades</Text>
          <View style={styles.upgradesList}>
            {upgradeEntries.map(([upgradeId, upgrade]) => (
              <View key={upgradeId} style={styles.upgradeRow}>
                <View style={styles.upgradeInfo}>
                  <Text style={styles.upgradeName}>
                    {upgradeId.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Text>
                  <Text style={styles.upgradeDescription}>
                    {getUpgradeDescription(upgradeId)}
                  </Text>
                  <Text style={styles.upgradeLevel}>
                    Level {upgrade.level}/{upgrade.maxLevel}
                  </Text>
                </View>
                <BaseButton
                  title={upgrade.level >= upgrade.maxLevel ? 'Max' : 'Upgrade'}
                  subtitle={upgrade.level < upgrade.maxLevel ? '$50K' : ''}
                  onPress={() => {
                    // Will integrate with gameActions
                    console.log(`Upgrading ${upgradeId} for ${departmentType}`);
                  }}
                  disabled={upgrade.level >= upgrade.maxLevel}
                  variant="success"
                  style={styles.upgradeButton}
                />
              </View>
            ))}
          </View>
        </View>
        
        {/* Department-Specific Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Department Benefits</Text>
          <Text style={styles.benefitText}>
            {getDepartmentBenefits(departmentType)}
          </Text>
        </View>
      </View>
    );
  });
  
  function getDepartmentBenefits(deptType: DepartmentType): string {
    const benefits: Record<DepartmentType, string> = {
      development: 'Generates lines of code and features. Core to your business.',
      sales: 'Converts features into revenue. Increases customer acquisition.',
      marketing: 'Boosts sales effectiveness and brand awareness.',
      hr: 'Reduces hiring costs and improves employee efficiency company-wide.',
      finance: 'Optimizes costs and provides investment returns.',
      operations: 'Increases efficiency across all departments.',
      executive: 'Provides company-wide multipliers and strategic benefits.'
    };
    
    return benefits[deptType] || 'Provides valuable business benefits.';
  }
  
  const styles = StyleSheet.create({
    card: {
      backgroundColor: '#1a1a1a',
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: '#333333'
    },
    header: {
      marginBottom: 20
    },
    departmentName: {
      color: '#ffffff',
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 12
    },
    productionInfo: {
      flexDirection: 'row',
      gap: 12
    },
    section: {
      marginBottom: 20
    },
    sectionTitle: {
      color: '#ffffff',
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 12
    },
    employeeGrid: {
      gap: 8
    },
    employeeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#0a0a0a',
      padding: 12,
      borderRadius: 8
    },
    employeeInfo: {
      flex: 1
    },
    employeeLevel: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '500'
    },
    employeeCount: {
      color: '#8E8E93',
      fontSize: 14
    },
    hireButton: {
      minWidth: 80,
      paddingHorizontal: 12,
      minHeight: 40
    },
    upgradesList: {
      gap: 12
    },
    upgradeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#0a0a0a',
      padding: 12,
      borderRadius: 8
    },
    upgradeInfo: {
      flex: 1,
      marginRight: 12
    },
    upgradeName: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 4
    },
    upgradeDescription: {
      color: '#8E8E93',
      fontSize: 12,
      marginBottom: 4
    },
    upgradeLevel: {
      color: '#007AFF',
      fontSize: 12,
      fontWeight: '500'
    },
    upgradeButton: {
      minWidth: 80,
      paddingHorizontal: 12,
      minHeight: 40
    },
    benefitText: {
      color: '#8E8E93',
      fontSize: 14,
      lineHeight: 20,
      fontStyle: 'italic'
    }
  });
  EOF
  ```

### Prestige System Implementation
- [ ] **Create Prestige System** (4 hours)
  ```bash
  # Create prestige system with investor points
  cat > src/features/progression/state/prestigeStore.ts << 'EOF'
  import { observable, computed, batch } from '@legendapp/state';
  import { GameMath } from '../../../shared/utils/BigNumber';
  import { gameState$ } from '../../../core/state/gameStore';
  import { departmentStore$ } from '../../departments/state/departmentStore';
  
  export interface PrestigeState {
    investorPoints: string;
    totalInvestorPoints: string;
    prestigeCount: number;
    lastPrestigeTime: number;
    nextPrestigeCost: string;
    prestigeMultipliers: {
      codeGeneration: number;
      currencyGeneration: number;
      hireCostReduction: number;
      upgradeCostReduction: number;
    };
    achievements: Achievement[];
  }
  
  export interface Achievement {
    id: string;
    name: string;
    description: string;
    unlocked: boolean;
    unlockedAt?: number;
    reward: AchievementReward;
  }
  
  export interface AchievementReward {
    type: 'investorPoints' | 'multiplier' | 'unlock';
    value: string | number;
    target?: string;
  }
  
  const initialPrestigeState: PrestigeState = {
    investorPoints: '0',
    totalInvestorPoints: '0',
    prestigeCount: 0,
    lastPrestigeTime: 0,
    nextPrestigeCost: '10000000', // $10M for first prestige
    prestigeMultipliers: {
      codeGeneration: 1,
      currencyGeneration: 1,
      hireCostReduction: 1,
      upgradeCostReduction: 1
    },
    achievements: createInitialAchievements()
  };
  
  export const prestigeStore$ = observable<PrestigeState>(initialPrestigeState);
  
  // Computed prestige values
  export const prestigeEligibility$ = computed(() => {
    const gameState = gameState$.peek();
    const totalValuation = GameMath.currency(calculateTotalValuation());
    const minPrestigeValue = GameMath.currency(prestigeStore$.nextPrestigeCost.peek());
    const lastPrestige = prestigeStore$.lastPrestigeTime.peek();
    const cooldownPeriod = 5 * 60 * 1000; // 5 minutes
    
    const eligible = totalValuation.gte(minPrestigeValue) && 
                    (Date.now() - lastPrestige > cooldownPeriod);
    
    const investorPointsGained = eligible ? 
      calculateInvestorPointsGain(totalValuation) : GameMath.currency(0);
    
    return {
      eligible,
      currentValuation: totalValuation.toString(),
      requiredValuation: minPrestigeValue.toString(),
      investorPointsGained: investorPointsGained.toString(),
      cooldownRemaining: Math.max(0, cooldownPeriod - (Date.now() - lastPrestige))
    };
  });
  
  export const prestigeMultipliersActive$ = computed(() => {
    const ip = GameMath.currency(prestigeStore$.investorPoints.peek());
    const multipliers = prestigeStore$.prestigeMultipliers.peek();
    
    // Calculate multipliers based on investor points
    const codeBonus = ip.div(100).plus(1); // 1% per 100 IP
    const currencyBonus = ip.div(200).plus(1); // 0.5% per 100 IP
    const hireCostReduction = GameMath.max(GameMath.currency(0.5), GameMath.currency(1).minus(ip.div(500))); // Up to 50% reduction
    const upgradeCostReduction = GameMath.max(GameMath.currency(0.6), GameMath.currency(1).minus(ip.div(1000))); // Up to 40% reduction
    
    return {
      codeGeneration: codeBonus.toNumber(),
      currencyGeneration: currencyBonus.toNumber(),
      hireCostReduction: hireCostReduction.toNumber(),
      upgradeCostReduction: upgradeCostReduction.toNumber()
    };
  });
  
  // Prestige actions
  export const prestigeActions = {
    performPrestige: () => {
      const eligibility = prestigeEligibility$.peek();
      
      if (!eligibility.eligible) {
        console.warn('Prestige not eligible');
        return false;
      }
      
      const investorPointsGained = GameMath.currency(eligibility.investorPointsGained);
      
      batch(() => {
        // Add investor points
        const currentIP = GameMath.currency(prestigeStore$.investorPoints.peek());
        const totalIP = GameMath.currency(prestigeStore$.totalInvestorPoints.peek());
        
        prestigeStore$.investorPoints.set(currentIP.plus(investorPointsGained).toString());
        prestigeStore$.totalInvestorPoints.set(totalIP.plus(investorPointsGained).toString());
        
        // Reset game state
        resetGameState();
        
        // Update prestige metadata
        prestigeStore$.prestigeCount.set(prev => prev + 1);
        prestigeStore$.lastPrestigeTime.set(Date.now());
        prestigeStore$.nextPrestigeCost.set(
          GameMath.currency(prestigeStore$.nextPrestigeCost.peek())
            .multipliedBy(10) // Each prestige requires 10x more valuation
            .toString()
        );
        
        // Update multipliers
        const newMultipliers = prestigeMultipliersActive$.peek();
        prestigeStore$.prestigeMultipliers.set(newMultipliers);
        
        // Check for new achievements
        checkAchievements();
      });
      
      return true;
    },
    
    spendInvestorPoints: (amount: string, upgrade: string) => {
      const currentIP = GameMath.currency(prestigeStore$.investorPoints.peek());
      const cost = GameMath.currency(amount);
      
      if (currentIP.gte(cost)) {
        prestigeStore$.investorPoints.set(currentIP.minus(cost).toString());
        applyInvestorPointUpgrade(upgrade, amount);
        return true;
      }
      
      return false;
    }
  };
  
  function calculateTotalValuation(): string {
    const gameState = gameState$.peek();
    const departments = departmentStore$.peek();
    
    // Base valuation from currency and assets
    let totalValue = GameMath.currency(gameState.player.currency);
    
    // Add value from lines of code
    totalValue = totalValue.plus(
      GameMath.currency(gameState.player.linesOfCode).multipliedBy(10)
    );
    
    // Add value from employees (human capital)
    Object.values(departments).forEach(dept => {
      if (dept.unlocked) {
        Object.entries(dept.employees).forEach(([level, count]) => {
          const values = { junior: 1000, mid: 5000, senior: 20000, lead: 80000, director: 200000 };
          const employeeValue = values[level as keyof typeof values] || 1000;
          totalValue = totalValue.plus(GameMath.currency(employeeValue * count));
        });
      }
    });
    
    // Add value from upgrades
    Object.values(departments).forEach(dept => {
      if (dept.unlocked) {
        Object.values(dept.upgrades).forEach(upgrade => {
          if (upgrade.level > 0) {
            totalValue = totalValue.plus(GameMath.currency(50000 * upgrade.level));
          }
        });
      }
    });
    
    return totalValue.toString();
  }
  
  function calculateInvestorPointsGain(valuation: GameMath): GameMath {
    // Formula: sqrt(valuation / 1M) for investor points
    const valuationInMillions = valuation.div(1000000);
    return valuationInMillions.sqrt().integerValue();
  }
  
  function resetGameState() {
    // Reset player state but preserve some progression
    const currentState = gameState$.peek();
    
    gameState$.set({
      player: {
        currency: '0',
        linesOfCode: '0',
        features: { basic: 0, advanced: 0, premium: 0 },
        startTime: Date.now(),
        lastActiveTime: Date.now()
      },
      departments: createResetDepartments(),
      progression: {
        investorPoints: prestigeStore$.investorPoints.peek(),
        prestigeCount: prestigeStore$.prestigeCount.peek() + 1,
        lastPrestigeTime: Date.now(),
        achievements: currentState.progression.achievements
      },
      ui: {
        activeScreen: 'dashboard',
        showOfflineProgress: false,
        lastSaveTime: Date.now()
      }
    });
    
    // Reset departments but keep unlocks from previous prestiges
    const totalPrestiges = prestigeStore$.prestigeCount.peek();
    const autoUnlocks = Math.min(totalPrestiges, 3); // Unlock first 3 departments automatically
    
    const deptTypes = ['sales', 'marketing', 'hr', 'finance', 'operations', 'executive'];
    for (let i = 0; i < autoUnlocks && i < deptTypes.length; i++) {
      departmentStore$[deptTypes[i] as any].unlocked.set(true);
    }
  }
  
  function createResetDepartments() {
    // Create fresh department state - will be handled by departmentStore reset
    return {
      development: {
        employees: { junior: 0, mid: 0, senior: 0, lead: 0 },
        upgrades: {
          betterIde: { level: 0, maxLevel: 3, purchased: false },
          pairProgramming: { level: 0, maxLevel: 1, purchased: false },
          codeReviews: { level: 0, maxLevel: 1, purchased: false },
          advancedFrameworks: { level: 0, maxLevel: 2, purchased: false },
          cloudInfrastructure: { level: 0, maxLevel: 3, purchased: false }
        },
        production: { baseRate: 1, efficiency: 1, multiplier: 1 },
        unlocked: true
      }
    };
  }
  
  function createInitialAchievements(): Achievement[] {
    return [
      {
        id: 'first_employee',
        name: 'First Hire',
        description: 'Hire your first employee',
        unlocked: false,
        reward: { type: 'investorPoints', value: '10' }
      },
      {
        id: 'millionaire',
        name: 'Millionaire',
        description: 'Reach $1,000,000 in currency',
        unlocked: false,
        reward: { type: 'multiplier', value: 1.1, target: 'currency' }
      },
      {
        id: 'first_prestige',
        name: 'Angel Investor',
        description: 'Complete your first prestige',
        unlocked: false,
        reward: { type: 'investorPoints', value: '100' }
      },
      {
        id: 'all_departments',
        name: 'Corporate Empire',
        description: 'Unlock all departments',
        unlocked: false,
        reward: { type: 'multiplier', value: 2.0, target: 'global' }
      },
      {
        id: 'speed_runner',
        name: 'Speed Runner',
        description: 'Reach first prestige in under 2 hours',
        unlocked: false,
        reward: { type: 'investorPoints', value: '500' }
      }
    ];
  }
  
  function checkAchievements() {
    // Implementation for checking and unlocking achievements
    const achievements = prestigeStore$.achievements.peek();
    const gameState = gameState$.peek();
    
    achievements.forEach((achievement, index) => {
      if (achievement.unlocked) return;
      
      let shouldUnlock = false;
      
      switch (achievement.id) {
        case 'first_employee':
          const totalEmployees = Object.values(departmentStore$.peek()).reduce(
            (sum, dept) => sum + Object.values(dept.employees).reduce((empSum, count) => empSum + count, 0),
            0
          );
          shouldUnlock = totalEmployees > 0;
          break;
          
        case 'millionaire':
          shouldUnlock = GameMath.greaterThanOrEqual(gameState.player.currency, '1000000');
          break;
          
        case 'first_prestige':
          shouldUnlock = prestigeStore$.prestigeCount.peek() > 0;
          break;
          
        case 'all_departments':
          const allUnlocked = Object.values(departmentStore$.peek()).every(dept => dept.unlocked);
          shouldUnlock = allUnlocked;
          break;
          
        case 'speed_runner':
          const playTime = Date.now() - gameState.player.startTime;
          shouldUnlock = prestigeStore$.prestigeCount.peek() > 0 && playTime < 2 * 60 * 60 * 1000;
          break;
      }
      
      if (shouldUnlock) {
        prestigeStore$.achievements[index].unlocked.set(true);
        prestigeStore$.achievements[index].unlockedAt.set(Date.now());
        
        // Apply achievement reward
        if (achievement.reward.type === 'investorPoints') {
          const currentIP = GameMath.currency(prestigeStore$.investorPoints.peek());
          const bonus = GameMath.currency(achievement.reward.value);
          prestigeStore$.investorPoints.set(currentIP.plus(bonus).toString());
        }
      }
    });
  }
  
  function applyInvestorPointUpgrade(upgrade: string, amount: string) {
    // Implementation for investor point upgrades
    switch (upgrade) {
      case 'codeMultiplier':
        // Permanent code generation boost
        break;
      case 'currencyMultiplier':
        // Permanent currency generation boost
        break;
      case 'costReduction':
        // Permanent hiring cost reduction
        break;
    }
  }
  EOF
  ```

### Achievement System Implementation
- [ ] **Create Achievement UI** (2 hours)
  ```bash
  # Create achievement display component
  cat > src/features/progression/components/AchievementList.tsx << 'EOF'
  import React from 'react';
  import { View, Text, ScrollView, StyleSheet } from 'react-native';
  import { use$, observer } from '@legendapp/state/react';
  import { prestigeStore$ } from '../state/prestigeStore';
  import { GameMath } from '../../../shared/utils/BigNumber';
  
  export const AchievementList = observer(() => {
    const achievements = use$(prestigeStore$.achievements);
    
    const unlockedAchievements = achievements.filter(a => a.unlocked);
    const lockedAchievements = achievements.filter(a => !a.unlocked);
    
    const formatReward = (reward: any) => {
      switch (reward.type) {
        case 'investorPoints':
          return `+${GameMath.formatCurrency(reward.value)} IP`;
        case 'multiplier':
          return `${reward.value}x ${reward.target} multiplier`;
        case 'unlock':
          return 'Special unlock';
        default:
          return 'Special reward';
      }
    };
    
    const formatTimeAgo = (timestamp: number) => {
      const minutes = Math.floor((Date.now() - timestamp) / 60000);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    };
    
    return (
      <ScrollView style={styles.container}>
        {/* Unlocked Achievements */}
        {unlockedAchievements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Unlocked ({unlockedAchievements.length})
            </Text>
            {unlockedAchievements.map(achievement => (
              <View key={achievement.id} style={[styles.achievementCard, styles.unlockedCard]}>
                <View style={styles.achievementIcon}>
                  <Text style={styles.iconText}>🏆</Text>
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementName}>{achievement.name}</Text>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                  <View style={styles.achievementMeta}>
                    <Text style={styles.rewardText}>{formatReward(achievement.reward)}</Text>
                    {achievement.unlockedAt && (
                      <Text style={styles.timeText}>{formatTimeAgo(achievement.unlockedAt)}</Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
        
        {/* Locked Achievements */}
        {lockedAchievements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Locked ({lockedAchievements.length})
            </Text>
            {lockedAchievements.map(achievement => (
              <View key={achievement.id} style={[styles.achievementCard, styles.lockedCard]}>
                <View style={styles.achievementIcon}>
                  <Text style={styles.iconText}>🔒</Text>
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={[styles.achievementName, styles.lockedText]}>
                    {achievement.name}
                  </Text>
                  <Text style={[styles.achievementDescription, styles.lockedText]}>
                    {achievement.description}
                  </Text>
                  <Text style={[styles.rewardText, styles.lockedText]}>
                    {formatReward(achievement.reward)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    );
  });
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#0a0a0a',
      padding: 16
    },
    section: {
      marginBottom: 24
    },
    sectionTitle: {
      color: '#ffffff',
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 12
    },
    achievementCard: {
      flexDirection: 'row',
      backgroundColor: '#1a1a1a',
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      borderWidth: 1
    },
    unlockedCard: {
      borderColor: '#34C759'
    },
    lockedCard: {
      borderColor: '#333333',
      opacity: 0.7
    },
    achievementIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#333333',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12
    },
    iconText: {
      fontSize: 20
    },
    achievementInfo: {
      flex: 1
    },
    achievementName: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 4
    },
    achievementDescription: {
      color: '#8E8E93',
      fontSize: 14,
      marginBottom: 8
    },
    achievementMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    rewardText: {
      color: '#34C759',
      fontSize: 12,
      fontWeight: '600'
    },
    timeText: {
      color: '#8E8E93',
      fontSize: 12
    },
    lockedText: {
      opacity: 0.6
    }
  });
  EOF
  ```

### Integration with Game State
- [ ] **Update Game State for Full Integration** (2 hours)
  ```bash
  # Update main game store to integrate all systems
  cat >> src/core/state/gameStore.ts << 'EOF'
  
  // Import new systems
  import { departmentStore$, departmentActions } from '../../features/departments/state/departmentStore';
  import { prestigeStore$, prestigeActions } from '../../features/progression/state/prestigeStore';
  
  // Enhanced game actions with full integration
  export const fullGameActions = {
    ...enhancedGameActions,
    ...departmentActions,
    ...prestigeActions,
    
    // Integrated hiring with prestige bonuses
    hireDeveloperWithBonuses: (department: DepartmentType, level: keyof EmployeeCount) => {
      const dept = departmentStore$[department].peek();
      if (!dept.unlocked) return false;
      
      const baseCost = calculateHireCost(department, level, dept.employees[level] || 0);
      const prestigeMultipliers = prestigeMultipliersActive$.peek();
      const finalCost = baseCost.multipliedBy(prestigeMultipliers.hireCostReduction);
      
      const currentCurrency = GameMath.currency(gameState$.player.currency.peek());
      
      if (currentCurrency.gte(finalCost)) {
        batch(() => {
          gameState$.player.currency.set(currentCurrency.minus(finalCost).toString());
          departmentStore$[department].employees[level].set(prev => (prev || 0) + 1);
          
          // Update production rates
          updateDepartmentProduction(department);
          
          // Check achievements
          checkHiringAchievements();
        });
        
        return true;
      }
      
      return false;
    },
    
    // Integrated upgrade purchasing with bonuses
    purchaseUpgradeWithBonuses: (department: DepartmentType, upgradeId: string) => {
      const dept = departmentStore$[department].peek();
      const upgrade = dept.upgrades[upgradeId];
      
      if (!upgrade || upgrade.level >= upgrade.maxLevel) return false;
      
      const baseCost = calculateUpgradeCost(department, upgradeId, upgrade.level);
      const prestigeMultipliers = prestigeMultipliersActive$.peek();
      const finalCost = baseCost.multipliedBy(prestigeMultipliers.upgradeCostReduction);
      
      const currentCurrency = GameMath.currency(gameState$.player.currency.peek());
      
      if (currentCurrency.gte(finalCost)) {
        batch(() => {
          gameState$.player.currency.set(currentCurrency.minus(finalCost).toString());
          departmentStore$[department].upgrades[upgradeId].level.set(prev => prev + 1);
          
          if (upgrade.level + 1 >= upgrade.maxLevel) {
            departmentStore$[department].upgrades[upgradeId].purchased.set(true);
          }
          
          // Update production rates
          updateDepartmentProduction(department);
        });
        
        return true;
      }
      
      return false;
    }
  };
  
  // Helper functions for integration
  function updateDepartmentProduction(department: DepartmentType) {
    const dept = departmentStore$[department].peek();
    const prestigeMultipliers = prestigeMultipliersActive$.peek();
    
    // Calculate base production from employees
    let baseProduction = calculateBaseProduction(department, dept.employees);
    
    // Apply upgrade bonuses
    baseProduction *= calculateUpgradeBonuses(department, dept.upgrades);
    
    // Apply prestige bonuses
    if (department === 'development') {
      baseProduction *= prestigeMultipliers.codeGeneration;
    } else {
      baseProduction *= prestigeMultipliers.currencyGeneration;
    }
    
    departmentStore$[department].production.baseRate.set(baseProduction);
    
    // Update efficiency based on other departments
    const efficiency = calculateDepartmentEfficiency(department);
    departmentStore$[department].production.efficiency.set(efficiency);
  }
  
  function calculateBaseProduction(department: DepartmentType, employees: EmployeeCount): number {
    const productionRates = {
      development: { junior: 1, mid: 3, senior: 8, lead: 20 },
      sales: { junior: 2, mid: 5, senior: 12, lead: 25 },
      marketing: { junior: 1.5, mid: 4, senior: 10, lead: 22 },
      hr: { junior: 0.5, mid: 1.5, senior: 3, lead: 6 },
      finance: { junior: 3, mid: 8, senior: 18, lead: 40 },
      operations: { junior: 2, mid: 6, senior: 15, lead: 35 },
      executive: { junior: 10, mid: 25, senior: 50, lead: 100, director: 200 }
    };
    
    const rates = productionRates[department];
    return Object.entries(employees).reduce((total, [level, count]) => {
      return total + (rates[level as keyof typeof rates] || 0) * (count || 0);
    }, 0);
  }
  
  function calculateUpgradeBonuses(department: DepartmentType, upgrades: any): number {
    let multiplier = 1;
    
    Object.entries(upgrades).forEach(([upgradeId, upgrade]: [string, any]) => {
      if (upgrade.level > 0) {
        switch (upgradeId) {
          case 'betterIde':
            multiplier *= (1 + upgrade.level * 0.25);
            break;
          case 'pairProgramming':
            multiplier *= upgrade.level > 0 ? 1.5 : 1;
            break;
          case 'codeReviews':
            multiplier *= upgrade.level > 0 ? 1.3 : 1;
            break;
          // Add more upgrade bonuses as needed
          default:
            multiplier *= (1 + upgrade.level * 0.1);
        }
      }
    });
    
    return multiplier;
  }
  
  function calculateDepartmentEfficiency(department: DepartmentType): number {
    let efficiency = 1;
    const allDepartments = departmentStore$.peek();
    
    // HR boosts efficiency across all departments
    if (allDepartments.hr.unlocked) {
      const hrProduction = allDepartments.hr.production.baseRate;
      efficiency *= (1 + hrProduction * 0.01); // 1% per HR production point
    }
    
    // Operations provides additional efficiency
    if (allDepartments.operations.unlocked) {
      const opsProduction = allDepartments.operations.production.baseRate;
      efficiency *= (1 + opsProduction * 0.005); // 0.5% per Operations production point
    }
    
    // Executive provides company-wide bonuses
    if (allDepartments.executive.unlocked) {
      const execProduction = allDepartments.executive.production.baseRate;
      efficiency *= (1 + execProduction * 0.002); // 0.2% per Executive production point
    }
    
    return efficiency;
  }
  
  function checkHiringAchievements() {
    // Check if first employee achievement should be unlocked
    const totalEmployees = Object.values(departmentStore$.peek()).reduce(
      (sum, dept) => sum + Object.values(dept.employees).reduce((empSum, count) => empSum + (count || 0), 0),
      0
    );
    
    if (totalEmployees === 1) {
      // Unlock first employee achievement
      const achievements = prestigeStore$.achievements.peek();
      const firstEmployeeIndex = achievements.findIndex(a => a.id === 'first_employee');
      if (firstEmployeeIndex >= 0 && !achievements[firstEmployeeIndex].unlocked) {
        prestigeStore$.achievements[firstEmployeeIndex].unlocked.set(true);
        prestigeStore$.achievements[firstEmployeeIndex].unlockedAt.set(Date.now());
      }
    }
  }
  EOF
  ```

---

## Quality Gates & Validation

### Functional Validation
- [ ] **Department System Testing**
  ```bash
  # Test all department mechanics
  echo "Testing department systems..."
  
  # Manual validation steps:
  # 1. All 7 departments can be unlocked
  # 2. Each department has unique upgrade trees
  # 3. Employees can be hired at different levels
  # 4. Production rates scale appropriately
  # 5. Department synergies work correctly
  
  echo "Department validation required:"
  echo "1. Unlock all departments in sequence"
  echo "2. Hire employees in each department"
  echo "3. Purchase upgrades and verify effects"
  echo "4. Test department interactions/synergies"
  ```

### Prestige System Validation
- [ ] **Test Prestige Mechanics**
  ```bash
  # Create prestige test script
  cat > scripts/test-prestige.js << 'EOF'
  console.log('Prestige System Test Checklist:');
  console.log('1. Reach $10M company valuation');
  console.log('2. Prestige option becomes available');
  console.log('3. Investor points calculated correctly');
  console.log('4. Game state resets but keeps progression');
  console.log('5. Prestige bonuses apply correctly');
  console.log('6. Achievement system tracks properly');
  console.log('7. Multiple prestige cycles work');
  EOF
  
  node scripts/test-prestige.js
  ```

### Performance Validation
- [ ] **Verify Performance with All Systems**
  - Test 60 FPS with all 7 departments active
  - Monitor memory usage with full progression unlocked
  - Verify no performance degradation after multiple prestiges
  - Test smooth operation with 100+ employees across departments

### Balance Validation
- [ ] **Game Balance Testing**
  ```bash
  # Create balance test guidelines
  echo "Balance Testing Guidelines:"
  echo "1. First prestige achievable in 2-4 hours"
  echo "2. Each department feels meaningfully different"
  echo "3. Progression curve remains engaging"
  echo "4. No single department dominates strategy"
  echo "5. Prestige bonuses provide meaningful improvements"
  echo "6. Achievement milestones feel appropriate"
  ```

---

## Deliverables

### Required Outputs
1. **Complete Department System** with all 7 departments functional
2. **Prestige Mechanics** with investor points and multipliers
3. **Achievement System** with meaningful milestones and rewards
4. **Department UI** with hiring, upgrades, and management interfaces
5. **Balanced Progression** ensuring engaging gameplay through multiple prestiges
6. **Performance Maintenance** with all systems active

### Documentation Updates
- [ ] **Update Game Design Document**
  - Document final department mechanics and synergies
  - Record prestige balance and progression curves
  - Note any deviations from original specifications

### Validation Checklist
- [ ] All 7 departments unlock and function correctly
- [ ] Employee hiring works across all departments and levels
- [ ] Upgrade trees provide meaningful progression
- [ ] Department synergies create strategic depth
- [ ] Prestige system provides compelling reset mechanics
- [ ] Achievement system tracks and rewards appropriately
- [ ] 60 FPS maintained with full system complexity
- [ ] Memory usage stable through multiple prestige cycles
- [ ] Game balance feels engaging and strategic

---

**Time Tracking**: Record actual time vs estimates
- [ ] Department architecture: __ hours (est: 3)
- [ ] Department store creation: __ hours (est: 4)  
- [ ] Department UI implementation: __ hours (est: 5)
- [ ] Department card components: __ hours (est: 3)
- [ ] Prestige system: __ hours (est: 4)
- [ ] Achievement system: __ hours (est: 2)
- [ ] Integration and balance: __ hours (est: 2)
- [ ] **Total Phase 3**: __ hours (est: 23-27 hours over 3-4 days)

**Critical Success Metrics**:
- [ ] All departments provide unique strategic value
- [ ] Prestige system creates compelling long-term progression
- [ ] Achievement system provides meaningful goals
- [ ] Game balance maintains engagement through multiple cycles
- [ ] Performance targets maintained with full complexity

**Next Phase**: [04-quality.md](./04-quality.md) - Polish, Performance Optimization, and User Experience Enhancement

**Go/No-Go Decision**: Core idle game loop must be engaging and all departments must provide meaningful strategic choices before proceeding to polish phase.