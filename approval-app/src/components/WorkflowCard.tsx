/**
 * Workflow Card Component
 * Displays a workflow item in a list
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, TouchableRipple } from 'react-native-paper';
import type { Workflow } from '../api/types';
import { StatusBadge } from './StatusBadge';

interface WorkflowCardProps {
  workflow: Workflow;
  onPress: () => void;
}

export function WorkflowCard({ workflow, onPress }: WorkflowCardProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <Card style={styles.card} mode="elevated">
      <TouchableRipple onPress={onPress}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="titleMedium" style={styles.title}>
              {workflow.execution_id}
            </Text>
            <StatusBadge status={workflow.status} />
          </View>

          <View style={styles.details}>
            <Text variant="bodySmall" style={styles.detailText}>
              Started: {formatDate(workflow.started_at)}
            </Text>
            {workflow.current_step && (
              <Text variant="bodySmall" style={styles.detailText}>
                Current Step: {workflow.current_step}
              </Text>
            )}
            {workflow.approval_mode && (
              <Text variant="bodySmall" style={styles.detailText}>
                Mode: {workflow.approval_mode}
              </Text>
            )}
          </View>
        </Card.Content>
      </TouchableRipple>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    flex: 1,
    fontWeight: '600',
  },
  details: {
    gap: 4,
  },
  detailText: {
    color: '#666',
  },
});