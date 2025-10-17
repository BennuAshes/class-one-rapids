import { renderHook, act } from '@testing-library/react-native';
import { useAttributes } from './useAttributes';

describe('useAttributes', () => {
  test('should allocate point to strength', () => {
    const { result } = renderHook(() => useAttributes(1)); // 1 unallocated point

    act(() => {
      result.current.allocatePoint('strength');
    });

    expect(result.current.strength).toBe(1);
    expect(result.current.unallocatedPoints).toBe(0);
  });

  test('should not allocate when no points available', () => {
    const { result } = renderHook(() => useAttributes(0));

    act(() => {
      result.current.allocatePoint('strength');
    });

    expect(result.current.strength).toBe(0);
    expect(result.current.unallocatedPoints).toBe(0);
  });

  test('should allocate point to coordination', () => {
    const { result } = renderHook(() => useAttributes(2));

    act(() => {
      result.current.allocatePoint('coordination');
    });

    expect(result.current.coordination).toBe(1);
    expect(result.current.unallocatedPoints).toBe(1);
  });

  test('should allocate point to endurance', () => {
    const { result } = renderHook(() => useAttributes(3));

    act(() => {
      result.current.allocatePoint('endurance');
    });

    expect(result.current.endurance).toBe(1);
    expect(result.current.unallocatedPoints).toBe(2);
  });

  test('should allocate multiple points to different attributes', () => {
    const { result } = renderHook(() => useAttributes(5));

    act(() => {
      result.current.allocatePoint('strength');
      result.current.allocatePoint('strength');
      result.current.allocatePoint('coordination');
      result.current.allocatePoint('endurance');
    });

    expect(result.current.strength).toBe(2);
    expect(result.current.coordination).toBe(1);
    expect(result.current.endurance).toBe(1);
    expect(result.current.unallocatedPoints).toBe(1);
  });

  test('should calculate damage bonus from strength', () => {
    const { result } = renderHook(() => useAttributes(5));

    act(() => {
      result.current.allocatePoint('strength');
      result.current.allocatePoint('strength');
    });

    expect(result.current.getDamageBonus()).toBe(10); // 2 strength * 5
  });

  test('should calculate critical chance from coordination', () => {
    const { result } = renderHook(() => useAttributes(10));

    act(() => {
      // Allocate 5 points to coordination
      for (let i = 0; i < 5; i++) {
        result.current.allocatePoint('coordination');
      }
    });

    expect(result.current.getCriticalChance()).toBe(20); // 10 base + (5 * 2)
  });

  test('should cap critical chance at 90%', () => {
    const { result } = renderHook(() => useAttributes(50));

    act(() => {
      // Allocate 45 points to coordination (should give 100% but cap at 90%)
      for (let i = 0; i < 45; i++) {
        result.current.allocatePoint('coordination');
      }
    });

    expect(result.current.getCriticalChance()).toBe(90); // Capped at 90
  });

  test('should calculate offline efficiency from endurance', () => {
    const { result } = renderHook(() => useAttributes(10));

    act(() => {
      // Allocate 4 points to endurance
      for (let i = 0; i < 4; i++) {
        result.current.allocatePoint('endurance');
      }
    });

    expect(result.current.getOfflineEfficiency()).toBe(35); // 25 base + (4 * 2.5)
  });

  test('should cap offline efficiency at 75%', () => {
    const { result } = renderHook(() => useAttributes(30));

    act(() => {
      // Allocate 25 points to endurance (should give 87.5% but cap at 75%)
      for (let i = 0; i < 25; i++) {
        result.current.allocatePoint('endurance');
      }
    });

    expect(result.current.getOfflineEfficiency()).toBe(75); // Capped at 75
  });
});