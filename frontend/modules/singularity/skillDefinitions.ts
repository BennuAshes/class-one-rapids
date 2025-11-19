/**
 * Skill definitions for the singularity system
 */

import { Skill } from '../../shared/types/game';

/**
 * All available skills in the game
 */
export const SKILLS: Skill[] = [
  {
    id: 'painting',
    name: 'Painting',
    description: 'Unlock colorful visual trails when feeding the Singularity Pet',
    unlockRequirement: {
      type: 'singularityPetCount',
      value: 1,
    },
    effectType: 'visualTrail',
    effectConfig: {
      colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'],
      fadeDuration: 2000,
      maxTrails: 50,
      size: 20,
    },
  },
];

/**
 * Retrieves a skill by its ID
 *
 * @param skillId - The unique identifier of the skill
 * @returns The skill if found, undefined otherwise
 */
export function getSkillById(skillId: string): Skill | undefined {
  return SKILLS.find((skill) => skill.id === skillId);
}
