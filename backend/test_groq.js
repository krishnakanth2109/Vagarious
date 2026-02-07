
import dotenv from "dotenv";
dotenv.config();

console.log("Checking Groq Key...");
const key = process.env.GROQ_API_KEY;
if (!key) {
    console.error("ERROR: No GROQ_API_KEY in .env");
    process.exit(1);
}
console.log(`Key found: ${key.slice(0, 5)}...`);

async function testGroq() {
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: 'Say hello' }]
            }),
        });

        if (response.ok) {
            const data = await response.json();
            console.log("SUCCESS! Groq responded:", data.choices[0].message.content);
        } else {
            console.error("FAILURE! Groq API Error:", await response.text());
        }
    } catch (e) {
        console.error("EXCEPTION:", e.message);
    }
}

testGroq();
