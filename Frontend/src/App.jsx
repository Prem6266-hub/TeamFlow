import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './routes/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import PublicRoute from './routes/PublicRoute';
import Workspace from './pages/Workspace';
import Project from './pages/Project';
import Task from './pages/Task';
import About from './pages/About';
import Privacy from './pages/Privacy';
import DashboardLayout from './layouts/DashboardLayout';
import { connectSocket, disconnectSocket } from './socket/socket';
import { fetchProjects } from './features/project/projectSlice';
import { fetchAttachments, fetchComments, fetchTask, fetchTasks } from './features/task/taskSlice';
import { fetchWorkspaceActivities, fetchWorkspaceMembers, setOnlineMembers } from './features/workspace/workspaceSlice';
import { addNotification } from './features/notification/notificationSlice';

function AppShell() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const [theme, setTheme] = useState(() => localStorage.getItem('teamflow-theme') || 'light');
  const [socketNotice, setSocketNotice] = useState('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('teamflow-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!socketNotice) return;

    const timer = window.setTimeout(() => {
      setSocketNotice('');
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [socketNotice]);

  useEffect(() => {
    if (!user) {
      disconnectSocket();
      return;
    }

    const userId = user._id || user.id;
    const socket = connectSocket(userId);

    const handleOnlineUsers = (payload) => {
      dispatch(setOnlineMembers(payload));
    };

    const handleActivityCreated = (payload) => {
      const workspaceMatch = location.pathname.match(/\/workspace\/([^/]+)/);
      if (workspaceMatch) {
        dispatch(fetchWorkspaceActivities(workspaceMatch[1]));
      }
      setSocketNotice(payload?.action ? `Activity: ${payload.action}` : 'A workspace activity was updated.');
    };

    const handleProjectCreated = (payload) => {
      const workspaceMatch = location.pathname.match(/\/workspace\/([^/]+)/);
      if (workspaceMatch) {
        dispatch(fetchProjects(workspaceMatch[1]));
        dispatch(fetchWorkspaceActivities(workspaceMatch[1]));
      }
      setSocketNotice(payload?.name ? `New project created: ${payload.name}` : 'A new project was added.');
    };

    const handleTaskCreated = (payload) => {
      const projectMatch = location.pathname.match(/\/projects\/([^/]+)/);
      const taskMatch = location.pathname.match(/\/task\/([^/]+)/);
      if (projectMatch) {
        dispatch(fetchTasks(projectMatch[1]));
      } else if (taskMatch) {
        dispatch(fetchTask(taskMatch[1]));
      }
      setSocketNotice(payload?.title ? `New task created: ${payload.title}` : 'A new task was added.');
    };

    const handleAttachmentDeleted = () => {
      const taskMatch = location.pathname.match(/\/task\/([^/]+)/);
      if (taskMatch) {
        dispatch(fetchAttachments(taskMatch[1]));
      }
      setSocketNotice('An attachment was removed.');
    };

    const handleNewNotification = (payload) => {
      dispatch(addNotification(payload));
      setSocketNotice(payload?.message || 'You have a new notification.');
    };

    socket.on('onlineUsers', handleOnlineUsers);
    socket.on('activityCreated', handleActivityCreated);
    socket.on('projectCreated', handleProjectCreated);
    socket.on('taskCreated', handleTaskCreated);
    socket.on('attachmentDeleted', handleAttachmentDeleted);
    socket.on('newNotification', handleNewNotification);

    return () => {
      socket.off('onlineUsers', handleOnlineUsers);
      socket.off('activityCreated', handleActivityCreated);
      socket.off('projectCreated', handleProjectCreated);
      socket.off('taskCreated', handleTaskCreated);
      socket.off('attachmentDeleted', handleAttachmentDeleted);
      socket.off('newNotification', handleNewNotification);
    };
  }, [dispatch, user, location.pathname]);

  const layoutWrapper = (children) => <DashboardLayout theme={theme} setTheme={setTheme}>{children}</DashboardLayout>;

  return (
    <>
      {socketNotice ? (
        <div className="socket-toast" onClick={() => setSocketNotice('')}>
          {socketNotice}
        </div>
      ) : null}

      <Routes>
        <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />

        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />

        <Route path="/dashboard" element={<ProtectedRoute>{layoutWrapper(<Dashboard />)}</ProtectedRoute>} />
        <Route path="/workspace/:workSpaceId" element={<ProtectedRoute>{layoutWrapper(<Workspace />)}</ProtectedRoute>} />
        <Route path="/projects/:projectId" element={<ProtectedRoute>{layoutWrapper(<Project />)}</ProtectedRoute>} />
        <Route path="/task/:taskId" element={<ProtectedRoute>{layoutWrapper(<Task />)}</ProtectedRoute>} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
