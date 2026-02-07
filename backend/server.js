import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Import Routes
import jobRoutes from "./routes/jobRoutes.js";
import candidateRoutes from "./routes/candidateRoutes.js";
import itRecruitmentRoutes from "./routes/itRecruitmentRoutes.js"; // <--- IMPORT
import employerRequirementRoutes from "./routes/employerRequirementRoutes.js";
import nonITRoleRoutes from "./routes/nonITRoleRoutes.js";
import chatRoutes from "./routes/chatRoutes.js"; // <--- IMPORT THIS

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// --- CORS CONFIGURATION ---
const allowedOrigins = [
  "https://vagarious-420.netlify.app", // Your Netlify Frontend
  "https://vagarious.onrender.com",    // Your Render Backend
  "http://localhost:5173",             // Vite Localhost
  "http://localhost:8080",             // Your specific Localhost port
  "http://localhost:5000",
  "http://localhost:3000"            // Backend Localhost
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like Postman, mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies/headers
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
    // On Render, we want to know why it failed, but not crash loop instantly if possible.
    // However, without DB, the app is useless, so exiting is standard.
    // process.exit(1); // Do not crash the app if DB fails, so Chatbot can still work
    console.warn("Continuing without DB connection...");
  }
};

// Routes
app.use("/api/jobs", jobRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/it-recruitment", itRecruitmentRoutes); // <--- ADD THIS
app.use("/api/employer-requirements", employerRequirementRoutes);
app.use("/api/non-it-roles", nonITRoleRoutes);
app.use("/api/chat", chatRoutes); // <--- Chatbot Route

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
// Only start the server if the database connects successfully
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error("Failed to connect to DB:", err.message);
  console.log("Starting server in Offline Mode (for Chatbot only)...");
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});