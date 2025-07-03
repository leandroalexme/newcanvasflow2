import React from 'react';
import './ProjectControls.css';

const ProjectControls = ({ onExportClick }) => (
  <div className="project-controls-container">
    <div className="project-selector">
      <span>Untitled Project</span>
      <span className="dropdown-arrow">▼</span>
    </div>
    <div className="controls-divider" />
    <button className="export-button" onClick={onExportClick}>Export</button>
    <button className="create-button">+ Create</button>
  </div>
);

export default ProjectControls; 