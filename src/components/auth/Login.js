import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaExclamationCircle,
  FaSpinner,
  FaSignInAlt,
  FaGoogle,
  FaFacebook,
  FaApple,
  FaTimes,
  FaPaperPlane,
  FaCheckCircle,
  FaKey
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './styles/Login.css'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: '',
    isLoading: false,
    isSent: false,
    error: ''
  });
  
  const navigate = useNavigate();
  const { login, loading: authLoading } = useAuth();

  const handleChange = (e) => {
    const { name, value, id } = e.target;
    const fieldName = name || id;
    
    if (!fieldName) return;
    setFormData({
      ...formData,
      [fieldName]: value
    });
    if (errors[fieldName]) {
      setErrors({
        ...errors,
        [fieldName]: ''
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    return newErrors;
  };

  const isValidEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const result = await login(formData.email, formData.password);
    if (result.success) {
      if (result.data?.user?.profile_complete || result.data?.profile_complete) {
        navigate('/home');
      } else {
        navigate('/profile-setup');
      }
    } else {
      setErrors({ 
        general: result.error || 'Invalid email or password' 
      });
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`Login with ${provider}`);
    // oath login
  };

  const handleForgotPassword = () => {
    setShowForgotPasswordModal(true);
    setForgotPasswordData({
      email: '',
      isLoading: false,
      isSent: false,
      error: ''
    });
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotPasswordData.email.trim()) {
      setForgotPasswordData(prev => ({ ...prev, error: 'Email is required' }));
      return;
    }
    
    if (!isValidEmail(forgotPasswordData.email)) {
      setForgotPasswordData(prev => ({ ...prev, error: 'Please enter a valid email address' }));
      return;
    }

    setForgotPasswordData(prev => ({ ...prev, isLoading: true, error: '' }));
    
    // Simulate API call
    setTimeout(() => {
      setForgotPasswordData(prev => ({ 
        ...prev, 
        isLoading: false, 
        isSent: true 
      }));
      
      // Auto close after 3 seconds
      setTimeout(() => {
        setShowForgotPasswordModal(false);
        setForgotPasswordData({
          email: '',
          isLoading: false,
          isSent: false,
          error: ''
        });
      }, 3000);
    }, 1500);
  };

  const handleForgotPasswordChange = (e) => {
    const { value } = e.target;
    setForgotPasswordData(prev => ({ 
      ...prev, 
      email: value,
      error: ''
    }));
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPasswordModal(false);
    setForgotPasswordData({
      email: '',
      isLoading: false,
      isSent: false,
      error: ''
    });
  };

  return (
    <div className="app-container">
      <div className="auth-page" id="loginPage">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="logo-icon">M</div>
            <h1>Mdates</h1>
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to continue your journey to find meaningful connections</p>
        </div>

        <form className="auth-form" id="loginForm" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="form-error" style={{ marginBottom: '20px' }}>
              <FaExclamationCircle /> {errors.general}
            </div>
          )}
          <div className="form-group">
            <label className="form-label" htmlFor="loginEmail">Email Address</label>
            <div className="input-with-icon">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                id="loginEmail"
                name="email"
                className="form-input"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={authLoading}
              />
            </div>
            {errors.email && <div className="form-error" id="loginEmailError">
              <FaExclamationCircle /> {errors.email}
            </div>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="loginPassword">Password</label>
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                id="loginPassword"
                name="password"
                className="form-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={authLoading}
              />
              <button
                type="button"
                className="password-toggle"
                id="loginPasswordToggle"
                onClick={togglePasswordVisibility}
                disabled={authLoading}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <div className="form-error" id="loginPasswordError">
              <FaExclamationCircle /> {errors.password}
            </div>}
            <div className="form-footer">
              <button
                type="button"
                className="forgot-password"
                id="forgotPasswordLink"
                onClick={handleForgotPassword}
                disabled={authLoading}
              >
                Forgot password?
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="auth-button"
            id="loginButton"
            disabled={authLoading}
          >
            {authLoading ? (
              <FaSpinner className="fa-spin" />
            ) : (
              <FaSignInAlt />
            )}
            {authLoading ? 'Signing In...' : 'Sign In'}
          </button>

          <div className="auth-divider">
            <span>Or continue with</span>
          </div>
          <div className="social-login">
            <button
              type="button"
              className="social-button google"
              onClick={() => handleSocialLogin('google')}
              disabled={authLoading}
            >
              <FaGoogle />
              Continue with Google
            </button>
            <button
              type="button"
              className="social-button facebook"
              onClick={() => handleSocialLogin('facebook')}
              disabled={authLoading}
            >
              <FaFacebook />
              Continue with Facebook
            </button>
            <button
              type="button"
              className="social-button apple"
              onClick={() => handleSocialLogin('apple')}
              disabled={authLoading}
            >
              <FaApple />
              Continue with Apple
            </button>
          </div>
          <div className="auth-redirect">
            Don't have an account? <Link to="/signup" id="goToSignupLink">Sign up now</Link>
          </div>
        </form>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <div className="modal-title-section">
                <div className="modal-icon">
                  <FaKey />
                </div>
                <div>
                  <h3>Reset Your Password</h3>
                  <p>Enter your email to receive reset instructions</p>
                </div>
              </div>
              <button 
                className="modal-close-btn"
                onClick={closeForgotPasswordModal}
                disabled={forgotPasswordData.isLoading}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-content">
              {forgotPasswordData.isSent ? (
                <div className="success-message">
                  <div className="success-icon">
                    <FaCheckCircle />
                  </div>
                  <h4>Check Your Email</h4>
                  <p>We've sent password reset instructions to:</p>
                  <div className="sent-email">{forgotPasswordData.email}</div>
                  <p className="success-note">
                    Please check your inbox and follow the link to reset your password.
                    The link will expire in 1 hour.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleForgotPasswordSubmit}>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <div className="input-with-icon">
                      <FaEnvelope className="input-icon" />
                      <input
                        type="email"
                        className="form-input"
                        placeholder="Enter your registered email"
                        value={forgotPasswordData.email}
                        onChange={handleForgotPasswordChange}
                        disabled={forgotPasswordData.isLoading}
                        autoFocus
                      />
                    </div>
                    {forgotPasswordData.error && (
                      <div className="form-error">
                        <FaExclamationCircle /> {forgotPasswordData.error}
                      </div>
                    )}
                    <div className="form-hint">
                      Enter the email address you used to sign up for Mdates
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="auth-button primary full-width"
                    disabled={forgotPasswordData.isLoading}
                  >
                    {forgotPasswordData.isLoading ? (
                      <>
                        <FaSpinner className="fa-spin" />
                        Sending Instructions...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane />
                        Send Reset Instructions
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {!forgotPasswordData.isSent && (
              <div className="modal-footer">
                <p>
                  Remember your password?{' '}
                  <button 
                    type="button" 
                    className="text-link"
                    onClick={closeForgotPasswordModal}
                  >
                    Back to Login
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default Login;