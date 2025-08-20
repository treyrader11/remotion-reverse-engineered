
import { useState, useEffect } from 'react';
import { Project } from '../types/project';

const PROJECTS_STORAGE_KEY = 'timeline-projects';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (stored) {
      try {
        const parsedProjects = JSON.parse(stored).map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt)
        }));
        setProjects(parsedProjects);
      } catch (error) {
        console.error('Failed to load projects:', error);
      }
    }
  }, []);

  const saveProjects = (newProjects: Project[]) => {
    setProjects(newProjects);
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(newProjects));
  };

  const createProject = (name: string, description?: string): Project => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name,
      description,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const updatedProjects = [...projects, newProject];
    saveProjects(updatedProjects);
    return newProject;
  };

  const updateProject = (id: string, updates: Partial<Project>): void => {
    const updatedProjects = projects.map(p => 
      p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
    );
    saveProjects(updatedProjects);
  };

  const deleteProject = (id: string): void => {
    const updatedProjects = projects.filter(p => p.id !== id);
    saveProjects(updatedProjects);
  };

  const getProject = (id: string): Project | undefined => {
    return projects.find(p => p.id === id);
  };

  return {
    projects,
    createProject,
    updateProject,
    deleteProject,
    getProject
  };
}
