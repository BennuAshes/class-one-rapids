/**
 * Tests for combinationLogic.ts
 * Following TDD methodology: Write tests first (RED), implement (GREEN), refactor
 */

import { canCombinePets, combinePets, getCombineCost } from './combinationLogic';
import { GameState } from '../../shared/types/game';
import { SINGULARITY_CONFIG } from './singularityConfig';
import { UPGRADES } from '../shop/upgradeDefinitions';

describe('combinationLogic', () => {
  describe('getCombineCost', () => {
    it('should return the correct combine cost', () => {
      expect(getCombineCost()).toBe(SINGULARITY_CONFIG.COMBINE_COST);
      expect(getCombineCost()).toBe(10);
    });
  });

  describe('canCombinePets', () => {
    it('should return false when insufficient AI Pets', () => {
      const state: GameState = {
        petCount: 9,
        bigPetCount: 0,
        singularityPetCount: 0,
        scrap: 0,
        upgrades: UPGRADES,
        purchasedUpgrades: ['unlock-combination'],
        skills: [],
        unlockedSkills: [],
        activeSkills: [],
      };

      expect(canCombinePets(state)).toBe(false);
    });

    it('should return false when combination not unlocked', () => {
      const state: GameState = {
        petCount: 10,
        bigPetCount: 0,
        singularityPetCount: 0,
        scrap: 0,
        upgrades: UPGRADES,
        purchasedUpgrades: [], // No unlock upgrade
        skills: [],
        unlockedSkills: [],
        activeSkills: [],
      };

      expect(canCombinePets(state)).toBe(false);
    });

    it('should return true when exactly enough AI Pets and unlocked', () => {
      const state: GameState = {
        petCount: 10,
        bigPetCount: 0,
        singularityPetCount: 0,
        scrap: 0,
        upgrades: UPGRADES,
        purchasedUpgrades: ['unlock-combination'],
        skills: [],
        unlockedSkills: [],
        activeSkills: [],
      };

      expect(canCombinePets(state)).toBe(true);
    });

    it('should return true when more than enough AI Pets and unlocked', () => {
      const state: GameState = {
        petCount: 25,
        bigPetCount: 0,
        singularityPetCount: 0,
        scrap: 0,
        upgrades: UPGRADES,
        purchasedUpgrades: ['unlock-combination'],
        skills: [],
        unlockedSkills: [],
        activeSkills: [],
      };

      expect(canCombinePets(state)).toBe(true);
    });

    it('should return false when petCount is 0', () => {
      const state: GameState = {
        petCount: 0,
        bigPetCount: 5,
        singularityPetCount: 1,
        scrap: 0,
        upgrades: UPGRADES,
        purchasedUpgrades: ['unlock-combination'],
        skills: [],
        unlockedSkills: [],
        activeSkills: [],
      };

      expect(canCombinePets(state)).toBe(false);
    });
  });

  describe('combinePets', () => {
    it('should throw error when insufficient pets', () => {
      const state: GameState = {
        petCount: 5,
        bigPetCount: 0,
        singularityPetCount: 0,
        scrap: 0,
        upgrades: UPGRADES,
        purchasedUpgrades: ['unlock-combination'],
        skills: [],
        unlockedSkills: [],
        activeSkills: [],
      };

      expect(() => combinePets(state)).toThrow();
      expect(() => combinePets(state)).toThrow(/insufficient/i);
    });

    it('should deduct AI Pets and add Big Pet when combining', () => {
      const state: GameState = {
        petCount: 10,
        bigPetCount: 0,
        singularityPetCount: 0,
        scrap: 0,
        upgrades: UPGRADES,
        purchasedUpgrades: ['unlock-combination'],
        skills: [],
        unlockedSkills: [],
        activeSkills: [],
      };

      const result = combinePets(state);

      expect(result.petCount).toBe(0);
      expect(result.bigPetCount).toBe(1);
      expect(result.singularityPetCount).toBe(0);
    });

    it('should handle combining with existing Big Pets', () => {
      const state: GameState = {
        petCount: 15,
        bigPetCount: 3,
        singularityPetCount: 1,
        scrap: 100,
        upgrades: UPGRADES,
        purchasedUpgrades: ['unlock-combination'],
        skills: [],
        unlockedSkills: [],
        activeSkills: [],
      };

      const result = combinePets(state);

      expect(result.petCount).toBe(5);
      expect(result.bigPetCount).toBe(4);
      expect(result.singularityPetCount).toBe(1);
      expect(result.scrap).toBe(100); // Other fields unchanged
    });

    it('should support multiple sequential combinations', () => {
      let state: GameState = {
        petCount: 30,
        bigPetCount: 0,
        singularityPetCount: 0,
        scrap: 0,
        upgrades: UPGRADES,
        purchasedUpgrades: ['unlock-combination'],
        skills: [],
        unlockedSkills: [],
        activeSkills: [],
      };

      // First combination
      state = combinePets(state);
      expect(state.petCount).toBe(20);
      expect(state.bigPetCount).toBe(1);

      // Second combination
      state = combinePets(state);
      expect(state.petCount).toBe(10);
      expect(state.bigPetCount).toBe(2);

      // Third combination
      state = combinePets(state);
      expect(state.petCount).toBe(0);
      expect(state.bigPetCount).toBe(3);

      // Fourth should fail
      expect(() => combinePets(state)).toThrow();
    });

    it('should preserve all other state fields', () => {
      const state: GameState = {
        petCount: 10,
        bigPetCount: 2,
        singularityPetCount: 1,
        scrap: 500,
        upgrades: UPGRADES,
        purchasedUpgrades: ['unlock-combination'],
        skills: [],
        unlockedSkills: ['painting'],
        activeSkills: ['painting'],
      };

      const result = combinePets(state);

      expect(result.scrap).toBe(500);
      expect(result.upgrades).toEqual(UPGRADES);
      expect(result.purchasedUpgrades).toEqual(['unlock-combination']);
      expect(result.unlockedSkills).toEqual(['painting']);
      expect(result.activeSkills).toEqual(['painting']);
    });
  });
});
