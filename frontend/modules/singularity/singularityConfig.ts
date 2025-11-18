/**
 * Configuration constants for the singularity system
 */

export const SINGULARITY_CONFIG = {
  /** Base probability per second for AI Pet to become Big Pet */
  BASE_AI_PET_SINGULARITY_RATE: 0.0001,

  /** Base probability per second for Big Pet to become Singularity Pet */
  BASE_BIG_PET_SINGULARITY_RATE: 0.01,

  /** Scrap generation rate per AI Pet per second */
  AI_PET_SCRAP_RATE: 1.0,

  /** Scrap generation rate per Big Pet per second */
  BIG_PET_SCRAP_RATE: 0.5,

  /** Scrap generation rate per Singularity Pet per second */
  SINGULARITY_PET_SCRAP_RATE: 0,

  /** Number of AI Pets required to combine into one Big Pet */
  COMBINE_COST: 10,

  /** Probability that feeding triggers a singularity boost */
  FEEDING_SINGULARITY_BOOST_CHANCE: 0.01,
} as const;
