/**
 * TanStack Query Hooks for Workflow Approval API
 */

import { useQuery, useMutation, useQueryClient, QueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { Workflow, WorkflowDetail, Approval, FeedbackData } from './types';

/**
 * Query Keys
 */
export const queryKeys = {
  health: ['health'] as const,
  workflows: ['workflows'] as const,
  workflow: (id: string) => ['workflow', id] as const,
  workflowApprovals: (id: string) => ['workflow', id, 'approvals'] as const,
  pendingApprovals: ['approvals', 'pending'] as const,
};

/**
 * Create configured QueryClient
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 1000, // 5 seconds
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        retry: 1,
      },
    },
  });
}

/**
 * Health Check Query
 */
export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: api.health,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
  });
}

/**
 * Workflows List Query
 */
export function useWorkflows(options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: queryKeys.workflows,
    queryFn: api.getWorkflows,
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: options?.refetchInterval || 30 * 1000, // 30 seconds default
  });
}

/**
 * Single Workflow Query
 */
export function useWorkflow(executionId: string) {
  return useQuery({
    queryKey: queryKeys.workflow(executionId),
    queryFn: () => api.getWorkflow(executionId),
    staleTime: 5 * 1000, // 5 seconds
    enabled: !!executionId,
  });
}

/**
 * Workflow Approvals Query
 */
export function useWorkflowApprovals(executionId: string) {
  return useQuery({
    queryKey: queryKeys.workflowApprovals(executionId),
    queryFn: () => api.getWorkflowApprovals(executionId),
    staleTime: 5 * 1000, // 5 seconds
    enabled: !!executionId,
  });
}

/**
 * Pending Approvals Query (with aggressive polling for real-time updates)
 */
export function usePendingApprovals(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.pendingApprovals,
    queryFn: api.getPendingApprovals,
    staleTime: 2 * 1000, // 2 seconds
    refetchInterval: 5 * 1000, // Poll every 5 seconds
    enabled: options?.enabled !== false,
  });
}

/**
 * Approve Request Mutation
 */
export function useApproveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (filePath: string) => api.approveRequest(filePath),
    onSuccess: () => {
      // Invalidate all related queries to refetch data
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows });
      queryClient.invalidateQueries({ queryKey: queryKeys.pendingApprovals });
    },
  });
}

/**
 * Reject Request Mutation
 */
export function useRejectRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ filePath, reason }: { filePath: string; reason?: string }) =>
      api.rejectRequest(filePath, reason),
    onSuccess: () => {
      // Invalidate all related queries to refetch data
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows });
      queryClient.invalidateQueries({ queryKey: queryKeys.pendingApprovals });
    },
  });
}

/**
 * Submit Feedback Mutation (rejects with feedback)
 */
export function useSubmitFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ filePath, feedback }: { filePath: string; feedback: FeedbackData }) =>
      api.submitFeedback(filePath, feedback),
    onSuccess: () => {
      // Invalidate all related queries to refetch data
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows });
      queryClient.invalidateQueries({ queryKey: queryKeys.pendingApprovals });
    },
  });
}

/**
 * Get pending approval count (derived from pending approvals)
 */
export function usePendingApprovalCount(): number {
  const { data: approvals } = usePendingApprovals();
  return approvals?.length || 0;
}