import React, { useState, useEffect } from 'react';
import '../App.css';
import { Link, useNavigate } from 'react-router-dom';

function generateRandomString(length = 6) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export default function Landing() {
  const router = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGuestJoin = () => {
    setIsLoading(true);
    const randomString = generateRandomString();
    setTimeout(() => {
      router(`/${randomString}`);
    }, 800);
  };

  const handleAuthNavigation = (path) => {
    setIsLoading(true);
    setTimeout(() => {
      router(path);
    }, 500);
  };

  return (
    <div className='landingPageContainer'>
      {/* Animated Background Elements */}
      <div className="animated-bg">
        <div className="floating-circle circle-1"></div>
        <div className="floating-circle circle-2"></div>
        <div className="floating-circle circle-3"></div>
      </div>

      {/* Navigation */}
      <nav className={`nav ${isScrolled ? 'nav-scrolled' : ''}`}>
        <div className='nav-container'>
          <div className='navHeader'>
            <h2 className='logo'>BeamTalk</h2>
          </div>
          <div className='navList'>
            <button 
              className='nav-btn secondary'
              onClick={handleGuestJoin}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading-spinner small"></span>
              ) : (
                'Join as Guest'
              )}
            </button>
            <button 
              className='nav-btn secondary'
              onClick={() => handleAuthNavigation('/auth')}
              disabled={isLoading}
            >
              Register
            </button>
            <button 
              className='nav-btn primary'
              onClick={() => handleAuthNavigation('/auth')}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading-spinner small"></span>
              ) : (
                'Login'
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button className="mobile-menu-btn">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="landingMainContainer">
        <div className="content-wrapper">
          <div className="text-content">
            <div className="badge">
              <span>✨ New</span> Real-time video calls
            </div>
            
            <h1 className="main-heading">
              <span className="gradient-text">Connect</span> with Your 
              <span className="highlight"> Loved Ones</span>
            </h1>
            
            <p className="subtitle">
              Bridge distances with crystal-clear video calls. Experience seamless 
              communication that feels like you're in the same room.
            </p>
            
            <div className="cta-buttons">
              <button 
                className="cta-btn primary"
                onClick={() => handleAuthNavigation('/auth')}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Getting Started...
                  </>
                ) : (
                  <>
                    <span className="btn-icon">🚀</span>
                    Get Started Free
                  </>
                )}
              </button>
              
              <button 
                className="cta-btn secondary"
                onClick={handleGuestJoin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading-spinner small"></span>
                ) : (
                  <>
                    <span className="btn-icon">👥</span>
                    Join as Guest
                  </>
                )}
              </button>
            </div>

            {/* Stats */}
            <div className="stats">
              <div className="stat-item">
                <div className="stat-number">10K+</div>
                <div className="stat-label">Active Users</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">99.9%</div>
                <div className="stat-label">Uptime</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">HD</div>
                <div className="stat-label">Quality</div>
              </div>
            </div>
          </div>

          <div className="visual-content">
            <div className="phone-mockup">
              <img 
                src='/mobile.png' 
                alt='BeamTalk mobile app interface'
                className='phone-image'
              />
              <div className="floating-element element-1">💬</div>
              <div className="floating-element element-2">📹</div>
              <div className="floating-element element-3">⭐</div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="wave-divider">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="shape-fill"></path>
        </svg>
      </div>

      {/* Footer - Naya Awesome Footer */}
      <footer className="footer">
        <div className="footer-container">
          {/* Main Footer Content */}
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-logo">
                <h3>BeamTalk</h3>
                <p>Connecting hearts across distances with crystal clear video calls.</p>
              </div>
              <div className="social-links">
                <a href="#" className="social-link" aria-label="Facebook">
                  <span className="social-icon">📘</span>
                </a>
                <a href="#" className="social-link" aria-label="Twitter">
                  <span className="social-icon">🐦</span>
                </a>
                <a href="#" className="social-link" aria-label="Instagram">
                  <span className="social-icon">📷</span>
                </a>
                <a href="#" className="social-link" aria-label="LinkedIn">
                  <span className="social-icon">💼</span>
                </a>
              </div>
            </div>

            <div className="footer-section">
              <h4>Product</h4>
              <ul className="footer-links">
                <li><a href="#">Features</a></li>
                <li><a href="#">Pricing</a></li>
                <li><a href="#">Use Cases</a></li>
                <li><a href="#">Integrations</a></li>
                <li><a href="#">Updates</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Company</h4>
              <ul className="footer-links">
                <li><a href="#">About Us</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Press</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Support</h4>
              <ul className="footer-links">
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Community</a></li>
                <li><a href="#">System Status</a></li>
                <li><a href="#">API Docs</a></li>
                <li><a href="#">Security</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Download</h4>
              <div className="download-buttons">
                <button className="download-btn">
                  <span className="store-icon">📱</span>
                  <div className="store-info">
                    <span className="store-text">Get on</span>
                    <span className="store-name">App Store</span>
                  </div>
                </button>
                <button className="download-btn">
                  <span className="store-icon">🤖</span>
                  <div className="store-info">
                    <span className="store-text">Get on</span>
                    <span className="store-name">Google Play</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="footer-bottom">
            <div className="footer-bottom-content">
              <div className="copyright">
                © 2024 BeamTalk. All rights reserved. Made with ❤️ for better connections.
              </div>
              <div className="footer-legal">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}