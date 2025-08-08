import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { WriteCodeButton } from '../WriteCodeButton';
import { gameState$, gameActions } from '../../../app/store/gameStore';

// Mock haptics
jest.mock('expo-haptics');

describe('WriteCodeButton', () => {
  beforeEach(() => {
    // Reset game state before each test
    gameActions.resetGame();
    jest.clearAllMocks();
  });

  it('renders correctly with initial state', () => {
    const { getByText, getByTestId } = render(<WriteCodeButton />);
    
    expect(getByText('WRITE CODE')).toBeTruthy();
    expect(getByText('+1 Line of Code')).toBeTruthy();
    expect(getByText('Total: 0')).toBeTruthy();
    expect(getByTestId('write-code-button')).toBeTruthy();
  });

  it('adds lines of code when pressed', () => {
    const { getByTestId } = render(<WriteCodeButton />);
    const button = getByTestId('write-code-button');
    
    // Initial state
    expect(gameState$.resources.linesOfCode.get()).toBe(0);
    
    // Press button
    fireEvent.press(button);
    
    // Verify lines of code increased
    expect(gameState$.resources.linesOfCode.get()).toBe(1);
  });

  it('triggers haptic feedback on press', () => {
    const { getByTestId } = render(<WriteCodeButton />);
    const button = getByTestId('write-code-button');
    
    fireEvent.press(button);
    
    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Light
    );
  });

  it('updates counter display after multiple presses', () => {
    const { getByTestId, getByText } = render(<WriteCodeButton />);
    const button = getByTestId('write-code-button');
    
    // Press button multiple times
    fireEvent.press(button);
    fireEvent.press(button);
    fireEvent.press(button);
    
    // Verify counter shows correct amount
    expect(getByText('Total: 3')).toBeTruthy();
    expect(gameState$.resources.linesOfCode.get()).toBe(3);
  });

  it('maintains consistent performance under rapid clicking', () => {
    const { getByTestId } = render(<WriteCodeButton />);
    const button = getByTestId('write-code-button');
    
    const startTime = performance.now();
    
    // Simulate rapid clicking (20 clicks)
    for (let i = 0; i < 20; i++) {
      fireEvent.press(button);
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Should complete within reasonable time (100ms)
    expect(duration).toBeLessThan(100);
    expect(gameState$.resources.linesOfCode.get()).toBe(20);
  });

  it('has accessible styling and layout', () => {
    const { getByTestId } = render(<WriteCodeButton />);
    const button = getByTestId('write-code-button');
    
    // Verify button has proper styling props
    expect(button.props.style).toBeDefined();
    expect(button.props.android_ripple).toEqual({
      color: '#4CAF50',
      borderless: false,
    });
  });
});