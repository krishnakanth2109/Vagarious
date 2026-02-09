// File: chatbotService.js

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
 * Optimized for speed and low memory usage
 */
async function scrapeWebsite(url) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new", 
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    console.log("🌐 Scraping:", url);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    // Minimal delay for dynamic content to load
    await delay(1500);

    const content = await page.evaluate(() => {
      // Remove noise to save tokens and speed up AI processing
      document.querySelectorAll("script, style, nav, footer, header, noscript, iframe, ads").forEach(el => el.remove());
      // Clean up whitespace and newlines for faster reading
      return document.body.innerText.replace(/\s+/g, " ").trim();
    });

    return content;
  } catch (err) {
    console.error(`❌ Scraper error on ${url}:`, err.message);
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
    console.error("❌ Missing GOOGLE_API_KEY. AI disabled.");
    return;
  }

  const urls = [
    "https://www.vagarioussolutions.com",
    "https://www.vagarioussolutions.com/about",
    "https://www.vagarioussolutions.com/services",
    "https://www.vagarioussolutions.com/contact"
  ];

  let combinedText = "";
  for (const url of urls) {
    const text = await scrapeWebsite(url);
    if (text && text.length > 100) {
      combinedText += `\n\n[Source: ${url}]\n${text}`;
    }
  }

  websiteKnowledge = combinedText;
  console.log("🏁 AI Knowledge Base Ready (Optimized for Flash)");
}

/**
 * 3. AI GENERATION LOGIC
 * Switched to gemini-1.5-flash for the fastest possible response time
 */
export async function getChatResponse(userMessage) {
  if (!websiteKnowledge) {
    return "My knowledge base is loading. Please give me a moment!";
  }

  try {
    // ⚡ gemini-1.5-flash is optimized for low-latency
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are the Vagarious Solutions AI Assistant.
      
      RULES:
      1. Use the provided website knowledge to answer.
      2. If unknown, say: "I can only assist with information related to Vagarious Solutions."
      3. Response style: Professional, friendly, and very concise.
      4. Limit: Maximum 2-3 sentences.

      WEBSITE KNOWLEDGE:
      ${websiteKnowledge.substring(0, 15000)}

      USER QUESTION: 
      ${userMessage}
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("❌ AI Error:", error);
    return "I'm having trouble responding right now. Please try again.";
  }
}