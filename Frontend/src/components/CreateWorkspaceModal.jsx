import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createNewWorkspace } from '../features/workspace/workspaceSlice';

function CreateWorkspaceModal() {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    dispatch(createNewWorkspace({ name, description }));
    setName('');
    setDescription('');
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} style={{ minWidth: '280px' }}>
      <div className="input-group">
        <label>Workspace name</label>
        <input className="input" placeholder="Workspace Name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="input-group">
        <label>Description</label>
        <textarea className="textarea" placeholder="Describe your workspace" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <button className="btn btn-primary" type="submit">
        Create workspace
      </button>
    </form>
  );
}

export default CreateWorkspaceModal;