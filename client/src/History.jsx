import { useState } from "react";

export default function History({ data = [], onDelete }) {
  const [showAll, setShowAll] = useState(false);

  if (!Array.isArray(data) || data.length === 0) {
    return <p className="empty-msg">No history yet. Start focusing! 🚀</p>;
  }

  const visibleData = showAll ? data : data.slice(0, 6);

  return (
    <div className="history-section">
      <h3>📜 Performance Archive</h3>
      <div className="history-grid">
        {visibleData.map((day) => {
          const intensity = day.totalCount > 7 ? "high-danger" : day.totalCount > 3 ? "mid-warning" : "low-success";

          const hoverDetails = day.logs && day.logs.length > 0 
          ? day.logs.map(l => `• ${l.activity}: ${l.reason}`).join('\n')
          : "No detailed logs available";
          
          return (
            <div key={day._id} className={`history-card ${intensity}`} title={hoverDetails}>
              <div className="card-header">
                <strong>
                  {new Date(day.date).toLocaleDateString("en-IN", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </strong>
              </div>
              
              <div className="card-body">
                <span className="session-count">{day.logs?.length || 0} Entries</span>
                <span className="count-badge">{day.totalCount}</span>
              </div>

              {/* FOOTER SECTION FOR DELETE BUTTON */}
              <div className="card-footer">
                <button className="btn-delete" onClick={() => onDelete(day._id)}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {data.length > 6 && (
        <button onClick={() => setShowAll(!showAll)} className="btn-secondary">
          {showAll ? "Show Less" : "View More History"}
        </button>
      )}
    </div>
  );
}