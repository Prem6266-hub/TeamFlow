import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Privacy.css';

function Privacy() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="privacy-page">
      <div className="privacy-container">
        {/* Header */}
        <div className="privacy-header">
          <button className="privacy-back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1>Privacy Policy</h1>
          <p className="privacy-last-updated">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Content */}
        <div className="privacy-content">
          <section className="privacy-section">
            <h2>1. Introduction</h2>
            <p>
              TeamFlow ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you visit our website and use 
              our services.
            </p>
          </section>

          <section className="privacy-section">
            <h2>2. Information We Collect</h2>
            <p>We collect information in the following ways:</p>
            <ul className="privacy-list">
              <li>
                <strong>Account Information:</strong> Name, email address, password, and company information when you 
                create an account
              </li>
              <li>
                <strong>Profile Information:</strong> Additional details you provide in your user profile
              </li>
              <li>
                <strong>Content:</strong> Projects, tasks, files, and other content you create and upload
              </li>
              <li>
                <strong>Communication Data:</strong> Comments, messages, and other communications within the platform
              </li>
              <li>
                <strong>Usage Data:</strong> Information about how you interact with our service, including IP address, 
                browser type, and device information
              </li>
              <li>
                <strong>Cookies:</strong> We use cookies to enhance your experience and collect analytics data
              </li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect for the following purposes:</p>
            <ul className="privacy-list">
              <li>Providing, maintaining, and improving our services</li>
              <li>Personalizing your experience and delivering customized content</li>
              <li>Processing transactions and sending related information</li>
              <li>Sending promotional communications (with your consent)</li>
              <li>Monitoring and analyzing trends, usage, and activities</li>
              <li>Detecting, preventing, and addressing fraud and security issues</li>
              <li>Complying with legal obligations</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>4. Data Sharing and Disclosure</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties.
            </p>
          </section>

          <section className="privacy-section">
            <h2>5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against 
              unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the 
              Internet is 100% secure. While we strive to use commercially acceptable means to protect your personal 
              information, we cannot guarantee its absolute security.
            </p>
          </section>

          <section className="privacy-section">
            <h2>6. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to provide our services and fulfill the purposes 
              outlined in this Privacy Policy. You can request deletion of your account and associated data at any time by 
              contacting us.
            </p>
          </section>

          <section className="privacy-section">
            <h2>7. Your Rights and Choices</h2>
            <p>You have the following rights regarding your personal information:</p>
            <ul className="privacy-list">
              <li>
                <strong>Access:</strong> You can request access to your personal information
              </li>
              <li>
                <strong>Correction:</strong> You can request correction of inaccurate information
              </li>
              <li>
                <strong>Deletion:</strong> You can request deletion of your information
              </li>
              <li>
                <strong>Opt-out:</strong> You can opt-out of promotional communications
              </li>
              <li>
                <strong>Data Portability:</strong> You can request a copy of your data in a portable format
              </li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>8. Cookies and Tracking</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our website and store certain 
              information. You can instruct your browser to refuse all cookies or alert you when cookies are being sent. 
              However, some features of our service may not function properly if cookies are disabled.
            </p>
          </section>

          <section className="privacy-section">
            <h2>9. Children's Privacy</h2>
            <p>
              Our service is not intended for children under the age of 13. We do not knowingly collect personal information 
              from children under 13. If we become aware that we have collected such information, we will delete it 
              immediately.
            </p>
          </section>

          <section className="privacy-section">
            <h2>10. Third-Party Links</h2>
            <p>
              Our website and services may contain links to third-party websites. We are not responsible for the privacy 
              practices of these external sites. We encourage you to review the privacy policies of any third-party services 
              before providing your personal information.
            </p>
          </section>

          <section className="privacy-section">
            <h2>11. International Data Transfers</h2>
            <p>
              If you are located outside the country where our servers are located, your information may be transferred to, 
              stored in, and processed in countries other than your country of residence. By using our service, you consent 
              to such transfers.
            </p>
          </section>

          <section className="privacy-section">
            <h2>12. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal 
              requirements, and other factors. We will notify you of any significant changes by posting the updated policy 
              on our website and updating the "Last updated" date above.
            </p>
          </section>

          <section className="privacy-section">
            <h2>13. Contact Us</h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please 
              contact us at:
            </p>
            <div className="contact-info">
              <p><strong>Email:</strong> privacy@teamflow.com</p>
              <p><strong>Address:</strong> TeamFlow Inc., 123 Main Street, Your City, Your Country</p>
            </div>
          </section>

          <section className="privacy-section">
            <h2>14. Compliance with Regulations</h2>
            <p>
              TeamFlow complies with applicable data protection regulations including GDPR, CCPA, and other regional 
              privacy laws. If you have rights under these regulations, please contact us and we will honor your requests 
              in accordance with applicable law.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Privacy;
