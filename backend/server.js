import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Import Routes
import jobRoutes from "./routes/jobRoutes.js";
import candidateRoutes from "./routes/candidateRoutes.js";
// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// --- CORS CONFIGURATION ---
const allowedOrigins = [
  "https://vagarious-420.netlify.app", // Your Netlify Frontend
  "https://vagarious.onrender.com",    // Your Render Backend
  "http://localhost:5173",             // Vite Localhost (Default)
  "http://localhost:8080",             // Your specific Localhost port
  "http://localhost:5000"              // Backend Localhost
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like Postman, mobile apps, or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies/headers if needed
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"]
};

// Apply CORS Middleware
app.use(cors(corsOptions)); 
app.use(express.json()); // Parse JSON bodies

// Database Connection
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from .env file");
    }
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Connect to Database
connectDB();

// Routes
app.use("/api/jobs", jobRoutes);
app.use("/api/candidates", candidateRoutes); // <--- USE THIS ROUTE
// Root Route (Health Check & Debugging)
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

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});