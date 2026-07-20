import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';

function Header({ theme, setTheme }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  return (
    <header className="app-header workspace-hero">
      <div className="app-header__content">
        <div className="workspace-eyebrow">Hello, {user?.name || 'there'}</div>
        <h2 className="workspace-title app-header__title">Keep your team moving forward.</h2>
      </div>

      <div className="header-actions">
        <button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>
        <button className="btn btn-secondary" onClick={() => dispatch(logout())}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;