import { useDispatch } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { logout } from '../features/auth/authSlice';

function Sidebar({ isOpen, onClose, theme, setTheme }) {

  const dispatch = useDispatch();
  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: '◉' },
  ];

  return (
    <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <span className="sidebar-brand__icon">⚡</span>
        <span>TeamFlow</span>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to + link.label}
            to={link.to}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <span className="sidebar-link__icon">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>
        <button className="btn btn-secondary" onClick={() => dispatch(logout())}>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;