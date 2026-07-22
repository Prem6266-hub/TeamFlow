import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import "../styles/Workspace.css";

import {
  fetchSingleWorkspace,
  fetchWorkspaceMembers,
  fetchWorkspaceActivities,
  inviteWorkspaceMember,
  editWorkspace,
  clearWorkspaceActivitiesAction,
} from "../features/workspace/workspaceSlice";
import { fetchProjects, createNewProject } from "../features/project/projectSlice";
import { addNotification } from "../features/notification/notificationSlice";
import { joinWorkspaceRoom } from "../socket/socket";
import Footer from "../components/footer";

function Workspace() {
  const { workSpaceId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentWorkspace, members, activities, loading } = useSelector((state) => state.workspace);
  const { projects } = useSelector((state) => state.project);
  const { user } = useSelector((state) => state.auth);

  const [inviteEmail, setInviteEmail] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [isEditingWorkspace, setIsEditingWorkspace] = useState(false);
  const [workspaceForm, setWorkspaceForm] = useState({ name: "", description: "" });
  const [inviteFeedback, setInviteFeedback] = useState({ type: "", message: "" });
  const currentUserId = user?._id || user?.id;
  const isWorkspaceOwner = Boolean(
    currentWorkspace?.owner &&
      (typeof currentWorkspace.owner === "object" ? currentWorkspace.owner._id : currentWorkspace.owner) === currentUserId
  );

  useEffect(() => {
    if (!workSpaceId) return;

    joinWorkspaceRoom(workSpaceId);
    dispatch(fetchSingleWorkspace(workSpaceId));
    dispatch(fetchWorkspaceMembers(workSpaceId));
    dispatch(fetchWorkspaceActivities(workSpaceId));
    dispatch(fetchProjects(workSpaceId));
  }, [dispatch, workSpaceId]);

  useEffect(() => {
    if (currentWorkspace) {
      setWorkspaceForm({
        name: currentWorkspace.name || "",
        description: currentWorkspace.description || "",
      });
    }
  }, [currentWorkspace]);

  const handleInvite = async (e) => {
    e.preventDefault();

    if (!inviteEmail.trim()) {
      setInviteFeedback({ type: "error", message: "Please enter an email address." });
      return;
    }

    const result = await dispatch(inviteWorkspaceMember({ workSpaceId, email: inviteEmail.trim() }));

    if (inviteWorkspaceMember.fulfilled.match(result)) {
      setInviteEmail("");
      setInviteFeedback({ type: "success", message: "User added successfully." });
      dispatch(fetchWorkspaceMembers(workSpaceId));
    } else {
      setInviteFeedback({
        type: "error",
        message: result.payload || "Could not send the invitation right now.",
      });
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();

    if (!projectName.trim()) return;

    const result = await dispatch(
      createNewProject({
        name: projectName.trim(),
        description: projectDescription.trim(),
        workSpaceId,
      }),
    );

    if (createNewProject.fulfilled.match(result)) {
      dispatch(addNotification({
        _id: `project-${Date.now()}`,
        id: `project-${Date.now()}`,
        message: `${user?.name || "You"} created project "${projectName.trim()}"`,
        type: "PROJECT_CREATED",
        sender: user,
        createdAt: new Date().toISOString(),
      }));
      setProjectName("");
      setProjectDescription("");
      dispatch(fetchProjects(workSpaceId));
    }
  };

  const handleUpdateWorkspace = async (e) => {
    e.preventDefault();

    if (!workspaceForm.name.trim()) return;

    const result = await dispatch(
      editWorkspace({
        workSpaceId,
        workspaceData: {
          name: workspaceForm.name.trim(),
          description: workspaceForm.description.trim(),
        },
      }),
    );

    if (editWorkspace.fulfilled.match(result)) {
      setIsEditingWorkspace(false);
      dispatch(fetchSingleWorkspace(workSpaceId));
    }
  };

  const handleClearActivities = async () => {
    const result = await dispatch(clearWorkspaceActivitiesAction(workSpaceId));

    if (clearWorkspaceActivitiesAction.fulfilled.match(result)) {
      dispatch(fetchWorkspaceActivities(workSpaceId));
    }
  };

  return (
    <>
    <div className="workspace-page">
      <section className="workspace-hero">
        <div className="workspace-hero__content">
          <span className="workspace-eyebrow">Workspace overview</span>
          <h1 className="workspace-title">{currentWorkspace?.name || "Loading workspace..."}</h1>
          <p className="workspace-description">
            {currentWorkspace?.description || "A collaborative place for your team to manage projects and tasks."}
          </p>

          <div className="workspace-meta">
            <span className="workspace-badge">{members?.length || 0} members</span>
            <span className="workspace-badge">{projects?.length || 0} projects</span>
            <span className="workspace-badge">{activities?.length || 0} activities</span>
          </div>
        </div>

        <div className="workspace-actions">
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Back
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              if (isEditingWorkspace) {
                setIsEditingWorkspace(false);
                setWorkspaceForm({
                  name: currentWorkspace?.name || "",
                  description: currentWorkspace?.description || "",
                });
              } else {
                setIsEditingWorkspace(true);
              }
            }}
          >
            {isEditingWorkspace ? "Cancel" : "Manage workspace"}
          </button>
        </div>
      </section>

      {isEditingWorkspace && (
        <section className="workspace-card">
          <div className="workspace-card__header">
            <h2>Edit workspace</h2>
          </div>

          <form onSubmit={handleUpdateWorkspace}>
            <div className="input-group">
              <label htmlFor="workspace-name">Workspace name</label>
              <input
                id="workspace-name"
                className="input"
                value={workspaceForm.name}
                onChange={(e) => setWorkspaceForm({ ...workspaceForm, name: e.target.value })}
                placeholder="Workspace name"
              />
            </div>

            <div className="input-group">
              <label htmlFor="workspace-description">Description</label>
              <textarea
                id="workspace-description"
                className="textarea"
                value={workspaceForm.description}
                onChange={(e) => setWorkspaceForm({ ...workspaceForm, description: e.target.value })}
                placeholder="Describe this workspace"
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
          <div className="workspace-card">
            <div className="workspace-card__header">
              <h2>Invite members</h2>
            </div>

            <form onSubmit={handleInvite}>
              <div className="input-group">
                <label htmlFor="member-email">Email address</label>
                <input
                  id="member-email"
                  className="input"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="name@example.com"
                />
              </div>
              <button className="btn btn-primary" type="submit">
                Invite member
              </button>
              {inviteFeedback.message ? (
                <div className={`form-feedback ${inviteFeedback.type}`}>{inviteFeedback.message}</div>
              ) : null}
            </form>
          </div>
        ) : null}

        <div className="workspace-card">
          <div className="workspace-card__header">
            <h2>Create project</h2>
          </div>

          <form onSubmit={handleCreateProject}>
            <div className="input-group">
              <label htmlFor="project-name">Project name</label>
              <input
                id="project-name"
                className="input"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Project name"
              />
            </div>

            <div className="input-group">
              <label htmlFor="project-description">Description</label>
              <textarea
                id="project-description"
                className="textarea"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Describe this project"
              />
            </div>

            <button className="btn btn-primary" type="submit">
              Create project
            </button>
          </form>
        </div>
      </div>

      <div className="workspace-grid">
        <section className="workspace-card">
          <div className="workspace-card__header">
            <h2>Workspace members</h2>
          </div>

          {loading && !members.length ? (
            <div className="empty-state">Loading members...</div>
          ) : members.length ? (
            <div className="member-list">
              {members.map((member) => (
                <div className="member-card" key={member._id}>
                  <div className="member-info">
                    <span className="member-name">
                      {member.name || member.email || "Member"}
                    </span>
                    {member.email && <span className="member-email">{member.email}</span>}
                    <span className="member-meta">
                      {member.online ? <span className="online-badge" /> : null}
                      {member.online ? "Online now" : "Offline"}
                    </span>
                  </div>
                  {member._id === currentWorkspace?.owner?._id && (
                    <span className="workspace-badge">Owner</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No members yet.</div>
          )}
        </section>

        <section className="workspace-card">
          <div className="workspace-card__header">
            <h2>Recent activity</h2>
            {isWorkspaceOwner ? (
              <button className="btn btn-secondary" type="button" onClick={handleClearActivities}>
                Clear all
              </button>
            ) : null}
          </div>

          {activities.length ? (
            <div className="activity-list">
              {activities.map((activity) => (
                <div className="activity-card" key={activity._id}>
                  <div className="activity-user">{activity.user?.name || "System"}</div>
                  <div className="activity-text">{activity.action || activity.message}</div>
                  <div className="activity-time">
                    {new Date(activity.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No activity yet.</div>
          )}
        </section>
      </div>

      <section className="workspace-card">
        <div className="workspace-card__header">
          <h2>Projects</h2>
        </div>

        {projects.length ? (
          <div className="project-list">
            {projects.map((project) => (
              <div
                className="project-card"
                key={project._id}
                onClick={() => navigate(`/projects/${project._id}`)}
              >
                <div className="project-top">
                  <h3 className="project-title">{project.name}</h3>
                  <span className="workspace-badge">{project.createdBy?.name || "Creator"}</span>
                </div>
                <p className="project-description">
                  {project.description || "No description yet."}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No projects added to this workspace yet.</div>
        )}
      </section>
    </div>

    <Footer/>
    </>
    
  );
}

export default Workspace;
