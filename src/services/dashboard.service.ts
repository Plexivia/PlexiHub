import { Project, Issue, Activity, ServerMetrics, Deployment, Container, User } from '../types';
import { projectService } from './project.service';
import { issueService } from './issue.service';

export interface DashboardData {
  project: Project;
  serverMetrics: ServerMetrics;
  deployment: Deployment;
  containers: Container[];
  recentIssues: Issue[];
  recentActivities: Activity[];
}

export const dashboardService = {
  async getDashboardData(projectId: string): Promise<DashboardData> {
    const project = await projectService.getProjectById(projectId);
    if (!project) throw new Error('Project not found');

    const issuesResult = await issueService.getIssues(project.id, { limit: 5, sortBy: 'updatedAt', sortOrder: 'desc' });
    const activities = await issueService.getRecentActivities(project.id, 6);

    return {
      project,
      serverMetrics: project.serverMetrics,
      deployment: project.deploymentInfo,
      containers: project.containers,
      recentIssues: issuesResult.issues,
      recentActivities: activities,
    };
  },

  async getServerMetrics(projectId: string): Promise<ServerMetrics> {
    const project = await projectService.getProjectById(projectId);
    if (!project) throw new Error('Project not found');
    return project.serverMetrics;
  },

  async getContainers(projectId: string): Promise<Container[]> {
    const project = await projectService.getProjectById(projectId);
    if (!project) throw new Error('Project not found');
    return project.containers;
  },

  async getLastDeployment(projectId: string): Promise<Deployment> {
    const project = await projectService.getProjectById(projectId);
    if (!project) throw new Error('Project not found');
    return project.deploymentInfo;
  },

  async getRecentActivity(projectId: string, limit = 10): Promise<Activity[]> {
    return issueService.getRecentActivities(projectId, limit);
  },

  async triggerDeployment(projectId: string, user: User): Promise<Deployment> {
    await new Promise((res) => setTimeout(res, 800));
    const project = await projectService.getProjectById(projectId);
    if (!project) throw new Error('Project not found');

    const newDeploy: Deployment = {
      id: `dep_${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      environment: 'Production',
      status: 'Success',
      backendVersion: project.backendVersion,
      dashboardVersion: project.dashboardVersion,
      deployedAt: new Date().toISOString(),
      gitCommitHash: Math.random().toString(16).substring(2, 9),
      triggeredBy: user.name,
      releaseNotes: 'Triggered from Operations Portal Dashboard',
    };

    project.deploymentInfo = newDeploy;
    await projectService.updateProject(project.id, { deploymentInfo: newDeploy });
    return newDeploy;
  },
};
