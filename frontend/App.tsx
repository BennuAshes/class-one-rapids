import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  TimeTrackerService,
  calculateOfflineRewards,
  WelcomeBackModal,
  type PlayerState,
  type OfflineRewards
} from './src/modules/offline-progression';

interface DamageNumber {
  id: number;
  value: number;
  x: number;
  y: number;
}


const AnimatedDamageNumber = ({ damage, onComplete }: { damage: DamageNumber; onComplete: () => void }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    // Animate floating upward and fading out
    translateY.value = withTiming(-100, { duration: 1500 });
    opacity.value = withSequence(
      withTiming(1, { duration: 300 }),
      withTiming(0, { duration: 1200 }, () => {
        runOnJS(onComplete)();
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.Text
      testID={`damage-number-${damage.id}`}
      style={[
        styles.damageNumber,
        {
          left: damage.x,
          top: damage.y,
        },
        animatedStyle,
      ]}
    >
      {damage.value}
    </Animated.Text>
  );
};


export default function App() {
  const [enemyHealth, setEnemyHealth] = useState(1000);
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);
  const [isDefeated, setIsDefeated] = useState(false);
  const [respawnTimer, setRespawnTimer] = useState(0);
  const [totalPyreal, setTotalPyreal] = useState(0);
  const [pyrealDrops, setPyrealDrops] = useState<Array<{id: number, amount: number}>>([]);
  // Power System state
  const [power, setPower] = useState(1);
  // XP System state
  const [currentXP, setCurrentXP] = useState(0);
  // Level System state
  const [level, setLevel] = useState(1);
  const [showLevelUp, setShowLevelUp] = useState(false);
  // Offline Time Tracking state
  const [timeAway, setTimeAway] = useState<number>(0);
  const [offlineRewards, setOfflineRewards] = useState<OfflineRewards | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const damageIdRef = useRef(0);
  const soundRef = useRef<Audio.Sound | null>(null);
  const timeTrackerRef = useRef<TimeTrackerService>(new TimeTrackerService());

  // Load progression data on mount
  useEffect(() => {
    const loadProgression = async () => {
      try {
        const savedData = await AsyncStorage.getItem('@progression_data');
        if (savedData) {
          const progression = JSON.parse(savedData);
          setLevel(progression.level || 1);
          setPower(progression.power || 1);
          setCurrentXP(progression.currentXP || 0);

          // Check for offline time with loaded progression data
          const minutesAway = await timeTrackerRef.current.calculateTimeAway();
          if (minutesAway >= 1) {
            const playerState: PlayerState = {
              power: progression.power || 1,
              level: progression.level || 1,
              xp: progression.currentXP || 0,
              pyreal: 0 // Not needed for calculation
            };
            const rewards = calculateOfflineRewards(minutesAway, playerState);
            setTimeAway(minutesAway);
            setOfflineRewards(rewards);
            setShowWelcomeModal(true);
          }
        } else {
          // Check offline time with default values
          const minutesAway = await timeTrackerRef.current.calculateTimeAway();
          if (minutesAway >= 1) {
            const playerState: PlayerState = {
              power: 1,
              level: 1,
              xp: 0,
              pyreal: 0
            };
            const rewards = calculateOfflineRewards(minutesAway, playerState);
            setTimeAway(minutesAway);
            setOfflineRewards(rewards);
            setShowWelcomeModal(true);
          }
        }
      } catch (error) {
        // Handle corrupted data gracefully - use defaults
        console.log('Failed to load progression:', error);
        // Still check offline time with defaults
        const minutesAway = await timeTrackerRef.current.calculateTimeAway();
        if (minutesAway >= 1) {
          const playerState: PlayerState = {
            power: 1,
            level: 1,
            xp: 0,
            pyreal: 0
          };
          const rewards = calculateOfflineRewards(minutesAway, playerState);
          setTimeAway(minutesAway);
          setOfflineRewards(rewards);
          setShowWelcomeModal(true);
        }
      }
    };

    loadProgression();
  }, []);

  // Save progression data when state changes
  useEffect(() => {
    const saveProgression = async () => {
      try {
        const progressionData = {
          level,
          power,
          currentXP,
        };
        await AsyncStorage.setItem('@progression_data', JSON.stringify(progressionData));
      } catch (error) {
        console.log('Failed to save progression:', error);
      }
    };

    saveProgression();
  }, [level, power, currentXP]);

  // Load sound on mount
  useEffect(() => {
    const loadSound = async () => {
      try {
        // For testing, Audio.Sound.createAsync might be mocked
        if (Audio.Sound.createAsync) {
          const result = await Audio.Sound.createAsync(
            // Using a placeholder sound file path for now
            // In production, you'd have an actual sound file
            { uri: 'impact.mp3' },
            { shouldPlay: false }
          );
          if (result && result.sound) {
            soundRef.current = result.sound;
          }
        }
      } catch (error) {
        // Silently fail if sound can't be loaded (for testing)
        console.log('Sound loading failed:', error);
      }
    };

    loadSound();

    // Cleanup
    return () => {
      if (soundRef.current && soundRef.current.unloadAsync) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Offline Time Tracking - TimeTracker service
  useEffect(() => {
    const handleTimeTracking = (minutesAway: number) => {
      if (minutesAway >= 1) {
        const playerState: PlayerState = {
          power,
          level,
          xp: currentXP,
          pyreal: totalPyreal
        };
        const rewards = calculateOfflineRewards(minutesAway, playerState);
        setTimeAway(minutesAway);
        setOfflineRewards(rewards);
        setShowWelcomeModal(true);
      }
    };

    timeTrackerRef.current.startTracking(handleTimeTracking);

    return () => {
      timeTrackerRef.current.stopTracking();
    };
  }, [power, level, currentXP, totalPyreal]);


  const handleEnemyTap = async () => {
    // Don't allow tapping defeated enemy
    if (isDefeated) return;

    // Trigger haptic feedback immediately (within 20ms requirement)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Play sound effect
    if (soundRef.current && soundRef.current.playAsync) {
      try {
        await soundRef.current.playAsync();
      } catch (error) {
        // If sound fails, still continue with the game
        console.log('Sound playback failed:', error);
      }
    }

    // Power-based damage calculation: Power × (10-15 base damage)
    const baseDamage = Math.floor(Math.random() * 6) + 10; // 10-15 base damage
    const damage = power * baseDamage;
    const newHealth = Math.max(0, enemyHealth - damage);
    setEnemyHealth(newHealth);

    // Check if enemy is defeated
    if (newHealth <= 0) {
      setIsDefeated(true);
      // Start respawn timer (2 seconds)
      setRespawnTimer(2);

      // Award XP (enemy level × 10, for now enemy level = 1)
      const enemyLevel = 1;
      const xpGained = enemyLevel * 10;
      setCurrentXP(prev => {
        const newXP = prev + xpGained;

        // Check for level-up (level × 100 XP required)
        const xpThreshold = level * 100;
        if (newXP >= xpThreshold) {
          // Level up!
          setLevel(level + 1);
          setPower(level + 1); // Power equals level
          setShowLevelUp(true);

          // Trigger haptic feedback for level-up celebration
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

          // Hide level-up message after 1.5 seconds
          setTimeout(() => setShowLevelUp(false), 1500);

          // Return XP above threshold (carry over)
          return newXP - xpThreshold;
        }

        return newXP;
      });

      // Drop Pyreal (1-5 Pyreal based on enemy level)
      const pyrealAmount = Math.floor(Math.random() * 5) + 1;
      const newDrop = { id: damageIdRef.current++, amount: pyrealAmount };
      setPyrealDrops(prev => [...prev, newDrop]);

      // Auto-collect after 1 second
      setTimeout(() => {
        setTotalPyreal(prev => prev + pyrealAmount);
        setPyrealDrops(prev => prev.filter(drop => drop.id !== newDrop.id));
      }, 1000);
    }

    // Add damage number with random position around enemy
    const newDamageNumber: DamageNumber = {
      id: damageIdRef.current++,
      value: damage,
      x: 150 + Math.random() * 100 - 50, // Random X position around enemy
      y: 350, // Starting Y position near enemy
    };
    setDamageNumbers(prev => [...prev, newDamageNumber]);
  };

  const removeDamageNumber = (id: number) => {
    setDamageNumbers(prev => prev.filter(d => d.id !== id));
  };

  // Respawn timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (respawnTimer > 0) {
      interval = setInterval(() => {
        setRespawnTimer(prev => {
          if (prev <= 1) {
            // Respawn enemy
            setIsDefeated(false);
            setEnemyHealth(1000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [respawnTimer]);

  return (
    <View style={styles.container}>
      {/* Pyreal Counter */}
      <View style={styles.pyrealContainer}>
        <Text testID="pyreal-counter" style={styles.pyrealText}>
          {totalPyreal}
        </Text>
        <Text style={styles.pyrealLabel}>Pyreal</Text>
      </View>

      {/* Welcome Back Modal */}
      <WelcomeBackModal
        rewards={offlineRewards}
        isVisible={showWelcomeModal}
        timeAway={timeAway}
        onCollect={() => {
          if (offlineRewards) {
            // Apply rewards
            setCurrentXP(prev => prev + offlineRewards.xpGained);
            setTotalPyreal(prev => prev + offlineRewards.pyrealGained);
          }
          // Close modal
          setShowWelcomeModal(false);
          setOfflineRewards(null);
          setTimeAway(0);
        }}
      />

      {/* Power Display */}
      <View style={styles.powerContainer}>
        <Text testID="power-display" style={styles.powerText}>
          Power: {power}
        </Text>
      </View>

      {/* XP Display */}
      <View style={styles.xpContainer}>
        <Text testID="xp-display" style={styles.xpText}>
          XP: {currentXP}
        </Text>
      </View>

      {/* Level Display */}
      <View style={styles.levelContainer}>
        <Text testID="level-display" style={styles.levelText}>
          Level: {level}
        </Text>
      </View>

      {/* XP Progress Bar */}
      <View testID="xp-progress-container" style={styles.xpProgressContainer}>
        <Text style={styles.xpProgressText}>
          {currentXP}/{level * 100}
        </Text>
        <View style={styles.xpProgressBarBackground}>
          <View
            testID="xp-progress-bar"
            style={[
              styles.xpProgressBarFill,
              { width: `${Math.min((currentXP / (level * 100)) * 100, 100)}%` }
            ]}
          />
        </View>
      </View>

      {/* Health Bar */}
      <View style={styles.healthContainer}>
        <Text testID="health-text" style={styles.healthText}>
          HP: {enemyHealth}/1000
        </Text>
        <View style={styles.healthBar}>
          <View
            style={[
              styles.healthFill,
              { width: `${(enemyHealth / 1000) * 100}%` }
            ]}
          />
        </View>
      </View>

      {/* Enemy or Victory Message */}
      {!isDefeated ? (
        <Pressable
          testID="enemy"
          style={styles.enemy}
          onPress={handleEnemyTap}
        >
          <Text style={styles.enemyText}>ENEMY</Text>
        </Pressable>
      ) : (
        <View style={styles.victoryContainer}>
          <Text style={styles.victoryText}>Victory!</Text>
          {respawnTimer > 0 && (
            <Text testID="respawn-timer" style={styles.respawnText}>
              New enemy in {respawnTimer}s
            </Text>
          )}
        </View>
      )}

      {/* Floating Damage Numbers */}
      {damageNumbers.map((damage) => (
        <AnimatedDamageNumber
          key={damage.id}
          damage={damage}
          onComplete={() => removeDamageNumber(damage.id)}
        />
      ))}

      {/* Pyreal Drops */}
      {pyrealDrops.map((drop) => (
        <Text
          key={drop.id}
          testID="pyreal-drop"
          style={styles.pyrealDrop}
        >
          +{drop.amount} Pyreal
        </Text>
      ))}

      {/* Level-Up Celebration */}
      {showLevelUp && (
        <View style={styles.levelUpContainer}>
          <Text testID="level-up-message" style={styles.levelUpText}>
            LEVEL UP!
          </Text>
          {/* Celebration Particles */}
          <View testID="celebration-particles" style={styles.particlesContainer}>
            <View style={[styles.particle, styles.particle1]} />
            <View style={[styles.particle, styles.particle2]} />
            <View style={[styles.particle, styles.particle3]} />
            <View style={[styles.particle, styles.particle4]} />
            <View style={[styles.particle, styles.particle5]} />
            <View style={[styles.particle, styles.particle6]} />
          </View>
        </View>
      )}

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthContainer: {
    position: 'absolute',
    top: 100,
    width: '80%',
    alignItems: 'center',
  },
  healthText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  healthBar: {
    width: '100%',
    height: 30,
    backgroundColor: '#e0e0e0',
    borderRadius: 15,
    overflow: 'hidden',
  },
  healthFill: {
    height: '100%',
    backgroundColor: '#ff4444',
  },
  enemy: {
    width: 150,
    height: 150,
    backgroundColor: '#8b4513',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  enemyText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  damageNumber: {
    position: 'absolute',
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffff00',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  victoryContainer: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  victoryText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ff00',
    textAlign: 'center',
  },
  respawnText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  pyrealContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    alignItems: 'center',
  },
  pyrealText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  pyrealLabel: {
    fontSize: 12,
    color: '#666',
  },
  pyrealDrop: {
    position: 'absolute',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00FF00',
    top: 400,
    left: 150,
  },
  powerContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    alignItems: 'center',
  },
  powerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  xpContainer: {
    position: 'absolute',
    top: 80,
    left: 20,
    alignItems: 'center',
  },
  xpText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  levelContainer: {
    position: 'absolute',
    top: 110,
    left: 20,
    alignItems: 'center',
  },
  levelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  levelUpContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -75 }, { translateY: -25 }],
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  levelUpText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  xpProgressContainer: {
    position: 'absolute',
    top: 140,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  xpProgressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  xpProgressBarBackground: {
    width: '90%',
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  xpProgressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 10,
  },
  particlesContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    top: -50,
    left: -50,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  particle1: {
    top: 20,
    left: 30,
    backgroundColor: '#FFD700',
  },
  particle2: {
    top: 10,
    left: 80,
    backgroundColor: '#FF6B35',
  },
  particle3: {
    top: 40,
    left: 120,
    backgroundColor: '#4CAF50',
  },
  particle4: {
    top: 60,
    left: 40,
    backgroundColor: '#2196F3',
  },
  particle5: {
    top: 30,
    left: 100,
    backgroundColor: '#FF9800',
  },
  particle6: {
    top: 15,
    left: 60,
    backgroundColor: '#E91E63',
  },
});
