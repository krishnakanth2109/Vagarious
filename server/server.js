import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { loadKnowledge, getKnowledge } from "./knowledge.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 Check API Key
if (!process.env.GOOGLE_API_KEY) {
  console.error("❌ Missing GOOGLE_API_KEY in .env file");
  process.exit(1);
}

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// ✅ Text Limiter (Increased limit for Gemini 1.5 Flash)
function limitText(text, maxLength = 100000) {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

// Chat API Endpoint
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "Message is required" });
    }

    // Get the scraped data
    const contextData = getKnowledge();

    if (!contextData) {
      return res.status(503).json({ reply: "System is still loading knowledge. Please wait a moment." });
    }

    // 🔄 Use gemini-1.5-flash (Standard, Fast, High Context)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash", 
      systemInstruction: `
      You are the Vagarious Solutions AI Assistant.
      
      RULES:
      1. Use ONLY the website knowledge provided below to answer.
      2. If the answer is not in the context, reply EXACTLY: "I'm sorry, I can help only with Vagarious Solutions related information."
      3. Be professional, concise, and helpful.

      WEBSITE KNOWLEDGE:
      ${limitText(contextData)}
      `
    });

    const result = await model.generateContent(message);
    const response = await result.response;
    
    res.json({ reply: response.text() });

  } catch (error) {
    console.error("❌ AI Generation Error:", error);
    res.status(500).json({ reply: "I encountered an error processing your request." });
  }
});

// Start Server
async function startServer() {
  // Scrape data before opening port
  await loadKnowledge();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();