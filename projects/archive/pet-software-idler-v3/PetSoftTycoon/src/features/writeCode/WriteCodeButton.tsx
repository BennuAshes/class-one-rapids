import React from 'react';
import { Pressable, Text, StyleSheet, Animated } from 'react-native';
import { observer } from '@legendapp/state/react';
import { gameState$, gameActions } from '../../app/store/gameStore';
import * as Haptics from 'expo-haptics';

export const WriteCodeButton: React.FC = observer(() => {
  const linesOfCode = gameState$.resources.linesOfCode.get();
  const animatedValue = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    // Haptic feedback for tactile engagement
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Button press animation for visual feedback
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 0.95,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Add lines of code - core game mechanic
    gameActions.addLinesOfCode(1);
  };

  return (
    <Animated.View style={{ transform: [{ scale: animatedValue }] }}>
      <Pressable 
        style={[styles.button]} 
        onPress={handlePress}
        android_ripple={{ color: '#4CAF50', borderless: false }}
        testID="write-code-button"
      >
        <Text style={styles.buttonText}>WRITE CODE</Text>
        <Text style={styles.subtitle}>+1 Line of Code</Text>
        <Text style={styles.counter}>Total: {linesOfCode}</Text>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 5,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    borderWidth: 2,
    borderColor: '#1976D2',
    minHeight: 120,
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  subtitle: {
    color: '#E3F2FD',
    fontSize: 16,
    marginTop: 4,
    fontWeight: '500',
  },
  counter: {
    color: '#BBDEFB',
    fontSize: 12,
    marginTop: 2,
  },
});