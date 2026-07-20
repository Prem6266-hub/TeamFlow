import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchWorkspaces } from '../features/workspace/workspaceSlice';
import WorkspaceCard from '../components/WorkspaceCard';
import CreateWorkspaceModal from '../components/CreateWorkspaceModal';

function Dashboard() {
  const dispatch = useDispatch();
  const { workspaces, loading } = useSelector((state) => state.workspace);

  useEffect(() => {
    dispatch(fetchWorkspaces());
  }, [dispatch]);

  return (
    <div className="workspace-page">
      <section className="workspace-hero">
        <div className="workspace-hero__content">
          <span className="workspace-eyebrow">Workspace hub</span>
          <h1 className="workspace-title">Your collaborative command center</h1>
          <p className="workspace-description">Create workspaces, invite teammates, and keep every project moving in one place.</p>
        </div>

        <div className="workspace-actions">
          <CreateWorkspaceModal />
        </div>
      </section>

      <section className="workspace-card">
        <div className="workspace-card__header">
          <h2>My workspaces</h2>
        </div>

        {loading ? (
          <div className="empty-state">Loading your workspaces...</div>
        ) : workspaces.length ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {workspaces.map((workspace) => (
              <WorkspaceCard key={workspace._id} workspace={workspace} />
            ))}
          </div>
        ) : (
          <div className="empty-state">No workspaces yet. Create your first one to get started.</div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;