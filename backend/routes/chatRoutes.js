import express from 'express';
import nodeFetch from 'node-fetch';
import puppeteer from 'puppeteer';

const router = express.Router();

let SITE_CONTENT = [
    {
        id: "home",
        keywords: ["home", "vagarious", "company", "about us", "overview", "who is", "what is vagarious"],
        content: `Vagarious Solutions is your trusted IT & Non-IT recruitment partner. 
        We specialize in connecting exceptional talent with outstanding opportunities. 
        We have over 15+ years of experience, 1500+ placements, and 200+ client companies.
        We serve industries like IT & Software, BFSI, Healthcare, Manufacturing, Retail, and BPO.
        Our mission is to be a reliable recruitment partner, connecting talent with opportunity.`
    },
    {
        id: "services",
        keywords: ["services", "offer", "provide", "recruitment", "staffing", "consultancy", "domains", "sectors", "industries"],
        content: `We offer a comprehensive range of recruitment services:
        1. **IT Recruitment**: Software Development, Testing & QA, Cloud & DevOps, Data & Analytics, Cybersecurity.
        2. **Non-IT Recruitment**: Sales & Marketing, HR, Finance, Operations, Customer Support.
        3. **Permanent Staffing**: Finding dedicated full-time employees for long-term growth.
        4. **Contract Staffing**: Flexible solutions for project-based or seasonal needs.
        5. **Executive Search**: Headhunting for senior leadership roles.`
    },
    {
        id: "candidates",
        keywords: ["candidate", "job", "work", "apply", "resume", "cv", "vacancy", "opening", "career", "hiring", "positions"],
        content: `For Job Seekers:
        - We provide access to premium job opportunities in both IT and Non-IT sectors.
        - Our services are completely free for candidates.
        - You can browse current openings and upload your resume on our "Candidates" page.
        - The process involves submitting your resume, initial screening, job matching, interview prep, and getting hired.
        - We also offer career counseling and salary negotiation guidance.`
    },
    {
        id: "employers",
        keywords: ["employer", "business", "company", "hire", "submit requirement", "partner", "client", "staffing needed"],
        content: `For Employers:
        - We help you build your dream team with reliable, efficient, and cost-effective recruitment.
        - We offer Contingency Hiring, Retained Search, and RPO Services.
        - Our process includes Requirement Analysis, Talent Sourcing, Screening, Shortlisting, and Onboarding support.
        - You can submit your hiring requirements directly on our "Employers" page, and we will respond within 24 hours.`
    },
    {
        id: "contact",
        keywords: ["contact", "email", "phone", "address", "location", "reach", "support", "office", "headquarters", "bangalore", "mumbai", "delhi", "hyderabad"],
        content: `You can reach us specifically via:
        - **Email**: contact@vagarious.com
        - **Location**: Headquartered in Hyderabad, with presence in Bangalore, Mumbai, and Delhi.
        - **Support**: Use the contact form on our website to talk to an expert.`
    }
];

let HAS_SCRAPED = false;

async function scrapeWebsite() {
    if (HAS_SCRAPED) return;
    try {
        console.log("🌐 Chatbot: Starting live web intelligence sync...");
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });

        const scrapedData = [];
        // Try local first, then production/remote
        const PRIMARY_URL = 'http://localhost:8080';
        const FALLBACK_URL = 'https://vagarioussolutions.com'; // Use your real domain here

        const routes = ['/', '/about', '/services', '/ITRecruitment', '/employers', '/candidates', '/contact'];

        for (const route of routes) {
            try {
                const page = await browser.newPage();
                await page.setRequestInterception(true);
                page.on('request', (req) => {
                    if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) req.abort();
                    else req.continue();
                });

                let loaded = false;
                try {
                    await page.goto(`${PRIMARY_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 8000 });
                    loaded = true;
                } catch (e) {
                    console.log(`⚠️ Localhost unavailable for ${route}, trying remote...`);
                    try {
                        await page.goto(`${FALLBACK_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
                        loaded = true;
                    } catch (e2) {
                        console.log(`❌ Failed to load ${route} from all sources.`);
                    }
                }

                if (loaded) {
                    const content = await page.evaluate(() => {
                        document.querySelectorAll('script, style, nav, footer, img, noscript').forEach(el => el.remove());
                        return document.body ? document.body.innerText.replace(/\\s+/g, ' ').trim() : '';
                    });

                    if (content.length > 100) {
                        scrapedData.push({
                            id: route === '/' ? 'home' : route.substring(1),
                            keywords: [route === '/' ? 'home' : route.substring(1), 'vagarious'],
                            content: content.substring(0, 2500)
                        });
                    }
                }
                await page.close();
            } catch (err) {
                console.log(`❌ Scrape error on ${route}: ${err.message}`);
            }
        }

        await browser.close();

        if (scrapedData.length > 0) {
            SITE_CONTENT = scrapedData;
            HAS_SCRAPED = true;
            console.log("✨ Chatbot knowledge synced successfully from live site!");
        }
    } catch (error) {
        console.error("⛔ Scraper Critical Failure:", error.message);
    }
}

// Start scraper
scrapeWebsite();

router.post('/', async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const userMessage = message.toLowerCase();

    try {
        if (process.env.GROQ_API_KEY) {
            console.log("🤖 Querying Groq AI...");
            const groqResponse = await nodeFetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        {
                            role: 'system',
                            content: `You are Vagarious Assistant, a professional AI for Vagarious Solutions. 
                            Answer based ONLY on this context: ${JSON.stringify(SITE_CONTENT)}.
                            If the answer isn't there, say you can only help with Vagarious-related queries.
                            Be concise, use emojis, and bold key terms.`
                        },
                        { role: 'user', content: message }
                    ],
                    temperature: 0.6
                }),
            });

            if (groqResponse.ok) {
                const data = await groqResponse.json();
                return res.json({ response: data.choices[0].message.content });
            }
        }
        throw new Error("AI Fallback required");
    } catch (error) {
        console.error("⚠️ AI Mode Failed, switching to Knowledge Search:", error.message);

        let bestMatch = null;
        let maxScore = 0;

        SITE_CONTENT.forEach(section => {
            let score = 0;
            section.keywords.forEach(kw => {
                if (userMessage.includes(kw.toLowerCase())) score += kw.length;
            });
            if (score > maxScore) {
                maxScore = score;
                bestMatch = section.content;
            }
        });

        const response = bestMatch || "Hello! How can I help you find information about Vagarious Solutions today?";
        return res.json({ response });
    }
});

export default router;
