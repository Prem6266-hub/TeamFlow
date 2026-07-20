import React from 'react';
import { useNavigate } from 'react-router-dom';

function WorkspaceCard({ workspace }) {
  const navigate = useNavigate();

  return (
    <div className="page-card workspace-card" onClick={() => navigate(`/workspace/${workspace._id}`)} style={{ cursor: 'pointer' }}>
      <div className="project-top">
        <h3 className="project-title">{workspace.name}</h3>
        <span className="workspace-badge">Open</span>
      </div>
      <p className="project-description">{workspace.description || 'No description yet.'}</p>
      <div className="workspace-meta">
        <span className="workspace-badge">Owner: {workspace.owner?.name || 'You'}</span>
      </div>
    </div>
  );
}

export default WorkspaceCard;
