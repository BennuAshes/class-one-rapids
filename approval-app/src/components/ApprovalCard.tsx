/**
 * Approval Card Component
 * Displays a pending approval request with action buttons
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, Button, IconButton } from 'react-native-paper';
import type { Approval } from '../api/types';

interface ApprovalCardProps {
  approval: Approval;
  onApprove: () => void;
  onReject: () => void;
  isLoading?: boolean;
}

export function ApprovalCard({ approval, onApprove, onReject, isLoading }: ApprovalCardProps) {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const created = new Date(approval.timestamp).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - created) / 1000);
      const remaining = Math.max(0, approval.timeout_seconds - elapsed);
      setTimeRemaining(remaining);
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [approval.timestamp, approval.timeout_seconds]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  const isExpired = timeRemaining === 0;

  return (
    <Card style={[styles.card, isExpired && styles.expiredCard]} mode="elevated">
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text variant="titleMedium" style={styles.title}>
              {approval.checkpoint}
            </Text>
            <Text variant="bodySmall" style={styles.subtitle}>
              {approval.execution_id}
            </Text>
          </View>
          <View style={styles.timerContainer}>
            <Text
              variant="labelLarge"
              style={[styles.timer, isExpired && styles.expiredTimer]}
            >
              {formatTime(timeRemaining)}
            </Text>
            <Text variant="bodySmall" style={styles.timerLabel}>
              {isExpired ? 'Expired' : 'Remaining'}
            </Text>
          </View>
        </View>

        <Text variant="bodySmall" style={styles.timestamp}>
          Created: {formatDate(approval.timestamp)}
        </Text>

        {approval.preview && (
          <View style={styles.previewContainer}>
            <Text variant="bodySmall" style={styles.previewLabel}>
              Preview:
            </Text>
            <Text
              variant="bodySmall"
              style={styles.previewText}
              numberOfLines={isExpanded ? undefined : 3}
            >
              {approval.preview}
            </Text>
            {approval.preview.length > 100 && (
              <Button
                mode="text"
                compact
                onPress={() => setIsExpanded(!isExpanded)}
                style={styles.expandButton}
              >
                {isExpanded ? 'Show Less' : 'Read More'}
              </Button>
            )}
          </View>
        )}

        <View style={styles.actions}>
          <Button
            mode="contained"
            icon="check"
            onPress={onApprove}
            disabled={isLoading || isExpired}
            loading={isLoading}
            style={[styles.button, styles.approveButton]}
            labelStyle={styles.buttonLabel}
          >
            Approve
          </Button>
          <Button
            mode="contained"
            icon="close"
            onPress={onReject}
            disabled={isLoading || isExpired}
            style={[styles.button, styles.rejectButton]}
            labelStyle={styles.buttonLabel}
          >
            Reject
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  expiredCard: {
    opacity: 0.6,
    borderLeftColor: '#9E9E9E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    color: '#666',
  },
  timerContainer: {
    alignItems: 'flex-end',
    marginLeft: 16,
  },
  timer: {
    fontWeight: '700',
    fontSize: 18,
    color: '#FF9800',
  },
  expiredTimer: {
    color: '#9E9E9E',
  },
  timerLabel: {
    color: '#666',
    fontSize: 10,
  },
  timestamp: {
    color: '#666',
    marginBottom: 12,
  },
  previewContainer: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  previewLabel: {
    fontWeight: '600',
    marginBottom: 4,
  },
  previewText: {
    color: '#333',
    fontFamily: 'monospace',
  },
  expandButton: {
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  button: {
    flex: 1,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  buttonLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});