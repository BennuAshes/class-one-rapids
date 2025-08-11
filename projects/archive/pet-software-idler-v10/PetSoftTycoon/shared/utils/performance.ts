export class PerformanceMonitor {
  private fps: number[] = []
  private frameStart = performance.now()
  
  startMonitoring(): void {
    const measureFrame = () => {
      const now = performance.now()
      const frameFPS = 1000 / (now - this.frameStart)
      this.fps.push(frameFPS)
      this.frameStart = now
      
      // Keep only last 60 frames (1 second at 60fps)
      if (this.fps.length > 60) {
        this.fps.shift()
      }
      
      requestAnimationFrame(measureFrame)
    }
    
    requestAnimationFrame(measureFrame)
  }
  
  getAverageFPS(): number {
    if (this.fps.length === 0) return 0
    return this.fps.reduce((sum, fps) => sum + fps, 0) / this.fps.length
  }
  
  isPerformant(): boolean {
    return this.getAverageFPS() >= 58 // Allow 2fps buffer
  }
}

export const performanceMonitor = new PerformanceMonitor()