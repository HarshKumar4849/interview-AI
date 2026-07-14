import React from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import '../landing.scss';

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <main className="landing-container">
      <Navbar />
      {/* Decorative background glow blobs */}
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>

      <div className="landing-content">
        {/* Animated Logo Container */}
        <div className="logo-wrapper">
          <img src="/logo.png" alt="Interview AI Logo" className="landing-logo" />
        </div>

        {/* Text Area */}
        <h1 className="landing-title">
          Supercharge Your <span className="gradient-text">Interview Prep</span>
        </h1>
        <p className="landing-subtitle">
          Accelerate your career. Let our advanced AI analyze job descriptions and your resume to generate customized questions, key evaluation criteria, and targeted roadmaps.
        </p>

        {/* Feature Highlights Grid */}
        <div className="features-highlight">
          <div className="feat-card">
            <span className="feat-card__icon">⚡</span>
            <h3>AI Roadmaps</h3>
            <p>Step-by-step prep paths</p>
          </div>
          <div className="feat-card">
            <span className="feat-card__icon">🎯</span>
            <h3>Match Score</h3>
            <p>ATS job alignment scoring</p>
          </div>
          <div className="feat-card">
            <span className="feat-card__icon">💬</span>
            <h3>STAR Q&amp;A</h3>
            <p>Targeted prep questions</p>
          </div>
          <div className="feat-card">
            <span className="feat-card__icon">📄</span>
            <h3>ATS Resume</h3>
            <p>Tailored resume generator</p>
          </div>
        </div>

        {/* Dynamic Buttons */}
        <div className="cta-container">
          {user ? (
            <button 
              className="button primary-button cta-btn dashboard-btn" 
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
              <svg className="arrow-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          ) : (
            <div className="landing-cta-wrapper">
              <button 
                className="button primary-button cta-btn start-free-btn" 
                onClick={() => navigate('/register')}
              >
                Get Started for Free
                <svg className="arrow-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
              <p className="cta-subtext">No credit card required &bull; Create your plan instantly</p>
            </div>
          )}
        </div>
      </div>

      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} © 2026 Interview AI. Designed & Developed by Harsh Pandey. </p>
      </footer>
    </main>
  );
};

export default Landing;
