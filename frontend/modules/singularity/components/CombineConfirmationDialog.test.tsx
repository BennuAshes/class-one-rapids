import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CombineConfirmationDialog } from './CombineConfirmationDialog';

describe('CombineConfirmationDialog', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when visible is true', () => {
    const { getByText } = render(
      <CombineConfirmationDialog
        visible={true}
        currentPetCount={15}
        combineCost={10}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(getByText(/Combine AI Pets/i)).toBeTruthy();
  });

  it('does not render when visible is false', () => {
    const { queryByText } = render(
      <CombineConfirmationDialog
        visible={false}
        currentPetCount={15}
        combineCost={10}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(queryByText(/Combine AI Pets/i)).toBeNull();
  });

  it('displays cost and current count correctly', () => {
    const { getByText } = render(
      <CombineConfirmationDialog
        visible={true}
        currentPetCount={15}
        combineCost={10}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(getByText(/combine 10 AI Pets/i)).toBeTruthy();
    expect(getByText(/Current AI Pets: 15/i)).toBeTruthy();
  });

  it('calls onConfirm when confirm button is pressed', () => {
    const { getByText } = render(
      <CombineConfirmationDialog
        visible={true}
        currentPetCount={15}
        combineCost={10}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const confirmButton = getByText('Combine');
    fireEvent.press(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button is pressed', () => {
    const { getByText } = render(
      <CombineConfirmationDialog
        visible={true}
        currentPetCount={15}
        combineCost={10}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = getByText('Cancel');
    fireEvent.press(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when modal is closed via onRequestClose', () => {
    const { UNSAFE_getByType } = render(
      <CombineConfirmationDialog
        visible={true}
        currentPetCount={15}
        combineCost={10}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const modal = UNSAFE_getByType(require('react-native').Modal);

    if (modal.props.onRequestClose) {
      modal.props.onRequestClose();
    }

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('displays info about Big Pet benefits', () => {
    const { getByText } = render(
      <CombineConfirmationDialog
        visible={true}
        currentPetCount={15}
        combineCost={10}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(getByText(/Big Pet Benefits/i)).toBeTruthy();
    expect(getByText(/scrap\/second/i)).toBeTruthy();
  });

  it('has proper accessibility labels on buttons', () => {
    const { getByLabelText } = render(
      <CombineConfirmationDialog
        visible={true}
        currentPetCount={15}
        combineCost={10}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(getByLabelText('Cancel combination')).toBeTruthy();
    expect(getByLabelText('Confirm combination')).toBeTruthy();
  });
});
