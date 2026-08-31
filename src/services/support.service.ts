import {
  SupportRequest,
  SupportStatus,
  SupportCategory,
  IssuePriority,
  SupportFilterParams,
  User,
  Attachment,
  Activity,
  IssueComment,
} from '../types';
import { MOCK_SUPPORT_REQUESTS } from '../mocks/mockData';

const STORAGE_KEY_SUPPORT = 'commerceops_support_requests';

function initializeSupportStorage() {
  if (!localStorage.getItem(STORAGE_KEY_SUPPORT)) {
    localStorage.setItem(STORAGE_KEY_SUPPORT, JSON.stringify(MOCK_SUPPORT_REQUESTS));
  }
}

initializeSupportStorage();

function getStoredSupport(): SupportRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SUPPORT);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Support storage parse error', e);
  }
  return MOCK_SUPPORT_REQUESTS;
}

function saveStoredSupport(requests: SupportRequest[]): void {
  localStorage.setItem(STORAGE_KEY_SUPPORT, JSON.stringify(requests));
}

export const supportService = {
  async getSupportRequests(
    filters?: SupportFilterParams
  ): Promise<{ requests: SupportRequest[]; total: number }> {
    await new Promise((res) => setTimeout(res, 120));
    let list = getStoredSupport();

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.subject.toLowerCase().includes(q) ||
          r.requestedBy.name.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)
      );
    }

    if (filters?.status && filters.status !== 'all') {
      list = list.filter((r) => r.status === filters.status);
    }

    if (filters?.priority && filters.priority !== 'all') {
      list = list.filter((r) => r.priority === filters.priority);
    }

    if (filters?.category && filters.category !== 'all') {
      list = list.filter((r) => r.category === filters.category);
    }

    // Sort
    const sortBy = filters?.sortBy || 'updatedAt';
    const sortOrder = filters?.sortOrder || 'desc';

    list.sort((a, b) => {
      let comp = 0;
      if (sortBy === 'id') {
        comp = a.id.localeCompare(b.id);
      } else if (sortBy === 'priority') {
        const pOrder: Record<IssuePriority, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
        comp = pOrder[a.priority] - pOrder[b.priority];
      } else {
        const dateA = new Date(a[sortBy] || a.createdAt).getTime();
        const dateB = new Date(b[sortBy] || b.createdAt).getTime();
        comp = dateA - dateB;
      }
      return sortOrder === 'asc' ? comp : -comp;
    });

    const total = list.length;
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const paginated = list.slice((page - 1) * limit, page * limit);

    return { requests: paginated, total };
  },

  async getRequests(filters?: SupportFilterParams): Promise<{ requests: SupportRequest[]; total: number }> {
    return this.getSupportRequests(filters);
  },

  async getSupportRequestById(requestId: string): Promise<SupportRequest | null> {
    await new Promise((res) => setTimeout(res, 80));
    const list = getStoredSupport();
    return list.find((r) => r.id.toUpperCase() === requestId.toUpperCase()) || null;
  },

  async getRequestById(requestId: string): Promise<SupportRequest | null> {
    return this.getSupportRequestById(requestId);
  },

  async generateNextRequestId(): Promise<string> {
    const list = getStoredSupport();
    let maxNum = 100;
    for (const item of list) {
      const match = item.id.match(/^SUP-(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
    return `SUP-${maxNum + 1}`;
  },

  async createSupportRequest(payload: {
    subject: string;
    description: string;
    category: SupportCategory;
    priority: IssuePriority;
    projectId?: string;
    attachments?: Attachment[];
    requestedBy: User;
  }): Promise<SupportRequest> {
    await new Promise((res) => setTimeout(res, 200));
    const nextId = await this.generateNextRequestId();
    const now = new Date().toISOString();

    const newRequest: SupportRequest = {
      id: nextId,
      subject: payload.subject,
      description: payload.description,
      category: payload.category,
      priority: payload.priority,
      status: 'Open',
      requestedBy: payload.requestedBy,
      createdAt: now,
      updatedAt: now,
      attachments: payload.attachments || [],
      comments: [],
      activities: [
        {
          id: `act_${Date.now()}`,
          supportRequestId: nextId,
          user: payload.requestedBy,
          action: 'Request created',
          timestamp: now,
          type: 'created',
        },
      ],
    };

    const list = getStoredSupport();
    list.unshift(newRequest);
    saveStoredSupport(list);

    return newRequest;
  },

  async createRequest(payload: {
    subject: string;
    description: string;
    category: SupportCategory;
    priority: IssuePriority;
    projectId?: string;
    attachments?: Attachment[];
    requestedBy: User;
  }): Promise<SupportRequest> {
    return this.createSupportRequest(payload);
  },

  async updateSupportStatus(
    requestId: string,
    status: SupportStatus,
    user: User
  ): Promise<SupportRequest> {
    await new Promise((res) => setTimeout(res, 150));
    const list = getStoredSupport();
    const index = list.findIndex((r) => r.id.toUpperCase() === requestId.toUpperCase());
    if (index === -1) throw new Error('Support request not found');

    const prev = list[index].status;
    const now = new Date().toISOString();

    list[index].status = status;
    list[index].updatedAt = now;

    const activity: Activity = {
      id: `act_${Date.now()}`,
      supportRequestId: requestId,
      user,
      action: `Status changed to ${status}`,
      timestamp: now,
      type: 'status_change',
      details: `Changed from ${prev} to ${status}`,
    };
    list[index].activities = list[index].activities || [];
    list[index].activities.unshift(activity);

    saveStoredSupport(list);
    return list[index];
  },

  async updateRequestStatus(
    requestId: string,
    status: SupportStatus,
    user: User
  ): Promise<SupportRequest> {
    return this.updateSupportStatus(requestId, status, user);
  },

  async addSupportComment(
    requestId: string,
    content: string,
    author: User
  ): Promise<IssueComment> {
    await new Promise((res) => setTimeout(res, 150));
    const list = getStoredSupport();
    const index = list.findIndex((r) => r.id.toUpperCase() === requestId.toUpperCase());
    if (index === -1) throw new Error('Support request not found');

    const now = new Date().toISOString();
    const comment: IssueComment = {
      id: `comm_sup_${Date.now()}`,
      issueId: requestId,
      author,
      content,
      createdAt: now,
    };

    list[index].comments = list[index].comments || [];
    list[index].comments.push(comment);
    list[index].updatedAt = now;

    list[index].activities = list[index].activities || [];
    list[index].activities.unshift({
      id: `act_${Date.now()}`,
      supportRequestId: requestId,
      user: author,
      action: 'Comment added',
      timestamp: now,
      type: 'comment',
      details: content.length > 50 ? `${content.substring(0, 50)}...` : content,
    });

    saveStoredSupport(list);
    return comment;
  },

  async addComment(
    requestId: string,
    content: string,
    author: User
  ): Promise<SupportRequest> {
    await this.addSupportComment(requestId, content, author);
    const updated = await this.getSupportRequestById(requestId);
    return updated!;
  },

  async addSupportAttachment(
    requestId: string,
    attachment: Attachment,
    user: User
  ): Promise<Attachment> {
    await new Promise((res) => setTimeout(res, 150));
    const list = getStoredSupport();
    const index = list.findIndex((r) => r.id.toUpperCase() === requestId.toUpperCase());
    if (index === -1) throw new Error('Support request not found');

    const now = new Date().toISOString();
    list[index].attachments = list[index].attachments || [];
    list[index].attachments.push(attachment);
    list[index].updatedAt = now;

    list[index].activities = list[index].activities || [];
    list[index].activities.unshift({
      id: `act_${Date.now()}`,
      supportRequestId: requestId,
      user,
      action: 'Attachment uploaded',
      timestamp: now,
      type: 'attachment',
      details: `Uploaded ${attachment.name}`,
    });

    saveStoredSupport(list);
    return attachment;
  },
};
