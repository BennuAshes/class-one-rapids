import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, useRef, useContext } from 'react';
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
import { Audio } from 'expo-audio';
import { WeaknessSpot } from './modules/combat/WeaknessSpot';
import { AttributesDisplay } from './modules/attributes/AttributesDisplay';
import { AttributeContext } from './modules/attributes/AttributeContext';

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

export function GameContent() {
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
  const damageIdRef = useRef(0);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Get strength bonus from context
  const { getDamageBonus } = useContext(AttributeContext);

  const handleEnemyTap = async (isCritical: boolean = false) => {
    // Don't allow tapping defeated enemy
    if (isDefeated) return;

    // Trigger haptic feedback immediately (within 20ms requirement)
    // Use Heavy impact for critical hits, Medium for normal
    Haptics.impactAsync(
      isCritical ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Medium
    );

    // Play sound effect
    if (soundRef.current && soundRef.current.playAsync) {
      try {
        await soundRef.current.playAsync();
      } catch (error) {
        // If sound fails, still continue with the game
        console.log('Sound playback failed:', error);
      }
    }

    // NEW: Apply formula with strength bonus
    // Formula: (10 + random(0-5)) + (Strength × 5)
    const baseDamage = 10 + Math.floor(Math.random() * 6); // 10-15 base damage
    const strengthBonus = getDamageBonus(); // Get strength bonus from attributes
    const damageBeforeMultipliers = baseDamage + strengthBonus;

    // Apply critical and power multipliers
    const criticalMultiplier = isCritical ? 2 : 1;
    const damage = power * damageBeforeMultipliers * criticalMultiplier;

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

          // Hide level-up message after 1.5 seconds
          setTimeout(() => {
            setShowLevelUp(false);
          }, 1500);

          // Trigger haptic feedback for level up
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

          // Return overflow XP
          return newXP - xpThreshold;
        }

        return newXP;
      });

      // Drop Pyreal (5-10 per enemy)
      const pyrealAmount = Math.floor(Math.random() * 6) + 5;
      const dropId = Date.now();
      setPyrealDrops([{ id: dropId, amount: pyrealAmount }]);

      // Auto-collect Pyreal after a short delay
      setTimeout(() => {
        setTotalPyreal(prev => prev + pyrealAmount);
        setPyrealDrops([]);
      }, 500);
    }

    // Create damage number at random position near the tap
    const damageId = damageIdRef.current++;
    const newDamageNumber: DamageNumber = {
      id: damageId,
      value: damage,
      x: 150 + Math.random() * 100 - 50, // Random position near enemy
      y: 300 + Math.random() * 50 - 25,
    };
    setDamageNumbers(prev => [...prev, newDamageNumber]);
  };

  // Initialize sound
  useEffect(() => {
    const loadSound = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require('./assets/impact.mp3'),
        { shouldPlay: false }
      );
      soundRef.current = sound;
    };

    loadSound().catch(error => {
      console.log('Failed to load sound:', error);
    });

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Respawn timer effect
  useEffect(() => {
    if (respawnTimer > 0) {
      const timer = setTimeout(() => {
        if (respawnTimer === 1) {
          // Respawn enemy
          setIsDefeated(false);
          setEnemyHealth(1000);
        }
        setRespawnTimer(respawnTimer - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [respawnTimer]);

  const removeDamageNumber = (id: number) => {
    setDamageNumbers(prev => prev.filter(d => d.id !== id));
  };

  // Calculate XP progress percentage
  const xpProgress = (currentXP / (level * 100)) * 100;

  return (
    <View style={styles.container}>
      {/* Pyreal Display */}
      <View testID="pyreal-container" style={styles.pyrealContainer}>
        <Text testID="pyreal-text" style={styles.pyrealText}>
          Pyreal: {totalPyreal}
        </Text>
      </View>

      {/* Power Display */}
      <View testID="power-container" style={styles.powerContainer}>
        <Text testID="power-text" style={styles.powerText}>
          Power: {power}
        </Text>
        <Text testID="xp-text" style={styles.xpText}>
          XP: {currentXP}/{level * 100}
        </Text>
        <Text testID="level-text" style={styles.levelText}>
          Level: {level}
        </Text>
        {/* XP Progress Bar */}
        <View testID="xp-progress-bar" style={styles.xpProgressBarContainer}>
          <Text testID="xp-progress-text" style={styles.xpProgressText}>
            {Math.floor(xpProgress)}%
          </Text>
          <View testID="xp-progress-bar-bg" style={styles.xpProgressBar}>
            <View
              testID="xp-progress-bar-fill"
              style={[
                styles.xpProgressBarFill,
                { width: `${Math.min((currentXP / (level * 100)) * 100, 100)}%` }
              ]}
            />
          </View>
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
        <View testID="enemy-container" style={styles.enemyWrapper}>
          <Pressable
            testID="enemy"
            style={styles.enemy}
            onPress={() => handleEnemyTap(false)}
          >
            <Text style={styles.enemyText}>ENEMY</Text>
          </Pressable>
          <WeaknessSpot onPress={() => handleEnemyTap(true)} />
        </View>
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

      {/* Attributes Display */}
      <View style={{ marginTop: 20, width: '90%' }}>
        <AttributesDisplay />
      </View>

      {/* Floating Damage Numbers */}
      {damageNumbers.map((damage) => (
        <AnimatedDamageNumber
          key={damage.id}
          damage={damage}
          onComplete={() => removeDamageNumber(damage.id)}
        />
      ))}

      {/* Pyreal Drop Animation */}
      {pyrealDrops.map(drop => (
        <Text key={drop.id} testID={`pyreal-drop-${drop.id}`} style={styles.pyrealDrop}>
          +{drop.amount} Pyreal!
        </Text>
      ))}

      {/* Level-Up Celebration */}
      {showLevelUp && (
        <View testID="level-up-celebration" style={styles.levelUpCelebration}>
          <Text testID="level-up-text" style={styles.levelUpText}>
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
  // ... All the same styles from App.tsx
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
  enemyWrapper: {
    width: 150,
    height: 150,
    position: 'relative',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  pyrealDrop: {
    position: 'absolute',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    bottom: 200,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  powerContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    alignItems: 'flex-start',
  },
  powerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  xpText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 4,
  },
  xpProgressBarContainer: {
    marginTop: 8,
    width: 120,
  },
  xpProgressText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  xpProgressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpProgressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  levelUpCelebration: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
  },
  levelUpText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: '#000',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 5,
  },
  particlesContainer: {
    position: 'absolute',
    width: 300,
    height: 300,
  },
  particle: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFD700',
  },
  particle1: { top: 50, left: 50 },
  particle2: { top: 50, right: 50 },
  particle3: { top: 150, left: 30 },
  particle4: { top: 150, right: 30 },
  particle5: { bottom: 50, left: 50 },
  particle6: { bottom: 50, right: 50 },
});