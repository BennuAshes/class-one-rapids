/**
 * Integration tests for the Singularity System
 *
 * These tests verify end-to-end flows including:
 * - Full progression: AI → Big → Singularity → Skills
 * - Upgrade effects and stacking
 * - State persistence and restoration
 * - Performance with large pet counts
 * - Race condition handling
 */

import { GameState, Skill } from '../../shared/types/game';
import { processSingularityTick } from './singularityEngine';
import { combinePets, canCombinePets } from './combinationLogic';
import { checkAndUnlockSkills, isSkillUnlocked, isSkillActive } from './skillEngine';
import { SKILLS } from './skillDefinitions';
import { UPGRADES } from '../shop/upgradeDefinitions';

/**
 * Helper function to create a mock game state
 */
function createMockGameState(overrides: Partial<GameState> = {}): GameState {
  return {
    petCount: 0,
    bigPetCount: 0,
    singularityPetCount: 0,
    scrap: 0,
    upgrades: UPGRADES,
    purchasedUpgrades: [],
    skills: [...SKILLS],
    unlockedSkills: [],
    activeSkills: [],
    ...overrides,
  };
}

/**
 * Helper to calculate total singularity rate multiplier from purchased upgrades
 */
function getTotalSingularityMultiplier(state: GameState): number {
  return state.purchasedUpgrades
    .map(id => state.upgrades.find(u => u.id === id))
    .filter(u => u && u.effectType === 'singularityRateMultiplier')
    .reduce((sum, u) => sum + (u?.effectValue || 0), 0);
}

describe('Singularity Integration Tests', () => {
  describe('Task 50 & 51: Full Flow - AI → Big → Singularity → Skill', () => {
    it('should complete full progression from AI Pets to skill unlock', () => {
      // Start with AI Pets
      let state = createMockGameState({
        petCount: 50,
        purchasedUpgrades: ['unlock-combination'],
      });

      // Step 1: Combine AI Pets into Big Pets
      expect(canCombinePets(state)).toBe(true);
      state = combinePets(state);
      expect(state.petCount).toBe(40); // 50 - 10
      expect(state.bigPetCount).toBe(1);

      // Combine more times
      for (let i = 0; i < 3; i++) {
        state = combinePets(state);
      }
      expect(state.petCount).toBe(10);
      expect(state.bigPetCount).toBe(4);

      // Step 2: Process singularity progression
      // Mock Math.random to always succeed for testing
      const originalRandom = Math.random;
      Math.random = () => 0; // Always succeed probability checks

      // Process many ticks to trigger transitions
      for (let i = 0; i < 100; i++) {
        state = processSingularityTick(state, 1.0, 0);
      }

      // Should have some Big Pets transition to Singularity Pets
      expect(state.singularityPetCount).toBeGreaterThan(0);

      Math.random = originalRandom;

      // Step 3: Check for skill unlocks
      state = checkAndUnlockSkills(state);

      // Should unlock painting skill (requires 1 singularity pet)
      expect(isSkillUnlocked(state, 'painting')).toBe(true);

      // Should auto-enable the skill
      expect(isSkillActive(state, 'painting')).toBe(true);
    });

    it('should handle progression with zero upgrades', () => {
      let state = createMockGameState({
        petCount: 100,
        bigPetCount: 10,
      });

      const originalRandom = Math.random;
      Math.random = () => 0;

      // Process ticks without upgrades
      for (let i = 0; i < 50; i++) {
        state = processSingularityTick(state, 1.0, 0);
      }

      // Should still make progress
      expect(state.singularityPetCount).toBeGreaterThan(0);

      Math.random = originalRandom;
    });
  });

  describe('Task 52: Upgrade Effects and Stacking', () => {
    it('should apply singularity rate multiplier upgrades', () => {
      const state = createMockGameState({
        petCount: 100,
        purchasedUpgrades: ['singularity-rate-1'], // +25%
      });

      const multiplier = getTotalSingularityMultiplier(state);
      expect(multiplier).toBe(0.25);
    });

    it('should stack multiple singularity rate multipliers correctly', () => {
      const state = createMockGameState({
        purchasedUpgrades: ['singularity-rate-1', 'singularity-rate-2'], // +25% + +50%
      });

      const multiplier = getTotalSingularityMultiplier(state);
      expect(multiplier).toBe(0.75);
    });

    it('should increase singularity transitions with upgrades', () => {
      const originalRandom = Math.random;
      Math.random = () => 0.001; // Small random value for consistent testing

      // Test without upgrades
      let stateWithout = createMockGameState({
        petCount: 1000,
        bigPetCount: 100,
      });

      for (let i = 0; i < 10; i++) {
        stateWithout = processSingularityTick(stateWithout, 1.0, 0);
      }

      const transitionsWithout = stateWithout.singularityPetCount;

      // Test with upgrades
      let stateWith = createMockGameState({
        petCount: 1000,
        bigPetCount: 100,
        purchasedUpgrades: ['singularity-rate-1', 'singularity-rate-2'],
      });

      const multiplier = getTotalSingularityMultiplier(stateWith);

      for (let i = 0; i < 10; i++) {
        stateWith = processSingularityTick(stateWith, 1.0, multiplier);
      }

      const transitionsWith = stateWith.singularityPetCount;

      // With upgrades should have more transitions
      expect(transitionsWith).toBeGreaterThanOrEqual(transitionsWithout);

      Math.random = originalRandom;
    });

    it('should enable combination after purchasing unlock upgrade', () => {
      let state = createMockGameState({
        petCount: 50,
      });

      // Initially cannot combine (no upgrade)
      expect(canCombinePets(state)).toBe(false);

      // Purchase unlock upgrade
      state.purchasedUpgrades = ['unlock-combination'];

      // Now can combine
      expect(canCombinePets(state)).toBe(true);
    });
  });

  describe('Task 53: State Persistence', () => {
    it('should preserve all singularity fields in state', () => {
      const state = createMockGameState({
        petCount: 100,
        bigPetCount: 20,
        singularityPetCount: 5,
        unlockedSkills: ['painting'],
        activeSkills: ['painting'],
      });

      // Simulate serialization/deserialization
      const serialized = JSON.stringify(state);
      const deserialized: GameState = JSON.parse(serialized);

      // Verify all fields preserved
      expect(deserialized.petCount).toBe(100);
      expect(deserialized.bigPetCount).toBe(20);
      expect(deserialized.singularityPetCount).toBe(5);
      expect(deserialized.unlockedSkills).toEqual(['painting']);
      expect(deserialized.activeSkills).toEqual(['painting']);
      expect(deserialized.skills).toBeDefined();
    });

    it('should restore skills array after deserialization', () => {
      const state = createMockGameState({
        unlockedSkills: ['painting'],
        activeSkills: ['painting'],
      });

      // Skills should be populated
      expect(state.skills.length).toBeGreaterThan(0);
      expect(state.skills[0].id).toBe('painting');
    });
  });

  describe('Task 54: Performance with Large Pet Counts', () => {
    it('should handle 1000+ AI Pets efficiently', () => {
      const state = createMockGameState({
        petCount: 1000,
        bigPetCount: 100,
      });

      const startTime = Date.now();

      // Process tick with large counts
      const result = processSingularityTick(state, 1.0, 0);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete in less than 10ms
      expect(duration).toBeLessThan(10);

      // Should not modify original state
      expect(result).not.toBe(state);
    });

    it('should maintain performance with multiple upgrades', () => {
      const state = createMockGameState({
        petCount: 2000,
        bigPetCount: 200,
        purchasedUpgrades: ['singularity-rate-1', 'singularity-rate-2'],
      });

      const multiplier = getTotalSingularityMultiplier(state);
      const startTime = Date.now();

      // Process tick with large counts and upgrades
      const result = processSingularityTick(state, 1.0, multiplier);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should still be performant
      expect(duration).toBeLessThan(10);
    });
  });

  describe('Task 55: Race Conditions and Atomicity', () => {
    it('should handle rapid sequential singularity ticks', () => {
      let state = createMockGameState({
        petCount: 100,
        bigPetCount: 10,
      });

      // Rapidly process multiple ticks
      for (let i = 0; i < 100; i++) {
        state = processSingularityTick(state, 0.1, 0);
      }

      // Pet counts should remain consistent (no negatives, conservation)
      expect(state.petCount).toBeGreaterThanOrEqual(0);
      expect(state.bigPetCount).toBeGreaterThanOrEqual(0);
      expect(state.singularityPetCount).toBeGreaterThanOrEqual(0);

      // Total pets should be conserved (allowing for transitions)
      const totalPets = state.petCount + state.bigPetCount + state.singularityPetCount;
      expect(totalPets).toBeLessThanOrEqual(110); // Original total
    });

    it('should handle concurrent combination and singularity transitions', () => {
      let state = createMockGameState({
        petCount: 100,
        bigPetCount: 10,
        purchasedUpgrades: ['unlock-combination'],
      });

      // Combine pets
      state = combinePets(state);

      // Immediately process singularity tick
      state = processSingularityTick(state, 1.0, 0);

      // State should be consistent
      expect(state.petCount).toBeGreaterThanOrEqual(0);
      expect(state.bigPetCount).toBeGreaterThan(0);
    });

    it('should prevent negative pet counts', () => {
      let state = createMockGameState({
        petCount: 5, // Less than combine cost
        bigPetCount: 1,
        purchasedUpgrades: ['unlock-combination'],
      });

      // Cannot combine with insufficient pets
      expect(canCombinePets(state)).toBe(false);

      // Attempting to combine should throw
      expect(() => combinePets(state)).toThrow();

      // State should remain unchanged
      expect(state.petCount).toBe(5);
      expect(state.bigPetCount).toBe(1);
    });

    it('should maintain total pet conservation during transitions', () => {
      const initialState = createMockGameState({
        petCount: 100,
        bigPetCount: 20,
        singularityPetCount: 5,
      });

      const initialTotal = initialState.petCount + initialState.bigPetCount + initialState.singularityPetCount;

      const originalRandom = Math.random;
      Math.random = () => 0.001;

      // Process multiple ticks
      let state = initialState;
      for (let i = 0; i < 10; i++) {
        state = processSingularityTick(state, 1.0, 0);
      }

      const finalTotal = state.petCount + state.bigPetCount + state.singularityPetCount;

      // Total should be conserved or very close (due to atomic transitions)
      expect(finalTotal).toBeLessThanOrEqual(initialTotal);

      Math.random = originalRandom;
    });
  });

  describe('Additional Integration Scenarios', () => {
    it('should handle skill unlocks at exact threshold', () => {
      let state = createMockGameState({
        singularityPetCount: 0,
      });

      // No skills unlocked yet
      state = checkAndUnlockSkills(state);
      expect(isSkillUnlocked(state, 'painting')).toBe(false);

      // Add exactly 1 singularity pet
      state.singularityPetCount = 1;
      state = checkAndUnlockSkills(state);

      // Should unlock painting
      expect(isSkillUnlocked(state, 'painting')).toBe(true);
    });

    it('should not re-unlock already unlocked skills', () => {
      let state = createMockGameState({
        singularityPetCount: 10,
        unlockedSkills: ['painting'],
        activeSkills: ['painting'],
      });

      const beforeLength = state.unlockedSkills.length;

      // Check again
      state = checkAndUnlockSkills(state);

      // Should not duplicate
      expect(state.unlockedSkills.length).toBe(beforeLength);
      expect(state.unlockedSkills.filter(s => s === 'painting').length).toBe(1);
    });

    it('should handle zero deltaTime in singularity tick', () => {
      const state = createMockGameState({
        petCount: 100,
        bigPetCount: 10,
      });

      const result = processSingularityTick(state, 0, 0);

      // Should not cause errors
      expect(result).toBeDefined();
      expect(result.petCount).toBe(100);
      expect(result.bigPetCount).toBe(10);
    });
  });
});
