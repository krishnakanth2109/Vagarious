import { scrapeWebsite } from "./scraper.js";

let websiteKnowledge = "";

export async function loadKnowledge() {
  const urls = [
    "https://vagarioussolutions.com",
    "https://vagarioussolutions.com/about",
    "https://vagarioussolutions.com/services",
    "https://vagarioussolutions.com/contact"
  ];

  let combinedText = "";
  console.log("🔄 Starting knowledge base update...");

  for (const url of urls) {
    try {
      const text = await scrapeWebsite(url);
      if (text) {
        combinedText += `\n\n--- SOURCE: ${url} ---\n${text}`;
        console.log(`✅ Scraped: ${url}`);
      }
    } catch (err) {
      console.log(`❌ Failed: ${url}`);
    }
  }

  websiteKnowledge = combinedText;
  console.log("🏁 Knowledge loading complete. AI is ready.");
}

export function getKnowledge() {
  return websiteKnowledge;
}