import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../state/gameStore';

interface GameLoopProps {
  children: React.ReactNode;
}

export class GameLoopEngine {
  private lastUpdate = 0;
  private accumulator = 0;
  private readonly FIXED_TIMESTEP = 16.67; // 60 FPS
  private isRunning = false;
  private animationFrame?: number;
  
  constructor(private updateCallback: (deltaTime: number) => void) {}
  
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastUpdate = performance.now();
    this.accumulator = 0;
    this.update(this.lastUpdate);
  }
  
  stop(): void {
    this.isRunning = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
  
  private update = (timestamp: number): void => {
    if (!this.isRunning) return;
    
    const deltaTime = Math.min(timestamp - this.lastUpdate, 100); // Cap at 100ms
    this.lastUpdate = timestamp;
    
    this.accumulator += deltaTime;
    
    // Fixed timestep for consistent game logic
    while (this.accumulator >= this.FIXED_TIMESTEP) {
      this.updateCallback(this.FIXED_TIMESTEP);
      this.accumulator -= this.FIXED_TIMESTEP;
    }
    
    this.animationFrame = requestAnimationFrame(this.update);
  };
}

export function GameLoop({ children }: GameLoopProps) {
  const gameLoopRef = useRef<GameLoopEngine | null>(null);
  const { updateProduction } = useGameStore();
  
  const handleUpdate = useCallback((deltaTime: number) => {
    updateProduction(deltaTime);
  }, [updateProduction]);
  
  useEffect(() => {
    gameLoopRef.current = new GameLoopEngine(handleUpdate);
    gameLoopRef.current.start();
    
    return () => {
      gameLoopRef.current?.stop();
    };
  }, [handleUpdate]);
  
  return <>{children}</>;
}