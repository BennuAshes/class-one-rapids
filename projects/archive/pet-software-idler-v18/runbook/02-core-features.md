# Phase 02: Core Features - Department Systems

**Duration:** Weeks 4-7  
**Objective:** Implement all 7 departments as vertical slices with full functionality  
**Dependencies:** Phase 01 completed, core game loop operational

## Objectives

- [ ] Sales department vertical slice complete
- [ ] Customer Experience department implemented
- [ ] Product department functional
- [ ] Design department operational  
- [ ] QA department integrated
- [ ] Marketing department complete
- [ ] Inter-department synergy systems
- [ ] Feature shipping mechanics

## Department Implementation Strategy

Each department follows the established vertical-slicing pattern from Phase 01. All departments will be developed in parallel using the template structure.

### Department Development Order

1. **Week 4:** Sales + Customer Experience (revenue generators)
2. **Week 5:** Product + Design (feature creators)  
3. **Week 6:** QA + Marketing (multipliers)
4. **Week 7:** Integration + feature shipping

## Department Templates

### 1. Sales Department Implementation (Week 4, Days 1-3)

```bash
# Create sales department structure
mkdir -p src/features/sales/{state,components,hooks,handlers,validators}
```

**Sales State Management:**
```bash
cat > src/features/sales/state/salesStore.ts << 'EOF'
import { observable } from '@legendapp/state';
import { gameEvents } from '../../../core/EventBus';

interface SalesUnit {
  id: string;
  type: 'intern' | 'associate' | 'manager' | 'director';
  count: number;
  baseCost: number;
  revenue: number;
  automationLevel: number;
}

const SALES_CONFIGS = {
  intern: { baseCost: 25, revenue: 0.5 },
  associate: { baseCost: 250, revenue: 2.0 },
  manager: { baseCost: 2500, revenue: 8.0 },
  director: { baseCost: 25000, revenue: 20.0 },
};

const salesState$ = observable({
  totalRevenue: 0,
  salespeople: Object.entries(SALES_CONFIGS).map(([type, config]) => ({
    id: type,
    type: type as keyof typeof SALES_CONFIGS,
    count: 0,
    baseCost: config.baseCost,
    revenue: config.revenue,
    automationLevel: 0,
  })),
  
  upgrades: {
    crm: 0,
    leadGeneration: false,
    salesTraining: false,
  },
  
  // Computed values
  totalSalesForce: () => {
    return salesState$.salespeople.get().reduce((total, sales) => 
      total + sales.count, 0
    );
  },
  
  revenuePerSecond: () => {
    const salespeople = salesState$.salespeople.get();
    const upgrades = salesState$.upgrades.get();
    
    return salespeople.reduce((total, sales) => {
      const upgradeMultiplier = 1 + (upgrades.crm * 0.15);
      const trainingBonus = upgrades.salesTraining ? 1.25 : 1;
      return total + (sales.count * sales.revenue * upgradeMultiplier * trainingBonus);
    }, 0);
  },
  
  currentSalespersonCost: (type: keyof typeof SALES_CONFIGS) => {
    const salespeople = salesState$.salespeople.get();
    const salesperson = salespeople.find(s => s.type === type);
    if (!salesperson) return 0;
    
    return Math.floor(salesperson.baseCost * Math.pow(1.15, salesperson.count));
  },
});

export const useSales = () => {
  const hireSalesperson = (type: keyof typeof SALES_CONFIGS, playerMoney: number): boolean => {
    const cost = salesState$.currentSalespersonCost(type).get();
    
    if (playerMoney < cost) return false;
    
    const salespeople = salesState$.salespeople.get();
    const salesIndex = salespeople.findIndex(s => s.type === type);
    
    if (salesIndex >= 0) {
      salesState$.salespeople[salesIndex].count.set(prev => prev + 1);
      
      gameEvents.emit('salesperson.hired', { type, cost });
      gameEvents.emit('money.earned', { amount: -cost, source: 'sales_hire' });
      
      return true;
    }
    
    return false;
  };
  
  const upgradeCRM = (playerMoney: number): boolean => {
    const cost = 5000 * Math.pow(2, salesState$.upgrades.crm.get());
    
    if (playerMoney >= cost) {
      salesState$.upgrades.crm.set(prev => prev + 1);
      gameEvents.emit('money.earned', { amount: -cost, source: 'crm_upgrade' });
      return true;
    }
    
    return false;
  };
  
  return {
    // Read-only state
    totalRevenue: salesState$.totalRevenue,
    salespeople: salesState$.salespeople,
    totalSalesForce: salesState$.totalSalesForce,
    revenuePerSecond: salesState$.revenuePerSecond,
    upgrades: salesState$.upgrades,
    currentSalespersonCost: salesState$.currentSalespersonCost,
    
    // Actions
    hireSalesperson,
    upgradeCRM,
  };
};
EOF
```

**Sales Components:**
```bash
cat > src/features/sales/components/SalesTab.tsx << 'EOF'
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSales } from '../state/salesStore';
import { usePlayer } from '../../core/state/playerStore';
import { AnimatedNumber } from '../../../shared/ui/AnimatedNumber';
import { SalespersonList } from './SalespersonList';

export const SalesTab: React.FC = () => {
  const { totalRevenue, revenuePerSecond } = useSales();
  const { money } = usePlayer();
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sales Department</Text>
        <AnimatedNumber 
          value={totalRevenue.get()} 
          style={styles.counter}
          formatter={(v) => `$${v.toLocaleString()} total revenue`}
        />
        <AnimatedNumber 
          value={revenuePerSecond.get()} 
          style={styles.perSecond}
          formatter={(v) => `$${v.toFixed(2)}/sec`}
        />
      </View>
      
      <SalespersonList />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  counter: {
    fontSize: 18,
    color: '#4CAF50',
  },
  perSecond: {
    fontSize: 14,
    color: '#2196F3',
    marginTop: 4,
  },
});
EOF
```

### 2. Customer Experience Department (Week 4, Days 3-5)

```bash
mkdir -p src/features/customerExperience/{state,components,hooks,handlers,validators}

cat > src/features/customerExperience/state/customerExperienceStore.ts << 'EOF'
import { observable } from '@legendapp/state';
import { gameEvents } from '../../../core/EventBus';

interface CXUnit {
  id: string;
  type: 'support' | 'specialist' | 'manager' | 'director';
  count: number;
  baseCost: number;
  satisfaction: number;
}

const CX_CONFIGS = {
  support: { baseCost: 20, satisfaction: 0.1 },
  specialist: { baseCost: 200, satisfaction: 0.4 },
  manager: { baseCost: 2000, satisfaction: 1.5 },
  director: { baseCost: 20000, satisfaction: 4.0 },
};

const customerExperienceState$ = observable({
  customerSatisfaction: 50,
  supportTickets: 0,
  customerRetention: 0.85,
  
  cxTeam: Object.entries(CX_CONFIGS).map(([type, config]) => ({
    id: type,
    type: type as keyof typeof CX_CONFIGS,
    count: 0,
    baseCost: config.baseCost,
    satisfaction: config.satisfaction,
  })),
  
  upgrades: {
    helpdesk: 0,
    chatbot: false,
    knowledgeBase: false,
  },
  
  // Computed values
  totalSatisfactionBonus: () => {
    const team = customerExperienceState$.cxTeam.get();
    const upgrades = customerExperienceState$.upgrades.get();
    
    const teamBonus = team.reduce((total, member) => 
      total + (member.count * member.satisfaction), 0
    );
    
    const upgradeBonus = upgrades.helpdesk * 0.2;
    const chatbotBonus = upgrades.chatbot ? 0.3 : 0;
    
    return teamBonus + upgradeBonus + chatbotBonus;
  },
  
  currentMemberCost: (type: keyof typeof CX_CONFIGS) => {
    const team = customerExperienceState$.cxTeam.get();
    const member = team.find(m => m.type === type);
    if (!member) return 0;
    
    return Math.floor(member.baseCost * Math.pow(1.15, member.count));
  },
});

export const useCustomerExperience = () => {
  const hireCXMember = (type: keyof typeof CX_CONFIGS, playerMoney: number): boolean => {
    const cost = customerExperienceState$.currentMemberCost(type).get();
    
    if (playerMoney < cost) return false;
    
    const team = customerExperienceState$.cxTeam.get();
    const memberIndex = team.findIndex(m => m.type === type);
    
    if (memberIndex >= 0) {
      customerExperienceState$.cxTeam[memberIndex].count.set(prev => prev + 1);
      
      gameEvents.emit('cx.hired', { type, cost });
      gameEvents.emit('money.earned', { amount: -cost, source: 'cx_hire' });
      
      return true;
    }
    
    return false;
  };
  
  return {
    // Read-only state
    customerSatisfaction: customerExperienceState$.customerSatisfaction,
    customerRetention: customerExperienceState$.customerRetention,
    cxTeam: customerExperienceState$.cxTeam,
    totalSatisfactionBonus: customerExperienceState$.totalSatisfactionBonus,
    upgrades: customerExperienceState$.upgrades,
    currentMemberCost: customerExperienceState$.currentMemberCost,
    
    // Actions
    hireCXMember,
  };
};
EOF
```

### 3. Product Department (Week 5, Days 1-3)

```bash
mkdir -p src/features/product/{state,components,hooks,handlers,validators}

cat > src/features/product/state/productStore.ts << 'EOF'
import { observable } from '@legendapp/state';
import { gameEvents } from '../../../core/EventBus';

interface ProductManager {
  id: string;
  type: 'associate' | 'manager' | 'senior' | 'vp';
  count: number;
  baseCost: number;
  featureVelocity: number;
}

const PRODUCT_CONFIGS = {
  associate: { baseCost: 75, featureVelocity: 0.2 },
  manager: { baseCost: 750, featureVelocity: 0.8 },
  senior: { baseCost: 7500, featureVelocity: 2.5 },
  vp: { baseCost: 75000, featureVelocity: 6.0 },
};

const productState$ = observable({
  features: [],
  roadmapItems: 0,
  userStories: 0,
  
  productManagers: Object.entries(PRODUCT_CONFIGS).map(([type, config]) => ({
    id: type,
    type: type as keyof typeof PRODUCT_CONFIGS,
    count: 0,
    baseCost: config.baseCost,
    featureVelocity: config.featureVelocity,
  })),
  
  upgrades: {
    analytics: 0,
    userResearch: false,
    agileCeremonies: false,
  },
  
  // Computed values
  totalFeatureVelocity: () => {
    const managers = productState$.productManagers.get();
    const upgrades = productState$.upgrades.get();
    
    const baseVelocity = managers.reduce((total, pm) => 
      total + (pm.count * pm.featureVelocity), 0
    );
    
    const analyticsBonus = 1 + (upgrades.analytics * 0.1);
    const researchBonus = upgrades.userResearch ? 1.2 : 1;
    const agileBonus = upgrades.agileCeremonies ? 1.15 : 1;
    
    return baseVelocity * analyticsBonus * researchBonus * agileBonus;
  },
  
  currentPMCost: (type: keyof typeof PRODUCT_CONFIGS) => {
    const managers = productState$.productManagers.get();
    const pm = managers.find(m => m.type === type);
    if (!pm) return 0;
    
    return Math.floor(pm.baseCost * Math.pow(1.15, pm.count));
  },
});

export const useProduct = () => {
  const hireProductManager = (type: keyof typeof PRODUCT_CONFIGS, playerMoney: number): boolean => {
    const cost = productState$.currentPMCost(type).get();
    
    if (playerMoney < cost) return false;
    
    const managers = productState$.productManagers.get();
    const pmIndex = managers.findIndex(m => m.type === type);
    
    if (pmIndex >= 0) {
      productState$.productManagers[pmIndex].count.set(prev => prev + 1);
      
      gameEvents.emit('pm.hired', { type, cost });
      gameEvents.emit('money.earned', { amount: -cost, source: 'product_hire' });
      
      return true;
    }
    
    return false;
  };
  
  return {
    // Read-only state
    features: productState$.features,
    roadmapItems: productState$.roadmapItems,
    productManagers: productState$.productManagers,
    totalFeatureVelocity: productState$.totalFeatureVelocity,
    upgrades: productState$.upgrades,
    currentPMCost: productState$.currentPMCost,
    
    // Actions
    hireProductManager,
  };
};
EOF
```

### 4. Design Department (Week 5, Days 3-5)

```bash
mkdir -p src/features/design/{state,components,hooks,handlers,validators}

cat > src/features/design/state/designStore.ts << 'EOF'
import { observable } from '@legendapp/state';
import { gameEvents } from '../../../core/EventBus';

interface Designer {
  id: string;
  type: 'junior' | 'mid' | 'senior' | 'lead';
  count: number;
  baseCost: number;
  designOutput: number;
}

const DESIGN_CONFIGS = {
  junior: { baseCost: 40, designOutput: 0.3 },
  mid: { baseCost: 400, designOutput: 1.2 },
  senior: { baseCost: 4000, designOutput: 3.5 },
  lead: { baseCost: 40000, designOutput: 8.0 },
};

const designState$ = observable({
  designAssets: 0,
  userExperience: 70,
  brandValue: 100,
  
  designers: Object.entries(DESIGN_CONFIGS).map(([type, config]) => ({
    id: type,
    type: type as keyof typeof DESIGN_CONFIGS,
    count: 0,
    baseCost: config.baseCost,
    designOutput: config.designOutput,
  })),
  
  upgrades: {
    designTools: 0,
    designSystem: false,
    userTesting: false,
  },
  
  // Computed values
  totalDesignOutput: () => {
    const designers = designState$.designers.get();
    const upgrades = designState$.upgrades.get();
    
    const baseOutput = designers.reduce((total, designer) => 
      total + (designer.count * designer.designOutput), 0
    );
    
    const toolsBonus = 1 + (upgrades.designTools * 0.12);
    const systemBonus = upgrades.designSystem ? 1.3 : 1;
    const testingBonus = upgrades.userTesting ? 1.2 : 1;
    
    return baseOutput * toolsBonus * systemBonus * testingBonus;
  },
  
  currentDesignerCost: (type: keyof typeof DESIGN_CONFIGS) => {
    const designers = designState$.designers.get();
    const designer = designers.find(d => d.type === type);
    if (!designer) return 0;
    
    return Math.floor(designer.baseCost * Math.pow(1.15, designer.count));
  },
});

export const useDesign = () => {
  const hireDesigner = (type: keyof typeof DESIGN_CONFIGS, playerMoney: number): boolean => {
    const cost = designState$.currentDesignerCost(type).get();
    
    if (playerMoney < cost) return false;
    
    const designers = designState$.designers.get();
    const designerIndex = designers.findIndex(d => d.type === type);
    
    if (designerIndex >= 0) {
      designState$.designers[designerIndex].count.set(prev => prev + 1);
      
      gameEvents.emit('designer.hired', { type, cost });
      gameEvents.emit('money.earned', { amount: -cost, source: 'design_hire' });
      
      return true;
    }
    
    return false;
  };
  
  return {
    // Read-only state
    designAssets: designState$.designAssets,
    userExperience: designState$.userExperience,
    brandValue: designState$.brandValue,
    designers: designState$.designers,
    totalDesignOutput: designState$.totalDesignOutput,
    upgrades: designState$.upgrades,
    currentDesignerCost: designState$.currentDesignerCost,
    
    // Actions
    hireDesigner,
  };
};
EOF
```

### 5. QA Department (Week 6, Days 1-3)

```bash
mkdir -p src/features/qa/{state,components,hooks,handlers,validators}

cat > src/features/qa/state/qaStore.ts << 'EOF'
import { observable } from '@legendapp/state';
import { gameEvents } from '../../../core/EventBus';

interface QATester {
  id: string;
  type: 'tester' | 'automation' | 'lead' | 'manager';
  count: number;
  baseCost: number;
  bugDetection: number;
  testCoverage: number;
}

const QA_CONFIGS = {
  tester: { baseCost: 30, bugDetection: 0.2, testCoverage: 0.1 },
  automation: { baseCost: 300, bugDetection: 0.6, testCoverage: 0.5 },
  lead: { baseCost: 3000, bugDetection: 1.5, testCoverage: 1.2 },
  manager: { baseCost: 30000, bugDetection: 3.0, testCoverage: 2.5 },
};

const qaState$ = observable({
  bugsFixed: 0,
  testCoverage: 10,
  codeQuality: 60,
  
  qaTeam: Object.entries(QA_CONFIGS).map(([type, config]) => ({
    id: type,
    type: type as keyof typeof QA_CONFIGS,
    count: 0,
    baseCost: config.baseCost,
    bugDetection: config.bugDetection,
    testCoverage: config.testCoverage,
  })),
  
  upgrades: {
    testFrameworks: 0,
    cicd: false,
    performanceTesting: false,
  },
  
  // Computed values
  totalBugDetection: () => {
    const team = qaState$.qaTeam.get();
    const upgrades = qaState$.upgrades.get();
    
    const baseDetection = team.reduce((total, tester) => 
      total + (tester.count * tester.bugDetection), 0
    );
    
    const frameworkBonus = 1 + (upgrades.testFrameworks * 0.15);
    const cicdBonus = upgrades.cicd ? 1.25 : 1;
    const perfTestBonus = upgrades.performanceTesting ? 1.2 : 1;
    
    return baseDetection * frameworkBonus * cicdBonus * perfTestBonus;
  },
  
  totalTestCoverage: () => {
    const team = qaState$.qaTeam.get();
    return Math.min(95, team.reduce((total, tester) => 
      total + (tester.count * tester.testCoverage), 10
    ));
  },
  
  currentTesterCost: (type: keyof typeof QA_CONFIGS) => {
    const team = qaState$.qaTeam.get();
    const tester = team.find(t => t.type === type);
    if (!tester) return 0;
    
    return Math.floor(tester.baseCost * Math.pow(1.15, tester.count));
  },
});

export const useQA = () => {
  const hireTester = (type: keyof typeof QA_CONFIGS, playerMoney: number): boolean => {
    const cost = qaState$.currentTesterCost(type).get();
    
    if (playerMoney < cost) return false;
    
    const team = qaState$.qaTeam.get();
    const testerIndex = team.findIndex(t => t.type === type);
    
    if (testerIndex >= 0) {
      qaState$.qaTeam[testerIndex].count.set(prev => prev + 1);
      
      gameEvents.emit('tester.hired', { type, cost });
      gameEvents.emit('money.earned', { amount: -cost, source: 'qa_hire' });
      
      return true;
    }
    
    return false;
  };
  
  return {
    // Read-only state
    bugsFixed: qaState$.bugsFixed,
    testCoverage: qaState$.totalTestCoverage,
    codeQuality: qaState$.codeQuality,
    qaTeam: qaState$.qaTeam,
    totalBugDetection: qaState$.totalBugDetection,
    upgrades: qaState$.upgrades,
    currentTesterCost: qaState$.currentTesterCost,
    
    // Actions
    hireTester,
  };
};
EOF
```

### 6. Marketing Department (Week 6, Days 3-5)

```bash
mkdir -p src/features/marketing/{state,components,hooks,handlers,validators}

cat > src/features/marketing/state/marketingStore.ts << 'EOF'
import { observable } from '@legendapp/state';
import { gameEvents } from '../../../core/EventBus';

interface Marketer {
  id: string;
  type: 'coordinator' | 'specialist' | 'manager' | 'director';
  count: number;
  baseCost: number;
  brandAwareness: number;
  leadGeneration: number;
}

const MARKETING_CONFIGS = {
  coordinator: { baseCost: 35, brandAwareness: 0.1, leadGeneration: 0.2 },
  specialist: { baseCost: 350, brandAwareness: 0.4, leadGeneration: 0.8 },
  manager: { baseCost: 3500, brandAwareness: 1.2, leadGeneration: 2.5 },
  director: { baseCost: 35000, brandAwareness: 3.0, leadGeneration: 6.0 },
};

const marketingState$ = observable({
  brandAwareness: 10,
  leads: 0,
  conversionRate: 0.05,
  
  marketingTeam: Object.entries(MARKETING_CONFIGS).map(([type, config]) => ({
    id: type,
    type: type as keyof typeof MARKETING_CONFIGS,
    count: 0,
    baseCost: config.baseCost,
    brandAwareness: config.brandAwareness,
    leadGeneration: config.leadGeneration,
  })),
  
  upgrades: {
    adPlatforms: 0,
    contentMarketing: false,
    seo: false,
  },
  
  // Computed values
  totalBrandAwareness: () => {
    const team = marketingState$.marketingTeam.get();
    const upgrades = marketingState$.upgrades.get();
    
    const baseAwareness = team.reduce((total, marketer) => 
      total + (marketer.count * marketer.brandAwareness), 10
    );
    
    const adBonus = 1 + (upgrades.adPlatforms * 0.2);
    const contentBonus = upgrades.contentMarketing ? 1.3 : 1;
    const seoBonus = upgrades.seo ? 1.25 : 1;
    
    return Math.min(100, baseAwareness * adBonus * contentBonus * seoBonus);
  },
  
  leadsPerSecond: () => {
    const team = marketingState$.marketingTeam.get();
    return team.reduce((total, marketer) => 
      total + (marketer.count * marketer.leadGeneration), 0
    );
  },
  
  currentMarketerCost: (type: keyof typeof MARKETING_CONFIGS) => {
    const team = marketingState$.marketingTeam.get();
    const marketer = team.find(m => m.type === type);
    if (!marketer) return 0;
    
    return Math.floor(marketer.baseCost * Math.pow(1.15, marketer.count));
  },
});

export const useMarketing = () => {
  const hireMarketer = (type: keyof typeof MARKETING_CONFIGS, playerMoney: number): boolean => {
    const cost = marketingState$.currentMarketerCost(type).get();
    
    if (playerMoney < cost) return false;
    
    const team = marketingState$.marketingTeam.get();
    const marketerIndex = team.findIndex(m => m.type === type);
    
    if (marketerIndex >= 0) {
      marketingState$.marketingTeam[marketerIndex].count.set(prev => prev + 1);
      
      gameEvents.emit('marketer.hired', { type, cost });
      gameEvents.emit('money.earned', { amount: -cost, source: 'marketing_hire' });
      
      return true;
    }
    
    return false;
  };
  
  return {
    // Read-only state
    brandAwareness: marketingState$.totalBrandAwareness,
    leads: marketingState$.leads,
    conversionRate: marketingState$.conversionRate,
    marketingTeam: marketingState$.marketingTeam,
    leadsPerSecond: marketingState$.leadsPerSecond,
    upgrades: marketingState$.upgrades,
    currentMarketerCost: marketingState$.currentMarketerCost,
    
    // Actions
    hireMarketer,
  };
};
EOF
```

## Feature Shipping System (Week 7)

### 1. Feature Creation & Shipping Logic

```bash
# Create feature system
cat > src/features/core/state/featureStore.ts << 'EOF'
import { observable } from '@legendapp/state';
import { gameEvents } from '../../../core/EventBus';

interface Feature {
  id: string;
  name: string;
  type: 'basic' | 'advanced' | 'premium';
  linesOfCodeRequired: number;
  designAssetsRequired: number;
  testCoverageRequired: number;
  value: number;
  status: 'planning' | 'development' | 'testing' | 'ready' | 'shipped';
}

const featureStore$ = observable({
  activeFeatures: [] as Feature[],
  shippedFeatures: [] as Feature[],
  totalFeatureValue: 0,
  
  // Computed values
  canShipFeatures: () => {
    // Check if features are ready to ship based on department outputs
    const features = featureStore$.activeFeatures.get();
    return features.filter(f => f.status === 'ready');
  },
  
  nextFeatureCost: (type: 'basic' | 'advanced' | 'premium') => {
    const baseCosts = { basic: 100, advanced: 1000, premium: 10000 };
    const shippedCount = featureStore$.shippedFeatures.get().filter(f => f.type === type).length;
    return baseCosts[type] * Math.pow(1.2, shippedCount);
  },
});

export const useFeatures = () => {
  const createFeature = (type: 'basic' | 'advanced' | 'premium', playerMoney: number): boolean => {
    const cost = featureStore$.nextFeatureCost(type).get();
    
    if (playerMoney < cost) return false;
    
    const requirements = {
      basic: { loc: 10, design: 2, testing: 5 },
      advanced: { loc: 100, design: 20, testing: 50 },
      premium: { loc: 1000, design: 200, testing: 500 },
    };
    
    const req = requirements[type];
    const newFeature: Feature = {
      id: `${type}-${Date.now()}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Feature`,
      type,
      linesOfCodeRequired: req.loc,
      designAssetsRequired: req.design,
      testCoverageRequired: req.testing,
      value: cost * 5, // 5x return on investment
      status: 'planning',
    };
    
    featureStore$.activeFeatures.set(prev => [...prev, newFeature]);
    gameEvents.emit('money.earned', { amount: -cost, source: 'feature_planning' });
    
    return true;
  };
  
  const shipFeature = (featureId: string): boolean => {
    const activeFeatures = featureStore$.activeFeatures.get();
    const feature = activeFeatures.find(f => f.id === featureId && f.status === 'ready');
    
    if (!feature) return false;
    
    // Move to shipped features
    featureStore$.activeFeatures.set(prev => prev.filter(f => f.id !== featureId));
    featureStore$.shippedFeatures.set(prev => [...prev, { ...feature, status: 'shipped' as const }]);
    featureStore$.totalFeatureValue.set(prev => prev + feature.value);
    
    gameEvents.emit('feature.shipped', { value: feature.value, featureType: feature.type });
    gameEvents.emit('money.earned', { amount: feature.value, source: 'feature_revenue' });
    
    return true;
  };
  
  return {
    // Read-only state
    activeFeatures: featureStore$.activeFeatures,
    shippedFeatures: featureStore$.shippedFeatures,
    totalFeatureValue: featureStore$.totalFeatureValue,
    canShipFeatures: featureStore$.canShipFeatures,
    nextFeatureCost: featureStore$.nextFeatureCost,
    
    // Actions
    createFeature,
    shipFeature,
  };
};
EOF
```

### 2. Department Synergy System

```bash
# Create synergy calculator
cat > src/features/core/state/synergyStore.ts << 'EOF'
import { observable } from '@legendapp/state';

const synergyStore$ = observable({
  departmentBonuses: {
    development: 1.0,
    sales: 1.0,
    customerExperience: 1.0,
    product: 1.0,
    design: 1.0,
    qa: 1.0,
    marketing: 1.0,
  },
  
  // Computed synergy bonuses
  totalSynergyMultiplier: () => {
    const bonuses = synergyStore$.departmentBonuses.get();
    
    // Calculate cross-department synergies
    const devSalesBonus = Math.min(bonuses.development, bonuses.sales) * 0.1;
    const designDevBonus = Math.min(bonuses.design, bonuses.development) * 0.12;
    const qaDevBonus = Math.min(bonuses.qa, bonuses.development) * 0.08;
    const marketingSalesBonus = Math.min(bonuses.marketing, bonuses.sales) * 0.15;
    
    return 1 + devSalesBonus + designDevBonus + qaDevBonus + marketingSalesBonus;
  },
});

export const useSynergy = () => {
  const updateDepartmentBonus = (department: keyof typeof synergyStore$.departmentBonuses, bonus: number) => {
    synergyStore$.departmentBonuses[department].set(bonus);
  };
  
  return {
    // Read-only state
    departmentBonuses: synergyStore$.departmentBonuses,
    totalSynergyMultiplier: synergyStore$.totalSynergyMultiplier,
    
    // Actions
    updateDepartmentBonus,
  };
};
EOF
```

## Tab Navigation System

### 1. Department Tab Navigation

```bash
# Create tab navigation
cat > src/shared/ui/DepartmentTabs.tsx << 'EOF'
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { DevelopmentTab } from '../../features/development/components/DevelopmentTab';
import { SalesTab } from '../../features/sales/components/SalesTab';
import { CustomerExperienceTab } from '../../features/customerExperience/components/CustomerExperienceTab';
import { ProductTab } from '../../features/product/components/ProductTab';
import { DesignTab } from '../../features/design/components/DesignTab';
import { QATab } from '../../features/qa/components/QATab';
import { MarketingTab } from '../../features/marketing/components/MarketingTab';

const DEPARTMENTS = [
  { id: 'development', name: 'Dev', component: DevelopmentTab },
  { id: 'sales', name: 'Sales', component: SalesTab },
  { id: 'customerExperience', name: 'CX', component: CustomerExperienceTab },
  { id: 'product', name: 'Product', component: ProductTab },
  { id: 'design', name: 'Design', component: DesignTab },
  { id: 'qa', name: 'QA', component: QATab },
  { id: 'marketing', name: 'Marketing', component: MarketingTab },
];

export const DepartmentTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('development');
  
  const ActiveComponent = DEPARTMENTS.find(dept => dept.id === activeTab)?.component || DevelopmentTab;
  
  return (
    <View style={styles.container}>
      <ScrollView horizontal style={styles.tabBar} showsHorizontalScrollIndicator={false}>
        {DEPARTMENTS.map(dept => (
          <TouchableOpacity
            key={dept.id}
            style={[
              styles.tab,
              activeTab === dept.id && styles.activeTab
            ]}
            onPress={() => setActiveTab(dept.id)}
          >
            <Text style={[
              styles.tabText,
              activeTab === dept.id && styles.activeTabText
            ]}>
              {dept.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <View style={styles.content}>
        <ActiveComponent />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#2196F3',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: 'white',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
});
EOF
```

## Testing Strategy

### 1. Department Integration Tests

```bash
# Create integration test suite
cat > src/__tests__/departmentIntegration.test.ts << 'EOF'
import { useDevelopment } from '../features/development/state/developmentStore';
import { useSales } from '../features/sales/state/salesStore';
import { useFeatures } from '../features/core/state/featureStore';

describe('Department Integration', () => {
  it('should complete full development cycle', async () => {
    const { writeCode, hireDeveloper } = useDevelopment();
    const { createFeature, shipFeature } = useFeatures();
    const { hireSalesperson } = useSales();
    
    // Hire initial team
    hireDeveloper('junior', 1000);
    hireSalesperson('intern', 1000);
    
    // Create and develop feature
    createFeature('basic', 500);
    
    // Write required code
    for (let i = 0; i < 10; i++) {
      writeCode();
    }
    
    // Ship feature and verify revenue
    const initialMoney = 1000;
    shipFeature('basic-test');
    
    // Revenue should be generated
    expect(getMoney()).toBeGreaterThan(initialMoney);
  });
  
  it('should calculate department synergies correctly', () => {
    const { totalSynergyMultiplier } = useSynergy();
    
    // Test cross-department bonuses
    updateDepartmentBonus('development', 2.0);
    updateDepartmentBonus('sales', 2.0);
    
    // Should get dev-sales synergy bonus
    expect(totalSynergyMultiplier.get()).toBeGreaterThan(1.0);
  });
});
EOF

# Run integration tests
npm test -- --testPathPattern=departmentIntegration
```

## Validation Criteria

### Functional Requirements Met
- [ ] All 7 departments implemented as vertical slices
- [ ] Department hiring systems functional with cost scaling
- [ ] Feature creation and shipping cycle complete
- [ ] Cross-department synergy bonuses calculated
- [ ] Tab navigation between departments working
- [ ] Revenue generation from shipped features

### Performance Requirements Met
- [ ] <50ms tab switching response time
- [ ] 60fps maintained with all departments loaded
- [ ] Memory usage under 200MB with full feature set
- [ ] FlatList performance optimized for all department lists

### Code Quality Requirements Met
- [ ] >90% test coverage for all departments
- [ ] No cross-feature imports between departments
- [ ] Vertical slicing pattern maintained consistently
- [ ] TypeScript strict mode compliance

## Deliverables

1. **Seven Department Vertical Slices** - Complete implementations following established pattern
2. **Feature Shipping System** - End-to-end feature creation and revenue generation
3. **Department Synergy System** - Cross-department bonus calculations
4. **Tab Navigation UI** - Intuitive department switching interface
5. **Integration Test Suite** - Comprehensive testing of department interactions

## Next Phase

Upon completion, proceed to [03-Integration](./03-integration.md) for advanced system integration and prestige mechanics.

---

**Phase Completion Criteria:** All seven departments functional, feature shipping operational, integration tests passing

**Research Dependencies:**
- vertical-slicing: Each department as independent complete stack
- FlatList optimization: Efficient rendering for all department unit lists
- @legendapp/state@beta: Reactive state management across all departments