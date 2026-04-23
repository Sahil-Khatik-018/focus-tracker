import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";

export default function Counter({ token, logs, setLogs, refreshHistory }) {
  // All States use for Counter
  const [formData, setFormData] = useState({
    activity: "",
    reason: "",
  });


  const [isSyncing, setIsSyncing] = useState(false);

  const [isOnline, setIsOnline] = useState(false);

  const [lastSync, setLastSync] = useState(() => {
    const syncTime = localStorage.getItem("syncTime");
    return syncTime ? JSON.parse(syncTime) : "";
  });


  const streak = useMemo(() => {
    return logs.length === 0 ? "🔥 Perfect Day" : `${logs.length} slips`;
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
    setLogs((prevLogs) => prevLogs.filter((list) => list.id !== id));
  };


  const stateMessage = () => {
    const count = logs.length;
    if (count === 0) return { text: "Clean Slate. Don't screw it up, Stay focused", color: "green" };
    if (count <= 3) return { text: "First the cracks, then the collapse. Focus.", color: "#FFA500" };
    if (count <= 5) return { text: "You’re drifting. Let’s refocus.", color: "#ff4d4d" };
    return { text: "System Failure. You've lost the right to log more distractions. Go touch grass.", color: "red" };
  };

  const status = stateMessage();

  const syncData = async () => {
    setIsSyncing(true);

    if (!navigator.onLine) {
      toast.error("You're offline");
    return;
}

    try {
      const response = await fetch(`http://localhost:5000/api/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
      const response = await fetch(`http://localhost:5000/api/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const allDays = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.reload();
      }
      

      // Get today's date label
      const todayLabel = new Date().toISOString().split("T")[0];

      // Find the specific object for today
      const todayData = allDays.find((day) => day.date === todayLabel);

      if (todayData) {
        setLogs(todayData.logs); // Now logs gets the ARRAY of distractions, not the whole day
      }

    } catch (err) {
      toast.error("Error:", err.message);
    }
  };

  // useEffect
  useEffect(() => {
    localStorage.setItem("myDistraction", JSON.stringify(logs));
    localStorage.setItem("syncTime", JSON.stringify(lastSync));
  }, [logs, lastSync]);

  useEffect(() => {
    if (logs.length > 0) {
      document.title = `${logs.length} - Focus Sahil!`;

      const timer = setTimeout(() => {
        syncData();
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      document.title = "All Clear!";
    }
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

    if(lastOpenDate !== today) {
      setLogs([]);
      localStorage.setItem("myDistraction", JSON.stringify([]));
      localStorage.setItem("lastOpenDate", today);
      toast.info("New day detected! Local logs reset.");
    }
  }, [])


  return (
    <>
      <div
        className={`App ${logs.length > 5 ? "danger-bg" : ""}`}
      >
        <span className={isOnline ? "status online" : "status offline"}>
          {isOnline ? "Connected" : "Offline"}
        </span>
        <h1>Distraction Counter </h1>
        {/* ... Progress Bar, Inputs, and Sync Buttons ... */}
        <div className="progress-container">
          <div
            className="progress-bar"
            style={{
              width: `${Math.min(logs.length * 10, 100)}%`,
              backgroundColor: status.color,
            }}
          ></div>
        </div>
        <h2>Total wasted count: {logs.length}</h2>
        <h3 style={{ color: status.color }}>{status.text}</h3>
        <h4>{streak}</h4>
        <input
          type="text"
          name="activity"
          value={formData.activity}
          onChange={handleChange}
          placeholder="Activity"
        />{" "}
        <br /> <br />
        <input
          type="text"
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          placeholder="Reason..."
        />
        <p style={{ color: formData.reason.length < 15 ? "red" : "green" }}>
  {formData.reason.length < 15
    ? "Minimum 15 characters required"
    : "Looks good 👍"}
</p>
        <button
          onClick={handleClick}
          disabled={
            formData.activity.trim() === "" || formData.reason.length < 15 || logs.length >= 10
          }
          className="btn-main"
        >
          I Wasted Time
        </button>{" "}
        {/* <br />
        <br /> */}

          <div className="sync-section">
            <button onClick={syncData} disabled={isSyncing || logs.length === 0} className="btn-sync-small">
              {isSyncing === true ? "Syncing..." : "Sync to Cloud ☁️"}
            </button>

            <p className="sync-text-mini">Last Synced: {lastSync || "Never"}</p>

          </div>
        

        {logs.length === 0 ? (
          <p className="empty-msg">No distractions yet. Stay focused 💪</p>
        ) : (
          <ol>
          {logs.map((list) => (
            <li key={list.id}>
              <i>
                <b>{list.activity?.toUpperCase()}</b>: "{list.reason}"
              </i>{" "}
              <br />
              Time: {list.time}
              <button onClick={() => deleteList(list.id)}>X</button>
            </li>
          ))}
        </ol>
        )}
      </div>
    </>
  );
}
