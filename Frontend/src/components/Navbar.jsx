import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { logout, updateProfile } from '../features/auth/authSlice';
import { clearAllNotifications, closeNotificationModal, deleteNotification, fetchNotifications, openNotificationModal, removeNotification, syncNotifications } from '../features/notification/notificationSlice';
import { resetWorkspaceState } from '../features/workspace/workspaceSlice';
import { useEffect, useRef, useState } from 'react';

function Navbar({ theme, setTheme }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, error } = useSelector((state) => state.auth);
  const { currentWorkspace } = useSelector((state) => state.workspace);
  const { items, modalOpen } = useSelector((state) => state.notification);
  const [draggedId, setDraggedId] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [scrolled, setScrolled] = useState(false);
  const [scrollGlowVisible, setScrollGlowVisible] = useState(false);
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    if (user) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, user]);

  useEffect(() => {
    setProfileForm({ name: user?.name || '', email: user?.email || '' });
  }, [user]);

  useEffect(() => {
    const shouldLockScroll = modalOpen || profileOpen || mobileOpen;
    document.body.style.overflow = shouldLockScroll ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [modalOpen, profileOpen, mobileOpen]);

  useEffect(() => {
    const handleStorageSync = (event) => {
      if (event.key === 'teamflow-notifications' && event.newValue) {
        try {
          dispatch(syncNotifications(JSON.parse(event.newValue)));
        } catch (error) {
          console.error('Failed to sync notifications from storage', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageSync);
    return () => window.removeEventListener('storage', handleStorageSync);
  }, [dispatch]);

  useEffect(() => {
    const resetRoutes = ['/dashboard', '/workspace', '/login', '/register'];
    if (resetRoutes.includes(location.pathname)) {
      dispatch(resetWorkspaceState());
    }
  }, [dispatch, location.pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const shouldElevate = window.scrollY > 6;
      setScrolled(shouldElevate);
      setScrollGlowVisible(true);

      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = window.setTimeout(() => {
        setScrollGlowVisible(false);
      }, 220);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleRemove = (id) => {
    dispatch(deleteNotification(id));
    setDraggedId(null);
  };

  const handleOpenNotifications = () => {
    dispatch(fetchNotifications());
    dispatch(openNotificationModal());
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      name: profileForm.name.trim(),
      email: profileForm.email.trim(),
    };

    const result = await dispatch(updateProfile(payload));

    if (updateProfile.fulfilled.match(result)) {
      setProfileOpen(false);
    }
  };

  const hasActiveWorkspace = Boolean(currentWorkspace?._id || currentWorkspace?.id);
  const shouldShowWorkspaceLink = hasActiveWorkspace && !['/dashboard', '/workspace', '/login', '/register'].includes(location.pathname);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard' },
    ...(shouldShowWorkspaceLink ? [{ to: `/workspace/${currentWorkspace._id || currentWorkspace.id}`, label: currentWorkspace?.name || 'Workspace' }] : []),
  ];

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
        <div className={`navbar__scroll-glow ${scrollGlowVisible ? 'visible' : ''}`} />
        <div className="navbar__brand" onClick={() => { navigate('/dashboard'); setMobileOpen(false); }}>
          <span className="navbar__brand-icon">⚡</span>
          <span>TeamFlow</span>
        </div>

        <button className="navbar__toggle" onClick={() => setMobileOpen((prev) => !prev)} aria-label="Toggle navigation">
          ☰
        </button>

        <div className="navbar__links">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}>
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="navbar__actions">
          <button
            className={`theme-toggle ${theme === 'dark' ? 'theme-toggle--active' : ''}`}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <span className="theme-toggle__icon">{theme === 'dark' ? '☀' : '☾'}</span>
            <span className="theme-toggle__label">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
          <button className="btn btn-secondary" onClick={handleOpenNotifications}>
            Notifications {items.length ? `(${items.length})` : ''}
          </button>
          <button className="btn btn-secondary" onClick={() => setProfileOpen(true)}>
            Hi, {user?.name?.split(' ')[0] || 'User'}
          </button>
          <button className="btn btn-secondary" onClick={() => dispatch(logout())}>
            Logout
          </button>
        </div>
      </nav>

      {mobileOpen ? <div className="navbar__backdrop" onClick={() => setMobileOpen(false)} /> : null}

      <div className={`navbar__mobile-panel ${mobileOpen ? 'open' : ''}`}>
        <div className="navbar__mobile-head">
          <div className="navbar__brand" onClick={() => { navigate('/dashboard'); setMobileOpen(false); }}>
            <span className="navbar__brand-icon">⚡</span>
            <span>TeamFlow</span>
          </div>
          <button className="navbar__close" onClick={() => setMobileOpen(false)} aria-label="Close navigation">✕</button>
        </div>

        <div className="navbar__mobile-user">
          <div className="navbar__mobile-avatar">{(user?.name || 'U').charAt(0).toUpperCase()}</div>
          <div>
            <p className="navbar__mobile-user-name">{user?.name || 'User'}</p>
            <p className="navbar__mobile-user-email">{user?.email || 'teamflow@example.com'}</p>
          </div>
        </div>

        <div className="navbar__mobile-links">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `navbar__link navbar__link--panel${isActive ? ' active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="navbar__mobile-actions">
          <button
            className={`theme-toggle ${theme === 'dark' ? 'theme-toggle--active' : ''}`}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <span className="theme-toggle__icon">{theme === 'dark' ? '☀' : '☾'}</span>
            <span className="theme-toggle__label">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
          <button className="btn btn-secondary navbar__mobile-btn" onClick={handleOpenNotifications}>
            Notifications {items.length ? `(${items.length})` : ''}
          </button>
          <button className="btn btn-secondary navbar__mobile-btn" onClick={() => { setProfileOpen(true); setMobileOpen(false); }}>
            Profile
          </button>
          <button className="btn btn-secondary navbar__mobile-btn" onClick={() => { dispatch(logout()); setMobileOpen(false); }}>
            Logout
          </button>
        </div>
      </div>

      {profileOpen ? (
        <div className="notification-modal-backdrop" onClick={() => setProfileOpen(false)}>
          <div className="notification-modal" onClick={(event) => event.stopPropagation()}>
            <div className="notification-modal__header">
              <h3>Profile settings</h3>
              <button className="btn btn-secondary" onClick={() => setProfileOpen(false)}>Close</button>
            </div>
            <form className="notification-list" onSubmit={handleProfileSubmit}>
              <div className="input-group">
                <label htmlFor="profile-name">Name</label>
                <input
                  id="profile-name"
                  className="input"
                  value={profileForm.name}
                  onChange={(event) => setProfileForm((prev) => ({ ...prev, name: event.target.value }))}
                />
              </div>
              <div className="input-group">
                <label htmlFor="profile-email">Email</label>
                <input
                  id="profile-email"
                  className="input"
                  type="email"
                  value={profileForm.email}
                  onChange={(event) => setProfileForm((prev) => ({ ...prev, email: event.target.value }))}
                />
              </div>
              {error ? <p className="notification-empty">{error}</p> : null}
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save changes'}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {modalOpen ? (
        <div className="notification-modal-backdrop" onClick={() => dispatch(closeNotificationModal())}>
          <div className="notification-modal" onClick={(event) => event.stopPropagation()}>
            <div className="notification-modal__header">
              <h3>Notifications</h3>
              <div className="notification-modal__actions">
                {items.length ? (
                  <button className="btn btn-secondary" onClick={() => dispatch(clearAllNotifications())}>Clear all</button>
                ) : null}
                <button className="btn btn-secondary" onClick={() => dispatch(closeNotificationModal())}>Close</button>
              </div>
            </div>

            <div className="notification-list">
              {items.length === 0 ? (
                <p className="notification-empty">No notifications yet.</p>
              ) : (
                items.map((item) => (
                  <div
                    key={item._id}
                    className={`notification-card ${draggedId === item._id ? 'swiped' : ''}`}
                    onTouchStart={() => setDraggedId(item._id)}
                    onTouchEnd={() => setDraggedId(null)}
                    onMouseLeave={() => setDraggedId(null)}
                  >
                    <div>
                      <p className="notification-message">{item.message}</p>
                      <span className="notification-meta">
                        {item.sender?.name || 'System'} • {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <button className="notification-remove" onClick={() => handleRemove(item._id)}>
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default Navbar;
