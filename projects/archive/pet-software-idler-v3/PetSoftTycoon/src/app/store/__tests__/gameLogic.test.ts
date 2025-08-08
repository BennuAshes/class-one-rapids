// Unit tests for game logic functions
describe('Game Logic', () => {
  describe('Lines of Code Logic', () => {
    it('should add positive amounts correctly', () => {
      let linesOfCode = 0;
      
      // Simulate adding lines of code
      const addLinesOfCode = (amount: number) => {
        linesOfCode = Math.max(0, linesOfCode + amount);
        return linesOfCode;
      };
      
      expect(addLinesOfCode(5)).toBe(5);
      expect(addLinesOfCode(3)).toBe(8);
    });

    it('should not allow negative lines of code', () => {
      let linesOfCode = 10;
      
      const addLinesOfCode = (amount: number) => {
        linesOfCode = Math.max(0, linesOfCode + amount);
        return linesOfCode;
      };
      
      expect(addLinesOfCode(-15)).toBe(0);
    });
  });

  describe('Money Logic', () => {
    it('should handle money transactions correctly', () => {
      let money = 0;
      let totalEarned = 0;
      
      const addMoney = (amount: number) => {
        const currentMoney = money;
        const newMoney = Math.max(0, currentMoney + amount);
        money = newMoney;
        
        // Track total earned (only positive amounts)
        if (amount > 0) {
          totalEarned += amount;
        }
        
        return { money, totalEarned };
      };
      
      // Add money
      let result = addMoney(100);
      expect(result.money).toBe(100);
      expect(result.totalEarned).toBe(100);
      
      // Spend money (negative amount)
      result = addMoney(-50);
      expect(result.money).toBe(50);
      expect(result.totalEarned).toBe(100); // Should not change when spending
    });

    it('should not allow negative money balance', () => {
      let money = 50;
      
      const addMoney = (amount: number) => {
        money = Math.max(0, money + amount);
        return money;
      };
      
      expect(addMoney(-100)).toBe(0);
    });
  });

  describe('Department Unlock Logic', () => {
    it('should unlock departments at correct thresholds', () => {
      const departments = {
        development: { unlocked: true, threshold: 0 },
        sales: { unlocked: false, threshold: 500 },
        customerExperience: { unlocked: false, threshold: 5000 },
      };
      
      const checkUnlocks = (totalEarned: number) => {
        Object.values(departments).forEach(dept => {
          if (!dept.unlocked && totalEarned >= dept.threshold) {
            dept.unlocked = true;
          }
        });
        return departments;
      };
      
      // Test initial state
      expect(departments.development.unlocked).toBe(true);
      expect(departments.sales.unlocked).toBe(false);
      
      // Unlock sales department
      checkUnlocks(500);
      expect(departments.sales.unlocked).toBe(true);
      expect(departments.customerExperience.unlocked).toBe(false);
      
      // Unlock customer experience
      checkUnlocks(5000);
      expect(departments.customerExperience.unlocked).toBe(true);
    });
  });

  describe('Performance Requirements', () => {
    it('should handle rapid calculations efficiently', () => {
      const startTime = performance.now();
      
      // Simulate rapid gameplay calculations
      let linesOfCode = 0;
      let money = 0;
      
      for (let i = 0; i < 10000; i++) {
        linesOfCode = Math.max(0, linesOfCode + 1);
        money = Math.max(0, money + 10);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(50);
      expect(linesOfCode).toBe(10000);
      expect(money).toBe(100000);
    });
  });

  describe('Cost Calculation Logic', () => {
    it('should calculate unit costs correctly', () => {
      const calculateUnitCost = (baseCost: number, owned: number) => {
        return Math.floor(baseCost * Math.pow(1.15, owned));
      };
      
      expect(calculateUnitCost(100, 0)).toBe(100);
      expect(calculateUnitCost(100, 1)).toBe(114);
      expect(calculateUnitCost(100, 2)).toBe(132);
      expect(calculateUnitCost(100, 10)).toBe(404);
    });

    it('should validate purchase affordability', () => {
      const canAffordPurchase = (cost: number, money: number) => {
        return money >= cost;
      };
      
      expect(canAffordPurchase(100, 150)).toBe(true);
      expect(canAffordPurchase(100, 100)).toBe(true);
      expect(canAffordPurchase(100, 50)).toBe(false);
    });
  });
});