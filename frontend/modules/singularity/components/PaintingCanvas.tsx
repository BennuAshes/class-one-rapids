/**
 * PaintingCanvas component - Displays colorful visual trails when feeding
 */

import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';

/**
 * Configuration for the painting skill effect
 */
export interface PaintingSkillConfig {
  colors: string[];
  fadeDuration: number;
  maxTrails: number;
  size: number;
}

/**
 * Props for PaintingCanvas component
 */
export interface PaintingCanvasProps {
  isActive: boolean;
  skillConfig: PaintingSkillConfig;
}

/**
 * Trail point data structure
 */
interface TrailPoint {
  id: string;
  x: number;
  y: number;
  color: string;
  timestamp: number;
}

/**
 * Ref methods exposed by PaintingCanvas
 */
export interface PaintingCanvasRef {
  addTrail: (x: number, y: number) => void;
}

/**
 * PaintingCanvas component - renders visual trails with fade-out effect
 *
 * @param props - Component props
 * @param ref - Forwarded ref for imperative trail addition
 */
const PaintingCanvas = forwardRef<PaintingCanvasRef, PaintingCanvasProps>(
  ({ isActive, skillConfig }, ref) => {
    const [trails, setTrails] = useState<TrailPoint[]>([]);

    /**
     * Adds a new trail at the specified coordinates
     *
     * @param x - X coordinate
     * @param y - Y coordinate
     */
    const addTrail = (x: number, y: number) => {
      if (!isActive) return;

      const { colors, maxTrails, size } = skillConfig;

      // Select random color from config
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const newTrail: TrailPoint = {
        id: `trail-${Date.now()}-${Math.random()}`,
        x,
        y,
        color: randomColor,
        timestamp: Date.now(),
      };

      setTrails((prevTrails) => {
        // Add new trail and enforce max limit
        const updatedTrails = [...prevTrails, newTrail];

        // Keep only the most recent maxTrails
        if (updatedTrails.length > maxTrails) {
          return updatedTrails.slice(updatedTrails.length - maxTrails);
        }

        return updatedTrails;
      });
    };

    // Expose addTrail method via ref
    useImperativeHandle(ref, () => ({
      addTrail,
    }));

    /**
     * Cleanup old trails based on fade duration
     */
    useEffect(() => {
      if (!isActive || trails.length === 0) return;

      const cleanupInterval = setInterval(() => {
        const now = Date.now();
        const { fadeDuration } = skillConfig;

        setTrails((prevTrails) =>
          prevTrails.filter((trail) => now - trail.timestamp < fadeDuration)
        );
      }, 100); // Check every 100ms for smooth cleanup

      return () => clearInterval(cleanupInterval);
    }, [isActive, trails.length, skillConfig]);

    // Don't render anything if skill is not active
    if (!isActive) return null;

    /**
     * Calculate opacity based on trail age
     *
     * @param trail - The trail to calculate opacity for
     * @returns Opacity value between 0 and 1
     */
    const calculateOpacity = (trail: TrailPoint): number => {
      const age = Date.now() - trail.timestamp;
      const { fadeDuration } = skillConfig;

      // Linear fade from 1 to 0 over fadeDuration
      return Math.max(0, 1 - age / fadeDuration);
    };

    return (
      <View
        style={styles.canvas}
        pointerEvents="none"
        testID="painting-canvas"
      >
        {trails.map((trail) => {
          const opacity = calculateOpacity(trail);
          const { size } = skillConfig;

          return (
            <View
              key={trail.id}
              style={[
                styles.trail,
                {
                  left: trail.x - size / 2,
                  top: trail.y - size / 2,
                  width: size,
                  height: size,
                  backgroundColor: trail.color,
                  opacity,
                  borderRadius: size / 2,
                },
              ]}
            />
          );
        })}
      </View>
    );
  }
);

PaintingCanvas.displayName = 'PaintingCanvas';

const styles = StyleSheet.create({
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  trail: {
    position: 'absolute',
  },
});

export default PaintingCanvas;
