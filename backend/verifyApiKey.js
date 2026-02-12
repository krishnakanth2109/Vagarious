// File: verifyApiKey.js
// Simple script to verify your Google Gemini API key

import dotenv from "dotenv";
dotenv.config();

async function verifyApiKey() {
  console.log("\n" + "=".repeat(60));
  console.log("🔍 GOOGLE GEMINI API KEY VERIFICATION");
  console.log("=".repeat(60) + "\n");

  const apiKey = process.env.GOOGLE_API_KEY;

  // Step 1: Check if key exists
  if (!apiKey) {
    console.log("❌ ERROR: GOOGLE_API_KEY not found in .env file\n");
    console.log("📝 SOLUTION:");
    console.log("1. Create/edit .env file in your backend folder");
    console.log("2. Add this line: GOOGLE_API_KEY=your_actual_key_here");
    console.log("3. Get a FREE key from: https://aistudio.google.com/app/apikey\n");
    return;
  }

  console.log("✅ API Key found in .env file");
  console.log(`   Preview: ${apiKey.substring(0, 15)}...${apiKey.substring(apiKey.length - 5)}`);
  console.log(`   Length: ${apiKey.length} characters\n`);

  // Step 2: Validate key format
  if (apiKey.length < 35 || !apiKey.startsWith("AIzaSy")) {
    console.log("⚠️  WARNING: This doesn't look like a valid Google API key!");
    console.log("   Valid keys start with 'AIzaSy' and are 39+ characters long.\n");
  }

  // Step 3: Test the API key with direct fetch
  console.log("🧪 Testing API key with Google Gemini...\n");

  const testUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    const response = await fetch(testUrl);
    const data = await response.json();

    if (response.ok && data.models) {
      console.log("✅ SUCCESS! Your API key is VALID!\n");
      console.log(`📋 Available models: ${data.models.length}\n`);
      
      data.models.forEach((model, index) => {
        console.log(`${index + 1}. ${model.name}`);
      });

      // Find the best model
      console.log("\n💡 RECOMMENDED MODELS TO USE:\n");
      
      const flash = data.models.find(m => m.name.includes('gemini-1.5-flash'));
      const pro = data.models.find(m => m.name.includes('gemini-1.5-pro'));
      const legacy = data.models.find(m => m.name.includes('gemini-pro'));

      if (flash) console.log(`   ⚡ ${flash.name} (Fast, Recommended)`);
      if (pro) console.log(`   🧠 ${pro.name} (More capable)`);
      if (legacy) console.log(`   📦 ${legacy.name} (Legacy)`);

      console.log("\n✅ Your chatbot should work now!");

    } else if (response.status === 403) {
      console.log("❌ ERROR: API Key is NOT AUTHORIZED\n");
      console.log("📝 SOLUTION:");
      console.log("1. Your key doesn't have Gemini API access");
      console.log("2. Go to: https://aistudio.google.com/app/apikey");
      console.log("3. CREATE A NEW API KEY");
      console.log("4. Make sure to enable 'Generative Language API'\n");
      
    } else if (response.status === 400) {
      console.log("❌ ERROR: Invalid API Key Format\n");
      console.log("Error details:", data.error?.message || "Unknown error");
      console.log("\n📝 SOLUTION:");
      console.log("1. Your API key is invalid or malformed");
      console.log("2. Get a new key from: https://aistudio.google.com/app/apikey\n");
      
    } else {
      console.log("❌ ERROR: API Request Failed\n");
      console.log("Status:", response.status);
      console.log("Error:", JSON.stringify(data, null, 2));
      console.log("\n📝 SOLUTION:");
      console.log("1. Generate a NEW API key from: https://aistudio.google.com/app/apikey");
      console.log("2. Replace the key in your .env file\n");
    }

  } catch (error) {
    console.log("❌ NETWORK ERROR\n");
    console.log("Error:", error.message);
    console.log("\n📝 Check your internet connection and try again.\n");
  }

  console.log("=".repeat(60) + "\n");
}

// Run the verification
verifyApiKey();