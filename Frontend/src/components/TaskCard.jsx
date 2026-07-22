import React from 'react';
import { useNavigate } from 'react-router-dom';

function TaskCard({ task }) {
  if (!task) return null;

  const navigate = useNavigate();

  return (
    <div className="page-card taskboard-card" onClick={() => navigate(`/task/${task._id}`)}>
      <div className="project-top">
        <h4 className="project-title" style={{ marginBottom: '4px' }}>{task.title || 'Untitled task'}</h4>
        <span className="workspace-badge">{task.priority || 'normal'}</span>
      </div>
      <p className="project-description">{task.description || 'No description provided.'}</p>
      {task.dueDate ? <div className="member-meta">Due: {new Date(task.dueDate).toLocaleDateString()}</div> : null}
    </div>
  );
}

export default TaskCard;
