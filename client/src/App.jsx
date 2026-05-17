import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import "./App.css";

import Auth from "./components/Auth";
import Navbar from "./components/Navbar";
import Counter from "./components/Counter";
import History from "./History";
import Landing from "./pages/Landing";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [history, setHistory] = useState([]);
  const [user, setUser] = useState(null);

  const [logs, setLogs] = useState(() => {
    const savedLogs = localStorage.getItem("myDistraction");
    return savedLogs ? JSON.parse(savedLogs) : [];
  });

  const API_BASE = window.location.hostname.includes("localhost")
  ? "http://localhost:5000" 
  : "https://focus-tracker-e20q.onrender.com";


  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/logs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (response.ok) {
        setHistory([...data].reverse());
      }
    } catch (err) {
      toast.error("History Fetching Failed!!");
    }
  };

  const fetchUser = async () => {
  if (!token) return;
  try {
    const res = await fetch(`http://localhost:5000/api/load`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.status === 401) {
      localStorage.removeItem("token");
      window.location.reload();
    }
    if (res.ok) {
      setUser({ email: data.user?.email || data.email || "Explorer" });
    }
  } catch {
    toast.error("User fetch failed");
  }
};

  useEffect(() => {
    fetchUser();
    if(token) fetchHistory();
  }, [token]);

  const handleLogout = () => {
    localStorage.clear()
    localStorage.removeItem("token");
    localStorage.removeItem("myDistraction");
    localStorage.removeItem("syncTime");
    setToken(null);
    setLogs([]);
    setUser(null);
    window.location.href = "/";
  };

  const handleReset = () => {
    if (window.confirm("Brutal Reality Check: Delete today's progress?")) {
      setLogs([]);
      localStorage.setItem("myDistraction", JSON.stringify([]));
    }
  };

  const handleExport = () => {
    if (logs.length === 0) return alert("Nothing to export yet!");
    const prettyLogs = JSON.stringify(logs, null, 2);
    const blob = new Blob([prettyLogs], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "distraction_report.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteHistory = async (id) => {
    if(!window.confirm("Brutal Check: Delete this day forever?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/logs/${id}`, {
        method: "DELETE",
        headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      });

      if(res.ok) {
        toast.success("Deleted! Stay focused now.");
        fetchHistory() //Refresh the list from the server
      }
    } catch(err) {
      toast.error("Delete failed!");
    }
  }

  return (
  <Router>
    <div className="MainContainer">
      <Toaster position="top-right" />
      
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route 
          path="/login" 
          element={!token ? <Auth setToken={setToken} /> : <Navigate to="/dashboard" />} 
        />
        <Route path="/signup" element={!token ? <Auth setToken={setToken} /> : <Navigate to="/dashboard" />} />
        <Route 
          path="/dashboard" 
          element={
            token ? (
              <>
                <Navbar user={user} token={token} onLogout={handleLogout} onReset={handleReset} onExport={handleExport}/>
                <Counter user={user} token={token} logs={logs} setLogs={setLogs} refreshHistory={fetchHistory}/>
                <History data={history} onDelete={handleDeleteHistory}/>
              </>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
      </Routes>
    </div>
  </Router>
);
}