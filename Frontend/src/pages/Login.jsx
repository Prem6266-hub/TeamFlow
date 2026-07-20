import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../features/auth/authSlice';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const { user, loading, error } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  return (
    <div className="auth-shell">
      <div className="auth-card page-card">
        <div className="auth-card__content">
          <span className="workspace-eyebrow">Welcome back</span>
          <h1 className="workspace-title">Login to TeamFlow</h1>
          <p className="workspace-description">Plan projects, track deliverables, and collaborate effortlessly.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input id="email" className="input" type="email" name="email" placeholder="name@example.com" value={formData.email} onChange={handleChange} />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input id="password" className="input" type="password" name="password" placeholder="Enter password" value={formData.password} onChange={handleChange} />
          </div>

          {error && <div className="form-error">{error}</div>}

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>

          <p className="auth-link">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;