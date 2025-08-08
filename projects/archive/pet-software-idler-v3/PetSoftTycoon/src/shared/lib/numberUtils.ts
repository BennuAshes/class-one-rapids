import Big from 'big.js';

/**
 * Format numbers with appropriate suffixes (1K, 1M, 1B, etc.)
 * Optimized for idle game display with proper precision
 */
export const formatNumber = (num: number): string => {
  if (num < 1000) return Math.floor(num).toString();
  
  const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc'];
  const tier = Math.log10(Math.abs(num)) / 3 | 0;
  
  if (tier === 0) return Math.floor(num).toString();
  
  const suffix = suffixes[tier] || 'e' + (tier * 3);
  const scale = Math.pow(10, tier * 3);
  const scaled = num / scale;
  
  // Dynamic precision based on scale
  const precision = scaled < 10 ? 2 : scaled < 100 ? 1 : 0;
  return scaled.toFixed(precision) + suffix;
};

/**
 * Calculate exponential cost scaling for units
 * Formula: Base * multiplier^owned
 */
export const calculateCost = (baseCost: number, owned: number, multiplier: number = 1.15): number => {
  return Math.floor(baseCost * Math.pow(multiplier, owned));
};

/**
 * Check if player can afford a purchase
 */
export const canAfford = (cost: number, money: number): boolean => {
  return money >= cost;
};

/**
 * Calculate production per second for a unit
 */
export const calculateProductionRate = (baseRate: number, owned: number, multipliers: number[] = []): number => {
  let totalRate = baseRate * owned;
  
  // Apply multipliers
  multipliers.forEach(multiplier => {
    totalRate *= multiplier;
  });
  
  return totalRate;
};

/**
 * Format time duration in a human-readable format
 */
export const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  return `${days}d ${hours}h`;
};