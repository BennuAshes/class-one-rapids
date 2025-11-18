/**
 * Skill engine logic for checking requirements and managing skill state.
 *
 * This module handles the skill progression system, which rewards players
 * for reaching specific milestones (e.g., obtaining their first Singularity Pet).
 *
 * Skills are automatically unlocked when requirements are met and can be
 * toggled on/off by the player once unlocked.
 */

import { GameState, Skill } from '../../shared/types/game';

/**
 * Checks if a skill is unlocked.
 *
 * @param state - Current game state
 * @param skillId - ID of the skill to check
 * @returns true if skill is in the unlocked skills list
 */
export function isSkillUnlocked(state: GameState, skillId: string): boolean {
  return state.unlockedSkills.includes(skillId);
}

/**
 * Checks if a skill is currently active.
 *
 * @param state - Current game state
 * @param skillId - ID of the skill to check
 * @returns true if skill is in the active skills list
 */
export function isSkillActive(state: GameState, skillId: string): boolean {
  return state.activeSkills.includes(skillId);
}

/**
 * Checks if a skill's unlock requirement is met.
 *
 * Supports multiple requirement types:
 * - singularityPetCount: Requires a minimum number of Singularity Pets
 * - totalPets: Requires a minimum total across all pet tiers
 * - upgrade: Requires a specific upgrade to be purchased
 * - time: Requires a minimum playtime (not yet implemented)
 *
 * @param state - Current game state
 * @param skill - Skill to check
 * @returns true if the requirement is satisfied
 */
export function checkSkillRequirement(
  state: GameState,
  skill: Skill
): boolean {
  const { type, value } = skill.unlockRequirement;

  switch (type) {
    case 'singularityPetCount':
      return state.singularityPetCount >= (value as number);

    case 'totalPets':
      const totalPets =
        state.petCount + state.bigPetCount + state.singularityPetCount;
      return totalPets >= (value as number);

    case 'upgrade':
      return state.purchasedUpgrades.includes(value as string);

    case 'time':
      // Time-based requirements not implemented yet
      // Would require tracking total playtime or timestamp-based unlocks
      console.warn('Time-based skill requirements not yet implemented');
      return false;

    default:
      console.warn(`Unknown skill requirement type: ${type}`);
      return false;
  }
}

/**
 * Checks all skills and unlocks any that meet their requirements.
 *
 * This should be called periodically (e.g., every game loop tick) to check
 * if the player has met any new skill unlock conditions.
 *
 * Newly unlocked skills are automatically enabled, providing immediate
 * gratification for reaching milestones. Players can disable them later
 * if desired.
 *
 * @param state - Current game state
 * @returns Updated game state with newly unlocked and activated skills
 */
export function checkAndUnlockSkills(state: GameState): GameState {
  // Handle case where skills array is not initialized
  if (!state.skills || state.skills.length === 0) {
    return state;
  }

  const newlyUnlocked: string[] = [];

  // Iterate through all available skills
  for (const skill of state.skills) {
    // Skip already unlocked skills to avoid duplicates
    if (state.unlockedSkills.includes(skill.id)) {
      continue;
    }

    // Check if this skill's requirement is met
    if (checkSkillRequirement(state, skill)) {
      newlyUnlocked.push(skill.id);
    }
  }

  // No changes needed if no new unlocks
  if (newlyUnlocked.length === 0) {
    return state;
  }

  // Add newly unlocked skills to both unlocked and active lists
  // Auto-enabling provides immediate feedback to the player
  return {
    ...state,
    unlockedSkills: [...state.unlockedSkills, ...newlyUnlocked],
    activeSkills: [...state.activeSkills, ...newlyUnlocked],
  };
}

/**
 * Toggles a skill on or off.
 *
 * Only unlocked skills can be activated. This allows players to customize
 * their experience by disabling skills they don't want (e.g., visual effects
 * that may be distracting).
 *
 * @param state - Current game state
 * @param skillId - ID of skill to toggle
 * @param active - true to activate, false to deactivate
 * @returns Updated game state with skill toggled
 */
export function toggleSkill(
  state: GameState,
  skillId: string,
  active: boolean
): GameState {
  // Cannot activate a locked skill - silently ignore
  if (active && !state.unlockedSkills.includes(skillId)) {
    return state;
  }

  if (active) {
    // Add to active skills if not already there
    if (!state.activeSkills.includes(skillId)) {
      return {
        ...state,
        activeSkills: [...state.activeSkills, skillId],
      };
    }
  } else {
    // Remove from active skills
    return {
      ...state,
      activeSkills: state.activeSkills.filter((id) => id !== skillId),
    };
  }

  return state;
}
