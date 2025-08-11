import { renderHook, act } from '@testing-library/react-native';
import { useGameStore } from '../../../src/core/state/gameStore';
import { BigNumber } from '../../../src/shared/utils/BigNumber';

describe('GameStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useGameStore());
    act(() => {
      result.current.reset();
    });
  });
  
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useGameStore());
    
    expect(result.current.money.toString()).toBe('100.00');
    expect(result.current.statistics.totalClicks).toBe(0);
  });
  
  it('should handle click interactions', () => {
    const { result } = renderHook(() => useGameStore());
    
    act(() => {
      result.current.click();
    });
    
    expect(result.current.money.toString()).toBe('101.00');
    expect(result.current.statistics.totalClicks).toBe(1);
  });
  
  it('should add money correctly', () => {
    const { result } = renderHook(() => useGameStore());
    
    act(() => {
      result.current.addMoney(new BigNumber(50));
    });
    
    expect(result.current.money.toString()).toBe('150.00');
  });
});