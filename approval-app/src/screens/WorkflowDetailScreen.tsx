/**
 * Workflow Detail Screen
 * Shows detailed information about a specific workflow
 */

import React from 'react';
import { StyleSheet, ScrollView, View, RefreshControl } from 'react-native';
import { Appbar, Card, Text, List, ActivityIndicator, Divider } from 'react-native-paper';
import { useWorkflow } from '../api/queries';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any, 'WorkflowDetail'>;

export function WorkflowDetailScreen({ route, navigation }: Props) {
  const { executionId } = route.params;
  const { data: workflow, isLoading, isError, error, refetch, isRefetching } = useWorkflow(executionId);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStepIcon = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'check-circle';
      case 'in_progress':
        return 'progress-clock';
      case 'failed':
        return 'close-circle';
      default:
        return 'circle-outline';
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Workflow Details" />
        <Appbar.Action icon="refresh" onPress={() => refetch()} />
      </Appbar.Header>

      {isLoading && !workflow ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : isError ? (
        <EmptyState
          icon="alert-circle"
          title="Error Loading Workflow"
          message={error?.message || 'Failed to load workflow details.'}
        />
      ) : !workflow ? (
        <EmptyState icon="file-document-outline" title="Workflow Not Found" />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
        >
          {/* Status Card */}
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.header}>
                <Text variant="titleLarge">{workflow.execution_id}</Text>
                <StatusBadge status={workflow.status.status} size="medium" />
              </View>
              <Divider style={styles.divider} />
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>
                  Feature Source:
                </Text>
                <Text variant="bodyMedium">{workflow.status.feature_source}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>
                  Started:
                </Text>
                <Text variant="bodyMedium">{formatDate(workflow.status.started_at)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>
                  Approval Mode:
                </Text>
                <Text variant="bodyMedium">{workflow.status.approval_mode}</Text>
              </View>
              {workflow.status.current_step && (
                <View style={styles.infoRow}>
                  <Text variant="bodyMedium" style={styles.label}>
                    Current Step:
                  </Text>
                  <Text variant="bodyMedium">{workflow.status.current_step}</Text>
                </View>
              )}
            </Card.Content>
          </Card>

          {/* Workflow Steps */}
          <Card style={styles.card}>
            <Card.Title title="Workflow Steps" />
            <Card.Content>
              {workflow.status.steps.map((step, index) => (
                <List.Item
                  key={index}
                  title={step.name}
                  description={step.status}
                  left={(props) => <List.Icon {...props} icon={getStepIcon(step.status)} />}
                />
              ))}
            </Card.Content>
          </Card>

          {/* Approvals */}
          {workflow.approvals && workflow.approvals.length > 0 && (
            <Card style={styles.card}>
              <Card.Title title="Approvals" />
              <Card.Content>
                {workflow.approvals.map((approval, index) => (
                  <List.Item
                    key={index}
                    title={approval.checkpoint}
                    description={`Status: ${approval.status}`}
                    left={(props) => (
                      <List.Icon
                        {...props}
                        icon={
                          approval.status === 'approved'
                            ? 'check-circle'
                            : approval.status === 'rejected'
                            ? 'close-circle'
                            : 'clock-outline'
                        }
                      />
                    )}
                  />
                ))}
              </Card.Content>
            </Card>
          )}

          {/* Generated Files */}
          {workflow.files && workflow.files.length > 0 && (
            <Card style={styles.card}>
              <Card.Title title="Generated Files" />
              <Card.Content>
                {workflow.files.map((file, index) => (
                  <List.Item
                    key={index}
                    title={file.name}
                    description={formatFileSize(file.size)}
                    left={(props) => <List.Icon {...props} icon="file-document" />}
                  />
                ))}
              </Card.Content>
            </Card>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  divider: {
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  label: {
    fontWeight: '600',
    color: '#666',
  },
});