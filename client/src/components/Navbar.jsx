import { useState, useEffect } from "react";

export default function Navbar({ user, token, onLogout, onReset, onExport }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
  const closeMenu = (e) => {
    if (!e.target.closest(".menu-container")) {
      setIsMenuOpen(false); 
    }
  };
  
  if (isMenuOpen) {
    document.addEventListener("mousedown", closeMenu);
  }

  return () => document.removeEventListener("mousedown", closeMenu);
}, [isMenuOpen]);

  return (
    <nav className="navbar">
      <div className="logo" onClick={() => window.location.href="/"}>
        Focus<span>Tracker</span>
      </div>

      <div className="nav-actions">
        {token && user ? (
          /* SHOW THIS IF LOGGED IN */
          <div className="user-info">
            <span className="session-label">
              <span className="hide-mobile">Active Session: </span>
              <strong>{(user?.email?.split('@')[0] || "Explorer").toUpperCase()}</strong>
            </span>
            <div className="menu-container">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="three-dot-btn">⋮</button>
              {isMenuOpen && (
                <div className="dropdown-menu">
                  <button onClick={() => {onExport(); setIsMenuOpen(false);}}>Export JSON 📥</button>
                  <button onClick={() => {onReset(); setIsMenuOpen(false)}} className="text-danger">Reset Day ↻</button>
                  <button onClick={onLogout}>Logout 🚪</button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* SHOW THIS IF LOGGED OUT (Login/Signup Pages) */
          <div className="auth-links">
          </div>
        )}
      </div>
    </nav>
  );
}