import { User, Issue, IssueStatus } from '../types';
import { MOCK_USERS } from '../mocks/mockData';
import { issueService } from './issue.service';

export interface CollaborationEvent {
  id: string;
  type: 'status_change' | 'comment_added' | 'assignee_change' | 'priority_change';
  actor: User;
  issue: Issue;
  oldStatus?: IssueStatus;
  newStatus?: IssueStatus;
  commentPreview?: string;
  timestamp: string;
}

type EventListener = (event: CollaborationEvent) => void;

class CollaborationManager {
  private isRunning: boolean = true;
  private timer: any = null;
  private listeners: Set<EventListener> = new Set();
  private lastEvent: CollaborationEvent | null = null;

  constructor() {
    // Delay first start slightly after app mount
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        this.start();
      }, 5000);
    }
  }

  public isSimulationActive(): boolean {
    return this.isRunning;
  }

  public getLastEvent(): CollaborationEvent | null {
    return this.lastEvent;
  }

  public getOnlineTeammates(currentUserId?: string): User[] {
    return MOCK_USERS.filter((u) => u.id !== currentUserId);
  }

  public subscribe(listener: EventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public start(): void {
    if (this.timer) clearInterval(this.timer);
    this.isRunning = true;
    // Simulate collaborative updates every 24-38 seconds
    const intervalMs = Math.floor(Math.random() * (38000 - 24000 + 1) + 24000);
    this.timer = setInterval(() => {
      this.triggerRandomSimulation();
    }, intervalMs);
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
  }

  public toggle(): boolean {
    if (this.isRunning) {
      this.stop();
    } else {
      this.start();
    }
    return this.isRunning;
  }

  public async triggerManualSimulation(currentUserId?: string): Promise<CollaborationEvent | null> {
    return this.triggerRandomSimulation(currentUserId);
  }

  private async triggerRandomSimulation(currentUserId?: string): Promise<CollaborationEvent | null> {
    try {
      // 1. Fetch available issues
      const { issues } = await issueService.getIssues();
      if (!issues || issues.length === 0) return null;

      // 2. Filter candidate actors (exclude current user if provided)
      const potentialActors = MOCK_USERS.filter((u) => u.id !== currentUserId);
      const actor = potentialActors[Math.floor(Math.random() * potentialActors.length)] || MOCK_USERS[1];

      // 3. Pick a random active issue
      const activeIssues = issues.filter((i) => i.status !== 'Resolved' && i.status !== 'Closed');
      const targetIssue = activeIssues.length > 0
        ? activeIssues[Math.floor(Math.random() * activeIssues.length)]
        : issues[Math.floor(Math.random() * issues.length)];

      // 4. Decide action type (status change is 70% weighted)
      const actionRoll = Math.random();

      if (actionRoll < 0.7) {
        // Status transition sequence
        const statusFlow: Record<IssueStatus, IssueStatus[]> = {
          Created: ['Open', 'In Progress'],
          Open: ['In Progress', 'Waiting for Client'],
          'In Progress': ['Waiting for Client', 'Resolved'],
          'Waiting for Client': ['In Progress', 'Resolved'],
          Resolved: ['Closed', 'Open'],
          Closed: ['Open'],
        };

        const possibleNext = statusFlow[targetIssue.status] || ['In Progress'];
        const newStatus = possibleNext[Math.floor(Math.random() * possibleNext.length)];

        if (newStatus !== targetIssue.status) {
          const oldStatus = targetIssue.status;
          const updated = await issueService.updateIssueStatus(
            targetIssue.projectId,
            targetIssue.id,
            newStatus,
            actor
          );

          const event: CollaborationEvent = {
            id: `evt_${Date.now()}`,
            type: 'status_change',
            actor,
            issue: updated,
            oldStatus,
            newStatus,
            timestamp: new Date().toISOString(),
          };

          this.broadcast(event);
          return event;
        }
      } else if (actionRoll < 0.88) {
        // Add a realistic progress comment
        const sampleComments = [
          'Investigated the latency spike. Upstream DB connection pool recycled and normalized.',
          'Pushed hotfix patch to staging environment for validation.',
          'Checked Prometheus telemetry: CPU threshold dropped back below 35%.',
          'Verified with payment gateway provider; webhook backlog is now fully drained.',
          'Rollout canary metrics look stable across all 3 regional clusters.',
          'Applied query optimization index to orders table. Latency down by 82ms.',
        ];
        const commentContent = sampleComments[Math.floor(Math.random() * sampleComments.length)];

        await issueService.addComment(targetIssue.projectId, targetIssue.id, commentContent, actor);

        // Fetch updated issue
        const refreshed = await issueService.getIssueById(targetIssue.projectId, targetIssue.id);

        const event: CollaborationEvent = {
          id: `evt_${Date.now()}`,
          type: 'comment_added',
          actor,
          issue: refreshed || targetIssue,
          commentPreview: commentContent,
          timestamp: new Date().toISOString(),
        };

        this.broadcast(event);
        return event;
      } else {
        // Reassign issue
        const otherTeammates = MOCK_USERS.filter((u) => u.id !== targetIssue.assignee?.id);
        const newAssignee = otherTeammates[Math.floor(Math.random() * otherTeammates.length)];

        const updated = await issueService.updateIssueAssignee(
          targetIssue.projectId,
          targetIssue.id,
          newAssignee?.id || null,
          actor
        );

        const event: CollaborationEvent = {
          id: `evt_${Date.now()}`,
          type: 'assignee_change',
          actor,
          issue: updated,
          timestamp: new Date().toISOString(),
        };

        this.broadcast(event);
        return event;
      }
    } catch (err) {
      console.warn('Simulation event failed:', err);
    }
    return null;
  }

  private broadcast(event: CollaborationEvent): void {
    this.lastEvent = event;

    // Dispatch global window event for cross-component listeners
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('commerceops:collaborative_event', {
          detail: event,
        })
      );
      window.dispatchEvent(
        new CustomEvent('commerceops:issue_updated', {
          detail: { issueId: event.issue.id, projectId: event.issue.projectId },
        })
      );
    }

    // Notify registered listeners
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (e) {
        console.error('Error in collaboration event listener', e);
      }
    });
  }
}

export const collaborationService = new CollaborationManager();
