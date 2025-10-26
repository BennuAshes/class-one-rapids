/**
 * Status Badge Component
 * Displays workflow/approval status with appropriate color coding
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import type { WorkflowStatus } from '../api/types';
import { statusColors } from '../theme/theme';

interface StatusBadgeProps {
  status: WorkflowStatus;
  size?: 'small' | 'medium';
}

export function StatusBadge({ status, size = 'small' }: StatusBadgeProps) {
  const backgroundColor = statusColors[status] || statusColors.pending;
  const textSize = size === 'small' ? 10 : 12;

  return (
    <Chip
      mode="flat"
      compact={size === 'small'}
      textStyle={[styles.text, { fontSize: textSize }]}
      style={[styles.chip, { backgroundColor }]}
    >
      {status.replace(/_/g, ' ').toUpperCase()}
    </Chip>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 24,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});