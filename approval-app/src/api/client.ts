/**
 * API Client for Workflow Approval Server
 */

import Constants from 'expo-constants';
import type {
  Workflow,
  WorkflowDetail,
  Approval,
  ApprovalResponse,
  HealthResponse,
} from './types';

const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:8080';
const API_TIMEOUT = 30000; // 30 seconds

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = API_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408);
    }
    throw error;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(
      error.error || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      error
    );
  }
  return response.json();
}

export const api = {
  /**
   * Health check
   */
  async health(): Promise<HealthResponse> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/health`);
    return handleResponse<HealthResponse>(response);
  },

  /**
   * Get all workflows
   */
  async getWorkflows(): Promise<Workflow[]> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/workflows`);
    return handleResponse<Workflow[]>(response);
  },

  /**
   * Get workflow details
   */
  async getWorkflow(executionId: string): Promise<WorkflowDetail> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/workflows/${executionId}`);
    return handleResponse<WorkflowDetail>(response);
  },

  /**
   * Get workflow approvals
   */
  async getWorkflowApprovals(executionId: string): Promise<Approval[]> {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/workflows/${executionId}/approvals`
    );
    return handleResponse<Approval[]>(response);
  },

  /**
   * Get all pending approvals
   */
  async getPendingApprovals(): Promise<Approval[]> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/approvals/pending`);
    return handleResponse<Approval[]>(response);
  },

  /**
   * Approve a request
   */
  async approveRequest(filePath: string): Promise<ApprovalResponse> {
    const encodedPath = btoa(filePath);
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/approvals/${encodedPath}/approve`,
      {
        method: 'POST',
      }
    );
    return handleResponse<ApprovalResponse>(response);
  },

  /**
   * Reject a request
   */
  async rejectRequest(filePath: string, reason?: string): Promise<ApprovalResponse> {
    const encodedPath = btoa(filePath);
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/approvals/${encodedPath}/reject`,
      {
        method: 'POST',
        body: JSON.stringify({ reason: reason || 'Rejected via mobile app' }),
      }
    );
    return handleResponse<ApprovalResponse>(response);
  },
};

export { ApiError };