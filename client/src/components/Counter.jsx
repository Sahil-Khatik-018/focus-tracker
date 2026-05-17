import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";

export default function Counter({ user, token, logs, setLogs, refreshHistory }) {
  // All States use for Counter
  const [formData, setFormData] = useState({
    activity: "",
    reason: "",
  });

  const API_BASE = window.location.hostname.includes("localhost") 
  ? "http://localhost:5000" 
  : "https://focus-tracker-e20q.onrender.com";

  const [currentTime, setCurrentTime] = useState(new Date());

  const [isSyncing, setIsSyncing] = useState(false);

  const [isOnline, setIsOnline] = useState(false);

  const [lastSync, setLastSync] = useState(() => {
    const syncTime = localStorage.getItem("syncTime");
    return syncTime ? JSON.parse(syncTime) : "";
  });


  const streak = useMemo(() => {
    return logs.length === 0 ? "🔥 Untouchable" : `${logs.length} distractions logged`;
  }, [logs]);

  const analytics = useMemo(() => {
  if (logs.length === 0) return { topActivity: "None", focusScore: 100 };

  // 1. Calculate Top Distraction
  const counts = {};
    logs.forEach(log => {
      const act = log.activity.toLowerCase().trim();
      counts[act] = (counts[act] || 0) + 1;
    });
    
    const top = Object.entries(counts).reduce((a, b) => (b[1] > a[1] ? b : a), ["None", 0]);

    // 2. Calculate Focus Score (Starts at 100, drops 10 points per distraction)
    const score = Math.max(0, 100 - (logs.length * 10));

    return { topActivity: top[0], focusScore: score };
  }, [logs]);

  // All function to use in Counter
  const handleClick = () => {
    if (!formData.activity.trim() || formData.reason.length < 15) return;

    let newLog = {
      id: Date.now(),
      activity: formData.activity,
      reason: formData.reason,
      time: new Date().toLocaleTimeString(),
    };
    setLogs((prevLog) => [...prevLog, newLog]);
    setFormData({ activity: "", reason: "" });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const deleteList = (id) => {
    const isConfirmed = window.confirm("Are you sure you want to erase this distraction? Only do this if it was a mistake.");
    
    if (isConfirmed) {
      setLogs((prevLogs) => prevLogs.filter((list) => list.id !== id));
      toast.success("Entry removed from current session.");
    }
  };

  const stateMessage = () => {
    const count = logs.length;
    if (count === 0) return { text: "Clean Slate. Don't screw it up, Stay focused.", color: "green" };
    if (count <= 3) return { text: "A few cracks in the armor. Stop now before you spiral.", color: "#FFA500" };
    if (count <= 5) return { text: "You're drifting into 'Loser' territory. Wake up.", color: "#ff4d4d" };
    if (count <= 9) return { text: "Disaster. You're basically working for your distractions now.", color: "#ef4444" };
    return { text: "Total Failure. Step away from the screen. You've lost.", color: "#7f1d1d" };
  };

  const status = stateMessage();

  const syncData = async () => {
    setIsSyncing(true);

    if (!navigator.onLine) {
      toast.error("You're offline");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          logs: logs,
          totalCount: logs.length,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.reload();
      }

      if (response.ok) {
        const lastSyncTime = new Date().toLocaleString();
        setLastSync(lastSyncTime);
        toast.success(data.message);
        refreshHistory();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Connection failed. Check your Wi-Fi.");
    } finally {
      setIsSyncing(false);
    }
  };

  const loadData = async () => {
    try {
      const todayLabel = new Date().toISOString().split("T")[0];
      const response = await fetch(`${API_BASE}/api/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const allDays = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.reload();
      }
      
      // Find the specific object for today
      const todayData = allDays.find((day) => day.date === todayLabel);

      if (todayData) {
        setLogs(todayData.logs); // Now logs gets the ARRAY of distractions, not the whole day
      } else {
        setLogs([]); // Ensure it's empty if no data for today exists yet
      }

    } catch (err) {
      toast.error("Error:", err.message);
    }
  };

  useEffect(() => {
    localStorage.setItem("myDistraction", JSON.stringify(logs));
    localStorage.setItem("syncTime", JSON.stringify(lastSync));
  }, [logs, lastSync]);

  useEffect(() => {
    const heartbeat = setInterval(() => {
      if (logs.length > 0 && navigator.onLine) {
        syncData(); // Silent sync every 5 minutes
        console.log("Background heartbeat sync executed.");
      }
    }, 5 * 60 * 1000); // 5 Minutes

    return () => clearInterval(heartbeat);
  }, [logs]);

  useEffect(() => {
    if (token) loadData();
  }, [token]);
  

   useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);

    window.addEventListener("online", handleStatus);
    window.addEventListener("offline", handleStatus);
    
    setIsOnline(navigator.onLine);
    
    return () => {
      window.removeEventListener("online", handleStatus);
      window.removeEventListener("offline", handleStatus);
    };
  }, []);

  useEffect(() => {
    const lastOpenDate = localStorage.getItem("lastOpenDate");
    const today = new Date().toISOString().split("T")[0];

    if (lastOpenDate && lastOpenDate !== today) {
      // FORCE SYNC before clearing
      const finalizeYesterday = async () => {
        if (logs.length > 0) {
          await syncData(); // Push to DB
          const archiveTime = new Date().toLocaleString();
          setLastSync(archiveTime); // Show the final archive time
          localStorage.setItem("syncTime", JSON.stringify(archiveTime));
        }
        setLogs([]);
        localStorage.setItem("myDistraction", JSON.stringify([]));
        localStorage.setItem("lastOpenDate", today);
      };

      finalizeYesterday();
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(timer); // Cleanup on unmount
  }, []);


  return (
    <>
      <div className={`App ${logs.length >= 10 ? "danger-bg failure-mode" : logs.length > 5 ? "danger-bg" : ""}`}>
        <div className="command-hud">
          <div className="hud-left">
            <div className="connection-pill">
              <span className={isOnline ? "dot online-pulse" : "dot offline-pulse"}></span>
              <span className="status-text">{isOnline ? "CONNECTED" : "OFFLINE"}</span>
            </div>
          </div>
          
          <div className="hud-right">
            <div className="divider-line"></div>
            <span className="calendar-tag">
              {currentTime.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }).toUpperCase()}
            </span>
            <div className="divider-line"></div>
            <code className="digital-time">
              {currentTime.toLocaleTimeString([], { hour12: true })}
            </code>
            <div className="divider-line"></div>
            <div className="streak-mini">
              <span className="streak-icon">🔥</span>
              <span className="streak-val">{logs.length}</span>
            </div>
          </div>
          </div>
        

        <h1>Distraction Counter </h1>

        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Focus Leaks Today</span>
            <span className="stat-value" style={{ 
              color: analytics.focusScore > 70 ? "#22c55e" : analytics.focusScore > 40 ? "#f59e0b" : "#ef4444" 
            }}>
              {analytics.focusScore}%
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Primary Friction</span>
            <span className="stat-value" style={{ textTransform: 'capitalize' }}>
              <code>{analytics.topActivity}</code> 
            </span>
          </div>
        </div>

        <p className="score-commentary" style={{ color: status.color }}>
          {status.text}
        </p>
        {/* ... Progress Bar, Inputs, and Sync Buttons ... */}
        <div className="progress-container">
          <div
            className="progress-bar"
            style={{
              width: `${analytics.focusScore}%`, // Now shows remaining "Health"
              backgroundColor: analytics.focusScore > 70 ? "#22c55e" : analytics.focusScore > 40 ? "#f59e0b" : "#ef4444",
              transition: "width 1s ease-in-out, background-color 0.5s ease"
            }}
          ></div>
        </div>
        
        <input
          type="text"
          name="activity"
          value={formData.activity}
          onChange={handleChange}
          placeholder="Activity"
        />{" "}
        <input
          type="text"
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          placeholder="Reason (min. 15 chars)..."
          className={formData.reason.length > 0 && formData.reason.length < 15 ? "input-error" : ""}
        />

        <p className="char-count" style={{ color: formData.reason.length < 15 ? "#ff4d4d" : "#22c55e" }}>
          {formData.reason.length}/15 characters {formData.reason.length < 15 ? "required" : "reached"}
        </p>

        <button
          onClick={handleClick}
          disabled={formData.activity.trim() === "" || formData.reason.length < 15 || logs.length >= 10}
          className="btn-main"
        >
          Log Distraction 🛑
        </button>{" "}
        {/* <br />
        <br /> */}

          <div className="sync-section">
            <button onClick={syncData} disabled={isSyncing || logs.length === 0} className="btn-sync-small" style={{ minWidth: '180px' }}>
              {isSyncing ? <span className="sync-loader">Syncing...</span> : "Backup Session 🛰️"}
            </button>

            <p className="sync-text-mini">{lastSync ? `Last Backup: ${lastSync}` : "⚠️ Session not backed up"}</p>

          </div>
        

        {logs.length === 0 ? (
          <p className="empty-msg">No distractions yet. Stay focused 💪</p>
        ) : (
          <ol className="log-list">
            {logs.map((list) => (
              <li key={list.id}>
                <div className="log-content">
                  <i><b>{list.activity?.toUpperCase()}</b>: "{list.reason}"</i>
                  <br />
                  <span className="log-time">{list.time}</span>
                </div>
                <button onClick={() => deleteList(list.id)}>X</button>
              </li>
            ))}
          </ol>
        )}
      </div>
    </>
  );
}
