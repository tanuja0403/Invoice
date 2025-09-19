import React from 'react'
import '../css/Landing.css'

export default function Landing() {
  const goToApp = () => {
    if (window.location.pathname !== '/app') {
      window.history.pushState({}, '', '/app')
      window.dispatchEvent(new PopStateEvent('popstate'))
    }
  }

  return (
    <div className="landing-root light">
      <header className="landing-header light">
        <div className="brand">
          <span className="brand-icon">📄</span>
          <span className="brand-name">Smart Invoice Manager</span>
        </div>
        <nav className="landing-nav">
          <a href="#features">Features</a>
          <a href="#testimonials">Testimonials</a>
          <a href="#pricing">Pricing</a>
          <button className="secondary-btn small" onClick={() => { window.history.pushState({}, '', '/login'); window.dispatchEvent(new PopStateEvent('popstate')) }}>Login</button>
          <button className="primary-btn small" onClick={goToApp}>Get Started</button>
        </nav>
      </header>

      <main className="landing-content">
        <section className="hero">
          <h1 className="hero-title big">Simplify Your Invoice<br/>Management</h1>
          <p className="hero-subtitle">
            Automate invoice processing and gain real‑time insights with our intuitive platform.
            Streamline your workflow and focus on what matters most.
          </p>
          <div className="hero-actions">
            <button className="primary-btn" onClick={goToApp}>Get Started</button>
            <button className="secondary-btn" onClick={goToApp}>Try Demo</button>
          </div>
        </section>

        <section id="features" className="features four">
          <div className="feature-item fadein">
            <div className="fi-icon">🧾</div>
            <h3>Automated Scanning</h3>
            <p>Extract data from invoices with high accuracy, reducing manual data entry and errors.</p>
          </div>
          <div className="feature-item fadein delay">
            <div className="fi-icon">📈</div>
            <h3>Real‑Time Analytics</h3>
            <p>Visualize financial data with interactive charts for valuable business insights.</p>
          </div>
          <div className="feature-item fadein delay-2">
            <div className="fi-icon">🔐</div>
            <h3>Secure Storage</h3>
            <p>Store and access your invoices anytime, anywhere, with robust encryption.</p>
          </div>
          <div className="feature-item fadein delay-3">
            <div className="fi-icon">📊</div>
            <h3>Professional Dashboard</h3>
            <p>Manage invoices efficiently with a user‑friendly dashboard for businesses of all sizes.</p>
          </div>
        </section>

        <section className="cta-banner">
          <div className="cta-inner">
            <h3>Ready to take control of your invoices?</h3>
            <p>Join businesses simplifying their financial world with Smart Invoice Manager.</p>
            <div className="cta-actions">
              <button className="primary-btn" onClick={goToApp}>Get Started Now</button>
              <button className="secondary-btn" onClick={goToApp}>Contact Sales</button>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand">
          <span className="brand-icon">📄</span>
          <span>Smart Invoice Manager</span>
        </div>
        <div className="footer-links">
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          <a href="#privacy">Privacy Policy</a>
        </div>
        <div className="copyright">© {new Date().getFullYear()} Smart Invoice Manager. All rights reserved.</div>
      </footer>
    </div>
  )
}

