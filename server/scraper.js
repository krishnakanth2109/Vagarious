import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeWebsite(url) {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
    });

    const $ = cheerio.load(response.data);

    // Remove elements that confuse the AI (menus, scripts, footers)
    $("script, style, nav, footer, header, noscript, iframe").remove();

    // Get clean text
    const text = $("body")
      .text()
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .trim();

    return text;
  } catch (error) {
    console.error(`⚠️ Error scraping ${url}: ${error.message}`);
    return ""; // Return empty string on failure so app doesn't crash
  }
}