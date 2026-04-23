# FocusTracker 🚀

**Stop drifting. Start executing.** FocusTracker is a brutal, no-nonsense MERN stack application designed for high-performance individuals who need to track their distractions and hold themselves accountable.

---

## 🛠️ The Tech Stack

This project was built using the **MERN** stack for high scalability and real-time synchronization:

* **Frontend**: React.js (Hooks, Context-like Prop Drilling, and Custom Events).
* **Backend**: Node.js & Express.js.
* **Database**: MongoDB Atlas.
* **Authentication**: JSON Web Tokens (JWT) for secure session management.
* **Feedback**: React-Hot-Toast for professional, non-intrusive notifications.

---

## ✨ Key Features

### 1. Brutal Accountability 💀
- The app doesn't just track; it judges. Based on your distraction count, the system provides brutally honest feedback to push you back to work.

### 2. Smart Cloud Sync ☁️
- Never lose your data. Local logs are synchronized with a remote MongoDB database, allowing you to track progress across devices.

### 3. Productivity Timeline (History) 📜
- A dashboard view of your past performance. Each "History Card" provides a summary of that day's distractions, helping you identify long-term patterns.

### 4. Automatic Daily Reset ↻
- The system intelligently detects a new day and resets your local workspace, keeping your focus on the "Now" while preserving the "Past" in the cloud.

### 5. Professional Export 📥
- Need a backup? Export your daily distraction logs into a clean JSON format directly from the secure Navbar menu.

---

## 🚀 Installation & Setup

Follow these steps to get the environment running locally:

### 1. Clone the Repository
```bash
git clone [https://github.com/Sahil-Khatik-018/focus-tracker.git](https://github.com/Sahil-Khatik-018/focus-tracker.git) 
```


### 2. Backend Setup:

1. Navigate to the backend folder. 
2. Open terminal.
3. Install dependencies: `npm install`. 
4. Create a `.env` file and add your credentials:

    ```    
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_super_secret_key
    PORT=5000
    VITE_API_URL=your_localhost_url
    ```
5. Start the server: `npm start`

### 3. Frontend Setup :

1. Navigate to the frontend folder.
2. Open frontend folder terminal.
3. Install dependencies: `npm install`.
4. Start the React app: `npm run dev`.

> [!NOTE]:
> Please setup backend first and then move to frontend setup. 
