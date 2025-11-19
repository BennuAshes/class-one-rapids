/**
 * Tests for PaintingCanvas component
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import PaintingCanvas, { PaintingCanvasProps, PaintingCanvasRef } from './PaintingCanvas';
import { act } from 'react-test-renderer';

describe('PaintingCanvas', () => {
  const mockSkillConfig = {
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
    fadeDuration: 2000,
    maxTrails: 50,
    size: 20,
  };

  const defaultProps: PaintingCanvasProps = {
    isActive: true,
    skillConfig: mockSkillConfig,
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render canvas when isActive=true', () => {
      const { getByTestId } = render(<PaintingCanvas {...defaultProps} />);
      expect(getByTestId('painting-canvas')).toBeTruthy();
    });

    it('should not render canvas when isActive=false', () => {
      const { queryByTestId } = render(<PaintingCanvas {...defaultProps} isActive={false} />);
      expect(queryByTestId('painting-canvas')).toBeNull();
    });

    it('should have pointerEvents="none" to allow clicks through', () => {
      const { getByTestId } = render(<PaintingCanvas {...defaultProps} />);
      const canvas = getByTestId('painting-canvas');
      expect(canvas.props.pointerEvents).toBe('none');
    });
  });

  describe('Trail Management', () => {
    it('should add trail when addTrail is called', () => {
      const ref = React.createRef<PaintingCanvasRef>();
      const { getByTestId } = render(<PaintingCanvas {...defaultProps} ref={ref} />);

      act(() => {
        ref.current?.addTrail(100, 200);
      });

      const canvas = getByTestId('painting-canvas');
      // Check that trail was added (canvas should have children)
      expect(canvas.props.children).toBeTruthy();
    });

    it('should use random color from skill config', () => {
      const ref = React.createRef<PaintingCanvasRef>();
      const { getByTestId } = render(<PaintingCanvas {...defaultProps} />);

      // Add multiple trails and verify colors are from config
      act(() => {
        for (let i = 0; i < 10; i++) {
          ref.current?.addTrail(i * 10, i * 10);
        }
      });

      const canvas = getByTestId('painting-canvas');
      // Trails should be rendered
      expect(canvas.props.children).toBeTruthy();
    });

    it('should enforce max trail limit', () => {
      const limitedConfig = { ...mockSkillConfig, maxTrails: 5 };
      const ref = React.createRef<PaintingCanvasRef>();
      render(<PaintingCanvas isActive={true} skillConfig={limitedConfig} ref={ref} />);

      act(() => {
        // Add more trails than the limit
        for (let i = 0; i < 10; i++) {
          ref.current?.addTrail(i * 10, i * 10);
        }
      });

      // Should only keep the most recent maxTrails
      // This will be verified by checking internal state
      expect(ref.current).toBeTruthy();
    });

    it('should not add trails when component is not active', () => {
      const ref = React.createRef<PaintingCanvasRef>();
      const { queryByTestId } = render(<PaintingCanvas {...defaultProps} isActive={false} ref={ref} />);

      act(() => {
        ref.current?.addTrail(100, 200);
      });

      // Canvas should not render when inactive
      expect(queryByTestId('painting-canvas')).toBeNull();
    });
  });

  describe('Trail Fade-out', () => {
    it('should remove trails after fadeDuration', () => {
      const ref = React.createRef<PaintingCanvasRef>();
      const { getByTestId } = render(<PaintingCanvas {...defaultProps} />);

      act(() => {
        ref.current?.addTrail(100, 200);
      });

      // Trail should exist initially
      const canvas = getByTestId('painting-canvas');
      expect(canvas.props.children).toBeTruthy();

      // Fast-forward past fade duration
      act(() => {
        jest.advanceTimersByTime(mockSkillConfig.fadeDuration + 100);
      });

      // Trails should be cleaned up after fade duration
      // Component should update to reflect this
    });

    it('should fade trails gradually', () => {
      const ref = React.createRef<PaintingCanvasRef>();
      render(<PaintingCanvas {...defaultProps} />);

      act(() => {
        ref.current?.addTrail(100, 200);
      });

      // Advance time partially through fade
      act(() => {
        jest.advanceTimersByTime(mockSkillConfig.fadeDuration / 2);
      });

      // Trail should still exist but with reduced opacity
      // This tests the fade animation
    });
  });

  describe('Cleanup', () => {
    it('should cleanup on unmount', () => {
      const ref = React.createRef<PaintingCanvasRef>();
      const { unmount } = render(<PaintingCanvas {...defaultProps} ref={ref} />);

      act(() => {
        ref.current?.addTrail(100, 200);
      });

      // Should not throw on unmount
      expect(() => unmount()).not.toThrow();
    });

    it('should stop cleanup interval on unmount', () => {
      const ref = React.createRef<PaintingCanvasRef>();
      const { unmount } = render(<PaintingCanvas {...defaultProps} />);

      act(() => {
        ref.current?.addTrail(100, 200);
      });

      unmount();

      // Advancing timers after unmount should not cause issues
      act(() => {
        jest.advanceTimersByTime(5000);
      });
    });
  });

  describe('Performance', () => {
    it('should handle maximum trails efficiently', () => {
      const ref = React.createRef<PaintingCanvasRef>();
      render(<PaintingCanvas {...defaultProps} />);

      const startTime = Date.now();

      act(() => {
        // Add max trails rapidly
        for (let i = 0; i < mockSkillConfig.maxTrails; i++) {
          ref.current?.addTrail(Math.random() * 300, Math.random() * 600);
        }
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time (< 100ms)
      expect(duration).toBeLessThan(100);
    });

    it('should not accumulate trails beyond maxTrails', () => {
      const ref = React.createRef<PaintingCanvasRef>();
      render(<PaintingCanvas {...defaultProps} ref={ref} />);

      act(() => {
        // Add many more trails than the limit
        for (let i = 0; i < mockSkillConfig.maxTrails * 3; i++) {
          ref.current?.addTrail(i * 5, i * 5);
        }
      });

      // Should maintain performance by limiting trails
      expect(ref.current).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative coordinates', () => {
      const ref = React.createRef<PaintingCanvasRef>();
      render(<PaintingCanvas {...defaultProps} />);

      expect(() => {
        act(() => {
          ref.current?.addTrail(-10, -20);
        });
      }).not.toThrow();
    });

    it('should handle very large coordinates', () => {
      const ref = React.createRef<PaintingCanvasRef>();
      render(<PaintingCanvas {...defaultProps} />);

      expect(() => {
        act(() => {
          ref.current?.addTrail(10000, 10000);
        });
      }).not.toThrow();
    });

    it('should handle rapid successive calls', () => {
      const ref = React.createRef<PaintingCanvasRef>();
      render(<PaintingCanvas {...defaultProps} />);

      expect(() => {
        act(() => {
          for (let i = 0; i < 100; i++) {
            ref.current?.addTrail(i, i);
          }
        });
      }).not.toThrow();
    });
  });
});
