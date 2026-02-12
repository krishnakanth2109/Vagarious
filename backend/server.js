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
import chatRoutes from "./routes/chatRoutes.js";
import authRoutes from "./routes/authRoutes.js";

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// --- CORS CONFIGURATION ---
const allowedOrigins = [
  "https://vagarious-420.netlify.app",
  "https://vagarious.onrender.com",
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:5000",
  "http://localhost:3000",
  "https://hrms-vaz.netlify.app",
  "https://hrms-420.netlify.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (Postman, mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

// Apply Middleware
app.use(cors(corsOptions));
app.use(express.json()); // Parse JSON bodies

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
    // Do not crash the app if DB fails, so Chatbot can still work in offline mode if designed to
    console.warn("Continuing without DB connection...");
  }
};

// --- API ROUTES ---
app.use("/api/jobs", jobRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/it-recruitment", itRecruitmentRoutes);
app.use("/api/employer-requirements", employerRequirementRoutes);
app.use("/api/non-it-roles", nonITRoleRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/auth", authRoutes);

// Root Route (Health Check)
app.get("/", (req, res) => {
  res.json({
    message: "VGS Recruitment API is running...",
    environment: process.env.NODE_ENV || "development"
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// --- START SERVER ---
connectDB().then(() => {
  app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);

    // Initialize Chatbot Knowledge Base after server starts
    // We catch potential errors here to not crash the server if loading fails
    try {
      await loadKnowledge();
    } catch (err) {
      console.error("Knowledge load failed:", err);
    }
  });
}).catch((err) => {
  // This catch block handles errors from connectDB itself if it were to throw (it catches internally though)
  console.error("Failed to connect to DB:", err.message);
  console.log("Starting server in Offline Mode...");
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});