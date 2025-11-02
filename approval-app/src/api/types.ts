/**
 * API Types for Workflow Approval Server
 */

export interface Workflow {
  execution_id: string;
  status: WorkflowStatus;
  started_at: string;
  current_step?: string;
  approval_mode?: string;
  directory?: string;
}

export type WorkflowStatus =
  | 'initializing'
  | 'pending'
  | 'awaiting_approval'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'failed'
  | 'timeout';

export interface WorkflowDetail {
  execution_id: string;
  status: {
    execution_id: string;
    feature_source: string;
    approval_mode: string;
    status: WorkflowStatus;
    started_at: string;
    working_directory: string;
    current_step?: string;
    steps: WorkflowStep[];
  };
  approvals: Approval[];
  files: GeneratedFile[];
}

export interface WorkflowStep {
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export interface Approval {
  execution_id: string;
  checkpoint: string;
  file: string;
  file_path: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected' | 'timeout';
  timeout_seconds: number;
  preview?: string;
  approved_at?: string;
  approved_by?: string;
  rejected_at?: string;
  rejected_by?: string;
  reason?: string;
}

export interface GeneratedFile {
  name: string;
  size: number;
  path: string;
}

export interface ApprovalResponse {
  success: boolean;
  message: string;
}

export interface FeedbackData {
  specific_issues?: string;
  missing_elements?: string;
  suggested_improvements?: string;
  rating?: number;
  summary?: string;
}

export interface FeedbackSubmission {
  file_path: string;
  feedback: FeedbackData;
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
  feedback_saved?: boolean;
}

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  port: number;
}

export interface EventStreamData {
  pending_count: number;
  pending: Approval[];
}