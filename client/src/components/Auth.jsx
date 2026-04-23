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
    <div className="AuthBox">
      <h2>{isLoginView ? "Login to Focus" : "Create Account"}</h2>

      <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" />

      <button onClick={handleAuth}>
        {isLoginView ? "Login 🚀" : "Register Me 📝"}
      </button>

      <p onClick={()=>setIsLoginView(!isLoginView)} style={{cursor: "pointer", color: "blue"}}>
        {isLoginView ? "New here? Create account" : "Already have an account? Login"}
      </p>
    </div>
  );
}