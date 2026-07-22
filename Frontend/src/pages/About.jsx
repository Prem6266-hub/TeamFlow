import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../styles/About.css';

function About() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="about-page">
      <div className="about-container">
        {/* Header */}
        <div className="about-header">
          <button className="about-back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1>About TeamFlow</h1>
        </div>

        {/* Main Content */}
        <div className="about-content">
          <section className="about-section">
            <h2>Our Mission</h2>
            <p>
              At TeamFlow, we believe that great teamwork starts with clear communication and efficient workflows. 
              Our mission is to empower teams of all sizes to collaborate seamlessly, manage projects effectively, 
              and achieve their goals faster.
            </p>
          </section>

          <section className="about-section">
            <h2>What We Do</h2>
            <p>
              TeamFlow is a comprehensive project management and team collaboration platform designed to streamline 
              your workflow. With intuitive task management, real-time notifications, activity tracking, and seamless 
              workspace collaboration, TeamFlow helps your team stay organized and productive.
            </p>
          </section>

          <section className="about-section">
            <h2>Key Features</h2>
            <div className="features-grid">
              <div className="feature-card">
                <h3>Project Management</h3>
                <p>Organize and track projects with intuitive workflows and real-time updates.</p>
              </div>
              <div className="feature-card">
                <h3>Task Organization</h3>
                <p>Break down projects into manageable tasks with clear deadlines and assignees.</p>
              </div>
              <div className="feature-card">
                <h3>Real-time Collaboration</h3>
                <p>Work together in real-time with instant notifications and activity feeds.</p>
              </div>
              <div className="feature-card">
                <h3>Team Workspaces</h3>
                <p>Create separate workspaces for different teams and manage permissions easily.</p>
              </div>
              <div className="feature-card">
                <h3>Activity Tracking</h3>
                <p>Stay informed with comprehensive activity logs of all team actions.</p>
              </div>
              <div className="feature-card">
                <h3>Notifications</h3>
                <p>Never miss important updates with smart notifications and alerts.</p>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>Why Choose TeamFlow?</h2>
            <ul className="about-list">
              <li><strong>User-Friendly:</strong> Intuitive interface that requires minimal training</li>
              <li><strong>Real-time Updates:</strong> Stay connected with instant notifications and live activity feeds</li>
              <li><strong>Scalable:</strong> Works for small teams and large enterprises alike</li>
              <li><strong>Secure:</strong> Your data is encrypted and protected</li>
              <li><strong>Reliable:</strong> Built on modern, robust technology stack</li>
              <li><strong>Support:</strong> Dedicated support team ready to help</li>
            </ul>
          </section>

          <section className="about-section">
            <h2>Our Values</h2>
            <div className="values-grid">
              <div className="value-card">
                <h3>🎯 Simplicity</h3>
                <p>We believe in keeping things simple and intuitive for our users.</p>
              </div>
              <div className="value-card">
                <h3>🤝 Collaboration</h3>
                <p>We foster teamwork and open communication at every level.</p>
              </div>
              <div className="value-card">
                <h3>📈 Growth</h3>
                <p>We continuously improve and evolve to meet our users' needs.</p>
              </div>
              <div className="value-card">
                <h3>🔒 Trust</h3>
                <p>We earn your trust through transparency and reliability.</p>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>Get Started Today</h2>
            <p>
              Join thousands of teams already using TeamFlow to streamline their workflows and boost productivity. 
              Ready to transform the way your team works?
            </p>
            <div className="about-actions">
              {user ? (
                <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <button className="btn btn-primary" onClick={() => navigate('/login')}>
                    Sign In
                  </button>
                  <button className="btn btn-secondary" onClick={() => navigate('/register')}>
                    Create Account
                  </button>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default About;
