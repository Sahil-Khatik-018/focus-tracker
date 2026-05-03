import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="landing-page">
      {/* --- Navigation --- */}
      <nav className="glass-nav">
        <div className="logo">Focus<span>Tracker</span></div>
        <div className="nav-links">
          <Link to="/login" className="nav-item">Login</Link>
          <Link to="/signup" className="btn-signup">Get Started</Link>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <header className="hero-section">
        <div className="hero-badge">Alpha Version 2.0 Now Live</div>
        <h1>Master Your Time, <br/><span>Crush Distractions.</span></h1>
        <p>A brutal productivity tool designed for builders. <br /> Track your deep work, log your failures, and improve daily.</p>
        <div className="hero-actions">
          <Link to="/signup" className="btn-glow">Start Tracking — Free</Link> <br />
        </div>
      </header>

      {/* --- Feature Grid --- */}
      <section id="features" className="feature-grid">
        <div className="f-card">
          <div className="icon">⚡</div>
          <h3>Real-time Tracking</h3>
          <p>Log distractions as they happen. Don't let 5 minutes turn into an hour.</p>
        </div>
        <div className="f-card">
          <div className="icon">🛡️</div>
          <h3>Secure Data</h3>
          <p>Encrypted logs and JWT authentication. Your history is for your eyes only.</p>
        </div>
        <div className="f-card">
          <div className="icon">📈</div>
          <h3>Insightful Analytics</h3>
          <p>Detailed history to help you identify patterns in your procrastination.</p>
        </div>
        <div className="f-card">
          <div className="icon">🛑</div>
          <h3>System Failure Mode</h3>
          <p>If you slip more than 10 times, the system locks you out. No more excuses—go touch grass.</p>
        </div>
        <div className="f-card">
          <div className="icon">☁️</div>
          <h3>Cloud Sync</h3>
          <p>Your progress is synced in real-time. Access your distraction history from any device, anywhere.</p>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="landing-footer">
        <div className="footer-content">
          <p>© 2026 FocusTracker by Sahil Khatik</p>
          <div className="social-links">
            <a href="https://github.com/Sahil-Khatik-018/" target="_blank">GitHub</a>
            <a href="https://www.linkedin.com/in/khatiksahil/" target="_blank">LinkedIn</a>
            <a href="https://x.com/SahilKh786313/" target="_blank">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}