const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios"); // For your GitHub feature
require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth")

const app = express();
const PORT = process.env.PORT;

// 1. The Security Guard (CORS) - Allows React to talk to Node
app.use(cors({
  origin: "https://focus-tracker-kappa.vercel.app",
  credentials: true
}));
app.use(express.json()); // Allows Node to read JSON data

// 2. Database Connection
const mongoURI = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@cluster0.tmnvx7v.mongodb.net/?appName=Cluster0`;

mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ Connected to MongoDB Vault!"))
  .catch((err) => console.log("❌ Vault Connection Error:", err));

// 3. The Blueprint (The Notebook Page)
const dailySummarySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true },
  logs: { type: Array, default: [] },
  totalCount: { type: Number, default: 0 },
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
});

const DailySummary = mongoose.model("DailySummary", dailySummarySchema);
const User = mongoose.model("User", userSchema);

// Middleware (The Guard)
app.post("/api/sync", auth, async (req, res) => {
  const { logs, totalCount } = req.body;
  const userId = req.user.id; // this id come by middleware
  
  try {
    const updatedDay = await DailySummary.findOneAndUpdate(
      {date: new Date().toISOString().split("T")[0], userId: userId},
      {$set: { logs, totalCount, userId }},
      {upsert: true, new: true, runValidators: true}
    );

    res.status(200).json({message: "Synced to your personal account!"});
  }catch(err) {
    console.error("SYNC ERROR:", err);
    res.status(500).json({message: "Sync Failed", error: err.message});
  }
})

// 5. THE FETCH ROUTE (Get the History)
app.get("/api/logs", auth, async (req, res) => {
  try {
    const userHistory = await DailySummary.find({userId: req.user.id}); // Filter by User!
    res.status(200).json(userHistory);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
});

// SignUp Route
app.post("/api/auth/signup", async (req, res) => {
  // SAFETY CHECK: If there is no body, don't crash!
  if (!req.body || !req.body.email) {
    return res
      .status(400)
      .json({ message: "Request body is missing or empty!" });
  }

  try {
    const { email, password, name } = req.body;
    console.log("Attempting signup for:", email); //Log-1

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists!" });

    // 2. Hash (Blend) the password
    const salt = await bcrypt.genSalt(10); //The "Salt" adds extra randomness
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("Password hashed successfully!"); //Log-2

    // 3. Create and save the user
    const newUser = new User({
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "User created successfully! Now Login." });
  } catch (err) {
    console.error("DETAILED ERROR:", err);
    res.status(500).json({ message: "Server error during signup" });
  }
});

// Login Route
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find User
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found!" });

    // 2. Compare Password (Bcrypt does the magic)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid Credentials!" });

    const token = jwt.sign(
      { id: user._id, name: user.name },
      process.env.JWT_SECRET || "SUPER_SECRET_KEY", //This is your private signature
      { expiresIn: "1h" }, // The key expire in 1 hours / 1d - 24hr
    );

    console.log("Login Success! Generating token for user ID: " + user._id);
    
    // 3. Send the status message
    res
      .status(200)
      .json({
        message: "Login Successful!",
        token: token, //Send the key to the user
        user: { id: user._id, email: user.email },
      });
  } catch (err) {
    res.status(500).json({ message: "Server Login Error" });
  }
});

app.get("/api/load", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({user});
  } catch(err) {
    res.status(500).json({message: "Server Error"})
  }
}); 

// DELETE Route: For remove specific day from the history
app.delete("/api/logs/:id", auth, async (req, res) => {
  try {
    const deleteDay = await DailySummary.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if(!deleteDay) return res.status(401).json({message: "Day not found!"});

    res.status(200).json({message: "History cleared for that day! 🗑️"})
  } catch(err) {
    res.status(500).json({message: "Failed to delete history"})
  }
})

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
