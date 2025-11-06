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
  changed_files?: ChangedFile[];
  git_diff?: string;
  file_tree?: FileTreeNode[];
  approved_at?: string;
  approved_by?: string;
  rejected_at?: string;
  rejected_by?: string;
  reason?: string;
  approval_type?: 'standard' | 'execute_tasks' | 'command_improvement';
  command_improvement_metadata?: CommandImprovementMetadata;
}

export interface CommandImprovementMetadata {
  target_command: string;
  original_checkpoint: string;
  reflection_file: string;
  proposed_file: string;
  change_summary: string[];
  original_feedback: string;
  what_if_rejected: string;
}

export interface ChangedFile {
  path: string;
  status: 'created' | 'modified' | 'deleted';
}

export interface FileTreeNode {
  name: string;
  type: 'file' | 'directory';
  status?: 'created' | 'modified' | 'deleted';
  children?: FileTreeNode[];
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