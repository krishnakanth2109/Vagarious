// File: chatbotService.js

import puppeteer from "puppeteer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// Store Scraped Data in Memory
let websiteKnowledge = "";
let workingModel = null; // Cache the working model name

// Helper: Delay function for Puppeteer
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 1. PUPPETEER SCRAPER LOGIC
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

    await delay(1500);

    const content = await page.evaluate(() => {
      document.querySelectorAll("script, style, nav, footer, header, noscript, iframe, ads").forEach(el => el.remove());
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
 * 2. VERIFY API KEY AND FIND WORKING MODEL
 */
async function findWorkingModel() {
  const apiKey = process.env.GOOGLE_API_KEY;
  
  if (!apiKey) {
    console.error("❌ GOOGLE_API_KEY is missing from .env file");
    console.log("📝 Get your API key from: https://aistudio.google.com/app/apikey");
    return null;
  }

  console.log("🔍 Finding the best available model...");

  try {
    // Use native fetch to get available models
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ API error (${response.status}):`, data.error?.message || "Unknown error");
      console.log("📝 Get a NEW API key from: https://aistudio.google.com/app/apikey");
      return null;
    }

    if (!data.models || data.models.length === 0) {
      console.error("❌ No models available for this API key");
      return null;
    }

    console.log(`✅ Found ${data.models.length} available models`);
    
    // Try to find the best model - updated with new Google model names
    const modelPreferences = [
      'gemini-2.5-flash',           // Latest and fastest
      'gemini-flash-latest',        // Generic latest flash
      'gemini-2.0-flash',           // Older flash
      'gemini-2.5-pro',             // Pro version
      'gemini-pro-latest',          // Generic latest pro
      'gemini-1.5-flash',           // Legacy flash
      'gemini-1.5-pro',             // Legacy pro
      'gemini-pro'                  // Very old
    ];

    for (const pref of modelPreferences) {
      const found = data.models.find(m => m.name.includes(pref));
      if (found) {
        const modelName = found.name.replace('models/', '');
        console.log(`✅ Using model: ${modelName}`);
        return modelName;
      }
    }

    // If no preferred model found, use the first available one
    const modelName = data.models[0].name.replace('models/', '');
    console.log(`✅ Using first available model: ${modelName}`);
    return modelName;

  } catch (error) {
    console.error("❌ Network error checking models:", error.message);
    return null;
  }
}

/**
 * 3. KNOWLEDGE BASE BUILDER
 */
export async function loadKnowledge() {
  // First, find a working model
  workingModel = await findWorkingModel();
  
  if (!workingModel) {
    console.error("❌ AI chatbot disabled - no valid model found");
    console.log("📝 Please check your GOOGLE_API_KEY in the .env file");
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
  console.log("🏁 AI Knowledge Base Ready");
}

/**
 * 4. AI GENERATION LOGIC
 */
export async function getChatResponse(userMessage) {
  if (!workingModel) {
    return "AI chatbot is currently unavailable. Please check the server configuration.";
  }

  if (!websiteKnowledge) {
    return "My knowledge base is loading. Please give me a moment!";
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: workingModel });

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
    console.error("❌ AI Error:", error.message);
    return "I'm having trouble responding right now. Please try again in a moment.";
  }
}