# Phase 3: Department Systems & Integration

## Objectives
- Implement all 7 department systems (Development, Sales, CX, Product, Design, QA, Marketing)
- Create employee hiring and management mechanics
- Build manager automation systems
- Develop prestige system with investor rounds
- Integrate department synergies and unlock mechanics

## Prerequisites
- Phase 2 Core Features completed ✅
- Game loop and resource system functional ✅
- Basic UI components implemented ✅

## Tasks Checklist

### 1. Complete Department State Management

- [ ] **Expand Department State Schema**
  ```typescript
  // src/features/departments/state/departmentState$.ts
  import { observable } from '@legendapp/state';
  
  export const departmentState$ = observable({
    development: {
      unlocked: true,
      employees: {
        junior: { count: 0, cost: 10, production: 0.1 },
        mid: { count: 0, cost: 100, production: 1 },
        senior: { count: 0, cost: 1000, production: 10 },
        lead: { count: 0, cost: 10000, production: 100 }
      },
      manager: { unlocked: false, hired: false, cost: 50000 },
      get totalProduction() {
        const multiplier = this.manager.hired ? 2.0 : 1.0;
        return Object.values(this.employees).reduce((total, emp) => 
          total + (emp.count * emp.production), 0) * multiplier;
      },
      get totalCost() {
        return Object.values(this.employees).reduce((total, emp) => 
          total + (emp.count * emp.cost * Math.pow(1.15, emp.count)), 0);
      }
    },
    
    sales: {
      unlocked: false,
      unlockThreshold: 500, // 500 lines of code
      employees: {
        rep: { count: 0, cost: 25, production: 0.2 },
        manager: { count: 0, cost: 500, production: 2 },
        director: { count: 0, cost: 5000, production: 20 }
      },
      manager: { unlocked: false, hired: false, cost: 75000 }
    },
    
    customerExperience: {
      unlocked: false,
      unlockThreshold: 1000, // $1000 revenue
      employees: {
        support: { count: 0, cost: 15, production: 0.15 },
        specialist: { count: 0, cost: 200, production: 1.5 },
        manager: { count: 0, cost: 2500, production: 15 }
      },
      manager: { unlocked: false, hired: false, cost: 60000 }
    },
    
    product: {
      unlocked: false,
      unlockThreshold: 2500, // 2500 lines of code
      employees: {
        analyst: { count: 0, cost: 30, production: 0.3 },
        manager: { count: 0, cost: 400, production: 3 },
        director: { count: 0, cost: 4000, production: 30 }
      },
      manager: { unlocked: false, hired: false, cost: 80000 }
    },
    
    design: {
      unlocked: false,
      unlockThreshold: 10, // 10 features
      employees: {
        designer: { count: 0, cost: 40, production: 0.4 },
        senior: { count: 0, cost: 600, production: 4 },
        lead: { count: 0, cost: 6000, production: 40 }
      },
      manager: { unlocked: false, hired: false, cost: 90000 }
    },
    
    qa: {
      unlocked: false,
      unlockThreshold: 100, // 100 features
      employees: {
        tester: { count: 0, cost: 20, production: 0.2 },
        automation: { count: 0, cost: 300, production: 2.5 },
        lead: { count: 0, cost: 3500, production: 25 }
      },
      manager: { unlocked: false, hired: false, cost: 70000 }
    },
    
    marketing: {
      unlocked: false,
      unlockThreshold: 10000, // $10,000 revenue
      employees: {
        coordinator: { count: 0, cost: 50, production: 0.5 },
        specialist: { count: 0, cost: 800, production: 5 },
        director: { count: 0, cost: 8000, production: 50 }
      },
      manager: { unlocked: false, hired: false, cost: 100000 }
    }
  });
  ```

### 2. Department Unlock System

- [ ] **Create Department Unlock Logic**
  ```typescript
  // src/features/departments/services/departmentUnlocker.ts
  import { departmentState$ } from '../state/departmentState$';
  import { gameState$ } from '../../game-core/state/gameState$';
  
  export class DepartmentUnlocker {
    static checkUnlocks() {
      const resources = gameState$.resources.get();
      const departments = departmentState$.get();
      
      // Sales department
      if (!departments.sales.unlocked && resources.code >= 500) {
        departmentState$.sales.unlocked.set(true);
        this.showUnlockNotification('Sales', 'Convert code into revenue!');
      }
      
      // Customer Experience
      if (!departments.customerExperience.unlocked && resources.money >= 1000) {
        departmentState$.customerExperience.unlocked.set(true);
        this.showUnlockNotification('Customer Experience', 'Keep customers happy!');
      }
      
      // Product department
      if (!departments.product.unlocked && resources.code >= 2500) {
        departmentState$.product.unlocked.set(true);
        this.showUnlockNotification('Product', 'Define what to build!');
      }
      
      // Design department
      if (!departments.design.unlocked && resources.features >= 10) {
        departmentState$.design.unlocked.set(true);
        this.showUnlockNotification('Design', 'Make it beautiful!');
      }
      
      // QA department
      if (!departments.qa.unlocked && resources.features >= 100) {
        departmentState$.qa.unlocked.set(true);
        this.showUnlockNotification('QA', 'Prevent bugs and ensure quality!');
      }
      
      // Marketing department
      if (!departments.marketing.unlocked && resources.money >= 10000) {
        departmentState$.marketing.unlocked.set(true);
        this.showUnlockNotification('Marketing', 'Spread the word!');
      }
    }
    
    private static showUnlockNotification(department: string, description: string) {
      console.log(`🎉 ${department} Department Unlocked: ${description}`);
      // Trigger achievement notification system
    }
  }
  ```

### 3. Employee Management Components

- [ ] **Create Employee Card Component**
  ```typescript
  // src/features/departments/components/EmployeeCard.tsx
  import React from 'react';
  import { View, Text, StyleSheet, Pressable } from 'react-native';
  import { observer } from '@legendapp/state/react';
  import { formatNumber, formatCurrency } from '../../ui/utils/formatters';
  
  interface EmployeeCardProps {
    name: string;
    count: number;
    cost: number;
    production: number;
    onHire: () => void;
    canAfford: boolean;
    icon: string;
  }
  
  const EmployeeCard = observer<EmployeeCardProps>(({
    name,
    count,
    cost,
    production,
    onHire,
    canAfford,
    icon
  }) => {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.count}>x{count}</Text>
        </View>
        
        <View style={styles.stats}>
          <Text style={styles.production}>
            {formatNumber(production * count)}/s
          </Text>
          <Text style={styles.cost}>
            Cost: {formatCurrency(cost)}
          </Text>
        </View>
        
        <Pressable 
          style={[
            styles.hireButton, 
            !canAfford && styles.disabledButton
          ]}
          onPress={onHire}
          disabled={!canAfford}
        >
          <Text style={[
            styles.hireText,
            !canAfford && styles.disabledText
          ]}>
            Hire
          </Text>
        </Pressable>
      </View>
    );
  });
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: '#fff',
      margin: 5,
      padding: 15,
      borderRadius: 10,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    icon: {
      fontSize: 24,
      marginRight: 10,
    },
    name: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
    },
    count: {
      fontSize: 14,
      color: '#666',
      backgroundColor: '#f0f0f0',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
    },
    stats: {
      marginBottom: 10,
    },
    production: {
      fontSize: 14,
      color: '#4CAF50',
      fontWeight: '500',
    },
    cost: {
      fontSize: 12,
      color: '#666',
    },
    hireButton: {
      backgroundColor: '#2196F3',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 6,
    },
    disabledButton: {
      backgroundColor: '#ccc',
    },
    hireText: {
      color: '#fff',
      textAlign: 'center',
      fontWeight: '600',
    },
    disabledText: {
      color: '#999',
    },
  });
  
  export default EmployeeCard;
  ```

- [ ] **Create Department Panel Component**
  ```typescript
  // src/features/departments/components/DepartmentPanel.tsx
  import React from 'react';
  import { View, Text, StyleSheet, ScrollView } from 'react-native';
  import { observer } from '@legendapp/state/react';
  import { departmentState$ } from '../state/departmentState$';
  import { gameState$ } from '../../game-core/state/gameState$';
  import EmployeeCard from './EmployeeCard';
  import ManagerCard from './ManagerCard';
  
  interface DepartmentPanelProps {
    departmentKey: string;
    title: string;
    description: string;
    icon: string;
  }
  
  const DepartmentPanel = observer<DepartmentPanelProps>(({
    departmentKey,
    title,
    description,
    icon
  }) => {
    const department = departmentState$[departmentKey].get();
    const resources = gameState$.resources.get();
    
    if (!department.unlocked) {
      return (
        <View style={styles.lockedContainer}>
          <Text style={styles.lockedIcon}>🔒</Text>
          <Text style={styles.lockedTitle}>{title}</Text>
          <Text style={styles.lockedDescription}>
            Unlock at {department.unlockThreshold} threshold
          </Text>
        </View>
      );
    }
    
    const hireEmployee = (employeeType: string) => {
      const employee = department.employees[employeeType];
      const cost = Math.floor(employee.cost * Math.pow(1.15, employee.count));
      
      if (resources.money >= cost) {
        gameState$.resources.money.set(prev => prev - cost);
        departmentState$[departmentKey].employees[employeeType].count.set(prev => prev + 1);
      }
    };
    
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerIcon}>{icon}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
        
        <Text style={styles.description}>{description}</Text>
        
        <Text style={styles.sectionTitle}>Employees</Text>
        {Object.entries(department.employees).map(([key, employee]) => {
          const cost = Math.floor(employee.cost * Math.pow(1.15, employee.count));
          return (
            <EmployeeCard
              key={key}
              name={key.charAt(0).toUpperCase() + key.slice(1)}
              count={employee.count}
              cost={cost}
              production={employee.production}
              onHire={() => hireEmployee(key)}
              canAfford={resources.money >= cost}
              icon={this.getEmployeeIcon(key)}
            />
          );
        })}
        
        {department.manager && (
          <ManagerCard
            department={departmentKey}
            manager={department.manager}
            canAfford={resources.money >= department.manager.cost}
          />
        )}
      </ScrollView>
    );
  });
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f8f9fa',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      backgroundColor: '#fff',
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    headerIcon: {
      fontSize: 32,
      marginRight: 15,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#333',
    },
    description: {
      padding: 15,
      fontSize: 16,
      color: '#666',
      backgroundColor: '#fff',
      marginBottom: 10,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      margin: 15,
      color: '#333',
    },
    lockedContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f8f9fa',
    },
    lockedIcon: {
      fontSize: 48,
      marginBottom: 15,
    },
    lockedTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#999',
      marginBottom: 10,
    },
    lockedDescription: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
    },
  });
  
  export default DepartmentPanel;
  ```

### 4. Manager Automation System

- [ ] **Create Manager Card Component**
  ```typescript
  // src/features/departments/components/ManagerCard.tsx
  import React from 'react';
  import { View, Text, StyleSheet, Pressable } from 'react-native';
  import { observer } from '@legendapp/state/react';
  import { departmentState$ } from '../state/departmentState$';
  import { gameState$ } from '../../game-core/state/gameState$';
  import { formatCurrency } from '../../ui/utils/formatters';
  
  interface ManagerCardProps {
    department: string;
    manager: {
      unlocked: boolean;
      hired: boolean;
      cost: number;
    };
    canAfford: boolean;
  }
  
  const ManagerCard = observer<ManagerCardProps>(({
    department,
    manager,
    canAfford
  }) => {
    const hireManager = () => {
      if (canAfford && !manager.hired) {
        gameState$.resources.money.set(prev => prev - manager.cost);
        departmentState$[department].manager.hired.set(true);
      }
    };
    
    if (manager.hired) {
      return (
        <View style={[styles.container, styles.hiredContainer]}>
          <Text style={styles.icon}>👔</Text>
          <View style={styles.content}>
            <Text style={styles.title}>Department Manager</Text>
            <Text style={styles.benefit}>2x Production Multiplier Active</Text>
            <Text style={styles.status}>✅ Hired</Text>
          </View>
        </View>
      );
    }
    
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>👔</Text>
        <View style={styles.content}>
          <Text style={styles.title}>Department Manager</Text>
          <Text style={styles.benefit}>Doubles all employee production</Text>
          <Text style={styles.cost}>Cost: {formatCurrency(manager.cost)}</Text>
        </View>
        <Pressable
          style={[
            styles.hireButton,
            !canAfford && styles.disabledButton
          ]}
          onPress={hireManager}
          disabled={!canAfford}
        >
          <Text style={[
            styles.hireText,
            !canAfford && styles.disabledText
          ]}>
            Hire
          </Text>
        </Pressable>
      </View>
    );
  });
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: '#fff',
      margin: 15,
      padding: 20,
      borderRadius: 15,
      elevation: 3,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#FFD700',
    },
    hiredContainer: {
      backgroundColor: '#f0f8f0',
      borderColor: '#4CAF50',
    },
    icon: {
      fontSize: 36,
      marginRight: 15,
    },
    content: {
      flex: 1,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
    },
    benefit: {
      fontSize: 14,
      color: '#666',
      marginVertical: 5,
    },
    cost: {
      fontSize: 14,
      color: '#FF5722',
      fontWeight: '600',
    },
    status: {
      fontSize: 14,
      color: '#4CAF50',
      fontWeight: '600',
    },
    hireButton: {
      backgroundColor: '#FF9800',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    disabledButton: {
      backgroundColor: '#ccc',
    },
    hireText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    disabledText: {
      color: '#999',
    },
  });
  
  export default ManagerCard;
  ```

### 5. Prestige System Implementation

- [ ] **Create Prestige State Management**
  ```typescript
  // src/features/prestige/state/prestigeState$.ts
  import { observable } from '@legendapp/state';
  
  export const prestigeState$ = observable({
    currentRun: {
      valuation: 0,
      startTime: Date.now(),
      achievementsUnlocked: [] as string[]
    },
    
    lifetime: {
      totalInvestorPoints: 0,
      totalRuns: 0,
      fastestIPO: Infinity,
      bestValuation: 0,
      
      // Permanent bonuses
      get startingCapitalBonus() {
        return Math.floor(this.totalInvestorPoints * 0.1); // 10% per IP
      },
      
      get globalSpeedBonus() {
        return this.totalInvestorPoints * 0.01; // 1% per IP
      },
      
      get maxOfflineHours() {
        return 8 + Math.floor(this.totalInvestorPoints / 10); // Base 8h + bonus
      }
    },
    
    // Prestige calculation
    get availableInvestorPoints() {
      const totalValue = this.currentRun.valuation;
      if (totalValue < 1000000) return 0; // $1M minimum for prestige
      return Math.floor(Math.sqrt(totalValue / 1000000));
    },
    
    get shouldShowPrestigeOption() {
      return this.availableInvestorPoints > 0;
    }
  });
  ```

- [ ] **Create Prestige Calculator Service**
  ```typescript
  // src/features/prestige/services/prestigeCalculator.ts
  import { gameState$ } from '../../game-core/state/gameState$';
  import { departmentState$ } from '../../departments/state/departmentState$';
  import { prestigeState$ } from '../state/prestigeState$';
  import { batch } from '@legendapp/state';
  
  export class PrestigeCalculator {
    static calculateCurrentValuation(): number {
      const resources = gameState$.resources.get();
      const departments = departmentState$.get();
      
      // Base valuation from resources
      let valuation = resources.money;
      valuation += resources.features * 1000; // Features worth $1K each
      valuation += resources.leads * 500; // Leads worth $500 each
      
      // Employee value calculation
      Object.values(departments).forEach(dept => {
        if (!dept.unlocked) return;
        
        Object.values(dept.employees).forEach(emp => {
          valuation += emp.count * emp.cost * 10; // Employees add 10x their cost
        });
        
        if (dept.manager?.hired) {
          valuation += dept.manager.cost * 5; // Managers add 5x their cost
        }
      });
      
      return Math.floor(valuation);
    }
    
    static performPrestige(): boolean {
      const investorPoints = prestigeState$.availableInvestorPoints.get();
      
      if (investorPoints <= 0) return false;
      
      // Calculate run stats
      const runTime = Date.now() - prestigeState$.currentRun.startTime.get();
      const currentValuation = this.calculateCurrentValuation();
      
      batch(() => {
        // Add investor points
        prestigeState$.lifetime.totalInvestorPoints.set(prev => prev + investorPoints);
        prestigeState$.lifetime.totalRuns.set(prev => prev + 1);
        
        // Update records
        if (runTime < prestigeState$.lifetime.fastestIPO.get()) {
          prestigeState$.lifetime.fastestIPO.set(runTime);
        }
        
        if (currentValuation > prestigeState$.lifetime.bestValuation.get()) {
          prestigeState$.lifetime.bestValuation.set(currentValuation);
        }
        
        // Reset game state
        gameState$.resources.set({
          code: prestigeState$.lifetime.startingCapitalBonus.get(),
          features: 0,
          money: prestigeState$.lifetime.startingCapitalBonus.get(),
          leads: 0,
        });
        
        // Reset departments but keep unlocks based on IP
        this.resetDepartmentsWithBonuses();
        
        // Start new run
        prestigeState$.currentRun.set({
          valuation: 0,
          startTime: Date.now(),
          achievementsUnlocked: []
        });
      });
      
      return true;
    }
    
    private static resetDepartmentsWithBonuses() {
      const totalIP = prestigeState$.lifetime.totalInvestorPoints.get();
      
      // Keep some departments unlocked based on IP
      const keepUnlocked = {
        development: true,
        sales: totalIP >= 5,
        customerExperience: totalIP >= 10,
        product: totalIP >= 15,
        design: totalIP >= 20,
        qa: totalIP >= 25,
        marketing: totalIP >= 30
      };
      
      Object.entries(departmentState$.get()).forEach(([key, dept]) => {
        departmentState$[key].unlocked.set(keepUnlocked[key] || false);
        
        // Reset all employee counts
        Object.keys(dept.employees).forEach(empKey => {
          departmentState$[key].employees[empKey].count.set(0);
        });
        
        // Reset managers
        if (dept.manager) {
          departmentState$[key].manager.hired.set(false);
        }
      });
    }
  }
  ```

### 6. Department Navigation System

- [ ] **Create Department Tabs Component**
  ```typescript
  // src/features/departments/components/DepartmentTabs.tsx
  import React, { useState } from 'react';
  import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    Pressable 
  } from 'react-native';
  import { observer } from '@legendapp/state/react';
  import { departmentState$ } from '../state/departmentState$';
  import DepartmentPanel from './DepartmentPanel';
  
  const DepartmentTabs = observer(() => {
    const [activeTab, setActiveTab] = useState('development');
    const departments = departmentState$.get();
    
    const departmentConfigs = [
      { key: 'development', title: 'Development', icon: '💻', description: 'Write code to build features' },
      { key: 'sales', title: 'Sales', icon: '💰', description: 'Convert leads into revenue' },
      { key: 'customerExperience', title: 'Customer Experience', icon: '😊', description: 'Keep customers happy and loyal' },
      { key: 'product', title: 'Product', icon: '📋', description: 'Define what features to build' },
      { key: 'design', title: 'Design', icon: '🎨', description: 'Make your product beautiful' },
      { key: 'qa', title: 'QA', icon: '🐛', description: 'Ensure quality and prevent bugs' },
      { key: 'marketing', title: 'Marketing', icon: '📢', description: 'Generate leads and awareness' },
    ];
    
    const unlockedDepartments = departmentConfigs.filter(dept => 
      departments[dept.key]?.unlocked
    );
    
    return (
      <View style={styles.container}>
        <ScrollView 
          horizontal 
          style={styles.tabBar}
          showsHorizontalScrollIndicator={false}
        >
          {unlockedDepartments.map(dept => (
            <Pressable
              key={dept.key}
              style={[
                styles.tab,
                activeTab === dept.key && styles.activeTab
              ]}
              onPress={() => setActiveTab(dept.key)}
            >
              <Text style={styles.tabIcon}>{dept.icon}</Text>
              <Text style={[
                styles.tabText,
                activeTab === dept.key && styles.activeTabText
              ]}>
                {dept.title}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        
        <DepartmentPanel
          departmentKey={activeTab}
          title={departmentConfigs.find(d => d.key === activeTab)?.title || ''}
          description={departmentConfigs.find(d => d.key === activeTab)?.description || ''}
          icon={departmentConfigs.find(d => d.key === activeTab)?.icon || ''}
        />
      </View>
    );
  });
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    tabBar: {
      backgroundColor: '#fff',
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
      maxHeight: 60,
    },
    tab: {
      paddingHorizontal: 15,
      paddingVertical: 10,
      alignItems: 'center',
      minWidth: 80,
    },
    activeTab: {
      borderBottomWidth: 3,
      borderBottomColor: '#2196F3',
    },
    tabIcon: {
      fontSize: 16,
      marginBottom: 2,
    },
    tabText: {
      fontSize: 12,
      color: '#666',
      textAlign: 'center',
    },
    activeTabText: {
      color: '#2196F3',
      fontWeight: '600',
    },
  });
  
  export default DepartmentTabs;
  ```

### 7. Enhanced Game Engine with Departments

- [ ] **Update Game Engine for Department Production**
  ```typescript
  // src/features/game-core/services/gameEngine.ts (Updated)
  import { gameState$ } from '../state/gameState$';
  import { departmentState$ } from '../../departments/state/departmentState$';
  import { prestigeState$ } from '../../prestige/state/prestigeState$';
  import { DepartmentUnlocker } from '../../departments/services/departmentUnlocker';
  import { PrestigeCalculator } from '../../prestige/services/prestigeCalculator';
  import { batch } from '@legendapp/state';
  
  export class GameEngine {
    private static gameLoopInterval: NodeJS.Timeout | null = null;
    private static unlockCheckInterval: NodeJS.Timeout | null = null;
    
    static start() {
      this.gameLoopInterval = setInterval(() => {
        this.updateProduction();
      }, 100); // 10 FPS game logic
      
      this.unlockCheckInterval = setInterval(() => {
        DepartmentUnlocker.checkUnlocks();
        this.updatePrestigeValuation();
      }, 1000); // Check unlocks every second
    }
    
    static stop() {
      if (this.gameLoopInterval) {
        clearInterval(this.gameLoopInterval);
        this.gameLoopInterval = null;
      }
      
      if (this.unlockCheckInterval) {
        clearInterval(this.unlockCheckInterval);
        this.unlockCheckInterval = null;
      }
    }
    
    private static updateProduction() {
      const departments = departmentState$.get();
      const globalMultiplier = 1 + prestigeState$.lifetime.globalSpeedBonus.get();
      
      let codeProduction = 0;
      let featureProduction = 0;
      let moneyProduction = 0;
      let leadProduction = 0;
      
      // Calculate production from all departments
      Object.entries(departments).forEach(([deptName, dept]) => {
        if (!dept.unlocked) return;
        
        const deptMultiplier = dept.manager?.hired ? 2.0 : 1.0;
        
        Object.entries(dept.employees).forEach(([empType, emp]) => {
          const production = emp.count * emp.production * deptMultiplier * globalMultiplier;
          
          switch (deptName) {
            case 'development':
              codeProduction += production;
              break;
            case 'sales':
              moneyProduction += production * 2;
              leadProduction += production * 0.5;
              break;
            case 'customerExperience':
              // CX improves all department efficiency
              const cxBonus = production * 0.1;
              codeProduction += cxBonus;
              moneyProduction += cxBonus;
              break;
            case 'product':
              featureProduction += production * 0.1;
              codeProduction += production * 0.5;
              break;
            case 'design':
              featureProduction += production * 0.2;
              break;
            case 'qa':
              // QA prevents feature bugs (multiplies feature value)
              featureProduction *= 1 + (production * 0.01);
              break;
            case 'marketing':
              leadProduction += production;
              break;
          }
        });
      });
      
      // Feature conversion logic
      if (codeProduction >= 10) {
        const featureConversion = Math.floor(codeProduction / 10);
        featureProduction += featureConversion;
        codeProduction -= featureConversion * 10;
      }
      
      // Lead to money conversion
      if (leadProduction >= 5) {
        const leadConversion = Math.floor(leadProduction / 5);
        moneyProduction += leadConversion * 10;
        leadProduction -= leadConversion * 5;
      }
      
      // Apply production (batch for performance)
      batch(() => {
        gameState$.resources.code.set(prev => prev + (codeProduction * 0.1));
        gameState$.resources.features.set(prev => prev + (featureProduction * 0.1));
        gameState$.resources.money.set(prev => prev + (moneyProduction * 0.1));
        gameState$.resources.leads.set(prev => prev + (leadProduction * 0.1));
      });
    }
    
    private static updatePrestigeValuation() {
      const valuation = PrestigeCalculator.calculateCurrentValuation();
      prestigeState$.currentRun.valuation.set(valuation);
    }
  }
  ```

## Validation Criteria

### Must Pass ✅
- [ ] All 7 departments implement correctly with unlock thresholds
- [ ] Employee hiring scales cost properly (1.15x multiplier)
- [ ] Manager automation doubles department production
- [ ] Prestige system calculates investor points accurately
- [ ] Department synergies provide meaningful bonuses

### Should Pass ⚠️
- [ ] Department tabs navigation works smoothly
- [ ] Complex production calculations maintain 60 FPS
- [ ] Prestige rewards feel meaningful and balanced
- [ ] Employee cards display accurate costs and production

### Nice to Have 💡
- [ ] Department unlock notifications are satisfying
- [ ] Visual feedback shows department productivity
- [ ] Prestige progression feels rewarding long-term
- [ ] Department synergies create strategic depth

## Testing Commands

```bash
# Test department unlocks
# Manually set resources and verify unlocks trigger

# Test employee hiring
# Verify cost scaling and production increases

# Test manager automation
# Confirm 2x multiplier applies correctly

# Performance testing with all departments
npm run android
npm run ios
```

## Troubleshooting

### Department Unlock Issues
- **Symptom**: Departments not unlocking at thresholds
- **Solution**: Check DepartmentUnlocker service integration
- **Command**: Verify unlock conditions in game loop

### Production Calculation Errors
- **Symptom**: Resources not increasing as expected
- **Solution**: Debug GameEngine updateProduction method
- **Command**: Add console.log to track production values

### Performance Degradation
- **Symptom**: FPS drops with many employees
- **Solution**: Optimize batch updates and calculation frequency
- **Command**: Use React DevTools Profiler

## Deliverables

### 1. Complete Department System
- ✅ All 7 departments with unique mechanics
- ✅ Employee hiring with exponential cost scaling
- ✅ Manager automation providing 2x multipliers

### 2. Prestige System
- ✅ Investor point calculation based on valuation
- ✅ Permanent bonuses that affect new runs
- ✅ Strategic depth in prestige timing

### 3. Integrated Game Experience
- ✅ Department synergies creating complex strategies
- ✅ Smooth navigation between departments
- ✅ Balanced progression curve

## Next Phase
Once all departments and prestige systems are working correctly, proceed to **Phase 4: Quality & Polish** (`04-quality.md`)

**Estimated Duration**: 4-5 days
**Department Integration Complete**: ✅/❌ (update after validation)