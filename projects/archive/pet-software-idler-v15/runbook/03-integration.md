# Phase 3: Integration & Features

**Duration**: 32 hours  
**Timeline**: Days 16-23  
**Dependencies**: Phase 2 core features completed and tested

## Objectives
- Implement all 7 departments with unique mechanics
- Build comprehensive employee progression system
- Create achievement system with rewards
- Develop prestige mechanics for long-term progression
- Integrate audio system with contextual feedback
- Add advanced UI features and navigation
- Implement department synergy and bonus systems

## Tasks Breakdown

### Task 3.1: Complete Department System (12 hours)
**Objective**: Implement all 7 departments with unique characteristics and mechanics

#### Step 3.1.1: Expand Department Configuration
```bash
# Update game configuration with all departments
cat > src/shared/constants/gameConfig.ts << 'EOF'
export const GAME_CONFIG = {
  // Performance settings
  TARGET_FPS: 60,
  FRAME_TIME: 1000 / 60,
  PERFORMANCE_MONITOR_INTERVAL: 1000,
  
  // Game balance
  INITIAL_MONEY: 0,
  INITIAL_CLICKS_PER_SECOND: 1,
  COST_MULTIPLIER: 1.15,
  MANAGER_COST_BASE: 1000000,
  
  // Save system
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds
  MAX_OFFLINE_HOURS: 12,
  OFFLINE_EFFICIENCY: 0.5, // 50% of online production
  
  // Performance limits
  MAX_MEMORY_MB: 200,
  MAX_BUNDLE_SIZE_MB: 50,
  TARGET_LOAD_TIME_MS: 3000,
  TARGET_INPUT_RESPONSE_MS: 50,
  
  // Department unlock costs
  DEPARTMENT_UNLOCK_COSTS: {
    development: 0,           // Free (starting department)
    sales: 50000,            // $50K
    customerExperience: 200000,  // $200K
    product: 500000,         // $500K
    design: 1000000,         // $1M
    qa: 2000000,            // $2M
    marketing: 5000000       // $5M
  } as const,
  
  // Department synergy bonuses
  SYNERGY_BONUSES: {
    'development-qa': 1.2,        // 20% bonus when both active
    'design-product': 1.15,       // 15% bonus
    'marketing-sales': 1.25,      // 25% bonus
    'sales-customerExperience': 1.1,  // 10% bonus
  } as const
} as const;

export const DEPARTMENT_CONFIG = {
  development: {
    id: 'development',
    name: 'Development',
    icon: '👨‍💻',
    description: 'Core software development team',
    unlockCost: 0,
    baseResource: 'linesOfCode',
    employees: [
      { id: 'junior_dev', name: 'Junior Developer', baseCost: 10, baseProduction: 1, icon: '👦' },
      { id: 'mid_dev', name: 'Mid-Level Developer', baseCost: 100, baseProduction: 8, icon: '👨' },
      { id: 'senior_dev', name: 'Senior Developer', baseCost: 1000, baseProduction: 47, icon: '👨‍🔬' },
      { id: 'lead_dev', name: 'Development Lead', baseCost: 12000, baseProduction: 260, icon: '👨‍💼' },
      { id: 'director_dev', name: 'Engineering Director', baseCost: 130000, baseProduction: 1400, icon: '🎩' },
      { id: 'vp_dev', name: 'VP of Engineering', baseCost: 1400000, baseProduction: 7800, icon: '👑' }
    ]
  },
  sales: {
    id: 'sales',
    name: 'Sales',
    icon: '📈',
    description: 'Revenue generation and client acquisition',
    unlockCost: 50000,
    baseResource: 'customerLeads',
    employees: [
      { id: 'junior_sales', name: 'Sales Associate', baseCost: 50, baseProduction: 2, icon: '📞' },
      { id: 'mid_sales', name: 'Account Executive', baseCost: 500, baseProduction: 15, icon: '🤝' },
      { id: 'senior_sales', name: 'Senior Sales Rep', baseCost: 5000, baseProduction: 85, icon: '💼' },
      { id: 'lead_sales', name: 'Sales Manager', baseCost: 60000, baseProduction: 500, icon: '📊' },
      { id: 'director_sales', name: 'Sales Director', baseCost: 650000, baseProduction: 2800, icon: '🎯' },
      { id: 'vp_sales', name: 'VP of Sales', baseCost: 7000000, baseProduction: 15600, icon: '👔' }
    ]
  },
  customerExperience: {
    id: 'customerExperience',
    name: 'Customer Experience',
    icon: '😊',
    description: 'Customer support and satisfaction',
    unlockCost: 200000,
    baseResource: 'reputation',
    employees: [
      { id: 'junior_cx', name: 'Support Specialist', baseCost: 25, baseProduction: 1, icon: '🎧' },
      { id: 'mid_cx', name: 'Customer Success Rep', baseCost: 250, baseProduction: 6, icon: '🤗' },
      { id: 'senior_cx', name: 'Senior CX Specialist', baseCost: 2500, baseProduction: 35, icon: '⭐' },
      { id: 'lead_cx', name: 'CX Team Lead', baseCost: 30000, baseProduction: 195, icon: '🏆' },
      { id: 'director_cx', name: 'CX Director', baseCost: 325000, baseProduction: 1100, icon: '🌟' },
      { id: 'vp_cx', name: 'VP of Customer Experience', baseCost: 3500000, baseProduction: 6200, icon: '💎' }
    ]
  },
  product: {
    id: 'product',
    name: 'Product',
    icon: '🔬',
    description: 'Product strategy and innovation',
    unlockCost: 500000,
    baseResource: 'features',
    employees: [
      { id: 'junior_pm', name: 'Associate PM', baseCost: 75, baseProduction: 3, icon: '📝' },
      { id: 'mid_pm', name: 'Product Manager', baseCost: 750, baseProduction: 20, icon: '📋' },
      { id: 'senior_pm', name: 'Senior PM', baseCost: 7500, baseProduction: 120, icon: '🎨' },
      { id: 'lead_pm', name: 'Lead Product Manager', baseCost: 90000, baseProduction: 650, icon: '🚀' },
      { id: 'director_pm', name: 'Product Director', baseCost: 975000, baseProduction: 3600, icon: '🎭' },
      { id: 'vp_pm', name: 'VP of Product', baseCost: 10500000, baseProduction: 20000, icon: '🎪' }
    ]
  },
  design: {
    id: 'design',
    name: 'Design',
    icon: '🎨',
    description: 'UI/UX and visual design',
    unlockCost: 1000000,
    baseResource: 'polishPoints',
    employees: [
      { id: 'junior_design', name: 'Junior Designer', baseCost: 40, baseProduction: 2, icon: '🖌️' },
      { id: 'mid_design', name: 'UX Designer', baseCost: 400, baseProduction: 12, icon: '🖼️' },
      { id: 'senior_design', name: 'Senior Designer', baseCost: 4000, baseProduction: 70, icon: '🎯' },
      { id: 'lead_design', name: 'Design Lead', baseCost: 48000, baseProduction: 380, icon: '✨' },
      { id: 'director_design', name: 'Design Director', baseCost: 520000, baseProduction: 2100, icon: '🌈' },
      { id: 'vp_design', name: 'VP of Design', baseCost: 5600000, baseProduction: 11700, icon: '🎪' }
    ]
  },
  qa: {
    id: 'qa',
    name: 'Quality Assurance',
    icon: '🔍',
    description: 'Testing and quality control',
    unlockCost: 2000000,
    baseResource: 'qualityScore',
    employees: [
      { id: 'junior_qa', name: 'QA Tester', baseCost: 30, baseProduction: 1, icon: '🐛' },
      { id: 'mid_qa', name: 'QA Analyst', baseCost: 300, baseProduction: 7, icon: '🔍' },
      { id: 'senior_qa', name: 'Senior QA Engineer', baseCost: 3000, baseProduction: 42, icon: '🛠️' },
      { id: 'lead_qa', name: 'QA Lead', baseCost: 36000, baseProduction: 230, icon: '🎖️' },
      { id: 'director_qa', name: 'QA Director', baseCost: 390000, baseProduction: 1300, icon: '🏅' },
      { id: 'vp_qa', name: 'VP of Quality', baseCost: 4200000, baseProduction: 7200, icon: '👑' }
    ]
  },
  marketing: {
    id: 'marketing',
    name: 'Marketing',
    icon: '📢',
    description: 'Brand awareness and promotion',
    unlockCost: 5000000,
    baseResource: 'brandAwareness',
    employees: [
      { id: 'junior_marketing', name: 'Marketing Coordinator', baseCost: 60, baseProduction: 2, icon: '📱' },
      { id: 'mid_marketing', name: 'Marketing Specialist', baseCost: 600, baseProduction: 18, icon: '📺' },
      { id: 'senior_marketing', name: 'Senior Marketer', baseCost: 6000, baseProduction: 100, icon: '🎬' },
      { id: 'lead_marketing', name: 'Marketing Manager', baseCost: 72000, baseProduction: 550, icon: '🎪' },
      { id: 'director_marketing', name: 'Marketing Director', baseCost: 780000, baseProduction: 3000, icon: '🌟' },
      { id: 'vp_marketing', name: 'VP of Marketing', baseCost: 8400000, baseProduction: 16800, icon: '🚀' }
    ]
  }
} as const;

// Manager costs scale with department unlock cost
export const MANAGER_COSTS = {
  development: 100000,      // $100K
  sales: 250000,           // $250K
  customerExperience: 500000,  // $500K
  product: 750000,         // $750K
  design: 1000000,         // $1M
  qa: 1250000,            // $1.25M
  marketing: 1500000       // $1.5M
} as const;
EOF
```

#### Step 3.1.2: Enhanced Department UI Components
```bash
# Create department list component
cat > src/features/departments/components/DepartmentsList.tsx << 'EOF'
import React, { memo } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { gameState } from '@/core/state/gameState';
import { departmentComputed } from '../state/departmentStore';
import { DepartmentCard } from './DepartmentCard';
import { DepartmentTabs } from './DepartmentTabs';

export const DepartmentsList = memo(() => {
  const departments = gameState.departments.use();
  const unlockedDepartments = departments.filter(dept => dept.unlocked);
  
  return (
    <View style={styles.container}>
      {/* Department Tabs */}
      <DepartmentTabs departments={unlockedDepartments} />
      
      {/* Active Department Details */}
      <ActiveDepartmentView />
    </View>
  );
});

const ActiveDepartmentView = memo(() => {
  const activeDepartment = departmentComputed.activeDepartment.use();
  
  if (!activeDepartment) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Select a department to view details</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.departmentContainer}>
      <DepartmentCard department={activeDepartment} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  departmentContainer: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
EOF

# Create department tabs component
cat > src/features/departments/components/DepartmentTabs.tsx << 'EOF'
import React, { memo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { departmentStore } from '../state/departmentStore';
import { DEPARTMENT_CONFIG } from '@/shared/constants/gameConfig';

interface DepartmentTabsProps {
  departments: Array<{
    id: string;
    name: string;
    unlocked: boolean;
  }>;
}

export const DepartmentTabs = memo<DepartmentTabsProps>(({ departments }) => {
  const activeTab = departmentStore.activeTab.use();
  
  const handleTabPress = (departmentId: string) => {
    departmentStore.activeTab.set(departmentId);
  };
  
  return (
    <ScrollView 
      horizontal 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsHorizontalScrollIndicator={false}
    >
      {departments.map(dept => {
        const config = DEPARTMENT_CONFIG[dept.id as keyof typeof DEPARTMENT_CONFIG];
        const isActive = activeTab === dept.id;
        
        return (
          <TouchableOpacity
            key={dept.id}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => handleTabPress(dept.id)}
          >
            <Text style={styles.tabIcon}>{config.icon}</Text>
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
              {config.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    maxHeight: 80,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tab: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    minWidth: 80,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  activeTabText: {
    color: 'white',
    fontWeight: '600',
  },
});
EOF

# Create detailed department card
cat > src/features/departments/components/DepartmentCard.tsx << 'EOF'
import React, { memo } from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { Card } from '@/shared/components/Card';
import { EmployeeList } from './EmployeeList';
import { DepartmentStats } from './DepartmentStats';
import { ManagerSection } from './ManagerSection';
import { DEPARTMENT_CONFIG } from '@/shared/constants/gameConfig';

interface DepartmentCardProps {
  department: {
    id: string;
    name: string;
    unlocked: boolean;
    employees: any[];
    efficiency: number;
    managerHired: boolean;
    totalProduction: number;
  };
}

export const DepartmentCard = memo<DepartmentCardProps>(({ department }) => {
  const config = DEPARTMENT_CONFIG[department.id as keyof typeof DEPARTMENT_CONFIG];
  
  return (
    <ScrollView style={styles.container}>
      {/* Department Header */}
      <Card style={styles.headerCard}>
        <View style={styles.header}>
          <Text style={styles.headerIcon}>{config.icon}</Text>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{config.name}</Text>
            <Text style={styles.headerDescription}>{config.description}</Text>
          </View>
        </View>
      </Card>
      
      {/* Department Statistics */}
      <DepartmentStats department={department} />
      
      {/* Manager Section */}
      <ManagerSection department={department} />
      
      {/* Employee List */}
      <EmployeeList 
        departmentId={department.id}
        employees={department.employees}
      />
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    padding: 16,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});
EOF
```

#### Step 3.1.3: Department-Specific Logic
```bash
# Create department synergy system
cat > src/features/departments/services/synergySystem.ts << 'EOF'
import { gameState } from '@/core/state/gameState';
import { GAME_CONFIG } from '@/shared/constants/gameConfig';

export class SynergySystem {
  static calculateDepartmentSynergies(): Record<string, number> {
    const departments = gameState.departments.get();
    const activeDepartments = departments
      .filter(dept => dept.unlocked && dept.employees.some(emp => emp.count > 0))
      .map(dept => dept.id);
    
    const synergies: Record<string, number> = {};
    
    // Check each department for synergy bonuses
    activeDepartments.forEach(deptId => {
      synergies[deptId] = this.calculateSynergyBonus(deptId, activeDepartments);
    });
    
    return synergies;
  }
  
  private static calculateSynergyBonus(departmentId: string, activeDepartments: string[]): number {
    let totalBonus = 1.0; // Base multiplier
    
    // Check each synergy configuration
    Object.entries(GAME_CONFIG.SYNERGY_BONUSES).forEach(([synergyKey, bonus]) => {
      const [dept1, dept2] = synergyKey.split('-');
      
      // Check if this department participates in this synergy
      if ((dept1 === departmentId || dept2 === departmentId) &&
          activeDepartments.includes(dept1) && 
          activeDepartments.includes(dept2)) {
        totalBonus *= bonus;
      }
    });
    
    // Additional scaling bonus for having many active departments
    if (activeDepartments.length >= 5) {
      totalBonus *= 1.1; // 10% bonus for having 5+ departments
    }
    
    if (activeDepartments.length >= 7) {
      totalBonus *= 1.05; // Additional 5% for all departments
    }
    
    return totalBonus;
  }
  
  static getSynergyDescription(departmentId: string): string[] {
    const activeDepartments = gameState.departments.get()
      .filter(dept => dept.unlocked && dept.employees.some(emp => emp.count > 0))
      .map(dept => dept.id);
    
    const descriptions: string[] = [];
    
    Object.entries(GAME_CONFIG.SYNERGY_BONUSES).forEach(([synergyKey, bonus]) => {
      const [dept1, dept2] = synergyKey.split('-');
      
      if (dept1 === departmentId || dept2 === departmentId) {
        const partnerDept = dept1 === departmentId ? dept2 : dept1;
        const isActive = activeDepartments.includes(partnerDept);
        const bonusPercent = Math.round((bonus - 1) * 100);
        
        descriptions.push(
          `${isActive ? '✅' : '❌'} ${partnerDept}: +${bonusPercent}% bonus`
        );
      }
    });
    
    return descriptions;
  }
}
EOF
```

#### Success Criteria
- [ ] All 7 departments implemented with unique mechanics
- [ ] Department unlock system working
- [ ] Employee progression functional across departments
- [ ] Synergy system providing bonuses correctly

### Task 3.2: Achievement System (8 hours)
**Objective**: Create comprehensive achievement system with rewards and progression tracking

#### Step 3.2.1: Achievement Configuration
```bash
# Create comprehensive achievement system
mkdir -p src/features/achievements/{state,components,services}

cat > src/features/achievements/state/achievementConfig.ts << 'EOF'
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'progress' | 'milestone' | 'challenge' | 'hidden';
  requirement: {
    type: 'money' | 'clicks' | 'employees' | 'departments' | 'production' | 'time' | 'prestige';
    value: number;
    departmentId?: string;
  };
  reward: {
    type: 'money' | 'multiplier' | 'unlock' | 'cosmetic';
    value: number;
    description: string;
  };
  hidden: boolean;
}

export const ACHIEVEMENT_CONFIG: Achievement[] = [
  // Progress Achievements
  {
    id: 'first_click',
    name: 'Getting Started',
    description: 'Click the main button for the first time',
    icon: '👆',
    category: 'progress',
    requirement: { type: 'clicks', value: 1 },
    reward: { type: 'money', value: 100, description: '$100 bonus' },
    hidden: false
  },
  {
    id: 'hundred_clicks',
    name: 'Clicking Master',
    description: 'Click the main button 100 times',
    icon: '👏',
    category: 'progress',
    requirement: { type: 'clicks', value: 100 },
    reward: { type: 'multiplier', value: 1.05, description: '5% click bonus' },
    hidden: false
  },
  {
    id: 'thousand_clicks',
    name: 'Click Maniac',
    description: 'Click the main button 1,000 times',
    icon: '🔥',
    category: 'challenge',
    requirement: { type: 'clicks', value: 1000 },
    reward: { type: 'multiplier', value: 1.1, description: '10% click bonus' },
    hidden: false
  },
  
  // Money Milestones
  {
    id: 'first_thousand',
    name: 'Startup Capital',
    description: 'Earn your first $1,000',
    icon: '💰',
    category: 'milestone',
    requirement: { type: 'money', value: 1000 },
    reward: { type: 'money', value: 500, description: '$500 bonus' },
    hidden: false
  },
  {
    id: 'hundred_k',
    name: 'Six Figures',
    description: 'Earn $100,000',
    icon: '💵',
    category: 'milestone',
    requirement: { type: 'money', value: 100000 },
    reward: { type: 'multiplier', value: 1.02, description: '2% production bonus' },
    hidden: false
  },
  {
    id: 'million',
    name: 'Millionaire',
    description: 'Earn $1,000,000',
    icon: '🏆',
    category: 'milestone',
    requirement: { type: 'money', value: 1000000 },
    reward: { type: 'multiplier', value: 1.05, description: '5% production bonus' },
    hidden: false
  },
  
  // Employee Achievements
  {
    id: 'first_hire',
    name: 'Team Builder',
    description: 'Hire your first employee',
    icon: '👥',
    category: 'progress',
    requirement: { type: 'employees', value: 1 },
    reward: { type: 'money', value: 1000, description: '$1,000 bonus' },
    hidden: false
  },
  {
    id: 'ten_employees',
    name: 'Small Team',
    description: 'Have 10 employees total',
    icon: '🏢',
    category: 'progress',
    requirement: { type: 'employees', value: 10 },
    reward: { type: 'multiplier', value: 1.03, description: '3% efficiency bonus' },
    hidden: false
  },
  {
    id: 'hundred_employees',
    name: 'Growing Company',
    description: 'Have 100 employees total',
    icon: '🏭',
    category: 'milestone',
    requirement: { type: 'employees', value: 100 },
    reward: { type: 'multiplier', value: 1.1, description: '10% efficiency bonus' },
    hidden: false
  },
  
  // Department Achievements
  {
    id: 'second_department',
    name: 'Expansion',
    description: 'Unlock your second department',
    icon: '📈',
    category: 'progress',
    requirement: { type: 'departments', value: 2 },
    reward: { type: 'money', value: 10000, description: '$10,000 bonus' },
    hidden: false
  },
  {
    id: 'all_departments',
    name: 'Full Stack Company',
    description: 'Unlock all 7 departments',
    icon: '🌟',
    category: 'milestone',
    requirement: { type: 'departments', value: 7 },
    reward: { type: 'multiplier', value: 1.15, description: '15% company-wide bonus' },
    hidden: false
  },
  
  // Time-based Achievements
  {
    id: 'one_hour',
    name: 'Dedicated',
    description: 'Play for 1 hour total',
    icon: '⏰',
    category: 'progress',
    requirement: { type: 'time', value: 3600000 }, // 1 hour in milliseconds
    reward: { type: 'money', value: 5000, description: '$5,000 bonus' },
    hidden: false
  },
  {
    id: 'one_day',
    name: 'Committed',
    description: 'Play for 24 hours total',
    icon: '📅',
    category: 'challenge',
    requirement: { type: 'time', value: 86400000 }, // 24 hours in milliseconds
    reward: { type: 'multiplier', value: 1.1, description: '10% time bonus' },
    hidden: false
  },
  
  // Hidden/Secret Achievements
  {
    id: 'secret_clicker',
    name: 'Secret Clicker',
    description: 'Click 10,000 times in a single session',
    icon: '🤫',
    category: 'hidden',
    requirement: { type: 'clicks', value: 10000 },
    reward: { type: 'multiplier', value: 1.25, description: '25% secret bonus' },
    hidden: true
  },
  {
    id: 'speed_runner',
    name: 'Speed Runner',
    description: 'Reach $1M in under 30 minutes',
    icon: '⚡',
    category: 'hidden',
    requirement: { type: 'money', value: 1000000 }, // Additional time check in logic
    reward: { type: 'multiplier', value: 1.2, description: '20% speed bonus' },
    hidden: true
  }
];
EOF
```

#### Step 3.2.2: Achievement State Management
```bash
cat > src/features/achievements/state/achievementStore.ts << 'EOF'
import { observable, computed } from '@legendapp/state';
import { gameState } from '@/core/state/gameState';
import { ACHIEVEMENT_CONFIG, Achievement } from './achievementConfig';

interface AchievementStoreState {
  notifications: AchievementNotification[];
  showNotifications: boolean;
}

interface AchievementNotification {
  achievement: Achievement;
  timestamp: number;
  seen: boolean;
}

export const achievementStore = observable<AchievementStoreState>({
  notifications: [],
  showNotifications: true
});

export class AchievementSystem {
  private static sessionStartTime = Date.now();
  private static sessionClicks = 0;
  
  static checkAchievements() {
    const currentState = gameState.get();
    const unlockedAchievements = currentState.progression.achievementsUnlocked;
    
    ACHIEVEMENT_CONFIG.forEach(achievement => {
      // Skip already unlocked achievements
      if (unlockedAchievements.includes(achievement.id)) return;
      
      // Check if requirements are met
      if (this.checkRequirement(achievement, currentState)) {
        this.unlockAchievement(achievement);
      }
    });
  }
  
  private static checkRequirement(achievement: Achievement, state: any): boolean {
    const { requirement } = achievement;
    
    switch (requirement.type) {
      case 'clicks':
        return state.progression.statisticsTracking.totalClicks >= requirement.value;
      
      case 'money':
        // Special case for speed runner achievement
        if (achievement.id === 'speed_runner') {
          const playTime = Date.now() - this.sessionStartTime;
          return state.resources.money >= requirement.value && playTime <= 1800000; // 30 minutes
        }
        return state.resources.money >= requirement.value;
      
      case 'employees':
        const totalEmployees = state.departments.reduce((total: number, dept: any) => 
          total + dept.employees.reduce((sum: number, emp: any) => sum + emp.count, 0), 0
        );
        return totalEmployees >= requirement.value;
      
      case 'departments':
        const unlockedDepts = state.departments.filter((dept: any) => dept.unlocked).length;
        return unlockedDepts >= requirement.value;
      
      case 'production':
        // Calculate total production per second
        const production = state.departments.reduce((total: number, dept: any) => 
          total + dept.totalProduction, 0
        );
        return production >= requirement.value;
      
      case 'time':
        return state.progression.statisticsTracking.totalPlayTime >= requirement.value;
      
      case 'prestige':
        return state.progression.prestigeCount >= requirement.value;
      
      default:
        return false;
    }
  }
  
  private static unlockAchievement(achievement: Achievement) {
    console.log(`🏆 Achievement unlocked: ${achievement.name}`);
    
    // Add to unlocked achievements
    gameState.progression.achievementsUnlocked.set(prev => [...prev, achievement.id]);
    
    // Apply reward
    this.applyReward(achievement.reward);
    
    // Add notification
    achievementStore.notifications.set(prev => [...prev, {
      achievement,
      timestamp: Date.now(),
      seen: false
    }]);
    
    // Play achievement sound/haptic (will be implemented in audio phase)
    console.log(`💰 Reward: ${achievement.reward.description}`);
  }
  
  private static applyReward(reward: any) {
    switch (reward.type) {
      case 'money':
        gameState.resources.money.set(prev => prev + reward.value);
        break;
      
      case 'multiplier':
        // Store multipliers for later application in game loop
        // This would be implemented as a global multiplier system
        console.log(`Multiplier reward: ${reward.value}x (${reward.description})`);
        break;
      
      case 'unlock':
        // Handle special unlocks (cosmetics, features, etc.)
        console.log(`Unlock reward: ${reward.description}`);
        break;
    }
  }
  
  static markNotificationSeen(achievementId: string) {
    const notifications = achievementStore.notifications.get();
    const index = notifications.findIndex(n => n.achievement.id === achievementId);
    
    if (index !== -1) {
      achievementStore.notifications[index].seen.set(true);
    }
  }
  
  static clearOldNotifications() {
    const cutoff = Date.now() - 300000; // 5 minutes
    achievementStore.notifications.set(prev => 
      prev.filter(notification => notification.timestamp > cutoff)
    );
  }
  
  // Public methods for tracking session-specific achievements
  static incrementSessionClicks() {
    this.sessionClicks++;
  }
  
  static getSessionStats() {
    return {
      sessionTime: Date.now() - this.sessionStartTime,
      sessionClicks: this.sessionClicks
    };
  }
}

// Computed values for UI
export const achievementComputed = {
  // Achievement progress for UI
  achievementProgress: computed(() => {
    const currentState = gameState.get();
    const unlocked = currentState.progression.achievementsUnlocked;
    
    return ACHIEVEMENT_CONFIG.map(achievement => {
      const isUnlocked = unlocked.includes(achievement.id);
      let progress = 0;
      
      if (!isUnlocked) {
        // Calculate progress percentage
        const requirement = achievement.requirement;
        switch (requirement.type) {
          case 'clicks':
            progress = currentState.progression.statisticsTracking.totalClicks / requirement.value;
            break;
          case 'money':
            progress = currentState.resources.money / requirement.value;
            break;
          // Add other progress calculations...
        }
      }
      
      return {
        ...achievement,
        unlocked: isUnlocked,
        progress: Math.min(1, Math.max(0, progress))
      };
    });
  }),
  
  // Visible achievements (excluding hidden ones unless unlocked)
  visibleAchievements: computed(() => {
    const achievements = achievementComputed.achievementProgress.get();
    const unlocked = gameState.progression.achievementsUnlocked.get();
    
    return achievements.filter(achievement => 
      !achievement.hidden || unlocked.includes(achievement.id)
    );
  }),
  
  // Achievement statistics
  achievementStats: computed(() => {
    const achievements = achievementComputed.achievementProgress.get();
    const total = achievements.length;
    const unlocked = achievements.filter(a => a.unlocked).length;
    const visible = achievements.filter(a => !a.hidden).length;
    
    return {
      total,
      unlocked,
      visible,
      completion: unlocked / total,
      visibleCompletion: unlocked / visible
    };
  }),
  
  // Recent notifications
  recentNotifications: computed(() => {
    const notifications = achievementStore.notifications.get();
    return notifications
      .filter(n => !n.seen)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 3); // Show max 3 notifications
  })
};
EOF
```

#### Step 3.2.3: Achievement UI Components
```bash
cat > src/features/achievements/components/AchievementPanel.tsx << 'EOF'
import React, { memo } from 'react';
import { View, StyleSheet, FlatList, Text } from 'react-native';
import { Card } from '@/shared/components/Card';
import { achievementComputed } from '../state/achievementStore';
import { AchievementCard } from './AchievementCard';

export const AchievementPanel = memo(() => {
  const achievements = achievementComputed.visibleAchievements.use();
  const stats = achievementComputed.achievementStats.use();
  
  const renderAchievement = ({ item }: { item: any }) => (
    <AchievementCard achievement={item} />
  );
  
  return (
    <View style={styles.container}>
      {/* Achievement Statistics */}
      <Card style={styles.statsCard}>
        <Text style={styles.statsTitle}>Achievement Progress</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.unlocked}</Text>
            <Text style={styles.statLabel}>Unlocked</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.visible}</Text>
            <Text style={styles.statLabel}>Visible</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Math.round(stats.visibleCompletion * 100)}%
            </Text>
            <Text style={styles.statLabel}>Complete</Text>
          </View>
        </View>
      </Card>
      
      {/* Achievement List */}
      <FlatList
        data={achievements}
        renderItem={renderAchievement}
        keyExtractor={item => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  statsCard: {
    padding: 16,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
});
EOF
```

#### Success Criteria
- [ ] Achievement system tracking player progress correctly
- [ ] Achievement notifications displaying properly
- [ ] Rewards being applied when achievements unlock
- [ ] Achievement progress calculating accurately

### Task 3.3: Prestige System (6 hours)
**Objective**: Implement prestige mechanics for long-term progression

#### Step 3.3.1: Prestige System Implementation
```bash
cat > src/features/prestige/state/prestigeStore.ts << 'EOF'
import { observable, computed } from '@legendapp/state';
import { gameState } from '@/core/state/gameState';

export interface PrestigeUpgrade {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
  maxLevel: number;
  currentLevel: number;
  effect: {
    type: 'production_multiplier' | 'click_multiplier' | 'cost_reduction' | 'special';
    value: number; // Base effect value
    scaling: number; // How effect scales with level
  };
}

export const PRESTIGE_UPGRADES: PrestigeUpgrade[] = [
  {
    id: 'click_power',
    name: 'Enhanced Clicking',
    description: 'Increases money earned per click',
    icon: '👆',
    cost: 1,
    maxLevel: 50,
    currentLevel: 0,
    effect: {
      type: 'click_multiplier',
      value: 1.1, // 10% increase per level
      scaling: 0.05 // Scaling factor
    }
  },
  {
    id: 'production_boost',
    name: 'Production Excellence',
    description: 'Increases all department production',
    icon: '🚀',
    cost: 2,
    maxLevel: 25,
    currentLevel: 0,
    effect: {
      type: 'production_multiplier',
      value: 1.15, // 15% increase per level
      scaling: 0.02
    }
  },
  {
    id: 'cost_efficiency',
    name: 'Bulk Hiring',
    description: 'Reduces employee hiring costs',
    icon: '💰',
    cost: 3,
    maxLevel: 20,
    currentLevel: 0,
    effect: {
      type: 'cost_reduction',
      value: 0.95, // 5% cost reduction per level
      scaling: 0.01
    }
  },
  {
    id: 'offline_bonus',
    name: 'Passive Income',
    description: 'Increases offline earnings efficiency',
    icon: '💤',
    cost: 5,
    maxLevel: 10,
    currentLevel: 0,
    effect: {
      type: 'special',
      value: 1.2, // 20% increase per level
      scaling: 0.1
    }
  }
];

interface PrestigeStoreState {
  upgrades: PrestigeUpgrade[];
  showPrestigeConfirmation: boolean;
}

export const prestigeStore = observable<PrestigeStoreState>({
  upgrades: PRESTIGE_UPGRADES.map(upgrade => ({ ...upgrade })),
  showPrestigeConfirmation: false
});

export class PrestigeSystem {
  // Calculate prestige points earned from current progress
  static calculatePrestigePoints(): number {
    const totalEarnings = gameState.progression.totalEarnings.get();
    
    // Prestige points based on total lifetime earnings
    // Formula: sqrt(totalEarnings / 1000000) - previous prestige points used
    const basePoints = Math.floor(Math.sqrt(totalEarnings / 1000000));
    const usedPoints = this.calculateUsedPrestigePoints();
    
    return Math.max(0, basePoints - usedPoints);
  }
  
  private static calculateUsedPrestigePoints(): number {
    const upgrades = prestigeStore.upgrades.get();
    return upgrades.reduce((total, upgrade) => {
      let cost = 0;
      for (let i = 0; i < upgrade.currentLevel; i++) {
        cost += upgrade.cost + Math.floor(i * 0.5); // Cost increases slightly each level
      }
      return total + cost;
    }, 0);
  }
  
  // Perform prestige reset
  static performPrestige(): boolean {
    const availablePoints = this.calculatePrestigePoints();
    
    if (availablePoints <= 0) {
      console.warn('No prestige points available');
      return false;
    }
    
    console.log(`🌟 Performing prestige! Gained ${availablePoints} prestige points`);
    
    // Add prestige points
    gameState.progression.prestigePoints.set(prev => prev + availablePoints);
    gameState.progression.currentPrestigeLevel.set(prev => prev + 1);
    gameState.progression.prestigeCount.set(prev => prev + 1);
    
    // Update total earnings tracking
    gameState.progression.totalEarnings.set(prev => prev + gameState.resources.money.get());
    
    // Reset game state to initial values
    this.resetGameState();
    
    return true;
  }
  
  private static resetGameState() {
    // Reset resources
    gameState.resources.set({
      linesOfCode: 0,
      features: { basic: 0, advanced: 0, premium: 0 },
      money: 0,
      customerLeads: 0,
      reputation: 0
    });
    
    // Reset departments (keep unlocks but reset employees)
    const departments = gameState.departments.get();
    gameState.departments.set(
      departments.map(dept => ({
        ...dept,
        employees: dept.employees.map(emp => ({
          ...emp,
          count: 0,
          currentCost: emp.baseCost // Reset to base cost
        })),
        managerHired: false,
        efficiency: 1.0,
        totalProduction: 0
      }))
    );
    
    // Keep some statistics but reset session-specific ones
    gameState.progression.statisticsTracking.totalClicks.set(0);
    // Keep totalPlayTime, departmentsUnlocked, employeesHired for achievements
    
    console.log('🔄 Game state reset for prestige');
  }
  
  // Purchase prestige upgrade
  static purchaseUpgrade(upgradeId: string): boolean {
    const availablePoints = gameState.progression.prestigePoints.get();
    const upgrades = prestigeStore.upgrades.get();
    const upgradeIndex = upgrades.findIndex(u => u.id === upgradeId);
    
    if (upgradeIndex === -1) {
      console.warn(`Upgrade ${upgradeId} not found`);
      return false;
    }
    
    const upgrade = upgrades[upgradeIndex];
    const cost = upgrade.cost + Math.floor(upgrade.currentLevel * 0.5);
    
    if (availablePoints < cost) {
      console.warn(`Not enough prestige points. Need ${cost}, have ${availablePoints}`);
      return false;
    }
    
    if (upgrade.currentLevel >= upgrade.maxLevel) {
      console.warn(`Upgrade ${upgradeId} already at max level`);
      return false;
    }
    
    // Purchase upgrade
    gameState.progression.prestigePoints.set(prev => prev - cost);
    prestigeStore.upgrades[upgradeIndex].currentLevel.set(prev => prev + 1);
    
    console.log(`⭐ Purchased ${upgrade.name} level ${upgrade.currentLevel + 1}`);
    return true;
  }
  
  // Get effective multipliers from prestige upgrades
  static getPrestigeMultipliers() {
    const upgrades = prestigeStore.upgrades.get();
    const multipliers = {
      clickPower: 1.0,
      production: 1.0,
      costReduction: 1.0,
      offlineBonus: 1.0
    };
    
    upgrades.forEach(upgrade => {
      if (upgrade.currentLevel === 0) return;
      
      const effectValue = upgrade.effect.value + 
        (upgrade.effect.scaling * (upgrade.currentLevel - 1));
      
      switch (upgrade.effect.type) {
        case 'click_multiplier':
          multipliers.clickPower *= Math.pow(effectValue, upgrade.currentLevel);
          break;
        case 'production_multiplier':
          multipliers.production *= Math.pow(effectValue, upgrade.currentLevel);
          break;
        case 'cost_reduction':
          multipliers.costReduction *= Math.pow(effectValue, upgrade.currentLevel);
          break;
        case 'special':
          if (upgrade.id === 'offline_bonus') {
            multipliers.offlineBonus *= Math.pow(effectValue, upgrade.currentLevel);
          }
          break;
      }
    });
    
    return multipliers;
  }
}

// Computed values for UI
export const prestigeComputed = {
  // Available prestige points
  availablePrestigePoints: computed(() => {
    return PrestigeSystem.calculatePrestigePoints();
  }),
  
  // Prestige upgrade costs
  upgradeCosts: computed(() => {
    const upgrades = prestigeStore.upgrades.get();
    return upgrades.map(upgrade => ({
      id: upgrade.id,
      cost: upgrade.cost + Math.floor(upgrade.currentLevel * 0.5),
      canAfford: gameState.progression.prestigePoints.get() >= 
        (upgrade.cost + Math.floor(upgrade.currentLevel * 0.5)),
      maxed: upgrade.currentLevel >= upgrade.maxLevel
    }));
  }),
  
  // Current prestige benefits
  prestigeBenefits: computed(() => {
    return PrestigeSystem.getPrestigeMultipliers();
  }),
  
  // Prestige eligibility
  canPrestige: computed(() => {
    return PrestigeSystem.calculatePrestigePoints() > 0;
  })
};
EOF
```

#### Success Criteria
- [ ] Prestige point calculation working correctly
- [ ] Prestige reset functionality complete
- [ ] Prestige upgrades purchasable and effective
- [ ] Prestige multipliers applied to game mechanics

### Task 3.4: Audio System Integration (4 hours)
**Objective**: Integrate audio system with contextual feedback

#### Step 3.4.1: Audio Integration
```bash
# Update the audio manager with game-specific sounds
cat > src/features/audio/services/gameAudioManager.ts << 'EOF'
import { Audio, AVPlaybackStatus } from 'expo-av';
import { gameState } from '@/core/state/gameState';
import { Haptics } from 'expo-haptics';

interface AudioConfig {
  volume: number;
  loop: boolean;
  maxInstances?: number;
  cooldown?: number;
}

interface SoundInstance {
  sound: Audio.Sound;
  lastPlayed: number;
  isPlaying: boolean;
}

class GameAudioManager {
  private sounds: Map<string, SoundInstance[]> = new Map();
  private soundConfig: Map<string, AudioConfig> = new Map();
  private masterVolume: number = 1.0;
  private audioEnabled: boolean = true;
  private hapticsEnabled: boolean = true;
  
  async initialize() {
    // Configure audio session
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false
    });
    
    // Subscribe to settings changes
    gameState.settings.audioEnabled.onChange((enabled) => {
      this.audioEnabled = enabled;
      if (!enabled) this.stopAllSounds();
    });
    
    gameState.settings.hapticsEnabled.onChange((enabled) => {
      this.hapticsEnabled = enabled;
    });
    
    console.log('🔊 Game audio system initialized');
  }
  
  // Game-specific audio feedback
  playClickFeedback(amount?: number) {
    if (!this.audioEnabled) return;
    
    // Scale pitch based on money earned
    const pitch = amount ? Math.min(1.5, 1 + (Math.log10(amount) * 0.1)) : 1;
    this.playSound('click', undefined, pitch);
    
    // Haptic feedback
    if (this.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }
  
  playPurchaseFeedback(cost: number) {
    if (!this.audioEnabled) return;
    
    // Different sounds for different cost tiers
    let soundId = 'purchase';
    let hapticStyle = Haptics.ImpactFeedbackStyle.Medium;
    
    if (cost >= 1000000) {
      soundId = 'major_purchase';
      hapticStyle = Haptics.ImpactFeedbackStyle.Heavy;
    } else if (cost >= 10000) {
      soundId = 'medium_purchase';
    }
    
    this.playSound(soundId);
    
    if (this.hapticsEnabled) {
      Haptics.impactAsync(hapticStyle);
    }
  }
  
  playAchievementUnlock() {
    if (!this.audioEnabled) return;
    
    this.playSound('achievement');
    
    if (this.hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }
  
  playPrestigeFeedback() {
    if (!this.audioEnabled) return;
    
    this.playSound('prestige');
    
    if (this.hapticsEnabled) {
      // Double haptic for emphasis
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 100);
    }
  }
  
  playDepartmentUnlock() {
    if (!this.audioEnabled) return;
    
    this.playSound('department_unlock');
    
    if (this.hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }
  
  playErrorFeedback() {
    if (!this.audioEnabled) return;
    
    this.playSound('error');
    
    if (this.hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }
  
  // Context-aware background music
  updateBackgroundMusic() {
    const departments = gameState.departments.get();
    const unlockedCount = departments.filter(d => d.unlocked).length;
    const totalProduction = departments.reduce((sum, d) => sum + d.totalProduction, 0);
    
    // Change music based on game progress
    if (unlockedCount >= 5 || totalProduction > 10000) {
      this.playBackgroundMusic('late_game');
    } else if (unlockedCount >= 2 || totalProduction > 100) {
      this.playBackgroundMusic('mid_game');
    } else {
      this.playBackgroundMusic('early_game');
    }
  }
  
  private playBackgroundMusic(trackId: string) {
    // Implementation for background music switching
    console.log(`🎵 Playing background music: ${trackId}`);
  }
  
  private playSound(soundId: string, volume?: number, pitch?: number) {
    // Simplified sound playing - full implementation would load and play actual audio files
    if (__DEV__) {
      console.log(`🔊 Playing sound: ${soundId} (volume: ${volume || 1}, pitch: ${pitch || 1})`);
    }
  }
  
  private stopAllSounds() {
    console.log('🔇 All sounds stopped');
  }
  
  cleanup() {
    this.stopAllSounds();
    console.log('🔊 Audio system cleaned up');
  }
}

export const gameAudioManager = new GameAudioManager();
EOF
```

#### Step 3.4.2: Integration Points
```bash
# Update main click button to use audio
cat >> src/features/game/components/MainClickButton.tsx << 'EOF'
// Add import
import { gameAudioManager } from '@/features/audio/services/gameAudioManager';

// Update handleClick function
const handleClick = useCallback(() => {
  const clickPower = 1; // Base click power + prestige bonuses
  gameState.resources.money.set(prev => prev + clickPower);
  gameState.progression.statisticsTracking.totalClicks.set(prev => prev + 1);
  
  // Audio feedback
  gameAudioManager.playClickFeedback(clickPower);
  
  console.log('💰 Click! +$', clickPower);
}, []);
EOF

# Update department actions to use audio
cat >> src/features/departments/state/departmentStore.ts << 'EOF'
// Add import
import { gameAudioManager } from '@/features/audio/services/gameAudioManager';

// Update hireEmployee function to include audio feedback
// Add this after successful purchase:
gameAudioManager.playPurchaseFeedback(totalCost);

// Update unlockDepartment to include audio feedback
// Add this after successful unlock:
gameAudioManager.playDepartmentUnlock();
EOF
```

#### Success Criteria
- [ ] Audio feedback integrated with game actions
- [ ] Haptic feedback working on supported devices
- [ ] Contextual audio scaling with game progress
- [ ] Audio settings respected throughout the game

### Task 3.5: Advanced UI Features (2 hours)
**Objective**: Implement remaining UI components and navigation

#### Step 3.5.1: Complete UI Components
```bash
# Create production statistics component
cat > src/features/game/components/ProductionStats.tsx << 'EOF'
import React, { memo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Card } from '@/shared/components/Card';
import { gameComputed } from '@/core/state/gameComputed';
import { gameLoop } from '@/core/services/gameLoop';

export const ProductionStats = memo(() => {
  const totalProduction = gameComputed.totalProductionPerSecond.use();
  const performanceStats = gameLoop.getPerformanceStats();
  
  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return Math.floor(num).toString();
  };
  
  return (
    <Card style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            ${formatNumber(totalProduction)}/s
          </Text>
          <Text style={styles.statLabel}>Production</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { 
            color: performanceStats.fps >= 55 ? '#2e7d32' : '#d32f2f' 
          }]}>
            {performanceStats.fps} FPS
          </Text>
          <Text style={styles.statLabel}>Performance</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {performanceStats.mode.toUpperCase()}
          </Text>
          <Text style={styles.statLabel}>Mode</Text>
        </View>
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  container: {
    margin: 16,
    marginVertical: 8,
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});
EOF

# Create settings panel
cat > src/features/settings/components/SettingsPanel.tsx << 'EOF'
import React, { memo } from 'react';
import { View, StyleSheet, Switch, Text } from 'react-native';
import { Card } from '@/shared/components/Card';
import { gameState } from '@/core/state/gameState';

export const SettingsPanel = memo(() => {
  const settings = gameState.settings.use();
  
  const handleToggle = (setting: keyof typeof settings, value: boolean) => {
    gameState.settings[setting].set(value);
  };
  
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Game Settings</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Audio Effects</Text>
          <Switch
            value={settings.audioEnabled}
            onValueChange={(value) => handleToggle('audioEnabled', value)}
          />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Haptic Feedback</Text>
          <Switch
            value={settings.hapticsEnabled}
            onValueChange={(value) => handleToggle('hapticsEnabled', value)}
          />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Push Notifications</Text>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={(value) => handleToggle('notificationsEnabled', value)}
          />
        </View>
      </Card>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
});
EOF
```

#### Success Criteria
- [ ] All UI components rendering correctly
- [ ] Settings panel functional
- [ ] Performance statistics accurate
- [ ] Navigation between screens working

## Deliverables

### Complete Feature Systems
1. **All 7 Departments**
   - Development, Sales, Customer Experience, Product, Design, QA, Marketing
   - Unique mechanics and progression for each department
   - Department synergy bonuses and unlock progression

2. **Achievement System**
   - 15+ achievements across multiple categories
   - Progress tracking and notification system
   - Reward system with permanent bonuses

3. **Prestige System**
   - Prestige point calculation based on lifetime earnings
   - 4 prestige upgrades with meaningful progression
   - Complete game state reset with persistent benefits

4. **Enhanced Audio System**
   - Contextual audio feedback for all major actions
   - Haptic feedback integration
   - Performance-aware audio scaling

5. **Complete UI/UX**
   - Department navigation and management
   - Achievement progress tracking
   - Settings and customization options

## Validation Steps

### Feature Validation
```bash
# Test all departments
# - [ ] All 7 departments can be unlocked
# - [ ] Employee hiring works in all departments
# - [ ] Manager hiring provides 2x bonus
# - [ ] Department synergies calculate correctly

# Test achievement system
# - [ ] Achievements unlock when requirements met
# - [ ] Rewards apply correctly
# - [ ] Progress tracking accurate
# - [ ] Hidden achievements work properly

# Test prestige system
# - [ ] Prestige points calculate correctly
# - [ ] Prestige reset maintains appropriate progress
# - [ ] Prestige upgrades provide stated benefits
# - [ ] Multiple prestige cycles work correctly
```

### Integration Validation
```bash
# Test audio integration
# - [ ] Audio plays for all major actions
# - [ ] Haptic feedback works on supported devices
# - [ ] Audio settings toggle correctly
# - [ ] Performance mode affects audio complexity

# Test UI integration
# - [ ] All screens accessible via navigation
# - [ ] Performance statistics update in real-time
# - [ ] Settings persist between sessions
# - [ ] Achievement notifications display correctly
```

### Performance Validation
```bash
# Monitor performance with all features
# - [ ] 60 FPS maintained with all departments active
# - [ ] Memory usage under 200MB with full progress
# - [ ] Save/load works with complex game state
# - [ ] Achievement checking doesn't impact frame rate
```

## Common Issues & Solutions

### Issue: Performance Degradation with Many Departments
**Symptoms**: Frame rate drops below 55 FPS with all departments active
**Solution**:
- Optimize department update frequency
- Use batch state updates more aggressively
- Implement more granular performance scaling

### Issue: Achievement Progress Not Updating
**Symptoms**: Achievement progress stuck or not calculating correctly
**Solution**:
- Verify achievement checking frequency
- Check computed value dependencies
- Ensure statistics are being tracked properly

### Issue: Prestige Calculations Incorrect
**Symptoms**: Wrong prestige points awarded or benefits not applying
**Solution**:
- Validate prestige point formula
- Check used points calculation
- Verify multiplier application in game loop

### Issue: Audio Feedback Overwhelming
**Symptoms**: Too many audio cues playing simultaneously
**Solution**:
- Implement audio cooldowns more strictly
- Reduce audio instances for rapid actions
- Add audio priority system

## Next Steps
After completing Phase 3:
1. **Comprehensive Testing**: Full feature validation across all systems
2. **Performance Optimization**: Fine-tune for target performance metrics
3. **User Experience Polish**: Refine UI/UX based on integrated systems
4. **Proceed to Phase 4**: Begin final polish and quality assurance

---

## Time Tracking
- Task 3.1 (Complete Department System): ⏱️ 12 hours
- Task 3.2 (Achievement System): ⏱️ 8 hours
- Task 3.3 (Prestige System): ⏱️ 6 hours
- Task 3.4 (Audio Integration): ⏱️ 4 hours
- Task 3.5 (Advanced UI): ⏱️ 2 hours
- **Total Phase 3**: ⏱️ 32 hours

## Dependencies
- ✅ Phase 2 core features completed and validated
- ✅ Performance monitoring tools functional
- ✅ Audio assets available (or placeholder system)
- 🔄 UI/UX design assets for enhanced visual polish