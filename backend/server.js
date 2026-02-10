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
import authRoutes from "./routes/authRoutes.js"; 

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// --- CORS CONFIGURATION ---
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://hrms-420.netlify.app",
  "http://localhost:8080",
  "https://vagarious-420.netlify.app"
];

// Define corsOptions properly before using it
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
app.use(cors(corsOptions)); // Now this variable exists
app.use(express.json()); 

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
    process.exit(1);
  }
};

// --- API ROUTES ---
app.use("/api/jobs", jobRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/it-recruitment", itRecruitmentRoutes);
app.use("/api/employer-requirements", employerRequirementRoutes);
app.use("/api/non-it-roles", nonITRoleRoutes);
app.use("/api/auth", authRoutes); 

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
    app.listen(PORT, async () => {
      console.log(`Server running on port ${PORT}`);
      
      // Initialize Chatbot Knowledge Base after server starts
      loadKnowledge().catch(err => console.error("Knowledge load failed:", err));
    });
}).catch((err) => {
    console.error("Failed to connect to DB, server not started:", err);
});