/**
 * Tests for skillEngine.ts
 * Following TDD methodology: Write tests first (RED), implement (GREEN), refactor
 */

import {
  checkSkillRequirement,
  checkAndUnlockSkills,
  toggleSkill,
  isSkillUnlocked,
  isSkillActive,
} from './skillEngine';
import { GameState, Skill } from '../../shared/types/game';
import { SKILLS } from './skillDefinitions';

describe('skillEngine', () => {
  let mockState: GameState;

  beforeEach(() => {
    mockState = {
      petCount: 50,
      bigPetCount: 5,
      singularityPetCount: 0,
      scrap: 100,
      upgrades: [],
      purchasedUpgrades: [],
      skills: [...SKILLS],
      unlockedSkills: [],
      activeSkills: [],
    };
  });

  describe('isSkillUnlocked', () => {
    it('should return false when skill not unlocked', () => {
      expect(isSkillUnlocked(mockState, 'painting')).toBe(false);
    });

    it('should return true when skill unlocked', () => {
      mockState.unlockedSkills = ['painting'];
      expect(isSkillUnlocked(mockState, 'painting')).toBe(true);
    });
  });

  describe('isSkillActive', () => {
    it('should return false when skill not active', () => {
      expect(isSkillActive(mockState, 'painting')).toBe(false);
    });

    it('should return true when skill active', () => {
      mockState.activeSkills = ['painting'];
      expect(isSkillActive(mockState, 'painting')).toBe(true);
    });
  });

  describe('checkSkillRequirement', () => {
    it('should check singularityPetCount requirement correctly', () => {
      const skill: Skill = {
        id: 'test',
        name: 'Test',
        description: 'Test skill',
        unlockRequirement: { type: 'singularityPetCount', value: 1 },
        effectType: 'other',
      };

      mockState.singularityPetCount = 0;
      expect(checkSkillRequirement(mockState, skill)).toBe(false);

      mockState.singularityPetCount = 1;
      expect(checkSkillRequirement(mockState, skill)).toBe(true);

      mockState.singularityPetCount = 5;
      expect(checkSkillRequirement(mockState, skill)).toBe(true);
    });

    it('should check totalPets requirement correctly', () => {
      const skill: Skill = {
        id: 'test',
        name: 'Test',
        description: 'Test skill',
        unlockRequirement: { type: 'totalPets', value: 100 },
        effectType: 'other',
      };

      // Total: 50 + 5 + 0 = 55
      expect(checkSkillRequirement(mockState, skill)).toBe(false);

      mockState.petCount = 100;
      // Total: 100 + 5 + 0 = 105
      expect(checkSkillRequirement(mockState, skill)).toBe(true);
    });

    it('should check upgrade requirement correctly', () => {
      const skill: Skill = {
        id: 'test',
        name: 'Test',
        description: 'Test skill',
        unlockRequirement: { type: 'upgrade', value: 'required-upgrade-id' },
        effectType: 'other',
      };

      expect(checkSkillRequirement(mockState, skill)).toBe(false);

      mockState.purchasedUpgrades = ['required-upgrade-id'];
      expect(checkSkillRequirement(mockState, skill)).toBe(true);

      mockState.purchasedUpgrades = ['other-upgrade', 'required-upgrade-id'];
      expect(checkSkillRequirement(mockState, skill)).toBe(true);
    });

    it('should handle time requirement (not implemented yet)', () => {
      const skill: Skill = {
        id: 'test',
        name: 'Test',
        description: 'Test skill',
        unlockRequirement: { type: 'time', value: 3600 },
        effectType: 'other',
      };

      // Should return false for unimplemented requirement
      expect(checkSkillRequirement(mockState, skill)).toBe(false);
    });
  });

  describe('checkAndUnlockSkills', () => {
    it('should not unlock skills when requirements not met', () => {
      const result = checkAndUnlockSkills(mockState);

      expect(result.unlockedSkills).toEqual([]);
      expect(result.activeSkills).toEqual([]);
    });

    it('should unlock skills when requirements met', () => {
      mockState.singularityPetCount = 1; // Meets painting requirement

      const result = checkAndUnlockSkills(mockState);

      expect(result.unlockedSkills).toContain('painting');
      expect(result.activeSkills).toContain('painting'); // Should auto-enable
    });

    it('should not re-unlock already unlocked skills', () => {
      mockState.singularityPetCount = 1;
      mockState.unlockedSkills = ['painting'];
      mockState.activeSkills = ['painting'];

      const result = checkAndUnlockSkills(mockState);

      expect(result.unlockedSkills).toEqual(['painting']); // No duplicates
      expect(result.activeSkills).toEqual(['painting']);
    });

    it('should unlock multiple skills if requirements met', () => {
      const additionalSkill: Skill = {
        id: 'test-skill',
        name: 'Test',
        description: 'Test',
        unlockRequirement: { type: 'totalPets', value: 50 },
        effectType: 'other',
      };

      mockState.skills = [...SKILLS, additionalSkill];
      mockState.singularityPetCount = 1; // Unlocks painting
      // Total pets = 50 + 5 + 1 = 56, unlocks test-skill

      const result = checkAndUnlockSkills(mockState);

      expect(result.unlockedSkills).toContain('painting');
      expect(result.unlockedSkills).toContain('test-skill');
      expect(result.unlockedSkills.length).toBe(2);
    });
  });

  describe('toggleSkill', () => {
    beforeEach(() => {
      mockState.unlockedSkills = ['painting'];
    });

    it('should activate skill when toggled on', () => {
      const result = toggleSkill(mockState, 'painting', true);

      expect(result.activeSkills).toContain('painting');
    });

    it('should deactivate skill when toggled off', () => {
      mockState.activeSkills = ['painting'];

      const result = toggleSkill(mockState, 'painting', false);

      expect(result.activeSkills).not.toContain('painting');
    });

    it('should not activate locked skill', () => {
      mockState.unlockedSkills = []; // Painting not unlocked

      const result = toggleSkill(mockState, 'painting', true);

      expect(result.activeSkills).not.toContain('painting');
    });

    it('should handle multiple skill toggles', () => {
      mockState.unlockedSkills = ['painting', 'skill2'];

      let result = mockState;
      result = toggleSkill(result, 'painting', true);
      result = toggleSkill(result, 'skill2', true);

      expect(result.activeSkills).toContain('painting');
      expect(result.activeSkills).toContain('skill2');

      result = toggleSkill(result, 'painting', false);

      expect(result.activeSkills).not.toContain('painting');
      expect(result.activeSkills).toContain('skill2');
    });
  });
});
