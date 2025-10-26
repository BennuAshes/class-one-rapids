/**
 * ApprovalCard Component Tests
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { ApprovalCard } from '../ApprovalCard';
import type { Approval } from '../../api/types';

const renderWithProvider = (component: React.ReactElement) => {
  return render(<PaperProvider>{component}</PaperProvider>);
};

describe('ApprovalCard', () => {
  const mockApproval: Approval = {
    execution_id: '20241020_143022',
    checkpoint: 'PRD',
    file: '/path/to/prd.md',
    file_path: '/path/to/.approval_PRD.json',
    timestamp: new Date().toISOString(),
    status: 'pending',
    timeout_seconds: 300,
    preview: 'This is a preview of the PRD document...',
  };

  const mockOnApprove = jest.fn();
  const mockOnReject = jest.fn();

  beforeEach(() => {
    mockOnApprove.mockClear();
    mockOnReject.mockClear();
    jest.clearAllTimers();
  });

  it('should render checkpoint name', () => {
    const { getByText } = renderWithProvider(
      <ApprovalCard
        approval={mockApproval}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
      />
    );
    expect(getByText('PRD')).toBeTruthy();
  });

  it('should render execution ID', () => {
    const { getByText } = renderWithProvider(
      <ApprovalCard
        approval={mockApproval}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
      />
    );
    expect(getByText('20241020_143022')).toBeTruthy();
  });

  it('should render preview text', () => {
    const { getByText } = renderWithProvider(
      <ApprovalCard
        approval={mockApproval}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
      />
    );
    expect(getByText(/This is a preview/)).toBeTruthy();
  });

  it('should show countdown timer', () => {
    const { getByText } = renderWithProvider(
      <ApprovalCard
        approval={mockApproval}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
      />
    );
    // Timer should show some time remaining
    expect(getByText(/\d+:\d{2}/)).toBeTruthy();
  });

  it('should call onApprove when approve button is pressed', () => {
    const { getByText } = renderWithProvider(
      <ApprovalCard
        approval={mockApproval}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
      />
    );

    fireEvent.press(getByText('Approve'));
    expect(mockOnApprove).toHaveBeenCalledTimes(1);
  });

  it('should call onReject when reject button is pressed', () => {
    const { getByText } = renderWithProvider(
      <ApprovalCard
        approval={mockApproval}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
      />
    );

    fireEvent.press(getByText('Reject'));
    expect(mockOnReject).toHaveBeenCalledTimes(1);
  });

  it('should disable buttons when isLoading is true', () => {
    const { getByText } = renderWithProvider(
      <ApprovalCard
        approval={mockApproval}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
        isLoading={true}
      />
    );

    const approveButton = getByText('Approve');
    const rejectButton = getByText('Reject');

    // Buttons should be disabled
    fireEvent.press(approveButton);
    fireEvent.press(rejectButton);

    // Callbacks should not be called
    expect(mockOnApprove).not.toHaveBeenCalled();
    expect(mockOnReject).not.toHaveBeenCalled();
  });

  it('should show "Read More" button for long previews', () => {
    const longPreview = 'A'.repeat(200);
    const approvalWithLongPreview = { ...mockApproval, preview: longPreview };

    const { getByText } = renderWithProvider(
      <ApprovalCard
        approval={approvalWithLongPreview}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
      />
    );

    expect(getByText('Read More')).toBeTruthy();
  });

  it('should expand preview when "Read More" is pressed', () => {
    const longPreview = 'A'.repeat(200);
    const approvalWithLongPreview = { ...mockApproval, preview: longPreview };

    const { getByText } = renderWithProvider(
      <ApprovalCard
        approval={approvalWithLongPreview}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
      />
    );

    fireEvent.press(getByText('Read More'));
    expect(getByText('Show Less')).toBeTruthy();
  });

  it('should not show expand button for short previews', () => {
    const shortPreview = 'Short preview';
    const approvalWithShortPreview = { ...mockApproval, preview: shortPreview };

    const { queryByText } = renderWithProvider(
      <ApprovalCard
        approval={approvalWithShortPreview}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
      />
    );

    expect(queryByText('Read More')).toBeNull();
  });

  it('should format timestamp correctly', () => {
    const { getByText } = renderWithProvider(
      <ApprovalCard
        approval={mockApproval}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
      />
    );

    expect(getByText(/Created:/)).toBeTruthy();
  });

  it('should handle expired timer', async () => {
    jest.useFakeTimers();

    // Create approval with very short timeout
    const expiredApproval = {
      ...mockApproval,
      timestamp: new Date(Date.now() - 400000).toISOString(), // 400 seconds ago
      timeout_seconds: 300, // 5 minute timeout
    };

    const { getByText } = renderWithProvider(
      <ApprovalCard
        approval={expiredApproval}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
      />
    );

    // Fast-forward time
    await waitFor(() => {
      expect(getByText(/Expired/)).toBeTruthy();
    });

    jest.useRealTimers();
  });

  it('should render without preview', () => {
    const approvalWithoutPreview = { ...mockApproval, preview: undefined };

    const { queryByText } = renderWithProvider(
      <ApprovalCard
        approval={approvalWithoutPreview}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
      />
    );

    expect(queryByText(/Preview:/)).toBeNull();
  });
});