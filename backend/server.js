// --- START OF FILE app.js ---

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Import Chatbot Service
import { loadKnowledge, getChatResponse } from "./chatbotService.js";

// Import Routes
import jobRoutes from "./routes/jobRoutes.js";
import candidateRoutes from "./routes/candidateRoutes.js";
import itRecruitmentRoutes from "./routes/itRecruitmentRoutes.js";
import employerRequirementRoutes from "./routes/employerRequirementRoutes.js";
import nonITRoleRoutes from "./routes/nonITRoleRoutes.js";
<<<<<<< HEAD
import chatRoutes from "./routes/chatRoutes.js"; // <--- IMPORT THIS

=======
import authRoutes from "./routes/authRoutes.js"; // <--- ADDED AUTH ROUTES
>>>>>>> b2f902fb7074265c690bd0d496376c8f821b4659
// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// --- CORS CONFIGURATION ---
const allowedOrigins = [
<<<<<<< HEAD
  "https://vagarious-420.netlify.app", // Your Netlify Frontend
  "https://vagarious.onrender.com",    // Your Render Backend
  "http://localhost:5173",             // Vite Localhost
  "http://localhost:8080",             // Your specific Localhost port
  "http://localhost:5000",
  "http://localhost:3000"            // Backend Localhost
=======
  "https://vagarious-420.netlify.app", 
  "https://vagarious.onrender.com",    
  "http://localhost:5173",             
  "http://localhost:8080",            
  "http://localhost:5000",
  "http://localhost:3000",
  "https://hrms-vaz.netlify.app"         
>>>>>>> b2f902fb7074265c690bd0d496376c8f821b4659
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, 
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

// Apply Middleware
<<<<<<< HEAD
app.use(cors(corsOptions));
app.use(express.json()); // Parse JSON bodies
=======
app.use(cors(corsOptions)); 
app.use(express.json()); 
>>>>>>> b2f902fb7074265c690bd0d496376c8f821b4659

// Database Connection Function
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from .env file");
    }
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
<<<<<<< HEAD
    // On Render, we want to know why it failed, but not crash loop instantly if possible.
    // However, without DB, the app is useless, so exiting is standard.
    // process.exit(1); // Do not crash the app if DB fails, so Chatbot can still work
    console.warn("Continuing without DB connection...");
=======
    process.exit(1);
>>>>>>> b2f902fb7074265c690bd0d496376c8f821b4659
  }
};

// --- API ROUTES ---
app.use("/api/jobs", jobRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/it-recruitment", itRecruitmentRoutes);
app.use("/api/employer-requirements", employerRequirementRoutes);
app.use("/api/non-it-roles", nonITRoleRoutes);
<<<<<<< HEAD
app.use("/api/chat", chatRoutes); // <--- Chatbot Route
=======
app.use("/api/auth", authRoutes); // <--- USE AUTH ROUTES
// --- CHATBOT ROUTE ---
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ reply: "Message is required" });

    const reply = await getChatResponse(message);
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ reply: "Internal server error during chat processing." });
  }
});
>>>>>>> b2f902fb7074265c690bd0d496376c8f821b4659

// Root Route (Health Check)
app.get("/", (req, res) => {
  res.json({
    message: "VGS Recruitment API is running...",
    environment: process.env.NODE_ENV || "development",
    cors_allowed: allowedOrigins
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// --- START SERVER ---
connectDB().then(() => {
<<<<<<< HEAD
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
=======
    app.listen(PORT, async () => {
      console.log(`Server running on port ${PORT}`);
      
      // Initialize Chatbot Knowledge Base after server starts
      // This ensures the server is responsive while scraping happens in background
      loadKnowledge().catch(err => console.error("Knowledge load failed:", err));
    });
>>>>>>> b2f902fb7074265c690bd0d496376c8f821b4659
}).catch((err) => {
  console.error("Failed to connect to DB:", err.message);
  console.log("Starting server in Offline Mode (for Chatbot only)...");
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});