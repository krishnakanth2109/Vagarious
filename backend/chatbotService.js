// --- START OF FILE chatbotService.js ---

import puppeteer from "puppeteer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Store Scraped Data in Memory
let websiteKnowledge = "";

// Helper: Delay function for Puppeteer
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 1. PUPPETEER SCRAPER LOGIC
 */
async function scrapeWebsite(url) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true, // Set to true for production/servers
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-blink-features=AutomationControlled"
      ]
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    );

    await page.setViewport({ width: 1366, height: 768 });
    console.log("🌐 Opening:", url);

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    // Wait for dynamic content
    await delay(3000);

    const content = await page.evaluate(() => {
      // Remove non-essential elements to clean up text
      document.querySelectorAll("script, style, nav, footer, header, noscript").forEach(el => el.remove());
      return document.body.innerText.replace(/\s+/g, " ").trim();
    });

    return content;

  } catch (err) {
    console.error(`❌ Puppeteer error on ${url}:`, err.message);
    return "";
  } finally {
    if (browser) await browser.close();
  }
}

/**
 * 2. KNOWLEDGE BASE BUILDER
 */
export async function loadKnowledge() {
  if (!process.env.GOOGLE_API_KEY) {
    console.error("❌ Missing GOOGLE_API_KEY in .env file. Chatbot will not work.");
    return;
  }

  console.log("🔄 Starting knowledge base update...");

  const urls = [
    "https://www.vagarioussolutions.com",
    "https://www.vagarioussolutions.com/about",
    "https://www.vagarioussolutions.com/services",
    "https://www.vagarioussolutions.com/contact"
  ];

  let combinedText = "";

  for (const url of urls) {
    try {
      const text = await scrapeWebsite(url);
      if (!text || text.length < 200) {
        console.log("❌ Skipped (No content):", url);
        continue;
      }
      combinedText += `\n\nCONTENT FROM ${url}:\n${text}`;
      console.log("✅ Loaded:", url);
    } catch (err) {
      console.log("❌ Failed to load:", url);
    }
  }

  websiteKnowledge = combinedText;
  console.log("🏁 Knowledge loading complete. AI is ready.");
}

/**
 * 3. AI GENERATION LOGIC
 */
export async function getChatResponse(userMessage) {
  if (!websiteKnowledge) {
    return "I am currently loading my knowledge base. Please try again in a few seconds.";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Limit context size to prevent token errors
    const maxLength = 30000;
    const contextData = websiteKnowledge.length > maxLength 
      ? websiteKnowledge.substring(0, maxLength) + "..." 
      : websiteKnowledge;

    const prompt = `
      You are the Vagarious Solutions AI Assistant.
      
      RULES:
      1. Use ONLY the website knowledge provided below.
      2. If the answer is not in the context, say: "I'm sorry, I can help only with Vagarious Solutions related information."
      3. Be professional and concise.
      4. ✅ STRICT LIMIT: Keep your answer under 50 words (max 3 sentences).

      WEBSITE KNOWLEDGE:
      ${contextData}

      USER QUESTION: 
      ${userMessage}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error("❌ AI Generation Error:", error);
    return "I encountered an error processing your request.";
  }
}