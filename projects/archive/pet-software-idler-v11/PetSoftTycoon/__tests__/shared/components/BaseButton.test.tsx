import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BaseButton } from '../../../src/shared/components/BaseButton';

describe('BaseButton', () => {
  it('should render correctly', () => {
    const { getByText } = render(
      <BaseButton title="Test Button" onPress={() => {}} />
    );
    
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('should handle press events', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <BaseButton title="Test Button" onPress={mockOnPress} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});