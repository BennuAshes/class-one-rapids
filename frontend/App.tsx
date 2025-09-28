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
  const damageIdRef = useRef(0);
  const soundRef = useRef<Audio.Sound | null>(null);

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


  const handleEnemyTap = async () => {
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

    const damage = Math.floor(Math.random() * 50) + 50; // 50-100 damage
    setEnemyHealth(prev => Math.max(0, prev - damage));

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

  return (
    <View style={styles.container}>
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

      {/* Enemy */}
      <Pressable
        testID="enemy"
        style={styles.enemy}
        onPress={handleEnemyTap}
      >
        <Text style={styles.enemyText}>ENEMY</Text>
      </Pressable>

      {/* Floating Damage Numbers */}
      {damageNumbers.map((damage) => (
        <AnimatedDamageNumber
          key={damage.id}
          damage={damage}
          onComplete={() => removeDamageNumber(damage.id)}
        />
      ))}

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
});
