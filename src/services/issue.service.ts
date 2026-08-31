import {
  Issue,
  IssueStatus,
  IssuePriority,
  IssueFilterParams,
  Activity,
  IssueComment,
  Attachment,
  User,
} from '../types';
import { MOCK_ISSUES, MOCK_ACTIVITIES, MOCK_USERS } from '../mocks/mockData';
import { projectService } from './project.service';

const STORAGE_KEY_ISSUES = 'commerceops_issues';
const STORAGE_KEY_ACTIVITIES = 'commerceops_activities';

function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEY_ISSUES)) {
    localStorage.setItem(STORAGE_KEY_ISSUES, JSON.stringify(MOCK_ISSUES));
  }
  if (!localStorage.getItem(STORAGE_KEY_ACTIVITIES)) {
    localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(MOCK_ACTIVITIES));
  }
}

initializeStorage();

function getStoredIssues(): Issue[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ISSUES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Issues storage parse error', e);
  }
  return MOCK_ISSUES;
}

function saveStoredIssues(issues: Issue[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ISSUES, JSON.stringify(issues));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('commerceops:issue_updated'));
    }
  } catch (e) {
    console.error('Failed to save issues to localStorage', e);
  }
}

function getStoredActivities(): Activity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVITIES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Activities storage parse error', e);
  }
  return MOCK_ACTIVITIES;
}

function saveStoredActivities(activities: Activity[]): void {
  localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(activities));
}

export const issueService = {
  async getIssues(projectId?: string, filters?: IssueFilterParams): Promise<{ issues: Issue[]; total: number }> {
    await new Promise((res) => setTimeout(res, 120));
    let list = getStoredIssues();

    if (projectId) {
      list = list.filter((i) => i.projectId === projectId);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (i) =>
          i.id.toLowerCase().includes(q) ||
          i.title.toLowerCase().includes(q) ||
          i.assignee?.name.toLowerCase().includes(q) ||
          i.createdBy.name.toLowerCase().includes(q) ||
          i.labels.some((l) => l.toLowerCase().includes(q))
      );
    }

    if (filters?.status && filters.status !== 'all') {
      list = list.filter((i) => i.status === filters.status);
    }

    if (filters?.priority && filters.priority !== 'all') {
      list = list.filter((i) => i.priority === filters.priority);
    }

    if (filters?.assigneeId && filters.assigneeId !== 'all') {
      list = list.filter((i) => i.assignee?.id === filters.assigneeId);
    }

    // Sorting
    const sortBy = filters?.sortBy || 'updatedAt';
    const sortOrder = filters?.sortOrder || 'desc';

    list.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'id') {
        comparison = a.id.localeCompare(b.id);
      } else if (sortBy === 'priority') {
        const pOrder: Record<IssuePriority, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
        comparison = pOrder[a.priority] - pOrder[b.priority];
      } else {
        const dateA = new Date(a[sortBy] || a.createdAt).getTime();
        const dateB = new Date(b[sortBy] || b.createdAt).getTime();
        comparison = dateA - dateB;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    const total = list.length;
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const paginated = list.slice((page - 1) * limit, page * limit);

    return { issues: paginated, total };
  },

  async getIssueById(projectIdOrIssueId: string, issueIdOnly?: string): Promise<Issue | null> {
    await new Promise((res) => setTimeout(res, 100));
    const targetId = issueIdOnly || projectIdOrIssueId;
    const list = getStoredIssues();
    return list.find((i) => i.id.toUpperCase() === targetId.toUpperCase()) || null;
  },

  async getTeamMembers(projectId?: string): Promise<User[]> {
    await new Promise((res) => setTimeout(res, 50));
    return MOCK_USERS;
  },

  async createIssue(
    projectIdOrPayload: string | {
      projectId: string;
      title: string;
      description: string;
      priority: IssuePriority;
      assignee?: User;
      labels: string[];
      attachments?: Attachment[];
      createdBy: User;
    },
    payloadArg?: {
      title: string;
      description: string;
      priority: IssuePriority;
      assignee?: User;
      labels: string[];
      attachments?: Attachment[];
      createdBy: User;
    }
  ): Promise<Issue> {
    await new Promise((res) => setTimeout(res, 200));

    let payload: {
      projectId: string;
      title: string;
      description: string;
      priority: IssuePriority;
      assignee?: User;
      labels: string[];
      attachments?: Attachment[];
      createdBy: User;
    };

    if (typeof projectIdOrPayload === 'string' && payloadArg) {
      payload = { ...payloadArg, projectId: projectIdOrPayload };
    } else {
      payload = projectIdOrPayload as any;
    }

    const nextId = await projectService.generateNextIssueId(payload.projectId);
    const now = new Date().toISOString();

    const newIssue: Issue = {
      id: nextId,
      projectId: payload.projectId,
      title: payload.title,
      description: payload.description,
      status: 'Created',
      priority: payload.priority,
      createdBy: payload.createdBy,
      assignee: payload.assignee,
      createdAt: now,
      updatedAt: now,
      labels: payload.labels || [],
      attachments: payload.attachments || [],
      comments: [],
      activities: [
        {
          id: `act_${Date.now()}`,
          issueId: nextId,
          projectId: payload.projectId,
          user: payload.createdBy,
          action: 'Issue created',
          timestamp: now,
          type: 'created',
          details: `Created ${nextId} with ${payload.priority} priority`,
        },
      ],
    };

    const issues = getStoredIssues();
    issues.unshift(newIssue);
    saveStoredIssues(issues);

    const activities = getStoredActivities();
    activities.unshift(newIssue.activities![0]);
    saveStoredActivities(activities);

    return newIssue;
  },

  async updateIssueStatus(
    projectIdOrIssueId: string,
    issueIdOrStatus: string | IssueStatus,
    statusOrUser: IssueStatus | User,
    userArg?: User
  ): Promise<Issue> {
    await new Promise((res) => setTimeout(res, 150));

    let issueId: string;
    let status: IssueStatus;
    let user: User;

    if (userArg) {
      // 4 arguments: (projectId, issueId, status, user)
      issueId = issueIdOrStatus as string;
      status = statusOrUser as IssueStatus;
      user = userArg;
    } else {
      // 3 arguments: (issueId, status, user)
      issueId = projectIdOrIssueId;
      status = issueIdOrStatus as IssueStatus;
      user = statusOrUser as User;
    }

    const issues = getStoredIssues();
    const index = issues.findIndex((i) => i.id.toUpperCase() === issueId.toUpperCase());
    if (index === -1) throw new Error('Issue not found');

    const previousStatus = issues[index].status;
    const now = new Date().toISOString();

    issues[index].status = status;
    issues[index].updatedAt = now;
    saveStoredIssues(issues);

    const activity: Activity = {
      id: `act_${Date.now()}`,
      issueId: issues[index].id,
      projectId: issues[index].projectId,
      user,
      action: `Status changed to ${status}`,
      timestamp: now,
      type: 'status_change',
      details: `Changed from ${previousStatus} to ${status}`,
    };

    issues[index].activities = issues[index].activities || [];
    issues[index].activities.unshift(activity);

    const activities = getStoredActivities();
    activities.unshift(activity);
    saveStoredActivities(activities);

    return issues[index];
  },

  async updateIssueAssignee(
    projectIdOrIssueId: string,
    issueIdOrAssignee: string | null,
    assigneeOrUser?: string | null | User,
    userArg?: User
  ): Promise<Issue> {
    await new Promise((res) => setTimeout(res, 150));

    let issueId: string;
    let newAssigneeId: string | null;
    let user: User;

    if (userArg) {
      // 4 arguments: (projectId, issueId, assigneeId, user)
      issueId = issueIdOrAssignee as string;
      newAssigneeId = assigneeOrUser as string | null;
      user = userArg;
    } else {
      issueId = projectIdOrIssueId;
      newAssigneeId = issueIdOrAssignee;
      user = assigneeOrUser as User;
    }

    const issues = getStoredIssues();
    const index = issues.findIndex((i) => i.id.toUpperCase() === issueId.toUpperCase());
    if (index === -1) throw new Error('Issue not found');

    const newAssignee = newAssigneeId ? MOCK_USERS.find((u) => u.id === newAssigneeId) : undefined;
    const now = new Date().toISOString();

    issues[index].assignee = newAssignee;
    issues[index].updatedAt = now;
    saveStoredIssues(issues);

    const activity: Activity = {
      id: `act_${Date.now()}`,
      issueId: issues[index].id,
      projectId: issues[index].projectId,
      user,
      action: newAssignee ? `Assigned to ${newAssignee.name}` : 'Unassigned issue',
      timestamp: now,
      type: 'assigned',
    };

    issues[index].activities = issues[index].activities || [];
    issues[index].activities.unshift(activity);

    const activities = getStoredActivities();
    activities.unshift(activity);
    saveStoredActivities(activities);

    return issues[index];
  },

  async updateIssue(
    projectIdOrIssueId: string,
    issueIdOrUpdates: string | Partial<Issue>,
    updatesOrUser?: Partial<Issue> | User,
    userArg?: User,
    actionDetail?: string
  ): Promise<Issue> {
    await new Promise((res) => setTimeout(res, 180));

    let issueId: string;
    let updates: Partial<Issue>;
    let user: User;
    let actionDesc: string | undefined;

    if (typeof issueIdOrUpdates === 'string') {
      // (projectId, issueId, updates, user, actionDesc)
      issueId = issueIdOrUpdates;
      updates = updatesOrUser as Partial<Issue>;
      user = userArg!;
      actionDesc = actionDetail;
    } else {
      // (issueId, updates, user, actionDesc)
      issueId = projectIdOrIssueId;
      updates = issueIdOrUpdates as Partial<Issue>;
      user = updatesOrUser as User;
      actionDesc = userArg as any;
    }

    const issues = getStoredIssues();
    const index = issues.findIndex((i) => i.id.toUpperCase() === issueId.toUpperCase());
    if (index === -1) throw new Error('Issue not found');

    const now = new Date().toISOString();
    issues[index] = {
      ...issues[index],
      ...updates,
      updatedAt: now,
    };
    saveStoredIssues(issues);

    if (actionDesc) {
      const activity: Activity = {
        id: `act_${Date.now()}`,
        issueId: issues[index].id,
        projectId: issues[index].projectId,
        user,
        action: actionDesc,
        timestamp: now,
        type: 'version_update',
      };
      issues[index].activities = issues[index].activities || [];
      issues[index].activities.unshift(activity);

      const activities = getStoredActivities();
      activities.unshift(activity);
      saveStoredActivities(activities);
    }

    return issues[index];
  },

  async addComment(
    projectIdOrIssueId: string,
    issueIdOrContent: string,
    contentOrUser: string | User,
    userArg?: User
  ): Promise<IssueComment> {
    await new Promise((res) => setTimeout(res, 180));

    let issueId: string;
    let content: string;
    let author: User;

    if (userArg) {
      // 4 args: (projectId, issueId, content, user)
      issueId = issueIdOrContent;
      content = contentOrUser as string;
      author = userArg;
    } else {
      // 3 args: (issueId, content, user)
      issueId = projectIdOrIssueId;
      content = issueIdOrContent;
      author = contentOrUser as User;
    }

    const issues = getStoredIssues();
    const index = issues.findIndex((i) => i.id.toUpperCase() === issueId.toUpperCase());
    if (index === -1) throw new Error('Issue not found');

    const now = new Date().toISOString();
    const newComment: IssueComment = {
      id: `comm_${Date.now()}`,
      issueId,
      author,
      content,
      createdAt: now,
    };

    issues[index].comments = issues[index].comments || [];
    issues[index].comments.push(newComment);
    issues[index].updatedAt = now;

    const activity: Activity = {
      id: `act_${Date.now()}`,
      issueId,
      projectId: issues[index].projectId,
      user: author,
      action: 'Comment added',
      timestamp: now,
      type: 'comment',
      details: content.length > 60 ? `${content.substring(0, 60)}...` : content,
    };

    issues[index].activities = issues[index].activities || [];
    issues[index].activities.unshift(activity);
    saveStoredIssues(issues);

    const activities = getStoredActivities();
    activities.unshift(activity);
    saveStoredActivities(activities);

    return newComment;
  },

  async addAttachment(
    projectIdOrIssueId: string,
    issueIdOrAttachment: string | Attachment,
    attachmentOrUser?: Attachment | User,
    userArg?: User
  ): Promise<Attachment> {
    await new Promise((res) => setTimeout(res, 200));

    let issueId: string;
    let attachment: Attachment;
    let user: User;

    if (userArg) {
      issueId = issueIdOrAttachment as string;
      attachment = attachmentOrUser as Attachment;
      user = userArg;
    } else {
      issueId = projectIdOrIssueId;
      attachment = issueIdOrAttachment as Attachment;
      user = attachmentOrUser as User;
    }

    const issues = getStoredIssues();
    const index = issues.findIndex((i) => i.id.toUpperCase() === issueId.toUpperCase());
    if (index === -1) throw new Error('Issue not found');

    const now = new Date().toISOString();
    issues[index].attachments = issues[index].attachments || [];
    issues[index].attachments.push(attachment);
    issues[index].updatedAt = now;

    const activity: Activity = {
      id: `act_${Date.now()}`,
      issueId,
      projectId: issues[index].projectId,
      user,
      action: 'Attachment uploaded',
      timestamp: now,
      type: 'attachment',
      details: `Uploaded ${attachment.name}`,
    };

    issues[index].activities = issues[index].activities || [];
    issues[index].activities.unshift(activity);
    saveStoredIssues(issues);

    const activities = getStoredActivities();
    activities.unshift(activity);
    saveStoredActivities(activities);

    return attachment;
  },

  async getActivitiesForIssue(issueId: string): Promise<Activity[]> {
    await new Promise((res) => setTimeout(res, 80));
    const list = getStoredActivities();
    return list.filter((a) => a.issueId?.toUpperCase() === issueId.toUpperCase());
  },

  async getRecentActivities(projectId?: string, limit = 10): Promise<Activity[]> {
    await new Promise((res) => setTimeout(res, 100));
    let list = getStoredActivities();
    if (projectId) {
      list = list.filter((a) => !a.projectId || a.projectId === projectId);
    }
    return list.slice(0, limit);
  },
};
