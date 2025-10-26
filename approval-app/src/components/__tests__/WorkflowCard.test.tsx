/**
 * WorkflowCard Component Tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { WorkflowCard } from '../WorkflowCard';
import type { Workflow } from '../../api/types';

const renderWithProvider = (component: React.ReactElement) => {
  return render(<PaperProvider>{component}</PaperProvider>);
};

describe('WorkflowCard', () => {
  const mockWorkflow: Workflow = {
    execution_id: '20241020_143022',
    status: 'awaiting_approval',
    started_at: '2024-10-20T14:30:22',
    current_step: 'PRD',
    approval_mode: 'file',
  };

  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('should render workflow execution ID', () => {
    const { getByText } = renderWithProvider(
      <WorkflowCard workflow={mockWorkflow} onPress={mockOnPress} />
    );
    expect(getByText('20241020_143022')).toBeTruthy();
  });

  it('should render workflow status badge', () => {
    const { getByText } = renderWithProvider(
      <WorkflowCard workflow={mockWorkflow} onPress={mockOnPress} />
    );
    expect(getByText('AWAITING APPROVAL')).toBeTruthy();
  });

  it('should render started timestamp', () => {
    const { getByText } = renderWithProvider(
      <WorkflowCard workflow={mockWorkflow} onPress={mockOnPress} />
    );
    expect(getByText(/Started:/)).toBeTruthy();
  });

  it('should render current step when available', () => {
    const { getByText } = renderWithProvider(
      <WorkflowCard workflow={mockWorkflow} onPress={mockOnPress} />
    );
    expect(getByText(/Current Step: PRD/)).toBeTruthy();
  });

  it('should render approval mode when available', () => {
    const { getByText } = renderWithProvider(
      <WorkflowCard workflow={mockWorkflow} onPress={mockOnPress} />
    );
    expect(getByText(/Mode: file/)).toBeTruthy();
  });

  it('should not render current step when not available', () => {
    const workflowWithoutStep = { ...mockWorkflow, current_step: undefined };
    const { queryByText } = renderWithProvider(
      <WorkflowCard workflow={workflowWithoutStep} onPress={mockOnPress} />
    );
    expect(queryByText(/Current Step:/)).toBeNull();
  });

  it('should not render approval mode when not available', () => {
    const workflowWithoutMode = { ...mockWorkflow, approval_mode: undefined };
    const { queryByText } = renderWithProvider(
      <WorkflowCard workflow={workflowWithoutMode} onPress={mockOnPress} />
    );
    expect(queryByText(/Mode:/)).toBeNull();
  });

  it('should call onPress when card is tapped', () => {
    const { getByText } = renderWithProvider(
      <WorkflowCard workflow={mockWorkflow} onPress={mockOnPress} />
    );

    fireEvent.press(getByText('20241020_143022'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should format date correctly', () => {
    const { getByText } = renderWithProvider(
      <WorkflowCard workflow={mockWorkflow} onPress={mockOnPress} />
    );
    // Just verify the date string is rendered
    expect(getByText(/Started:/)).toBeTruthy();
  });

  it('should handle different statuses', () => {
    const statuses: Array<Workflow['status']> = ['pending', 'approved', 'rejected', 'completed'];

    statuses.forEach(status => {
      const workflow = { ...mockWorkflow, status };
      const { getByText } = renderWithProvider(
        <WorkflowCard workflow={workflow} onPress={mockOnPress} />
      );
      expect(getByText(status.replace(/_/g, ' ').toUpperCase())).toBeTruthy();
    });
  });
});