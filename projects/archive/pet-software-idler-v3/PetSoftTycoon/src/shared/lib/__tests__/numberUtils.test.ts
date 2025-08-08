import { formatNumber, calculateCost, canAfford, calculateProductionRate, formatTime } from '../numberUtils';

describe('Number Utilities', () => {
  describe('formatNumber', () => {
    it('should format small numbers correctly', () => {
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(42)).toBe('42');
      expect(formatNumber(999)).toBe('999');
    });

    it('should format thousands correctly', () => {
      expect(formatNumber(1000)).toBe('1.00K');
      expect(formatNumber(1500)).toBe('1.50K');
      expect(formatNumber(15000)).toBe('15.0K');
      expect(formatNumber(150000)).toBe('150K');
    });

    it('should format millions correctly', () => {
      expect(formatNumber(1000000)).toBe('1.00M');
      expect(formatNumber(1500000)).toBe('1.50M');
      expect(formatNumber(15000000)).toBe('15.0M');
      expect(formatNumber(150000000)).toBe('150M');
    });

    it('should format billions correctly', () => {
      expect(formatNumber(1000000000)).toBe('1.00B');
      expect(formatNumber(1500000000)).toBe('1.50B');
    });

    it('should handle edge cases', () => {
      expect(formatNumber(999.9)).toBe('999');
      expect(formatNumber(1000.1)).toBe('1.00K');
    });
  });

  describe('calculateCost', () => {
    it('should calculate exponential cost scaling correctly', () => {
      const baseCost = 100;
      
      expect(calculateCost(baseCost, 0)).toBe(100);
      expect(calculateCost(baseCost, 1)).toBe(114); // 100 * 1.15^1 = 115, floored = 114
      expect(calculateCost(baseCost, 2)).toBe(132); // 100 * 1.15^2 (132.25 floored)
      expect(calculateCost(baseCost, 10)).toBe(404); // 100 * 1.15^10
    });

    it('should handle custom multipliers', () => {
      expect(calculateCost(100, 3, 1.2)).toBe(172); // 100 * 1.2^3
      expect(calculateCost(50, 5, 1.1)).toBe(80); // 50 * 1.1^5
    });

    it('should handle edge cases', () => {
      expect(calculateCost(0, 10)).toBe(0);
      expect(calculateCost(100, 0, 2)).toBe(100);
    });
  });

  describe('canAfford', () => {
    it('should return true when player has enough money', () => {
      expect(canAfford(100, 150)).toBe(true);
      expect(canAfford(100, 100)).toBe(true);
    });

    it('should return false when player has insufficient money', () => {
      expect(canAfford(100, 50)).toBe(false);
      expect(canAfford(100, 0)).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(canAfford(0, 0)).toBe(true);
      expect(canAfford(0, 100)).toBe(true);
    });
  });

  describe('calculateProductionRate', () => {
    it('should calculate basic production rate', () => {
      expect(calculateProductionRate(1, 5)).toBe(5); // 1 * 5 units
      expect(calculateProductionRate(2.5, 10)).toBe(25); // 2.5 * 10 units
    });

    it('should apply multipliers correctly', () => {
      expect(calculateProductionRate(1, 10, [2])).toBe(20); // 1 * 10 * 2
      expect(calculateProductionRate(1, 10, [2, 1.5])).toBe(30); // 1 * 10 * 2 * 1.5
    });

    it('should handle no units owned', () => {
      expect(calculateProductionRate(5, 0)).toBe(0);
      expect(calculateProductionRate(5, 0, [2, 3])).toBe(0);
    });
  });

  describe('formatTime', () => {
    it('should format seconds correctly', () => {
      expect(formatTime(30)).toBe('30s');
      expect(formatTime(59)).toBe('59s');
    });

    it('should format minutes correctly', () => {
      expect(formatTime(60)).toBe('1m 0s');
      expect(formatTime(90)).toBe('1m 30s');
      expect(formatTime(3599)).toBe('59m 59s');
    });

    it('should format hours correctly', () => {
      expect(formatTime(3600)).toBe('1h 0m');
      expect(formatTime(3661)).toBe('1h 1m');
      expect(formatTime(86399)).toBe('23h 59m');
    });

    it('should format days correctly', () => {
      expect(formatTime(86400)).toBe('1d 0h');
      expect(formatTime(90000)).toBe('1d 1h');
      expect(formatTime(172800)).toBe('2d 0h');
    });
  });

  describe('Performance Requirements', () => {
    it('should format numbers efficiently', () => {
      const startTime = performance.now();
      
      // Format 10,000 numbers
      for (let i = 0; i < 10000; i++) {
        formatNumber(Math.random() * 1000000000);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete within 100ms for 10k operations
      expect(duration).toBeLessThan(100);
    });

    it('should calculate costs efficiently', () => {
      const startTime = performance.now();
      
      // Calculate 10,000 costs
      for (let i = 0; i < 10000; i++) {
        calculateCost(100, i % 100);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete within 50ms for 10k operations
      expect(duration).toBeLessThan(50);
    });
  });
});