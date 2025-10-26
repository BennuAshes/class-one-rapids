import { renderHook, act } from '@testing-library/react-native';
import { useAttributesStore } from './useAttributesStore';
import { attributes$ } from './attributesStore';

describe('useAttributesStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    attributes$.set({
      strength: 0,
      coordination: 0,
      endurance: 0,
      unallocatedPoints: 0,
    });
  });

  test('should provide initial attribute values', () => {
    const { result } = renderHook(() => useAttributesStore());

    expect(result.current.strength).toBe(0);
    expect(result.current.coordination).toBe(0);
    expect(result.current.endurance).toBe(0);
    expect(result.current.unallocatedPoints).toBe(0);
  });

  test('should allocate points to strength', () => {
    // Set up initial unallocated points
    attributes$.unallocatedPoints.set(3);

    const { result } = renderHook(() => useAttributesStore());

    act(() => {
      result.current.allocatePoint('strength');
    });

    expect(result.current.strength).toBe(1);
    expect(result.current.unallocatedPoints).toBe(2);
  });

  test('should calculate damage bonus from strength', () => {
    attributes$.strength.set(5);

    const { result } = renderHook(() => useAttributesStore());

    expect(result.current.getDamageBonus()).toBe(5); // 5 * 1
  });

  test('should calculate critical chance from coordination', () => {
    attributes$.coordination.set(10);

    const { result } = renderHook(() => useAttributesStore());

    expect(result.current.getCriticalChance()).toBe(30); // 10 base + (10 * 2)
  });

  test('should cap critical chance at 90%', () => {
    attributes$.coordination.set(50); // Would be 110% without cap

    const { result } = renderHook(() => useAttributesStore());

    expect(result.current.getCriticalChance()).toBe(90);
  });

  test('should calculate offline efficiency from endurance', () => {
    attributes$.endurance.set(10);

    const { result } = renderHook(() => useAttributesStore());

    expect(result.current.getOfflineEfficiency()).toBe(50); // 25 base + (10 * 2.5)
  });

  test('should grant attribute points', () => {
    const { result } = renderHook(() => useAttributesStore());

    act(() => {
      result.current.grantPoints(5);
    });

    expect(result.current.unallocatedPoints).toBe(5);
  });

  test('should not allocate points when none available', () => {
    attributes$.unallocatedPoints.set(0);

    const { result } = renderHook(() => useAttributesStore());

    act(() => {
      result.current.allocatePoint('strength');
    });

    expect(result.current.strength).toBe(0);
    expect(result.current.unallocatedPoints).toBe(0);
  });
});