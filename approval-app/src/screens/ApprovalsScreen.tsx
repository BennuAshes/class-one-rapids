/**
 * Approvals Screen
 * Lists all pending approval requests with action buttons
 */

import React, { useState } from 'react';
import { StyleSheet, FlatList, RefreshControl, View } from 'react-native';
import { Appbar, Dialog, Portal, Button, TextInput, Snackbar, ActivityIndicator } from 'react-native-paper';
import { usePendingApprovals, useApproveRequest, useRejectRequest } from '../api/queries';
import { ApprovalCard } from '../components/ApprovalCard';
import { EmptyState } from '../components/EmptyState';
import type { Approval } from '../api/types';

export function ApprovalsScreen() {
  const {
    data: approvals,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = usePendingApprovals();

  const approveMutation = useApproveRequest();
  const rejectMutation = useRejectRequest();

  const [rejectDialogVisible, setRejectDialogVisible] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const handleApprove = async (approval: Approval) => {
    try {
      await approveMutation.mutateAsync(approval.file_path);
      setSnackbarMessage(`✓ Approved: ${approval.checkpoint}`);
      setSnackbarVisible(true);
    } catch (err) {
      setSnackbarMessage(`✗ Failed to approve: ${(err as Error).message}`);
      setSnackbarVisible(true);
    }
  };

  const handleReject = (approval: Approval) => {
    setSelectedApproval(approval);
    setRejectDialogVisible(true);
  };

  const confirmReject = async () => {
    if (!selectedApproval) return;

    try {
      await rejectMutation.mutateAsync({
        filePath: selectedApproval.file_path,
        reason: rejectReason || 'Rejected via mobile app',
      });
      setSnackbarMessage(`✗ Rejected: ${selectedApproval.checkpoint}`);
      setSnackbarVisible(true);
      setRejectDialogVisible(false);
      setRejectReason('');
      setSelectedApproval(null);
    } catch (err) {
      setSnackbarMessage(`Failed to reject: ${(err as Error).message}`);
      setSnackbarVisible(true);
    }
  };

  const renderApproval = ({ item }: { item: Approval }) => (
    <ApprovalCard
      approval={item}
      onApprove={() => handleApprove(item)}
      onReject={() => handleReject(item)}
      isLoading={
        (approveMutation.isPending || rejectMutation.isPending) &&
        (selectedApproval?.file_path === item.file_path)
      }
    />
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Pending Approvals" />
        <Appbar.Action icon="refresh" onPress={() => refetch()} />
      </Appbar.Header>

      {isLoading && !approvals ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : isError ? (
        <EmptyState
          icon="alert-circle"
          title="Error Loading Approvals"
          message={error?.message || 'Failed to load approvals. Please try again.'}
        />
      ) : approvals && approvals.length === 0 ? (
        <EmptyState
          icon="check-circle-outline"
          title="No Pending Approvals"
          message="All workflows are approved or no approvals are required."
        />
      ) : (
        <FlatList
          data={approvals}
          renderItem={renderApproval}
          keyExtractor={(item) => item.file_path}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
          }
        />
      )}

      <Portal>
        <Dialog visible={rejectDialogVisible} onDismiss={() => setRejectDialogVisible(false)}>
          <Dialog.Title>Reject Approval</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Reason for rejection (optional)"
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={3}
              mode="outlined"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setRejectDialogVisible(false)}>Cancel</Button>
            <Button onPress={confirmReject} mode="contained" loading={rejectMutation.isPending}>
              Confirm Reject
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
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
});