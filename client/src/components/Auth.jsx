import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {Link, useLocation} from "react-router-dom";

export default function Auth({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginView, setIsLoginView] = useState(true);
  const location = useLocation();

  const API_BASE = window.location.hostname === "localhost" 
  ? "http://localhost:5000" 
  : "https://focus-tracker-e20q.onrender.com";

  const handleAuth = async () => {
    const endpoint = isLoginView ? "login" : "signup";

    try {
      const response = await fetch(`${API_BASE}/api/auth/${endpoint}`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        toast.success(`${isLoginView ? "Login" : "Signup"} Successful 🚀`);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Server error!");
    }
  };

  useEffect(() => {
    if(location.pathname === "/signup") {
      setIsLoginView(false);
    } else {
      setIsLoginView(true);
    }
  }, [location.pathname])

  return (
    <div className="auth-page">
      <Link to="/" className="back-home-btn">← Back to Home</Link>
      
      <div className="auth-card">
        <div className="auth-header">
          <h2>{isLoginView ? "Welcome Back" : "Join the Elite"}</h2>
          <p>{isLoginView ? "Enter your credentials to access your dashboard." : "Start tracking your distractions today."}</p>
        </div>

        {/* Inputs */}
        <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" />
        <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" />

        {/* Action Button */}
        <button className="btn-auth" onClick={handleAuth}>
          {isLoginView ? "Login 🚀" : "Register Me 📝"}
        </button>

        {/* Toggle View */}
        <p className="auth-toggle" onClick={()=>setIsLoginView(!isLoginView)}>
          {isLoginView ? "New here? Create account" : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
}