import { useState } from "react";

export default function Navbar({ user, onLogout, onReset, onExport }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <nav className="navbar">
      <h1>FocusTracker</h1>
      <div className="user-info">
        <span>Welcome, <strong>{user?.email?.split('@')[0] || "Explorer"}</strong></span>

        <div className="menu-container">
          <button onClick={() => setShowMenu(!showMenu)} className="dot-btn">⋮</button>
          {showMenu && (
            <div className="dropdown-menu">
              <button onClick={() => { onExport(); setShowMenu(false); }}>Export JSON 📥</button>
              <button onClick={() => { onReset(); setShowMenu(false); }} className="text-danger">Reset Day ↻</button>
              <button onClick={onLogout}>Logout 🚪</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}