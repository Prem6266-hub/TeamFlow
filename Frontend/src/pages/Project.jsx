import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { editProject, fetchSingleProject } from '../features/project/projectSlice';
import CreateTask from '../components/createTask';
import { clearProjectTasks, fetchTasks } from '../features/task/taskSlice';
import TaskBoard from '../components/TaskBoard';
import { fetchSingleWorkspace, fetchWorkspaceMembers } from '../features/workspace/workspaceSlice';
import '../styles/Workspace.css';
import { joinWorkspaceRoom } from '../socket/socket';
import Footer from '../components/footer';
import { generateTasks } from '../features/ai/aiSlice';

function Project() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentProject } = useSelector((state) => state.project);
  const { tasks } = useSelector((state) => state.task);
  const { members, currentWorkspace } = useSelector((state) => state.workspace);
  const { user } = useSelector((state) => state.auth);

  const project = currentProject?.project;
  const currentUserId = user?._id || user?.id;
  const myAssignedTasks = (tasks || []).filter((task) => {
    const assignedId = task?.assignedTo?._id || task?.assignedTo;
    const normalizedAssignedId = assignedId ? String(assignedId) : '';
    const normalizedCurrentUserId = currentUserId ? String(currentUserId) : '';

    return Boolean(normalizedAssignedId && normalizedCurrentUserId && normalizedAssignedId === normalizedCurrentUserId);
  });
  const isWorkspaceOwner = Boolean(
    currentWorkspace?.owner &&
      (typeof currentWorkspace.owner === 'object'
        ? currentWorkspace.owner._id
        : currentWorkspace.owner) === (user?._id || user?.id)
  );
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: '', description: '' });

  useEffect(() => {
    dispatch(fetchSingleProject(projectId));
  }, [dispatch, projectId]);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchTasks(projectId));
    }
  }, [dispatch, projectId]);

  useEffect(() => {
    if (project?.workspace?._id || project?.workspace) {
      const workspaceId = project.workspace._id || project.workspace;
      joinWorkspaceRoom(workspaceId);
      dispatch(fetchSingleWorkspace(workspaceId));
      dispatch(fetchWorkspaceMembers(workspaceId));
    }
  }, [dispatch, project]);

  useEffect(() => {
    if (project) {
      setProjectForm({ name: project.name || '', description: project.description || '' });
    }
  }, [project]);

  const handleUpdateProject = async (e) => {
    e.preventDefault();

    if (!projectForm.name.trim()) return;

    const result = await dispatch(editProject({ projectId, projectData: projectForm }));

    if (editProject.fulfilled.match(result)) {
      setIsEditingProject(false);
      dispatch(fetchSingleProject(projectId));
    }
  };

  const handleGenerateTasks = async() => {
    if(!project?.name) return;

    await dispatch(generateTasks({
      projectTitle: project.name,
      projectId:project._id,
    }))

    await dispatch(fetchTasks(project._id));
  }

  const handleDeleteAllTasks = async () => {
    if (!project?._id) return;

    const result = await dispatch(clearProjectTasks(project._id));

    if (clearProjectTasks.fulfilled.match(result)) {
      await dispatch(fetchTasks(project._id));
    }
  };

  return (
    <>
    <div className="workspace-page">
      <section className="workspace-hero">
        <div className="workspace-hero__content">
          <span className="workspace-eyebrow">Project workspace</span>
          <h1 className="workspace-title">{project?.name || 'Project'}</h1>
          <p className="workspace-description">{project?.description || 'A focused space for planning and delivery.'}</p>
        </div>

        <div className="workspace-actions">
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Back
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setIsEditingProject((prev) => !prev)}
          >
            {isEditingProject ? 'Cancel' : 'Edit project'}
          </button>
        </div>
      </section>

      {isEditingProject && (
        <section className="workspace-card">
          <div className="workspace-card__header">
            <h2>Edit project</h2>
          </div>

          <form onSubmit={handleUpdateProject}>
            <div className="input-group">
              <label htmlFor="project-name">Project name</label>
              <input
                id="project-name"
                className="input"
                value={projectForm.name}
                onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                placeholder="Project name"
              />
            </div>

            <div className="input-group">
              <label htmlFor="project-description">Description</label>
              <textarea
                id="project-description"
                className="textarea"
                value={projectForm.description}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                placeholder="Describe this project"
              />
            </div>

            <button className="btn btn-primary" type="submit">
              Save changes
            </button>
          </form>
        </section>
      )}

      <section className="workspace-card" style={{ marginTop: 20 }}>
        <div className="workspace-card__header">
          <h2>Your assigned tasks</h2>
        </div>

        {myAssignedTasks.length ? (
          <div
            className="workspace-list"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              maxHeight: '320px',
              overflowY: 'auto',
              paddingRight: '6px',
            }}
          >
            {myAssignedTasks.map((task) => (
              <div key={task._id} className="workspace-card" style={{ padding: '16px', boxShadow: '0 8px 20px rgba(15, 23, 42, 0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--app-text)' }}>{task.title}</h3>
                  <span className="workspace-badge">{task.priority || 'medium'}</span>
                </div>
                <p style={{ margin: '0 0 10px', color: 'var(--app-muted)' }}>{task.description || 'No description provided.'}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span className="workspace-badge">{task.status || 'todo'}</span>
                  <button className="btn btn-secondary" onClick={() => navigate(`/task/${task._id}`)}>
                    Open task
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No tasks are currently assigned to you in this project.</div>
        )}
      </section>

      {isWorkspaceOwner ? (
        <section className="workspace-card" style={{ marginTop: 20 }}>
          <div className="workspace-card__header">
            <h2>Create task</h2>
          </div>
          <CreateTask projectId={projectId} members={members} canUploadAttachments={isWorkspaceOwner} canManageTasks={isWorkspaceOwner} />
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: 'min(100%, 240px)' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--app-border, #e2e8f0)' }} />
              <span style={{ color: 'var(--app-muted)', fontSize: '0.85rem', fontWeight: 600 }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--app-border, #e2e8f0)' }} />
            </div>
            <button
              className="btn btn-primary"
              onClick={handleGenerateTasks}
              style={{
                width: 'min(100%, 240px)',
                alignSelf: 'flex-start',
              }}
            >
              Generate Tasks with AI
            </button>
          </div>
        </section>
      ) : null}

      {isWorkspaceOwner ? (
        <section className="workspace-card" style={{ marginTop: 20 }}>
          <div className="workspace-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
            <h2>Task board</h2>
            <button
              className="btn btn-danger"
              onClick={handleDeleteAllTasks}
              style={{
                padding: '8px 12px',
                fontSize: '0.9rem',
                whiteSpace: 'nowrap',
                width: 'auto',
                maxWidth: '100%',
              }}
            >
              Delete all tasks
            </button>
          </div>
          <TaskBoard tasks={tasks} />
        </section>
      ) : null}
    </div>

    <Footer/>
    </>
    
  );
}

export default Project;
