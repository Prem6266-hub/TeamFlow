import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { editProject, fetchSingleProject } from '../features/project/projectSlice';
import TaskBoard from '../components/TaskBoard';
import CreateTask from '../components/createTask';
import { fetchTasks } from '../features/task/taskSlice';
import { fetchWorkspaceMembers } from '../features/workspace/workspaceSlice';
import '../styles/Workspace.css';
import { joinWorkspaceRoom } from '../socket/socket';
import Footer from '../components/footer';

function Project() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentProject } = useSelector((state) => state.project);
  const { tasks } = useSelector((state) => state.task);
  const { members, currentWorkspace } = useSelector((state) => state.workspace);
  const { user } = useSelector((state) => state.auth);

  const project = currentProject?.project;
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

      <div className="workspace-grid">
        {isWorkspaceOwner ? (
          <section className="workspace-card">
            <div className="workspace-card__header">
              <h2>Create task</h2>
            </div>
            <CreateTask projectId={projectId} members={members} canUploadAttachments={isWorkspaceOwner} canManageTasks={isWorkspaceOwner} />
          </section>
        ) : null}

        <section className="workspace-card">
          <div className="workspace-card__header">
            <h2>Task board</h2>
          </div>
          <TaskBoard tasks={tasks} />
        </section>
      </div>
    </div>

    <Footer/>
    </>
    
  );
}

export default Project;
