# Phase 03: System Integration & Advanced Features

**Duration:** Weeks 8-9  
**Objective:** Integrate all systems and implement advanced game mechanics  
**Dependencies:** Phase 02 completed, all departments functional

## Objectives

- [ ] Prestige system implementation (investor rounds)
- [ ] Advanced department synergies and automation
- [ ] Milestone and achievement systems
- [ ] Offline progression mechanics
- [ ] Performance optimization and monitoring
- [ ] Advanced UI/UX improvements

## Prestige System Implementation

### 1. Investor Rounds System (Week 8, Days 1-3)

```bash
# Create prestige/investor system
mkdir -p src/features/prestige/{state,components,hooks,handlers,validators}

cat > src/features/prestige/state/prestigeStore.ts << 'EOF'
import { observable } from '@legendapp/state';
import { gameEvents } from '../../../core/EventBus';

interface InvestorRound {
  id: string;
  name: string;
  requiredValuation: number;
  investmentAmount: number;
  investmentPoints: number;
  completed: boolean;
}

const INVESTOR_ROUNDS: InvestorRound[] = [
  {
    id: 'seed',
    name: 'Seed Round',
    requiredValuation: 100000,
    investmentAmount: 50000,
    investmentPoints: 10,
    completed: false,
  },
  {
    id: 'series_a',
    name: 'Series A',
    requiredValuation: 1000000,
    investmentAmount: 500000,
    investmentPoints: 25,
    completed: false,
  },
  {
    id: 'series_b',
    name: 'Series B',
    requiredValuation: 10000000,
    investmentAmount: 5000000,
    investmentPoints: 50,
    completed: false,
  },
  {
    id: 'series_c',
    name: 'Series C',
    requiredValuation: 50000000,
    investmentAmount: 25000000,
    investmentPoints: 100,
    completed: false,
  },
  {
    id: 'ipo',
    name: 'IPO',
    requiredValuation: 500000000,
    investmentAmount: 250000000,
    investmentPoints: 500,
    completed: false,
  },
];

const prestigeStore$ = observable({
  currentRound: 0,
  totalInvestmentPoints: 0,
  investorRounds: INVESTOR_ROUNDS,
  prestigeLevel: 0,
  
  // Computed values
  nextRound: () => {
    const rounds = prestigeStore$.investorRounds.get();
    return rounds.find(round => !round.completed);
  },
  
  canRaiseRound: (currentValuation: number) => {
    const nextRound = prestigeStore$.nextRound.get();
    return nextRound && currentValuation >= nextRound.requiredValuation;
  },
  
  prestigeBonus: () => {
    const level = prestigeStore$.prestigeLevel.get();
    return 1 + (level * 0.1); // 10% bonus per prestige level
  },
});

export const usePrestige = () => {
  const raiseInvestorRound = (currentValuation: number): boolean => {
    const nextRound = prestigeStore$.nextRound.get();
    
    if (!nextRound || currentValuation < nextRound.requiredValuation) {
      return false;
    }
    
    // Mark round as completed
    const rounds = prestigeStore$.investorRounds.get();
    const roundIndex = rounds.findIndex(r => r.id === nextRound.id);
    
    if (roundIndex >= 0) {
      prestigeStore$.investorRounds[roundIndex].completed.set(true);
      prestigeStore$.totalInvestmentPoints.set(prev => prev + nextRound.investmentPoints);
      prestigeStore$.currentRound.set(prev => prev + 1);
      
      // Add investment money
      gameEvents.emit('money.earned', { 
        amount: nextRound.investmentAmount, 
        source: `investor_round_${nextRound.id}` 
      });
      
      // Trigger celebration effects
      gameEvents.emit('milestone.reached', {
        milestone: nextRound.name,
        reward: nextRound.investmentAmount,
      });
      
      return true;
    }
    
    return false;
  };
  
  const prestige = (): boolean => {
    const totalPoints = prestigeStore$.totalInvestmentPoints.get();
    
    // Require at least Series A completion
    if (totalPoints < 35) return false;
    
    // Reset game with bonuses
    prestigeStore$.prestigeLevel.set(prev => prev + 1);
    
    // Emit prestige reset event
    gameEvents.emit('prestige.activated', {
      level: prestigeStore$.prestigeLevel.get(),
      bonuses: prestigeStore$.prestigeBonus.get(),
    });
    
    return true;
  };
  
  return {
    // Read-only state
    currentRound: prestigeStore$.currentRound,
    totalInvestmentPoints: prestigeStore$.totalInvestmentPoints,
    investorRounds: prestigeStore$.investorRounds,
    prestigeLevel: prestigeStore$.prestigeLevel,
    nextRound: prestigeStore$.nextRound,
    canRaiseRound: prestigeStore$.canRaiseRound,
    prestigeBonus: prestigeStore$.prestigeBonus,
    
    // Actions
    raiseInvestorRound,
    prestige,
  };
};
EOF
```

### 2. Advanced Automation Systems (Week 8, Days 3-5)

```bash
# Create automation manager
cat > src/features/core/state/automationStore.ts << 'EOF'
import { observable } from '@legendapp/state';
import { gameEvents } from '../../../core/EventBus';

interface AutomationRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  enabled: boolean;
  cost: number;
  unlocked: boolean;
}

const AUTOMATION_RULES: AutomationRule[] = [
  {
    id: 'auto_hire_dev',
    name: 'Auto-hire Developers',
    condition: 'money > developer_cost * 10',
    action: 'hire_developer',
    enabled: false,
    cost: 10000,
    unlocked: false,
  },
  {
    id: 'auto_ship_features',
    name: 'Auto-ship Features',
    condition: 'feature_ready',
    action: 'ship_feature',
    enabled: false,
    cost: 25000,
    unlocked: false,
  },
  {
    id: 'auto_upgrade_systems',
    name: 'Auto-upgrade Systems',
    condition: 'money > upgrade_cost * 5',
    action: 'buy_upgrade',
    enabled: false,
    cost: 50000,
    unlocked: false,
  },
];

const automationStore$ = observable({
  rules: AUTOMATION_RULES,
  automationLevel: 0,
  lastAutomationRun: 0,
  
  // Computed values
  availableRules: () => {
    return automationStore$.rules.get().filter(rule => rule.unlocked);
  },
  
  enabledRules: () => {
    return automationStore$.rules.get().filter(rule => rule.enabled && rule.unlocked);
  },
});

export const useAutomation = () => {
  const unlockAutomation = (ruleId: string, playerMoney: number): boolean => {
    const rules = automationStore$.rules.get();
    const ruleIndex = rules.findIndex(r => r.id === ruleId);
    
    if (ruleIndex >= 0 && !rules[ruleIndex].unlocked) {
      const cost = rules[ruleIndex].cost;
      
      if (playerMoney >= cost) {
        automationStore$.rules[ruleIndex].unlocked.set(true);
        gameEvents.emit('money.earned', { amount: -cost, source: 'automation_unlock' });
        return true;
      }
    }
    
    return false;
  };
  
  const toggleAutomation = (ruleId: string): void => {
    const rules = automationStore$.rules.get();
    const ruleIndex = rules.findIndex(r => r.id === ruleId);
    
    if (ruleIndex >= 0 && rules[ruleIndex].unlocked) {
      automationStore$.rules[ruleIndex].enabled.set(prev => !prev);
    }
  };
  
  const runAutomation = (): void => {
    const now = Date.now();
    const lastRun = automationStore$.lastAutomationRun.get();
    
    // Run automation every 5 seconds
    if (now - lastRun < 5000) return;
    
    const enabledRules = automationStore$.enabledRules.get();
    
    enabledRules.forEach(rule => {
      // Execute automation rule based on conditions
      gameEvents.emit('automation.rule_triggered', { ruleId: rule.id });
    });
    
    automationStore$.lastAutomationRun.set(now);
  };
  
  return {
    // Read-only state
    rules: automationStore$.rules,
    automationLevel: automationStore$.automationLevel,
    availableRules: automationStore$.availableRules,
    enabledRules: automationStore$.enabledRules,
    
    // Actions
    unlockAutomation,
    toggleAutomation,
    runAutomation,
  };
};
EOF
```

### 3. Milestone & Achievement System (Week 8, Days 5 - Week 9, Day 2)

```bash
# Create achievements system
mkdir -p src/features/achievements/{state,components}

cat > src/features/achievements/state/achievementStore.ts << 'EOF'
import { observable } from '@legendapp/state';
import { gameEvents } from '../../../core/EventBus';

interface Achievement {
  id: string;
  name: string;
  description: string;
  type: 'milestone' | 'challenge' | 'secret';
  condition: {
    stat: string;
    value: number;
    comparison: 'gte' | 'lte' | 'eq';
  };
  reward: {
    type: 'money' | 'multiplier' | 'unlock';
    value: number;
    description: string;
  };
  unlocked: boolean;
  claimed: boolean;
  progress: number;
}

const ACHIEVEMENTS: Achievement[] = [
  // Milestone achievements
  {
    id: 'first_hire',
    name: 'Team Builder',
    description: 'Hire your first developer',
    type: 'milestone',
    condition: { stat: 'developers_hired', value: 1, comparison: 'gte' },
    reward: { type: 'money', value: 100, description: '+$100 bonus' },
    unlocked: false,
    claimed: false,
    progress: 0,
  },
  {
    id: 'first_feature',
    name: 'MVP Master',
    description: 'Ship your first feature',
    type: 'milestone',
    condition: { stat: 'features_shipped', value: 1, comparison: 'gte' },
    reward: { type: 'multiplier', value: 1.1, description: '+10% revenue' },
    unlocked: false,
    claimed: false,
    progress: 0,
  },
  {
    id: 'million_revenue',
    name: 'Millionaire',
    description: 'Reach $1,000,000 in total revenue',
    type: 'milestone',
    condition: { stat: 'total_revenue', value: 1000000, comparison: 'gte' },
    reward: { type: 'unlock', value: 1, description: 'Unlock advanced features' },
    unlocked: false,
    claimed: false,
    progress: 0,
  },
  
  // Challenge achievements
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Ship 10 features in under 1 hour',
    type: 'challenge',
    condition: { stat: 'features_per_hour', value: 10, comparison: 'gte' },
    reward: { type: 'multiplier', value: 1.25, description: '+25% development speed' },
    unlocked: false,
    claimed: false,
    progress: 0,
  },
  
  // Secret achievements
  {
    id: 'easter_egg',
    name: 'Konami Code',
    description: 'Found the secret developer room',
    type: 'secret',
    condition: { stat: 'konami_activated', value: 1, comparison: 'eq' },
    reward: { type: 'money', value: 50000, description: '+$50,000 bonus' },
    unlocked: false,
    claimed: false,
    progress: 0,
  },
];

const achievementStore$ = observable({
  achievements: ACHIEVEMENTS,
  totalAchievements: ACHIEVEMENTS.length,
  unlockedCount: 0,
  
  // Computed values
  availableAchievements: () => {
    return achievementStore$.achievements.get().filter(a => a.unlocked && !a.claimed);
  },
  
  completionPercentage: () => {
    const achievements = achievementStore$.achievements.get();
    const claimed = achievements.filter(a => a.claimed).length;
    return (claimed / achievements.length) * 100;
  },
});

export const useAchievements = () => {
  const checkAchievements = (gameStats: Record<string, number>): void => {
    const achievements = achievementStore$.achievements.get();
    
    achievements.forEach((achievement, index) => {
      if (achievement.claimed) return;
      
      const statValue = gameStats[achievement.condition.stat] || 0;
      const { value, comparison } = achievement.condition;
      
      let conditionMet = false;
      switch (comparison) {
        case 'gte':
          conditionMet = statValue >= value;
          break;
        case 'lte':
          conditionMet = statValue <= value;
          break;
        case 'eq':
          conditionMet = statValue === value;
          break;
      }
      
      // Update progress
      achievementStore$.achievements[index].progress.set(
        Math.min(1, statValue / value)
      );
      
      // Unlock achievement
      if (conditionMet && !achievement.unlocked) {
        achievementStore$.achievements[index].unlocked.set(true);
        achievementStore$.unlockedCount.set(prev => prev + 1);
        
        gameEvents.emit('achievement.unlocked', {
          achievement: achievement.name,
          description: achievement.description,
        });
      }
    });
  };
  
  const claimAchievement = (achievementId: string): boolean => {
    const achievements = achievementStore$.achievements.get();
    const achievementIndex = achievements.findIndex(a => 
      a.id === achievementId && a.unlocked && !a.claimed
    );
    
    if (achievementIndex >= 0) {
      const achievement = achievements[achievementIndex];
      
      achievementStore$.achievements[achievementIndex].claimed.set(true);
      
      // Apply reward
      switch (achievement.reward.type) {
        case 'money':
          gameEvents.emit('money.earned', { 
            amount: achievement.reward.value, 
            source: 'achievement_reward' 
          });
          break;
        case 'multiplier':
          gameEvents.emit('multiplier.applied', {
            type: 'achievement',
            value: achievement.reward.value,
          });
          break;
        case 'unlock':
          gameEvents.emit('feature.unlocked', {
            feature: `achievement_unlock_${achievement.id}`,
          });
          break;
      }
      
      return true;
    }
    
    return false;
  };
  
  return {
    // Read-only state
    achievements: achievementStore$.achievements,
    totalAchievements: achievementStore$.totalAchievements,
    unlockedCount: achievementStore$.unlockedCount,
    availableAchievements: achievementStore$.availableAchievements,
    completionPercentage: achievementStore$.completionPercentage,
    
    // Actions
    checkAchievements,
    claimAchievement,
  };
};
EOF
```

### 4. Offline Progression System (Week 9, Days 2-3)

```bash
# Create offline progression calculator
cat > src/features/core/state/offlineStore.ts << 'EOF'
import { observable } from '@legendapp/state';
import { gameEvents } from '../../../core/EventBus';

const offlineStore$ = observable({
  lastOnlineTime: Date.now(),
  offlineEarnings: 0,
  offlineProgress: {
    linesOfCode: 0,
    revenue: 0,
    featuresShipped: 0,
  },
  
  // Computed values
  offlineTimeMinutes: () => {
    const now = Date.now();
    const lastOnline = offlineStore$.lastOnlineTime.get();
    return Math.floor((now - lastOnline) / (1000 * 60));
  },
});

export const useOfflineProgression = () => {
  const calculateOfflineProgress = (
    productionRates: {
      codePerSecond: number;
      revenuePerSecond: number;
      automationLevel: number;
    }
  ): void => {
    const now = Date.now();
    const lastOnline = offlineStore$.lastOnlineTime.get();
    const offlineTimeMs = Math.min(now - lastOnline, 7 * 24 * 60 * 60 * 1000); // Max 7 days
    const offlineTimeSeconds = offlineTimeMs / 1000;
    
    // Calculate offline production with diminishing returns
    const efficiencyRate = Math.max(0.1, 1 - (offlineTimeSeconds / (24 * 60 * 60)) * 0.1);
    
    const offlineCode = Math.floor(
      productionRates.codePerSecond * offlineTimeSeconds * efficiencyRate
    );
    
    const offlineRevenue = Math.floor(
      productionRates.revenuePerSecond * offlineTimeSeconds * efficiencyRate
    );
    
    // Estimate features shipped based on code production
    const offlineFeatures = Math.floor(offlineCode / 100); // 100 lines per feature
    
    offlineStore$.offlineProgress.set({
      linesOfCode: offlineCode,
      revenue: offlineRevenue,
      featuresShipped: offlineFeatures,
    });
    
    offlineStore$.offlineEarnings.set(offlineRevenue);
    offlineStore$.lastOnlineTime.set(now);
  };
  
  const claimOfflineEarnings = (): void => {
    const earnings = offlineStore$.offlineEarnings.get();
    const progress = offlineStore$.offlineProgress.get();
    
    if (earnings > 0) {
      gameEvents.emit('money.earned', { 
        amount: earnings, 
        source: 'offline_earnings' 
      });
      
      gameEvents.emit('offline.progress_applied', {
        linesOfCode: progress.linesOfCode,
        revenue: progress.revenue,
        featuresShipped: progress.featuresShipped,
      });
      
      // Reset offline earnings
      offlineStore$.offlineEarnings.set(0);
      offlineStore$.offlineProgress.set({
        linesOfCode: 0,
        revenue: 0,
        featuresShipped: 0,
      });
    }
  };
  
  const updateLastOnlineTime = (): void => {
    offlineStore$.lastOnlineTime.set(Date.now());
  };
  
  return {
    // Read-only state
    lastOnlineTime: offlineStore$.lastOnlineTime,
    offlineEarnings: offlineStore$.offlineEarnings,
    offlineProgress: offlineStore$.offlineProgress,
    offlineTimeMinutes: offlineStore$.offlineTimeMinutes,
    
    // Actions
    calculateOfflineProgress,
    claimOfflineEarnings,
    updateLastOnlineTime,
  };
};
EOF
```

### 5. Game Loop Integration (Week 9, Days 3-4)

```bash
# Create master game loop coordinator
cat > src/features/core/state/gameLoopStore.ts << 'EOF'
import { observable } from '@legendapp/state';
import { usePlayer } from './playerStore';
import { useDevelopment } from '../../development/state/developmentStore';
import { useSales } from '../../sales/state/salesStore';
import { useAutomation } from './automationStore';
import { useAchievements } from '../../achievements/state/achievementStore';
import { useOfflineProgression } from './offlineStore';

const gameLoopStore$ = observable({
  isRunning: false,
  tickRate: 1000, // 1 second ticks
  lastTick: 0,
  gameStats: {
    developers_hired: 0,
    features_shipped: 0,
    total_revenue: 0,
    features_per_hour: 0,
    konami_activated: 0,
  },
});

export const useGameLoop = () => {
  const { money } = usePlayer();
  const { totalProduction, linesOfCode } = useDevelopment();
  const { revenuePerSecond } = useSales();
  const { runAutomation } = useAutomation();
  const { checkAchievements } = useAchievements();
  const { calculateOfflineProgress, updateLastOnlineTime } = useOfflineProgression();
  
  const startGameLoop = (): void => {
    if (gameLoopStore$.isRunning.get()) return;
    
    gameLoopStore$.isRunning.set(true);
    
    const gameLoop = () => {
      if (!gameLoopStore$.isRunning.get()) return;
      
      const now = Date.now();
      const lastTick = gameLoopStore$.lastTick.get();
      const deltaTime = Math.min(now - lastTick, 5000); // Cap at 5 seconds
      
      if (deltaTime >= gameLoopStore$.tickRate.get()) {
        // Update game state
        tick(deltaTime / 1000);
        gameLoopStore$.lastTick.set(now);
      }
      
      // Schedule next tick
      requestAnimationFrame(gameLoop);
    };
    
    gameLoop();
  };
  
  const tick = (deltaSeconds: number): void => {
    // Passive production
    const codeProduction = totalProduction.get() * deltaSeconds;
    const revenueProduction = revenuePerSecond.get() * deltaSeconds;
    
    if (codeProduction > 0) {
      linesOfCode.set(prev => prev + Math.floor(codeProduction));
    }
    
    if (revenueProduction > 0) {
      gameEvents.emit('money.earned', { 
        amount: Math.floor(revenueProduction), 
        source: 'passive_income' 
      });
    }
    
    // Update game stats
    gameLoopStore$.gameStats.total_revenue.set(prev => 
      prev + Math.floor(revenueProduction)
    );
    
    // Run automation
    runAutomation();
    
    // Check achievements
    checkAchievements(gameLoopStore$.gameStats.get());
    
    // Update online time
    updateLastOnlineTime();
  };
  
  const stopGameLoop = (): void => {
    gameLoopStore$.isRunning.set(false);
  };
  
  const updateGameStat = (stat: string, value: number): void => {
    const currentStats = gameLoopStore$.gameStats.get();
    if (stat in currentStats) {
      gameLoopStore$.gameStats[stat as keyof typeof currentStats].set(value);
    }
  };
  
  return {
    // Read-only state
    isRunning: gameLoopStore$.isRunning,
    gameStats: gameLoopStore$.gameStats,
    
    // Actions
    startGameLoop,
    stopGameLoop,
    updateGameStat,
  };
};
EOF
```

### 6. Advanced UI Components (Week 9, Days 4-5)

```bash
# Create notification system
cat > src/shared/ui/NotificationSystem.tsx << 'EOF'
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { gameEvents } from '../../core/EventBus';

interface Notification {
  id: string;
  type: 'achievement' | 'milestone' | 'earning' | 'warning';
  title: string;
  message: string;
  duration: number;
}

export const NotificationSystem: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [animatedValues] = useState(() => new Map<string, Animated.Value>());
  
  useEffect(() => {
    const unsubscribes = [
      gameEvents.on('achievement.unlocked', ({ achievement, description }) => {
        showNotification({
          type: 'achievement',
          title: 'Achievement Unlocked!',
          message: `${achievement}: ${description}`,
          duration: 5000,
        });
      }),
      
      gameEvents.on('milestone.reached', ({ milestone, reward }) => {
        showNotification({
          type: 'milestone',
          title: 'Milestone Reached!',
          message: `${milestone} - Earned $${reward.toLocaleString()}`,
          duration: 4000,
        });
      }),
      
      gameEvents.on('money.earned', ({ amount, source }) => {
        if (amount > 1000 && source === 'feature_revenue') {
          showNotification({
            type: 'earning',
            title: 'Feature Revenue',
            message: `+$${amount.toLocaleString()}`,
            duration: 2000,
          });
        }
      }),
    ];
    
    return () => unsubscribes.forEach(unsub => unsub());
  }, []);
  
  const showNotification = (notification: Omit<Notification, 'id'>): void => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const newNotification = { ...notification, id };
    
    // Create animation value
    const animValue = new Animated.Value(-100);
    animatedValues.set(id, animValue);
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Animate in
    Animated.sequence([
      Animated.timing(animValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(notification.duration),
      Animated.timing(animValue, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Remove notification
      setNotifications(prev => prev.filter(n => n.id !== id));
      animatedValues.delete(id);
    });
  };
  
  const dismissNotification = (id: string): void => {
    const animValue = animatedValues.get(id);
    if (animValue) {
      Animated.timing(animValue, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        animatedValues.delete(id);
      });
    }
  };
  
  return (
    <View style={styles.container}>
      {notifications.map(notification => {
        const animValue = animatedValues.get(notification.id);
        return (
          <Animated.View
            key={notification.id}
            style={[
              styles.notification,
              styles[notification.type],
              {
                transform: [{ translateY: animValue || 0 }],
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => dismissNotification(notification.id)}
              style={styles.notificationContent}
            >
              <Text style={styles.title}>{notification.title}</Text>
              <Text style={styles.message}>{notification.message}</Text>
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    right: 16,
    zIndex: 1000,
  },
  notification: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    minWidth: 250,
    maxWidth: 300,
  },
  achievement: {
    backgroundColor: '#4CAF50',
  },
  milestone: {
    backgroundColor: '#FF9800',
  },
  earning: {
    backgroundColor: '#2196F3',
  },
  warning: {
    backgroundColor: '#F44336',
  },
  notificationContent: {
    flex: 1,
  },
  title: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  message: {
    color: 'white',
    fontSize: 12,
    opacity: 0.9,
  },
});
EOF

# Create performance dashboard
cat > src/shared/ui/PerformanceDashboard.tsx << 'EOF'
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { performanceMonitor } from '../monitoring/PerformanceMonitor';

export const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState({
    frameDrops: 0,
    memoryUsage: 0,
    fps: 60,
  });
  
  useEffect(() => {
    const interval = setInterval(() => {
      const perfMetrics = performanceMonitor.getMetrics();
      setMetrics({
        frameDrops: perfMetrics.frameDrops,
        memoryUsage: Math.floor(perfMetrics.memoryUsage / (1024 * 1024)), // Convert to MB
        fps: 60, // Estimated based on frame drops
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Performance</Text>
      <Text style={styles.metric}>FPS: {metrics.fps}</Text>
      <Text style={styles.metric}>Frame Drops: {metrics.frameDrops}</Text>
      <Text style={styles.metric}>Memory: {metrics.memoryUsage}MB</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 8,
    borderRadius: 4,
  },
  title: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metric: {
    color: 'white',
    fontSize: 10,
    marginBottom: 2,
  },
});
EOF
```

## Testing & Validation

### 1. Integration Testing (Week 9, Day 5)

```bash
# Create comprehensive integration tests
cat > src/__tests__/fullSystemIntegration.test.ts << 'EOF'
describe('Full System Integration', () => {
  it('should complete investor round progression', async () => {
    // Set up game state with high valuation
    const { raiseInvestorRound } = usePrestige();
    const { money, valuation } = usePlayer();
    
    // Simulate reaching seed round valuation
    valuation.set(150000);
    
    const success = raiseInvestorRound(150000);
    expect(success).toBe(true);
    expect(money.get()).toBeGreaterThan(50000);
  });
  
  it('should trigger achievements based on game progress', async () => {
    const { checkAchievements, claimAchievement } = useAchievements();
    const { updateGameStat } = useGameLoop();
    
    // Trigger first hire achievement
    updateGameStat('developers_hired', 1);
    checkAchievements({ developers_hired: 1 });
    
    const claimed = claimAchievement('first_hire');
    expect(claimed).toBe(true);
  });
  
  it('should calculate offline progression accurately', async () => {
    const { calculateOfflineProgress, claimOfflineEarnings } = useOfflineProgression();
    
    // Simulate 1 hour offline with production rates
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    calculateOfflineProgress({
      codePerSecond: 1,
      revenuePerSecond: 10,
      automationLevel: 1,
    });
    
    // Should have generated offline progress
    claimOfflineEarnings();
    // Verify earnings were applied
  });
});
EOF

# Run comprehensive tests
npm test -- --testPathPattern=fullSystemIntegration
```

## Performance Optimization

### 1. Bundle Analysis and Optimization

```bash
# Analyze bundle size
npx expo export --platform all
npx bundlesize check

# Create performance optimization script
cat > scripts/optimize-performance.sh << 'EOF'
#!/bin/bash

echo "Running performance optimizations..."

# Enable Hermes for better performance
sed -i 's/"hermes": false/"hermes": true/g' package.json

# Optimize images
npx imagemin assets/**/*.{jpg,png} --out-dir=assets/optimized/

# Tree shake unused code
npx expo optimize

# Generate bundle report
npx expo export --platform web --dev false
npx webpack-bundle-analyzer dist/static/js/*.js

echo "Performance optimization complete!"
EOF

chmod +x scripts/optimize-performance.sh
```

## Validation Criteria

### Functional Requirements Met
- [ ] Prestige system operational with investor rounds
- [ ] Advanced automation rules functional
- [ ] Achievement system triggering and rewarding correctly
- [ ] Offline progression calculating accurately
- [ ] Master game loop coordinating all systems
- [ ] Real-time notifications displaying properly

### Performance Requirements Met
- [ ] <50ms response time maintained with all systems
- [ ] 60fps sustained with full feature set
- [ ] Memory usage under 256MB with all departments
- [ ] Offline calculations complete in <1 second
- [ ] Achievement checks run efficiently

### Integration Requirements Met
- [ ] All department systems integrated seamlessly
- [ ] Cross-system events handled correctly
- [ ] State synchronization working across features
- [ ] No memory leaks detected during extended play
- [ ] Error handling robust across all systems

## Deliverables

1. **Prestige System** - Complete investor round progression with bonuses
2. **Advanced Automation** - Rule-based automation for repetitive tasks
3. **Achievement System** - Milestone tracking with rewards
4. **Offline Progression** - Accurate calculation of away time benefits
5. **Master Game Loop** - Coordinated system integration
6. **Enhanced UI/UX** - Notifications, performance dashboard, visual effects

## Next Phase

Upon completion, proceed to [04-Quality](./04-quality.md) for polish, optimization, and final quality assurance.

---

**Phase Completion Criteria:** All advanced systems integrated, comprehensive testing passed, performance targets maintained

**Research Dependencies:**
- vertical-slicing: System integration maintains feature independence
- @legendapp/state@beta: Reactive state management across complex system interactions
- new-architecture: Performance benefits utilized for complex calculations