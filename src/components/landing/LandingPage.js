import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaShieldAlt, FaUsers, FaCommentDots, FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import './styles/LandingPage.css';
import heroImage from '../../assets/hero-couple.jpg';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="logo">
            <FaHeart className="logo-icon" />
            <span>Mubas Dates</span>
          </div>
          <div className="nav-links">
            <Link to="/login" className="nav-link">Log in</Link>
            <Link to="/register" className="nav-link landing-btn-primary">Sign up</Link>
          </div>
        </div>
      </nav>

      <section 
        className="hero" 
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="hero-overlay">
          <div className="hero-content">
            <h1>Find Your Perfect Match</h1>
            <p className="hero-subtitle">
              Join Mubas Dates and meet like-minded singles who share your interests and values.
            </p>
            <div className="hero-cta">
              <Link to="/register" className="landing-btn landing-btn-primary landing-btn-large">
                Get Started <FaArrowRight />
              </Link>
              <Link to="/about" className="landing-btn landing-btn-secondary landing-btn-large">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Why Choose Mubas Dates?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <FaHeart className="feature-icon" />
            <h3>Meaningful Matches</h3>
            <p>Our algorithm focuses on compatibility, not just looks.</p>
          </div>
          <div className="feature-card">
            <FaShieldAlt className="feature-icon" />
            <h3>Safe & Secure</h3>
            <p>Your privacy and safety are our top priorities.</p>
          </div>
          <div className="feature-card">
            <FaUsers className="feature-icon" />
            <h3>Active Community</h3>
            <p>Thousands of genuine users looking for real connections.</p>
          </div>
          <div className="feature-card">
            <FaCommentDots className="feature-icon" />
            <h3>Easy Communication</h3>
            <p>Chat, share photos, and get to know each other.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create Your Profile</h3>
            <p>Tell us about yourself and what you're looking for.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Discover Matches</h3>
            <p>Browse through profiles that match your preferences.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Start Connecting</h3>
            <p>Send a like or a message and begin your journey.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <h2>Success Stories</h2>
        <div className="testimonial-grid">
          <div className="testimonial-card">
            <p>"I found my soulmate within a week. The matches were incredibly accurate!"</p>
            <div className="testimonial-author">- Sarah & Mike</div>
          </div>
          <div className="testimonial-card">
            <p>"Finally a dating app that focuses on personality, not just photos."</p>
            <div className="testimonial-author">- David</div>
          </div>
          <div className="testimonial-card">
            <p>"The community here is so genuine. Highly recommended!"</p>
            <div className="testimonial-author">- Emily</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <FaHeart /> Mubas Dates
          </div>
          <div className="footer-links">
            <Link to="/about">About</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div className="footer-copyright">
            © {new Date().getFullYear()} Mubas Dates. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;