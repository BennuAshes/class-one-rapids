/**
 * Tests for singularityEngine.ts
 * Following TDD methodology: Write tests first (RED), implement (GREEN), refactor
 */

import { getEffectiveSingularityRate, processSingularityTick, applySingularityBoostFromFeeding } from './singularityEngine';
import { SINGULARITY_CONFIG } from './singularityConfig';
import { GameState } from '../../shared/types/game';

describe('singularityEngine', () => {
  describe('getEffectiveSingularityRate', () => {
    it('should return base rate when no upgrades', () => {
      const result = getEffectiveSingularityRate(
        SINGULARITY_CONFIG.BASE_AI_PET_SINGULARITY_RATE,
        0
      );
      expect(result).toBe(SINGULARITY_CONFIG.BASE_AI_PET_SINGULARITY_RATE);
    });

    it('should apply multiplier correctly', () => {
      const baseRate = SINGULARITY_CONFIG.BASE_AI_PET_SINGULARITY_RATE;
      const multiplier = 0.5; // 50% increase
      const result = getEffectiveSingularityRate(baseRate, multiplier);
      expect(result).toBe(baseRate * (1 + multiplier));
    });

    it('should handle multiple stacked multipliers', () => {
      const baseRate = SINGULARITY_CONFIG.BASE_BIG_PET_SINGULARITY_RATE;
      const multiplier = 1.5; // 150% increase (e.g., 0.5 + 0.5 + 0.5)
      const result = getEffectiveSingularityRate(baseRate, multiplier);
      expect(result).toBe(baseRate * 2.5);
    });
  });

  describe('processSingularityTick', () => {
    let mockState: GameState;

    beforeEach(() => {
      mockState = {
        petCount: 100,
        bigPetCount: 10,
        singularityPetCount: 1,
        scrap: 0,
        upgrades: [],
        purchasedUpgrades: [],
        skills: [],
        unlockedSkills: [],
        activeSkills: [],
      };
    });

    it('should not transition any pets when probability fails', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.99); // High value = no transitions

      const result = processSingularityTick(mockState, 1.0, 0);

      expect(result.petCount).toBe(100);
      expect(result.bigPetCount).toBe(10);
      expect(result.singularityPetCount).toBe(1);
    });

    it('should transition AI Pets to Big Pets when probability succeeds', () => {
      // Mock to always succeed for first few pets
      jest.spyOn(Math, 'random').mockReturnValue(0.00001);

      const result = processSingularityTick(mockState, 1.0, 0);

      // Some AI Pets should have transitioned
      expect(result.petCount).toBeLessThan(mockState.petCount);
      expect(result.bigPetCount).toBeGreaterThan(mockState.bigPetCount);
      // Total pets should be conserved (minus transitions to Singularity)
      const originalTotal = mockState.petCount + mockState.bigPetCount;
      const newTotal = result.petCount + result.bigPetCount;
      expect(newTotal).toBeLessThanOrEqual(originalTotal);
    });

    it('should transition Big Pets to Singularity Pets when probability succeeds', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.001); // Will trigger Big Pet transitions

      const result = processSingularityTick(mockState, 1.0, 0);

      // Some Big Pets should have transitioned
      expect(result.bigPetCount).toBeLessThan(mockState.bigPetCount);
      expect(result.singularityPetCount).toBeGreaterThan(mockState.singularityPetCount);
    });

    it('should apply multiplier to singularity rates', () => {
      const multiplier = 10.0; // Huge multiplier to ensure transitions
      jest.spyOn(Math, 'random').mockReturnValue(0.05);

      const result = processSingularityTick(mockState, 1.0, multiplier);

      // With high multiplier, we should see transitions
      const totalTransitions = (mockState.petCount - result.petCount) +
                              (mockState.bigPetCount - result.bigPetCount);
      expect(totalTransitions).toBeGreaterThan(0);
    });

    it('should scale with deltaTime', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.00001);

      const result1 = processSingularityTick(mockState, 1.0, 0);
      const result2 = processSingularityTick(mockState, 2.0, 0);

      // 2x deltaTime should result in roughly 2x transitions (probabilistically)
      // We just verify that longer deltaTime has effect
      const transitions1 = mockState.petCount - result1.petCount;
      const transitions2 = mockState.petCount - result2.petCount;
      expect(transitions2).toBeGreaterThanOrEqual(transitions1);
    });

    it('should handle edge case of 0 pets', () => {
      mockState.petCount = 0;
      mockState.bigPetCount = 0;

      const result = processSingularityTick(mockState, 1.0, 0);

      expect(result.petCount).toBe(0);
      expect(result.bigPetCount).toBe(0);
      expect(result.singularityPetCount).toBe(1); // Should not change
    });
  });

  describe('applySingularityBoostFromFeeding', () => {
    let mockState: GameState;

    beforeEach(() => {
      mockState = {
        petCount: 50,
        bigPetCount: 5,
        singularityPetCount: 0,
        scrap: 0,
        upgrades: [],
        purchasedUpgrades: [],
        skills: [],
        unlockedSkills: [],
        activeSkills: [],
      };
    });

    it('should not trigger boost when probability fails', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.99); // Above threshold

      const result = applySingularityBoostFromFeeding(mockState);

      expect(result.petCount).toBe(50);
      expect(result.bigPetCount).toBe(5);
      expect(result.singularityPetCount).toBe(0);
    });

    it('should promote AI Pet to Big Pet when triggered and AI Pets available', () => {
      jest.spyOn(Math, 'random')
        .mockReturnValueOnce(0.001) // Trigger boost
        .mockReturnValueOnce(0.1); // Select AI Pet for promotion

      const result = applySingularityBoostFromFeeding(mockState);

      expect(result.petCount).toBe(49);
      expect(result.bigPetCount).toBe(6);
    });

    it('should promote Big Pet to Singularity Pet when triggered and only Big Pets available', () => {
      mockState.petCount = 0;
      jest.spyOn(Math, 'random')
        .mockReturnValueOnce(0.001) // Trigger boost
        .mockReturnValueOnce(0.9); // Select Big Pet for promotion

      const result = applySingularityBoostFromFeeding(mockState);

      expect(result.petCount).toBe(0);
      expect(result.bigPetCount).toBe(4);
      expect(result.singularityPetCount).toBe(1);
    });

    it('should not trigger when no promotable pets available', () => {
      mockState.petCount = 0;
      mockState.bigPetCount = 0;
      jest.spyOn(Math, 'random').mockReturnValue(0.001); // Would trigger

      const result = applySingularityBoostFromFeeding(mockState);

      expect(result.petCount).toBe(0);
      expect(result.bigPetCount).toBe(0);
      expect(result.singularityPetCount).toBe(0);
    });
  });
});
