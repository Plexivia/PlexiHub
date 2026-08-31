import { create } from 'zustand';
import { Project } from '../types';
import { projectService } from '../services/project.service';
import { MOCK_PROJECTS } from '../mocks/mockData';

interface ProjectState {
  projects: Project[];
  currentProjectId: string;
  currentProject: Project | null;
  isLoading: boolean;
  setProjects: (projects: Project[]) => void;
  selectProject: (projectId: string) => void;
  loadProjects: () => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: MOCK_PROJECTS,
  currentProjectId: MOCK_PROJECTS[0].id,
  currentProject: MOCK_PROJECTS[0],
  isLoading: false,

  setProjects: (projects) => {
    const currentId = get().currentProjectId;
    const current = projects.find((p) => p.id === currentId) || projects[0] || null;
    set({ projects, currentProject: current, currentProjectId: current?.id || '' });
  },

  selectProject: (projectId) => {
    const project = get().projects.find((p) => p.id === projectId || p.code.toLowerCase() === projectId.toLowerCase());
    if (project) {
      set({ currentProjectId: project.id, currentProject: project });
    }
  },

  loadProjects: async () => {
    set({ isLoading: true });
    try {
      const list = await projectService.getProjects();
      const currentId = get().currentProjectId;
      const current = list.find((p) => p.id === currentId) || list[0] || null;
      set({
        projects: list,
        currentProject: current,
        currentProjectId: current?.id || '',
        isLoading: false,
      });
    } catch (e) {
      console.error(e);
      set({ isLoading: false });
    }
  },
}));
