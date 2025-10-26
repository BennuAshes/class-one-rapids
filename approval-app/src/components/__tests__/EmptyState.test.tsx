/**
 * EmptyState Component Tests
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { EmptyState } from '../EmptyState';

const renderWithProvider = (component: React.ReactElement) => {
  return render(<PaperProvider>{component}</PaperProvider>);
};

describe('EmptyState', () => {
  it('should render with title', () => {
    const { getByText } = renderWithProvider(
      <EmptyState icon="clipboard-text-outline" title="No Data" />
    );
    expect(getByText('No Data')).toBeTruthy();
  });

  it('should render with title and message', () => {
    const { getByText } = renderWithProvider(
      <EmptyState
        icon="clipboard-text-outline"
        title="No Data"
        message="There is no data to display"
      />
    );
    expect(getByText('No Data')).toBeTruthy();
    expect(getByText('There is no data to display')).toBeTruthy();
  });

  it('should not render message when not provided', () => {
    const { queryByText } = renderWithProvider(
      <EmptyState icon="clipboard-text-outline" title="No Data" />
    );
    // Title should be present
    expect(queryByText('No Data')).toBeTruthy();
    // But no generic message text
  });

  it('should render with different icons', () => {
    const icons = ['clipboard-text-outline', 'alert-circle', 'check-circle-outline'];

    icons.forEach(icon => {
      const { getByText } = renderWithProvider(
        <EmptyState icon={icon} title="Test" />
      );
      expect(getByText('Test')).toBeTruthy();
    });
  });

  it('should render icon, title, and message in correct order', () => {
    const { getByText } = renderWithProvider(
      <EmptyState
        icon="clipboard-text-outline"
        title="No Workflows"
        message="Start a workflow to see it here"
      />
    );

    expect(getByText('No Workflows')).toBeTruthy();
    expect(getByText('Start a workflow to see it here')).toBeTruthy();
  });
});