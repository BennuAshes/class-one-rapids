import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useAttributesStore } from './useAttributesStore';

export const AttributesDisplay: React.FC = memo(() => {
  const {
    strength,
    coordination,
    endurance,
    unallocatedPoints,
    allocatePoint,
    getDamageBonus,
    getCriticalChance,
    getOfflineEfficiency
  } = useAttributesStore();
  return (
    <View style={[
      styles.container,
      unallocatedPoints > 0 && styles.containerWithPoints
    ]}>
      {unallocatedPoints > 0 && (
        <Text style={styles.pointsText}>{unallocatedPoints} points available</Text>
      )}

      <View style={styles.attributesRow}>
        {/* Strength */}
        <View style={styles.attributeItem}>
          <Text style={[styles.attributeText, styles.strengthText]}>
            Strength: {strength}
          </Text>
          <Text style={styles.bonusText}>+{getDamageBonus()} damage</Text>
          <Pressable
            style={[styles.allocateButton, unallocatedPoints === 0 && styles.disabledButton]}
            accessibilityState={{ disabled: unallocatedPoints === 0 }}
            disabled={unallocatedPoints === 0}
            onPress={() => allocatePoint('strength')}
          >
            <Text style={styles.buttonText}>[+]</Text>
          </Pressable>
        </View>

        {/* Coordination */}
        <View style={styles.attributeItem}>
          <Text style={[styles.attributeText, styles.coordinationText]}>
            Coordination: {coordination}
          </Text>
          <Text style={styles.bonusText}>{getCriticalChance()}% crit</Text>
          <Pressable
            style={[styles.allocateButton, unallocatedPoints === 0 && styles.disabledButton]}
            accessibilityState={{ disabled: unallocatedPoints === 0 }}
            disabled={unallocatedPoints === 0}
            onPress={() => allocatePoint('coordination')}
          >
            <Text style={styles.buttonText}>[+]</Text>
          </Pressable>
        </View>

        {/* Endurance */}
        <View style={styles.attributeItem}>
          <Text style={[styles.attributeText, styles.enduranceText]}>
            Endurance: {endurance}
          </Text>
          <Text style={styles.bonusText}>{getOfflineEfficiency()}% offline</Text>
          <Pressable
            style={[styles.allocateButton, unallocatedPoints === 0 && styles.disabledButton]}
            accessibilityState={{ disabled: unallocatedPoints === 0 }}
            disabled={unallocatedPoints === 0}
            onPress={() => allocatePoint('endurance')}
          >
            <Text style={styles.buttonText}>[+]</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  pointsText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  attributesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  attributeItem: {
    alignItems: 'center',
    flex: 1,
  },
  attributeText: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  strengthText: {
    color: '#FF4444',
  },
  coordinationText: {
    color: '#4444FF',
  },
  enduranceText: {
    color: '#44FF44',
  },
  allocateButton: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  disabledButton: {
    opacity: 0.3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bonusText: {
    color: '#888888',
    fontSize: 12,
    marginBottom: 4,
  },
  containerWithPoints: {
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
});