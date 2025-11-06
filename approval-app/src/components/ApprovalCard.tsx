/**
 * Approval Card Component
 * Displays a pending approval request with action buttons
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, Button, IconButton } from 'react-native-paper';
import type { Approval } from '../api/types';
import { FileChangesViewer } from './FileChangesViewer';

interface ApprovalCardProps {
  approval: Approval;
  onApprove: () => void;
  onReject: () => void;
  onProvideFeedback?: () => void;
  isLoading?: boolean;
}

export function ApprovalCard({
  approval,
  onApprove,
  onReject,
  onProvideFeedback,
  isLoading
}: ApprovalCardProps) {
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
  const isExecuteTask = approval.checkpoint === 'Execute Tasks';
  const isCommandImprovement = approval.checkpoint?.includes('Command Improvements') ||
                                approval.approval_type === 'command_improvement';

  return (
    <Card style={[
      styles.card,
      isExpired && styles.expiredCard,
      isExecuteTask && styles.executeTaskCard,
      isCommandImprovement && styles.commandImprovementCard
    ]} mode="elevated">
      <Card.Content>
        {isExecuteTask && (
          <View style={styles.warningBadge}>
            <Text style={styles.warningBadgeText}>⚠️ FINAL APPROVAL</Text>
          </View>
        )}
        {isCommandImprovement && (
          <View style={styles.commandBadge}>
            <Text style={styles.commandBadgeText}>🔧 COMMAND UPDATE</Text>
          </View>
        )}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text variant="titleMedium" style={[
              styles.title,
              isExecuteTask && styles.executeTaskTitle,
              isCommandImprovement && styles.commandImprovementTitle
            ]}>
              {isExecuteTask ? '🚀 ' : isCommandImprovement ? '🔧 ' : ''}{approval.checkpoint}
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

        {isExecuteTask && (
          <View style={styles.executeWarning}>
            <Text style={styles.executeWarningText}>
              ⚠️ This approval will trigger actual code generation and execution.
            </Text>
            <Text style={styles.executeWarningSubtext}>
              Please review the task list carefully before approving.
            </Text>
          </View>
        )}

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

        {isCommandImprovement && approval.command_improvement_metadata && (
          <View style={styles.commandContext}>
            <Text variant="titleSmall" style={styles.commandContextTitle}>
              📝 Command Update Details
            </Text>
            <Text variant="bodySmall" style={styles.commandContextItem}>
              <Text style={styles.commandContextLabel}>Target Command:</Text> {approval.command_improvement_metadata.target_command}
            </Text>
            <Text variant="bodySmall" style={styles.commandContextItem}>
              <Text style={styles.commandContextLabel}>Original Checkpoint:</Text> {approval.command_improvement_metadata.original_checkpoint}
            </Text>
            {approval.command_improvement_metadata.original_feedback && (
              <Text variant="bodySmall" style={styles.commandContextItem}>
                <Text style={styles.commandContextLabel}>Feedback:</Text> {approval.command_improvement_metadata.original_feedback}
              </Text>
            )}
            {approval.command_improvement_metadata.change_summary?.length > 0 && (
              <View>
                <Text variant="bodySmall" style={styles.commandContextLabel}>Proposed Changes:</Text>
                {approval.command_improvement_metadata.change_summary.map((change, idx) => (
                  <Text key={idx} variant="bodySmall" style={styles.changeItem}>
                    • {change}
                  </Text>
                ))}
              </View>
            )}
            <Text variant="caption" style={styles.commandContextNote}>
              {approval.command_improvement_metadata.what_if_rejected}
            </Text>
          </View>
        )}

        <FileChangesViewer
          fileTree={approval.file_tree}
          changedFiles={approval.changed_files}
          gitDiff={approval.git_diff}
        />

        <View style={styles.actions}>
          <Button
            mode="contained"
            icon="check"
            onPress={onApprove}
            disabled={isLoading || isExpired}
            loading={isLoading}
            style={[
              styles.button,
              styles.approveButton,
              isExecuteTask && styles.executeTaskApproveButton
            ]}
            labelStyle={[
              styles.buttonLabel,
              isExecuteTask && styles.executeTaskButtonLabel
            ]}
          >
            {isExecuteTask ? 'Execute Tasks' : 'Approve'}
          </Button>
          {onProvideFeedback ? (
            <Button
              mode="contained"
              icon="message-text"
              onPress={onProvideFeedback}
              disabled={isLoading || isExpired}
              style={[styles.button, styles.feedbackButton]}
              labelStyle={styles.buttonLabel}
            >
              Feedback
            </Button>
          ) : (
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
          )}
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
  feedbackButton: {
    backgroundColor: '#FF9800',
  },
  buttonLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Execute Tasks special styling
  executeTaskCard: {
    borderLeftColor: '#FF0000',
    borderLeftWidth: 6,
    backgroundColor: '#FFF5F5',
    elevation: 6,
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  executeTaskTitle: {
    color: '#CC0000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  warningBadge: {
    position: 'absolute',
    top: -10,
    right: 10,
    backgroundColor: '#FF4444',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  warningBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  executeWarning: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  executeWarningText: {
    color: '#CC0000',
    fontWeight: '600',
    marginBottom: 4,
  },
  executeWarningSubtext: {
    color: '#B71C1C',
    fontSize: 12,
  },
  executeTaskApproveButton: {
    backgroundColor: '#CC0000',
    paddingVertical: 4,
  },
  executeTaskButtonLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Command Improvement special styling
  commandImprovementCard: {
    borderLeftColor: '#9C27B0',
    borderLeftWidth: 6,
    backgroundColor: '#F3E5F5',
    elevation: 5,
    shadowColor: '#9C27B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  commandImprovementTitle: {
    color: '#6A1B9A',
    fontSize: 17,
    fontWeight: '600',
  },
  commandBadge: {
    position: 'absolute',
    top: -10,
    left: 10,
    backgroundColor: '#9C27B0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  commandBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  commandContext: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
  },
  commandContextTitle: {
    color: '#6A1B9A',
    fontWeight: '600',
    marginBottom: 8,
  },
  commandContextItem: {
    marginVertical: 2,
    color: '#555',
  },
  commandContextLabel: {
    fontWeight: '600',
    color: '#333',
  },
  changeItem: {
    marginLeft: 16,
    marginVertical: 2,
    color: '#555',
  },
  commandContextNote: {
    marginTop: 8,
    color: '#777',
    fontStyle: 'italic',
    fontSize: 12,
  },
});