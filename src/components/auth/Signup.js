import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCalendar,
  FaVenusMars,
  FaExclamationCircle,
  FaSpinner,
  FaUserPlus,
  FaGoogle,
  FaFacebook,
  FaTimes,
  FaCheck,
  FaShieldAlt,
  FaFileContract,
  FaChevronRight,
  FaExternalLinkAlt
} from 'react-icons/fa';
import './styles/Signup.css'
import { useAuth } from '../../context/AuthContext';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthdate: '',
    gender: '',
    terms: false
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [activeSection, setActiveSection] = useState('overview'); // For terms modal navigation
  
  const navigate = useNavigate();
  const { register, loading: authLoading } = useAuth();

  useEffect(() => {
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const maxDateStr = minDate.toISOString().split('T')[0];
    const dateInput = document.getElementById('signupBirthdate');
    if (dateInput) {
      dateInput.max = maxDateStr;
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, id } = e.target;
    const fieldName = name || id;
    if (!fieldName) return;
    
    setFormData({
      ...formData,
      [fieldName]: type === 'checkbox' ? checked : value
    });
    if (errors[fieldName]) {
      setErrors({
        ...errors,
        [fieldName]: ''
      });
    }
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.birthdate) {
      newErrors.birthdate = 'Birthdate is required';
    } else {
      const birthDate = new Date(formData.birthdate);
      const age = calculateAge(birthDate);
      if (age < 18) {
        newErrors.birthdate = 'You must be at least 18 years old';
      }
    }
    
    if (!formData.gender) {
      newErrors.gender = 'Please select your gender';
    }
    
    if (!formData.terms) {
      newErrors.terms = 'You must agree to the terms and conditions';
    }
    
    return newErrors;
  };

  const isValidEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    const signupData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      birthdate: formData.birthdate,
      gender: formData.gender
    };
    
    const result = await register(signupData);
    
    if (result.success) {
      navigate('/profile-setup');
    } else {
      if (result.error && result.error.includes('already exists')) {
        setErrors({ email: 'An account with this email already exists' });
      } else {
        setErrors({ 
          general: result.error || 'Registration failed. Please try again.' 
        });
      }
    }
  };

  const handleSocialSignup = (provider) => {
    console.log(`Signup with ${provider}`);
    // OAuth login 
  };

  const openTermsModal = (e) => {
    e.preventDefault();
    setShowTermsModal(true);
    setActiveSection('overview');
  };

  const openPrivacyModal = (e) => {
    e.preventDefault();
    setShowPrivacyModal(true);
  };

  const closeTermsModal = () => {
    setShowTermsModal(false);
  };

  const closePrivacyModal = () => {
    setShowPrivacyModal(false);
  };

  const TermsModalContent = () => {
    const termsSections = [
      { id: 'overview', title: 'Overview', content: 'These Terms of Service govern your use of Mdates and provide information about the Mdates service.' },
      { id: 'account', title: 'Account Creation', content: 'You must be at least 18 years old to create an account. You are responsible for maintaining the security of your account.' },
      { id: 'content', title: 'Content Guidelines', content: 'You agree not to post content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, or otherwise objectionable.' },
      { id: 'conduct', title: 'User Conduct', content: 'You agree to treat all users with respect and not engage in harassment, discrimination, or abusive behavior.' },
      { id: 'privacy', title: 'Privacy', content: 'Your privacy is important to us. Please review our Privacy Policy to understand how we collect and use your information.' },
      { id: 'termination', title: 'Termination', content: 'We reserve the right to terminate or suspend your account at any time for violations of these terms.' },
      { id: 'changes', title: 'Changes to Terms', content: 'We may modify these terms at any time. We will notify you of significant changes.' },
      { id: 'contact', title: 'Contact Us', content: 'For questions about these Terms of Service, please contact us at legal@mdates.com' }
    ];

    const getCurrentDate = () => {
      const now = new Date();
      return now.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };

    return (
      <div className="legal-modal-content">
        <div className="legal-header">
          <div className="legal-header-icon">
            <FaFileContract />
          </div>
          <div>
            <h3>Terms of Service</h3>
            <div className="legal-meta">
              <span className="legal-version">Version 2.1</span>
              <span className="legal-date">Last Updated: {getCurrentDate()}</span>
            </div>
          </div>
        </div>

        <div className="legal-content-container">
          <div className="legal-sidebar">
            <div className="legal-sidebar-header">Contents</div>
            <div className="legal-sidebar-items">
              {termsSections.map((section) => (
                <button
                  key={section.id}
                  className={`legal-sidebar-item ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <span>{section.title}</span>
                  <FaChevronRight />
                </button>
              ))}
            </div>
          </div>

          <div className="legal-main-content">
            <div className="legal-section">
              <h4>{termsSections.find(s => s.id === activeSection)?.title}</h4>
              <p>{termsSections.find(s => s.id === activeSection)?.content}</p>
              
              {activeSection === 'overview' && (
                <>
                  <div className="legal-highlight">
                    <div className="legal-highlight-icon">
                      <FaCheck />
                    </div>
                    <div>
                      <h5>Key Points</h5>
                      <ul>
                        <li>You must be at least 18 years old to use Mdates</li>
                        <li>You are responsible for your account security</li>
                        <li>Respect all users and maintain appropriate conduct</li>
                        <li>We may update these terms with prior notice</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="legal-requirements">
                    <h5>By using Mdates, you agree to:</h5>
                    <div className="requirements-grid">
                      <div className="requirement-item">
                        <div className="requirement-icon">✓</div>
                        <span>Provide accurate information</span>
                      </div>
                      <div className="requirement-item">
                        <div className="requirement-icon">✓</div>
                        <span>Maintain respectful interactions</span>
                      </div>
                      <div className="requirement-item">
                        <div className="requirement-icon">✓</div>
                        <span>Not engage in harassment</span>
                      </div>
                      <div className="requirement-item">
                        <div className="requirement-icon">✓</div>
                        <span>Follow community guidelines</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {activeSection === 'contact' && (
                <div className="legal-contact">
                  <h5>Need Help?</h5>
                  <div className="contact-options">
                    <div className="contact-option">
                      <strong>Email:</strong> legal@mdates.com
                    </div>
                    <div className="contact-option">
                      <strong>Response Time:</strong> 1-3 business days
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PrivacyModalContent = () => {
    const privacySections = [
      { id: 'data', title: 'Data We Collect', content: 'We collect information you provide directly, such as your name, email, profile information, and messages.' },
      { id: 'usage', title: 'How We Use Your Data', content: 'We use your information to provide and improve our services, personalize your experience, and communicate with you.' },
      { id: 'sharing', title: 'Information Sharing', content: 'We do not sell your personal information. We may share information with service providers who assist in operating our platform.' },
      { id: 'security', title: 'Security', content: 'We implement industry-standard security measures to protect your information from unauthorized access.' },
      { id: 'rights', title: 'Your Rights', content: 'You have the right to access, correct, or delete your personal information. Contact us to exercise these rights.' },
      { id: 'cookies', title: 'Cookies', content: 'We use cookies to enhance your experience. You can control cookie settings through your browser.' },
      { id: 'children', title: "Children's Privacy", content: 'Our services are not intended for individuals under 18 years of age.' },
      { id: 'updates', title: 'Policy Updates', content: 'We may update this policy periodically. We will notify you of significant changes.' }
    ];

    return (
      <div className="legal-modal-content">
        <div className="legal-header">
          <div className="legal-header-icon privacy">
            <FaShieldAlt />
          </div>
          <div>
            <h3>Privacy Policy</h3>
            <div className="legal-meta">
              <span className="legal-version">Version 3.0</span>
              <span className="legal-date">Effective Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>

        <div className="legal-content-container">
          <div className="privacy-content">
            <div className="privacy-intro">
              <h4>Your Privacy Matters</h4>
              <p>At Mdates, we are committed to protecting your privacy and being transparent about how we handle your information.</p>
            </div>

            <div className="privacy-sections">
              {privacySections.map((section) => (
                <div key={section.id} className="privacy-section">
                  <h5>{section.title}</h5>
                  <p>{section.content}</p>
                  
                  {section.id === 'data' && (
                    <div className="data-categories">
                      <h6>Types of Data:</h6>
                      <div className="data-grid">
                        <div className="data-category">
                          <div className="data-category-header">
                            <div className="data-category-icon">📝</div>
                            <span>Personal Information</span>
                          </div>
                          <ul>
                            <li>Name & Email</li>
                            <li>Date of Birth</li>
                            <li>Gender</li>
                            <li>Profile Photos</li>
                          </ul>
                        </div>
                        <div className="data-category">
                          <div className="data-category-header">
                            <div className="data-category-icon">💬</div>
                            <span>Communication Data</span>
                          </div>
                          <ul>
                            <li>Messages</li>
                            <li>Matches</li>
                            <li>Preferences</li>
                            <li>Interests</li>
                          </ul>
                        </div>
                        <div className="data-category">
                          <div className="data-category-header">
                            <div className="data-category-icon">📊</div>
                            <span>Usage Data</span>
                          </div>
                          <ul>
                            <li>App Activity</li>
                            <li>Device Information</li>
                            <li>Location (if enabled)</li>
                            <li>Log Data</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {section.id === 'security' && (
                    <div className="security-features">
                      <h6>Security Measures:</h6>
                      <div className="features-grid">
                        <div className="feature-item">
                          <div className="feature-icon">🔒</div>
                          <div>
                            <strong>Encryption</strong>
                            <span>End-to-end message encryption</span>
                          </div>
                        </div>
                        <div className="feature-item">
                          <div className="feature-icon">🛡️</div>
                          <div>
                            <strong>Access Control</strong>
                            <span>Strict access permissions</span>
                          </div>
                        </div>
                        <div className="feature-item">
                          <div className="feature-icon">📋</div>
                          <div>
                            <strong>Regular Audits</strong>
                            <span>Security compliance checks</span>
                          </div>
                        </div>
                        <div className="feature-item">
                          <div className="feature-icon">👁️</div>
                          <div>
                            <strong>Transparency</strong>
                            <span>Clear data practices</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="privacy-footer">
              <div className="privacy-notice">
                <h5>Your Choices</h5>
                <p>You can manage your privacy settings at any time through your account settings.</p>
                <div className="privacy-actions">
                  <button className="privacy-action-btn">
                    <FaExternalLinkAlt />
                    Download Your Data
                  </button>
                  <button className="privacy-action-btn secondary">
                    <FaExternalLinkAlt />
                    Manage Preferences
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      <div className="auth-page" id="signupPage">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="logo-icon">M</div>
            <h1>Mdates</h1>
          </div>
          <h2>Create Your Account</h2>
          <p>Join our community to find meaningful relationships</p>
        </div>

        <form className="auth-form" id="signupForm" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="form-error" style={{ marginBottom: '20px' }}>
              <FaExclamationCircle /> {errors.general}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="signupName">Full Name</label>
            <div className="input-with-icon">
              <FaUser className="input-icon" />
              <input
                type="text"
                id="signupName"
                name="name"
                className="form-input"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={authLoading}
              />
            </div>
            {errors.name && <div className="form-error" id="signupNameError">
              <FaExclamationCircle /> {errors.name}
            </div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signupEmail">Email Address</label>
            <div className="input-with-icon">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                id="signupEmail"
                name="email"
                className="form-input"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={authLoading}
              />
            </div>
            {errors.email && <div className="form-error" id="signupEmailError">
              <FaExclamationCircle /> {errors.email}
            </div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signupPassword">Password</label>
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                id="signupPassword"
                name="password"
                className="form-input"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={authLoading}
              />
              <button
                type="button"
                className="password-toggle"
                id="signupPasswordToggle"
                onClick={() => togglePasswordVisibility('password')}
                disabled={authLoading}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <div className="form-error" id="signupPasswordError">
              <FaExclamationCircle /> {errors.password}
            </div>}
            <div className="form-hint">Use at least 8 characters with a mix of letters, numbers, and symbols</div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signupConfirmPassword">Confirm Password</label>
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="signupConfirmPassword"
                name="confirmPassword"
                className="form-input"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={authLoading}
              />
              <button
                type="button"
                className="password-toggle"
                id="signupConfirmPasswordToggle"
                onClick={() => togglePasswordVisibility('confirm')}
                disabled={authLoading}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirmPassword && <div className="form-error" id="signupConfirmPasswordError">
              <FaExclamationCircle /> {errors.confirmPassword}
            </div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signupBirthdate">Date of Birth</label>
            <div className="input-with-icon">
              <FaCalendar className="input-icon" />
              <input
                type="date"
                id="signupBirthdate"
                name="birthdate"
                className="form-input"
                value={formData.birthdate}
                onChange={handleChange}
                required
                disabled={authLoading}
              />
            </div>
            {errors.birthdate && <div className="form-error" id="signupBirthdateError">
              <FaExclamationCircle /> {errors.birthdate}
            </div>}
            <div className="form-hint">You must be at least 18 years old to join</div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signupGender">Gender</label>
            <div className="input-with-icon">
              <FaVenusMars className="input-icon" />
              <select
                id="signupGender"
                name="gender"
                className="form-input"
                value={formData.gender}
                onChange={handleChange}
                required
                disabled={authLoading}
              >
                <option value="">Select your gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            {errors.gender && <div className="form-error" id="signupGenderError">
              <FaExclamationCircle /> {errors.gender}
            </div>}
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                id="signupTerms"
                name="terms"
                className="checkbox-input"
                checked={formData.terms}
                onChange={handleChange}
                required
                disabled={authLoading}
              />
              <span>I agree to the <button type="button" className="legal-link" onClick={openTermsModal}>Terms of Service</button> and <button type="button" className="legal-link" onClick={openPrivacyModal}>Privacy Policy</button></span>
            </label>
            {errors.terms && <div className="form-error" id="signupTermsError">
              <FaExclamationCircle /> {errors.terms}
            </div>}
          </div>

          <button
            type="submit"
            className="auth-button"
            id="signupButton"
            disabled={authLoading}
          >
            {authLoading ? (
              <FaSpinner className="fa-spin" />
            ) : (
              <FaUserPlus />
            )}
            {authLoading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="auth-divider">
            <span>Or sign up with</span>
          </div>
          <div className="social-login">
            <button
              type="button"
              className="social-button google"
              onClick={() => handleSocialSignup('google')}
              disabled={authLoading}
            >
              <FaGoogle />
              Continue with Google
            </button>
            <button
              type="button"
              className="social-button facebook"
              onClick={() => handleSocialSignup('facebook')}
              disabled={authLoading}
            >
              <FaFacebook />
              Continue with Facebook
            </button>
          </div>

          <div className="auth-redirect">
            Already have an account? <Link to="/login" id="goToLoginLink">Sign in here</Link>
          </div>
        </form>
      </div>

      {/* Terms of Service Modal */}
      {showTermsModal && (
        <div className="modal-overlay">
          <div className="modal-container legal-modal">
            <div className="modal-header">
              <div className="modal-title-section">
                <h3>Terms of Service</h3>
              </div>
              <button 
                className="modal-close-btn"
                onClick={closeTermsModal}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-content legal-content">
              <TermsModalContent />
            </div>

            <div className="modal-footer">
              <button 
                className="auth-button primary"
                onClick={closeTermsModal}
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="modal-overlay">
          <div className="modal-container legal-modal">
            <div className="modal-header">
              <div className="modal-title-section">
                <h3>Privacy Policy</h3>
              </div>
              <button 
                className="modal-close-btn"
                onClick={closePrivacyModal}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-content legal-content">
              <PrivacyModalContent />
            </div>

            <div className="modal-footer">
              <button 
                className="auth-button primary"
                onClick={closePrivacyModal}
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;