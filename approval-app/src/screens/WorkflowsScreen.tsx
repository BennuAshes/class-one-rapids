/**
 * Workflows Screen
 * Lists all workflows with their current status
 */

import React from 'react';
import { StyleSheet, FlatList, RefreshControl, View } from 'react-native';
import { Appbar, FAB, Snackbar, ActivityIndicator } from 'react-native-paper';
import { useWorkflows } from '../api/queries';
import { WorkflowCard } from '../components/WorkflowCard';
import { EmptyState } from '../components/EmptyState';
import type { Workflow } from '../api/types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any, 'Workflows'>;

export function WorkflowsScreen({ navigation }: Props) {
  const {
    data: workflows,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useWorkflows({ refetchInterval: 30000 }); // Poll every 30 seconds

  const [snackbarVisible, setSnackbarVisible] = React.useState(false);

  const handleWorkflowPress = (workflow: Workflow) => {
    navigation.navigate('WorkflowDetail', { executionId: workflow.execution_id });
  };

  const handleRefresh = async () => {
    try {
      await refetch();
    } catch (err) {
      setSnackbarVisible(true);
    }
  };

  const renderWorkflow = ({ item }: { item: Workflow }) => (
    <WorkflowCard workflow={item} onPress={() => handleWorkflowPress(item)} />
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Workflows" />
        <Appbar.Action icon="refresh" onPress={handleRefresh} testID="refresh-button" />
      </Appbar.Header>

      {isLoading && !workflows ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : isError ? (
        <EmptyState
          icon="alert-circle"
          title="Error Loading Workflows"
          message={error?.message || 'Failed to load workflows. Please try again.'}
        />
      ) : workflows && workflows.length === 0 ? (
        <EmptyState
          icon="clipboard-text-outline"
          title="No Workflows"
          message="No workflows have been started yet."
        />
      ) : (
        <FlatList
          data={workflows}
          renderItem={renderWorkflow}
          keyExtractor={(item) => item.execution_id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />
          }
        />
      )}

      <FAB
        icon="refresh"
        style={styles.fab}
        onPress={handleRefresh}
        label="Refresh"
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'Retry',
          onPress: handleRefresh,
        }}
      >
        Failed to refresh workflows
      </Snackbar>
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
  list: {
    paddingVertical: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});