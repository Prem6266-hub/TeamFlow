import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Twitter,
  LinkedIn,
  GitHub,
  YouTube,
  Send as SendIcon,
} from '@mui/icons-material';
import { subscribeToNewsletter } from '../services/newsletterApi';
import '../styles/Footer.css';

const footerSections = [
  {
    title: 'About',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setMessageType('error');
      setMessage('Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setMessageType('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setMessage('');
    
    try {
      const response = await subscribeToNewsletter(trimmedEmail);
      setMessageType('success');
      setMessage(response.data.message || 'Successfully subscribed to newsletter!');
      setEmail('');
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage('');
      }, 5000);
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setMessageType('error');
      
      // Get error message from response or use fallback
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        'Failed to subscribe. Please try again.';
      
      setMessage(errorMessage);
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage('');
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__content">
          
          {/* Brand & Newsletter Section */}
          <div className="footer__section footer__brand-section">
            <h3 className="footer__brand">🤝 TeamFlow</h3>
            <p className="footer__description">
              Streamline your team's workflow, track projects seamlessly, and boost output with TeamFlow.
            </p>

            {/* Newsletter Subscription */}
            <h4 className="footer__newsletter-title">Stay up to date</h4>
            <form className="footer__newsletter" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Enter your email"
                className="footer__input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
              <button 
                type="submit" 
                className="footer__button" 
                aria-label="Subscribe to newsletter"
                disabled={loading}
              >
                <SendIcon fontSize="small" />
              </button>
            </form>
            {message && (
              <div className={`footer__message footer__message--${messageType}`}>
                {message}
              </div>
            )}
          </div>

          {/* Navigation Links Columns */}
          {footerSections.map((section) => (
            <div key={section.title} className="footer__section">
              <h4 className="footer__section-title">{section.title}</h4>
              <ul className="footer__links">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('/') ? (
                      <Link to={link.href} className="footer__link">
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.href} className="footer__link">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer__divider" />

        {/* Bottom Bar: Copyright, Legal Links, and Social Icons */}
        <div className="footer__bottom">
          <p className="footer__copyright">
            © {new Date().getFullYear()} TeamFlow Inc. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="footer__socials">
            <a href="https://www.linkedin.com/in/prem-singh6268" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="LinkedIn">
              <LinkedIn fontSize="small" />
            </a>
            <a href="https://github.com/Prem6266-hub" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="GitHub">
              <GitHub fontSize="small" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}