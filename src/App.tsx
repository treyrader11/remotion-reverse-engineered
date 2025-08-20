
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProjectsPage } from './pages/projects-page';
import { EditorPage } from './pages/editor-page';
import './timeline/globals.css';

export const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProjectsPage />} />
        <Route path="/editor/:projectId" element={<EditorPage />} />
      </Routes>
    </Router>
  );
};
