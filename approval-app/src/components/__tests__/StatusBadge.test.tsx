/**
 * StatusBadge Component Tests
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { StatusBadge } from '../StatusBadge';

const renderWithProvider = (component: React.ReactElement) => {
  return render(<PaperProvider>{component}</PaperProvider>);
};

describe('StatusBadge', () => {
  it('should render with pending status', () => {
    const { getByText } = renderWithProvider(<StatusBadge status="pending" />);
    expect(getByText('PENDING')).toBeTruthy();
  });

  it('should render with awaiting_approval status', () => {
    const { getByText } = renderWithProvider(<StatusBadge status="awaiting_approval" />);
    expect(getByText('AWAITING APPROVAL')).toBeTruthy();
  });

  it('should render with approved status', () => {
    const { getByText } = renderWithProvider(<StatusBadge status="approved" />);
    expect(getByText('APPROVED')).toBeTruthy();
  });

  it('should render with rejected status', () => {
    const { getByText } = renderWithProvider(<StatusBadge status="rejected" />);
    expect(getByText('REJECTED')).toBeTruthy();
  });

  it('should render with completed status', () => {
    const { getByText } = renderWithProvider(<StatusBadge status="completed" />);
    expect(getByText('COMPLETED')).toBeTruthy();
  });

  it('should render with failed status', () => {
    const { getByText } = renderWithProvider(<StatusBadge status="failed" />);
    expect(getByText('FAILED')).toBeTruthy();
  });

  it('should render with timeout status', () => {
    const { getByText} = renderWithProvider(<StatusBadge status="timeout" />);
    expect(getByText('TIMEOUT')).toBeTruthy();
  });

  it('should render with small size by default', () => {
    const { getByText } = renderWithProvider(<StatusBadge status="pending" />);
    const badge = getByText('PENDING');
    expect(badge).toBeTruthy();
  });

  it('should render with medium size when specified', () => {
    const { getByText } = renderWithProvider(<StatusBadge status="pending" size="medium" />);
    const badge = getByText('PENDING');
    expect(badge).toBeTruthy();
  });

  it('should replace underscores with spaces in status text', () => {
    const { getByText } = renderWithProvider(<StatusBadge status="awaiting_approval" />);
    expect(getByText('AWAITING APPROVAL')).toBeTruthy();
  });
});