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
import { getDamageBonus, grantAttributePoints, getCriticalChance, migrateFromPower } from './modules/attributes/attributesStore';

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
  const [enemyHealth, setEnemyHealth] = useState(10);
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);
  const [isDefeated, setIsDefeated] = useState(false);
  const [respawnTimer, setRespawnTimer] = useState(0);
  const [totalPyreal, setTotalPyreal] = useState(0);
  const [pyrealDrops, setPyrealDrops] = useState<Array<{id: number, amount: number}>>([]);
  // XP System state
  const [currentXP, setCurrentXP] = useState(0);
  // Level System state
  const [level, setLevel] = useState(1);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const damageIdRef = useRef(0);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Handle migration from Power system to Attributes
  useEffect(() => {
    const migrated = migrateFromPower(level);
    if (migrated) {
      console.log(`Migrated from Power system: granted ${level} attribute points`);
    }
  }, []); // Run once on mount

  const handleEnemyTap = async (isWeaknessSpot: boolean = false) => {
    // Don't allow tapping defeated enemy
    if (isDefeated) return;

    // Determine if it's a critical hit
    // Weakness spot always crits, otherwise check coordination-based chance
    let isCritical = isWeaknessSpot;
    if (!isWeaknessSpot) {
      const critChance = getCriticalChance(); // Base 10% + (Coordination × 2)%
      const roll = Math.random() * 100;
      isCritical = roll < critChance;
    }

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

    // Attribute-based damage calculation: Base (1-2) + Strength bonus
    const baseDamage = Math.floor(Math.random() * 2) + 1; // 1-2 base damage
    const strengthBonus = getDamageBonus(); // Strength × 1
    // Apply 2x multiplier for critical hits (makes it 2-4 for weakness spots)
    const criticalMultiplier = isCritical ? 2 : 1;
    const damage = (baseDamage + strengthBonus) * criticalMultiplier;
    const newHealth = Math.max(0, enemyHealth - damage);
    setEnemyHealth(newHealth);

    // Check if enemy is defeated
    if (newHealth <= 0) {
      setIsDefeated(true);
      // Start respawn timer (2 seconds)
      setRespawnTimer(2);

      // Award XP (10 XP per enemy, ~5 mobs per level at 50 XP threshold)
      const xpGained = 10;
      setCurrentXP(prev => {
        const newXP = prev + xpGained;

        // Check for level-up (50 XP required per level)
        const xpThreshold = 50;
        if (newXP >= xpThreshold) {
          // Level up!
          setLevel(level + 1);
          grantAttributePoints(1); // Grant 1 attribute point per level
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
            setEnemyHealth(10);
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
          {currentXP}/50
        </Text>
        <View style={styles.xpProgressBarBackground}>
          <View
            testID="xp-progress-bar"
            style={[
              styles.xpProgressBarFill,
              { width: `${Math.min((currentXP / 50) * 100, 100)}%` }
            ]}
          />
        </View>
      </View>

      {/* Health Bar */}
      <View style={styles.healthContainer}>
        <Text testID="health-text" style={styles.healthText}>
          HP: {enemyHealth}/10
        </Text>
        <View style={styles.healthBar}>
          <View
            style={[
              styles.healthFill,
              { width: `${(enemyHealth / 10) * 100}%` }
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
