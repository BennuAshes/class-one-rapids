import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

interface WeaknessSpotProps {
  onPress: () => void;
  position?: { x: number; y: number };
}

export const WeaknessSpot: React.FC<WeaknessSpotProps> = ({ onPress, position = { x: 50, y: 50 } }) => {
  return (
    <TouchableOpacity
      testID="weakness-spot"
      style={[styles.weaknessSpot, { left: position.x, top: position.y }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.innerCircle} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  weaknessSpot: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    borderWidth: 2,
    borderColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  innerCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 215, 0, 0.5)',
  },
});