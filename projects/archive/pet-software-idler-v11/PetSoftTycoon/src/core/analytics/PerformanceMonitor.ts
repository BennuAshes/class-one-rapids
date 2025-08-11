export class PerformanceMonitor {
  private frameRates: number[] = [];
  private lastFrameTime = 0;
  private isMonitoring = false;
  
  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.monitorFrameRate();
  }
  
  stopMonitoring(): void {
    this.isMonitoring = false;
  }
  
  private monitorFrameRate(): void {
    const measureFrame = (timestamp: number) => {
      if (!this.isMonitoring) return;
      
      if (this.lastFrameTime) {
        const fps = 1000 / (timestamp - this.lastFrameTime);
        this.frameRates.push(fps);
        
        // Keep only last 60 measurements
        if (this.frameRates.length > 60) {
          this.frameRates.shift();
        }
        
        // Log warning if FPS drops below 50
        if (fps < 50) {
          console.warn(`Low FPS detected: ${fps.toFixed(2)}`);
        }
      }
      
      this.lastFrameTime = timestamp;
      requestAnimationFrame(measureFrame);
    };
    
    requestAnimationFrame(measureFrame);
  }
  
  getAverageFPS(): number {
    if (this.frameRates.length === 0) return 60;
    
    const sum = this.frameRates.reduce((a, b) => a + b, 0);
    return sum / this.frameRates.length;
  }
  
  getMetrics() {
    return {
      averageFPS: this.getAverageFPS(),
      frameDrops: this.frameRates.filter(fps => fps < 55).length,
      sampleCount: this.frameRates.length,
    };
  }
}

// Global instance
export const performanceMonitor = new PerformanceMonitor();