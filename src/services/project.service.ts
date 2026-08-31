import { Project, Issue } from '../types';
import { MOCK_PROJECTS } from '../mocks/mockData';

const STORAGE_KEY_PROJECTS = 'commerceops_projects';
const STORAGE_KEY_ISSUES = 'commerceops_issues';

function getStoredProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROJECTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Projects parse error', e);
  }
  return MOCK_PROJECTS;
}

function saveStoredProjects(projects: Project[]): void {
  localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
}

export const projectService = {
  async getProjects(): Promise<Project[]> {
    await new Promise((res) => setTimeout(res, 100));
    return getStoredProjects();
  },

  async getProjectById(projectId: string): Promise<Project | null> {
    await new Promise((res) => setTimeout(res, 80));
    const projects = getStoredProjects();
    const found = projects.find((p) => p.id === projectId || p.code.toLowerCase() === projectId.toLowerCase());
    return found || projects[0] || null;
  },

  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    await new Promise((res) => setTimeout(res, 120));
    const projects = getStoredProjects();
    const index = projects.findIndex((p) => p.id === projectId || p.code.toLowerCase() === projectId.toLowerCase());
    if (index === -1) throw new Error('Project not found');

    projects[index] = { ...projects[index], ...updates };
    saveStoredProjects(projects);
    return projects[index];
  },

  async generateNextIssueId(projectId: string): Promise<string> {
    const project = await this.getProjectById(projectId);
    const code = project ? project.code : 'ISSUE';

    // Query existing issues for this project
    let issues: Issue[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ISSUES);
      if (raw) issues = JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }

    const projectIssues = issues.filter((i) => i.projectId === (project?.id || projectId) || i.id.startsWith(`${code}-`));

    let maxNum = 0;
    for (const issue of projectIssues) {
      const match = issue.id.match(new RegExp(`^${code}-(\\d+)$`, 'i'));
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }

    // Default base counts if fresh
    if (maxNum === 0) {
      if (code === 'DH') maxNum = 24;
      else if (code === 'FS') maxNum = 18;
      else if (code === 'NL') maxNum = 9;
      else maxNum = 1;
    }

    const nextNum = maxNum + 1;
    const formattedNum = String(nextNum).padStart(3, '0');
    return `${code}-${formattedNum}`;
  },
};
