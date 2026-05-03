import { useState } from "react";
import toast from "react-hot-toast";

export default function Auth({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginView, setIsLoginView] = useState(true);


  const handleAuth = async () => {
    const endpoint = isLoginView ? "login" : "signup";

    try {
      const response = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
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

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Header Section */}
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