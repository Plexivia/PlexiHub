export type Role = 'Owner' | 'Admin' | 'Manager';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  department?: string;
  isActive: boolean;
  lastLoginAt?: string;
  twoFactorEnabled?: boolean;
}

export interface TenantConfig {
  id: string;
  name: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  favicon: string;
  domain: string;
  supportEmail: string;
}

export interface Deployment {
  id: string;
  status: 'Success' | 'In Progress' | 'Failed';
  backendVersion: string;
  dashboardVersion: string;
  environment: 'Production' | 'Staging' | 'Canary';
  deployedAt: string;
  gitCommitHash: string;
  triggeredBy: string;
  branch?: string;
  gitCommit?: string;
  gitBranch?: string;
  deployedBy?: string;
  releaseNotes?: string;
  timestamp?: string;
}

export interface Container {
  id: string;
  name: string;
  status: 'Running' | 'Degraded' | 'Stopped';
  cpu: string;
  memory: string;
  uptime: string;
  restartCount: number;
  image: string;
}

export interface NetworkMetricPoint {
  time: string;
  inMb: number;
  outMb: number;
}

export interface ServerMetrics {
  storageTotalGb: number;
  storageUsedGb: number;
  storageAvailableGb: number;
  storageUsagePercent: number;
  health: 'Healthy' | 'Warning' | 'Critical';
  cpuPercent: number;
  memoryPercent: number;
  uptimeString: string;
  incomingNetworkMb: number;
  outgoingNetworkMb: number;
  networkHistory: NetworkMetricPoint[];
}

export interface Project {
  id: string;
  name: string;
  code: string; // e.g. "DH", "FS"
  clientName: string;
  clientDomain: string;
  backendVersion: string; // e.g. "2.8.14" -> formatted as "B2.8.14"
  dashboardVersion: string; // e.g. "4.12.2" -> formatted as "D-4.12.2"
  deploymentInfo: Deployment;
  serverMetrics: ServerMetrics;
  containers: Container[];
  description?: string;
  createdAt: string;
}

export type IssueStatus =
  | 'Created'
  | 'Open'
  | 'In Progress'
  | 'Waiting for Client'
  | 'Resolved'
  | 'Closed';

export type IssuePriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedBy: User;
  uploadedAt: string;
}

export interface IssueComment {
  id: string;
  issueId: string;
  author: User;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Activity {
  id: string;
  issueId?: string;
  projectId?: string;
  supportRequestId?: string;
  user: User;
  action: string;
  timestamp: string;
  details?: string;
  type?:
    | 'created'
    | 'status_change'
    | 'comment'
    | 'attachment'
    | 'assigned'
    | 'priority_change'
    | 'version_update'
    | 'deploy';
}

export interface Issue {
  id: string; // e.g. "DH-024"
  projectId: string;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  createdBy: User;
  assignee?: User;
  createdAt: string;
  updatedAt: string;
  labels: string[];
  attachments: Attachment[];
  comments: IssueComment[];
  activities?: Activity[];
}

export type SupportCategory =
  | 'Technical'
  | 'Deployment'
  | 'Server'
  | 'Domain'
  | 'Billing'
  | 'General';

export type SupportStatus =
  | 'Open'
  | 'In Progress'
  | 'Waiting'
  | 'Resolved'
  | 'Closed';

export interface SupportRequest {
  id: string; // e.g. "SUP-104"
  subject: string;
  description: string;
  category: SupportCategory;
  priority: IssuePriority;
  status: SupportStatus;
  requestedBy: User;
  createdAt: string;
  updatedAt: string;
  attachments: Attachment[];
  comments?: IssueComment[];
  activities: Activity[];
}

export interface IssueFilterParams {
  search?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  dateRange?: string;
  sortBy?: 'id' | 'updatedAt' | 'createdAt' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SupportFilterParams {
  search?: string;
  status?: string;
  priority?: string;
  category?: string;
  sortBy?: 'id' | 'updatedAt' | 'createdAt' | 'priority';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface AuthSession {
  token: string;
  user: User;
  tenant: TenantConfig;
  expiresAt: string;
}

export interface AppPermissions {
  issue: {
    create: boolean;
    edit: boolean;
    assign: boolean;
  };
  support: {
    create: boolean;
    manage: boolean;
  };
}

export interface BusinessProfile {
  companyName: string;
  legalEntity?: string;
  registrationNumber?: string;
  vatId?: string;
  address?: string;
  supportEmail: string;
  operationsContact?: string;
  tier?: string;
  primaryDomain: string;
  timezone: string;
}

export interface SecuritySettings {
  twoFactorEnforced: boolean;
  ssoEnabled: boolean;
  sessionTimeoutMinutes: number;
  passwordExpirationDays: number;
  ipAllowlist: string[];
  lastAuditDate: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: User;
  action: string;
  details: string;
  ipAddress: string;
}
