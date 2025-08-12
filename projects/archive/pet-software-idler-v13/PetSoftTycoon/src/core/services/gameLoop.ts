import { batch } from '@legendapp/state';
import { gameState$ } from '../state/gameState';
import { departmentState$ } from '@/features/departments/state/departmentStore';
import { employeeState$ } from '@/features/employees/state/employeeStore';
import { GAME_CONFIG } from '@/shared/constants/gameConfig';

class GameLoop {
  private intervalId: NodeJS.Timeout | null = null;
  private lastTick: number = Date.now();
  private running: boolean = false;

  start() {
    if (this.running) return;
    
    this.running = true;
    this.lastTick = Date.now();
    
    this.intervalId = setInterval(() => {
      this.tick();
    }, GAME_CONFIG.GAME_LOOP_INTERVAL);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.running = false;
  }

  private tick() {
    const now = Date.now();
    const deltaTime = (now - this.lastTick) / 1000; // Convert to seconds
    this.lastTick = now;

    // Use batch for performance - update all state atomically
    batch(() => {
      this.updateRevenue(deltaTime);
      this.updateMetrics(deltaTime);
    });
  }

  private updateRevenue(deltaTime: number) {
    const departments = departmentState$.departments.get();
    const employees = employeeState$.employees.get();
    
    let totalRevenue = 0;
    
    // Calculate revenue from each department
    Object.values(departments).forEach(department => {
      const deptEmployees = employees.filter(emp => emp.departmentId === department.id);
      const deptProductivity = deptEmployees.reduce((sum, emp) => sum + emp.productivity, 0);
      
      const revenue = deptProductivity * deltaTime;
      totalRevenue += revenue;
      
      // Update department revenue
      departmentState$.departments[department.id].revenue.set(
        departmentState$.departments[department.id].revenue.get() + revenue
      );
    });
    
    // Update global money
    gameState$.money.set(gameState$.money.get() + totalRevenue);
  }

  private updateMetrics(deltaTime: number) {
    // Update play time
    gameState$.meta.totalPlayTime.set(
      gameState$.meta.totalPlayTime.get() + deltaTime
    );
    
    // Calculate company valuation based on revenue and assets
    const currentMoney = gameState$.money.get();
    const totalRevenue = departmentState$.totalRevenue();
    const valuation = currentMoney + (totalRevenue * 100); // Simple valuation model
    
    gameState$.valuation.set(valuation);
  }
}

// Export singleton instance
export const gameLoop = new GameLoop();