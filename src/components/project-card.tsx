
import React from 'react';
import { Project } from '../types/project';

interface ProjectCardProps {
  project: Project;
  onOpen: (project: Project) => void;
  onDelete: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onOpen, onDelete }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
      onDelete(project.id);
    }
  };

  return (
    <div
      onClick={() => onOpen(project)}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.name}</h3>
          {project.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
          )}
        </div>
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1"
          title="Delete project"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
        {project.thumbnail ? (
          <img 
            src={project.thumbnail} 
            alt={`${project.name} thumbnail`}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="text-gray-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Updated {formatDate(project.updatedAt)}</span>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{formatDate(project.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};
