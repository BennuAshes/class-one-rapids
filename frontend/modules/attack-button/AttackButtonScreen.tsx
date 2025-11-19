import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from '@legendapp/state/react';
import { useGameState } from '../../shared/hooks/useGameState';
import {
  totalScrapMultiplier$,
  totalPetBonus$,
  totalSingularityRateMultiplier$,
  calculateScrapPerSecond,
  gameState$
} from '../../shared/store/gameStore';
import { processSingularityTick, applySingularityBoostFromFeeding } from '../singularity/singularityEngine';
import { checkAndUnlockSkills, isSkillActive } from '../singularity/skillEngine';
import { canCombinePets, combinePets, getCombineCost } from '../singularity/combinationLogic';
import { CombineConfirmationDialog } from '../singularity/components/CombineConfirmationDialog';
import PaintingCanvas, { PaintingCanvasRef } from '../singularity/components/PaintingCanvas';
import { getSkillById } from '../singularity/skillDefinitions';

interface AttackButtonScreenProps {
  onNavigateToShop: () => void;
  onNavigateToSkills?: () => void;
}

/**
 * Main screen for the Attack Button (Singularity Pet feeding) feature.
 * Displays multi-tier pet counts and a button to increment them.
 * Integrates with upgrade system, singularity progression, and skill unlocks.
 */
export const AttackButtonScreen = observer(({ onNavigateToShop, onNavigateToSkills }: AttackButtonScreenProps) => {
  const { petCount$, bigPetCount$, singularityPetCount$, scrap$, activeSkills$ } = useGameState();
  const [showCombineDialog, setShowCombineDialog] = useState(false);
  const paintingCanvasRef = useRef<PaintingCanvasRef>(null);

  /**
   * Handles feeding the Singularity Pet.
   * Base gain is 1 pet, plus any pet bonus from purchased upgrades.
   * Also has a small chance to trigger singularity boost (1% by default).
   * If painting skill is active, adds a visual trail at button location.
   */
  const handleFeed = (event?: any) => {
    const bonus = totalPetBonus$.get();
    const petsToAdd = 1 + bonus;
    petCount$.set((prev) => prev + petsToAdd);

    // Check for singularity boost from feeding
    const currentState = gameState$.get();
    const updatedState = applySingularityBoostFromFeeding(currentState);

    // Apply any changes from the boost
    if (updatedState !== currentState) {
      gameState$.set(updatedState);
    }

    // Add painting trail if skill is active
    const isPaintingActive = isSkillActive(currentState, 'painting');
    if (isPaintingActive && paintingCanvasRef.current && event?.nativeEvent) {
      const { pageX, pageY } = event.nativeEvent;
      paintingCanvasRef.current.addTrail(pageX, pageY);
    }
  };

  /**
   * Game loop timer - runs every second
   *
   * This timer handles three key systems:
   * 1. Scrap generation from all pet tiers
   * 2. Singularity progression (AI -> Big -> Singularity)
   * 3. Skill unlock checks
   *
   * Uses .get() to read latest values on each tick.
   * Updates state using functional updates and state replacement.
   * Cleanup function ensures timer is cleared on unmount.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Generate scrap from all pet tiers
      const scrapGenerated = calculateScrapPerSecond();

      if (scrapGenerated > 0) {
        scrap$.set((prev) => prev + scrapGenerated);
      }

      // 2. Process singularity progression
      const currentState = gameState$.get();
      const multiplier = totalSingularityRateMultiplier$.get();
      let updatedState = processSingularityTick(currentState, 1.0, multiplier);

      // 3. Check for skill unlocks
      updatedState = checkAndUnlockSkills(updatedState);

      // Apply all updates atomically
      if (updatedState !== currentState) {
        gameState$.set(updatedState);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []); // Empty dependency array - timer persists for component lifetime

  /**
   * Handlers for combine functionality
   */
  const handleCombinePress = () => {
    setShowCombineDialog(true);
  };

  const handleCombineConfirm = () => {
    try {
      const currentState = gameState$.get();
      const updatedState = combinePets(currentState);
      gameState$.set(updatedState);
      setShowCombineDialog(false);
    } catch (error) {
      console.error('Failed to combine pets:', error);
      setShowCombineDialog(false);
    }
  };

  const handleCombineCancel = () => {
    setShowCombineDialog(false);
  };

  const petCount = petCount$.get();
  const bigPetCount = bigPetCount$.get();
  const singularityPetCount = singularityPetCount$.get();
  const scrap = scrap$.get();
  const currentState = gameState$.get();

  // Get painting skill configuration
  const paintingSkill = getSkillById('painting');
  const isPaintingActive = isSkillActive(currentState, 'painting');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.petCountsContainer}>
          <Text
            style={styles.aiPetText}
            accessibilityRole="text"
            accessibilityLabel={`AI Pets: ${petCount}`}
          >
            AI Pets: {petCount}
          </Text>

          <Text
            style={styles.bigPetText}
            accessibilityRole="text"
            accessibilityLabel={`Big Pets: ${bigPetCount}`}
          >
            Big Pets: {bigPetCount}
          </Text>

          <Text
            style={styles.singularityPetText}
            accessibilityRole="text"
            accessibilityLabel={`Singularity Pets: ${singularityPetCount}`}
          >
            Singularity Pets: {singularityPetCount}
          </Text>
        </View>

        <Text
          style={styles.counterText}
          accessibilityRole="text"
          accessibilityLabel={`Singularity Pet Count: ${petCount}`}
        >
          Singularity Pet Count: {petCount}
        </Text>

        <Text
          style={styles.scrapText}
          accessibilityRole="text"
          accessibilityLabel={`Scrap: ${scrap}`}
        >
          Scrap: {scrap}
        </Text>

        <View style={styles.navigationButtons}>
          <Pressable
            onPress={onNavigateToShop}
            accessibilityRole="button"
            accessibilityLabel="Shop"
            accessibilityHint="Tap to browse and purchase upgrades"
            style={({ pressed }) => [
              styles.navButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.navButtonText}>Shop</Text>
          </Pressable>

          {onNavigateToSkills && (
            <Pressable
              onPress={onNavigateToSkills}
              accessibilityRole="button"
              accessibilityLabel="Skills"
              accessibilityHint="View and manage your skills"
              style={({ pressed }) => [
                styles.navButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.navButtonText}>Skills</Text>
            </Pressable>
          )}
        </View>

        <Pressable
          onPress={handleCombinePress}
          accessibilityRole="button"
          accessibilityLabel="Combine pets"
          accessibilityHint="Combine AI Pets into Big Pets"
          accessibilityState={{ disabled: !canCombinePets(gameState$.get()) }}
          disabled={!canCombinePets(gameState$.get())}
          style={({ pressed }) => [
            styles.combineButton,
            pressed && styles.buttonPressed,
            !canCombinePets(gameState$.get()) && styles.buttonDisabled,
          ]}
        >
          <Text style={[
            styles.combineButtonText,
            !canCombinePets(gameState$.get()) && styles.buttonTextDisabled,
          ]}>
            Combine {getCombineCost()} AI Pets → 1 Big Pet
          </Text>
        </Pressable>

        <CombineConfirmationDialog
          visible={showCombineDialog}
          currentPetCount={petCount}
          combineCost={getCombineCost()}
          onConfirm={handleCombineConfirm}
          onCancel={handleCombineCancel}
        />

        <Pressable
          onPress={handleFeed}
          accessibilityRole="button"
          accessibilityLabel="feed button"
          accessibilityHint="Tap to feed your Singularity Pet and increase the count"
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>feed</Text>
        </Pressable>
      </View>

      {/* Painting skill visual effect overlay */}
      {paintingSkill && paintingSkill.effectConfig && (
        <PaintingCanvas
          ref={paintingCanvasRef}
          isActive={isPaintingActive}
          skillConfig={paintingSkill.effectConfig as any}
        />
      )}
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  petCountsContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  aiPetText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#666666', // Gray for AI Pets
  },
  bigPetText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#FF9500', // Orange for Big Pets
    fontWeight: '600',
  },
  singularityPetText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#007AFF', // Blue for Singularity Pets
    fontWeight: '700',
  },
  counterText: {
    fontSize: 18,
    marginBottom: 10,
    color: '#000000',
  },
  scrapText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#000000',
  },
  button: {
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android shadow
    elevation: 3,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    width: '100%',
  },
  navButton: {
    flex: 1,
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#34C759',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  shopButton: {
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#34C759',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shopButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  combineButton: {
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#FF9500',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  combineButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
  buttonTextDisabled: {
    color: '#666666',
  },
});
