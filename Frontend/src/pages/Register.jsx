import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../features/auth/authSlice';

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    skill: 'Frontend',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(register(formData));
  };

  if (user) navigate('/dashboard');

  return (
    <div className="auth-shell">
      <div className="auth-card page-card">
        <div className="auth-card__content">
          <span className="workspace-eyebrow">Join the team</span>
          <h1 className="workspace-title">Create your account</h1>
          <p className="workspace-description">Start organizing work with beautiful, collaborative spaces.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="name">Name</label>
            <input id="name" className="input" type="text" name="name" placeholder="Your name" value={formData.name} onChange={handleChange} />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input id="email" className="input" type="email" name="email" placeholder="name@example.com" value={formData.email} onChange={handleChange} />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input id="password" className="input" type="password" name="password" placeholder="Create a password" value={formData.password} onChange={handleChange} />
          </div>

          <div className="input-group">
            <label htmlFor="skill">Skill</label>
            <select id="skill" className="select" name="skill" value={formData.skill} onChange={handleChange}>
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Fullstack">Fullstack</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {error && <div className="form-error">{error}</div>}

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>

          <p className="auth-link">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;