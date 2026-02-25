import express from 'express';
import nodeFetch from 'node-fetch';
import puppeteer from 'puppeteer';

const router = express.Router();

/**
 * Knowledge Base Store
 * Initially populated with fallback data, then updated dynamically
 */
let KNOWLEDGE_BASE = {
    content: [],
    lastSynced: null,
    isSyncing: false
};

const FALLBACK_CONTENT = [
    {
        id: "home",
        keywords: ["home", "vagarious", "company", "about us", "who is", "what is vagarious"],
        content: `Vagarious Solutions is your trusted IT & Non-IT recruitment partner. 
        We specialize in connecting exceptional talent with outstanding opportunities. 
        We have over 15+ years of experience, 1500+ placements, and 200+ client companies.
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
        - The process involves submitting your resume, initial screening, job matching, interview prep, and getting hired.`
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
        keywords: ["contact", "email", "phone", "address", "location", "reach", "office", "bangalore", "mumbai", "delhi", "hyderabad"],
        content: `Contact Vagarious Solutions:
        - **Email**: contact@vagarious.com
        - **Location**: Headquartered in Hyderabad, with presence in Bangalore, Mumbai, and Delhi.
        - **Support**: Reach out via our website's contact form for expert assistance.`
    }
];

// Initialize with fallbacks
KNOWLEDGE_BASE.content = FALLBACK_CONTENT;

/**
 * Synchronize Chatbot Intelligence with Live Website
 */
export async function syncChatbotKnowledge() {
    if (KNOWLEDGE_BASE.isSyncing) return;
    KNOWLEDGE_BASE.isSyncing = true;

    console.log("🌐 Chatbot Intelligence: Initiating knowledge sync...");

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
        });

        const routes = ['/', '/about', '/services', '/ITRecruitment', '/employers', '/candidates', '/contact'];
        const PRIMARY_URL = 'http://localhost:8080';
        const FALLBACK_URL = 'https://vagarioussolutions.com';

        const scrapeResults = await Promise.all(routes.map(async (route) => {
            let page;
            try {
                page = await browser.newPage();
                await page.setRequestInterception(true);
                page.on('request', (req) => {
                    if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) req.abort();
                    else req.continue();
                });

                let loaded = false;
                try {
                    await page.goto(`${PRIMARY_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 5000 });
                    loaded = true;
                } catch (e) {
                    try {
                        await page.goto(`${FALLBACK_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
                        loaded = true;
                    } catch (e2) { /* Fail silently to proceed with others */ }
                }

                if (loaded) {
                    const content = await page.evaluate(() => {
                        document.querySelectorAll('script, style, nav, footer, img, noscript, header, iframe').forEach(el => el.remove());
                        return document.body ? document.body.innerText.replace(/\s+/g, ' ').trim() : '';
                    });

                    if (content.length > 100) {
                        return {
                            id: route === '/' ? 'home' : route.substring(1).toLowerCase(),
                            keywords: [route === '/' ? 'home' : route.substring(1).toLowerCase(), 'vagarious'],
                            content: content.substring(0, 3000)
                        };
                    }
                }
            } catch (err) {
                console.warn(`⚠️ Chatbot Sync: Route ${route} skipped - ${err.message}`);
            } finally {
                if (page) await page.close();
            }
            return null;
        }));

        const freshData = scrapeResults.filter(Boolean);
        if (freshData.length > 0) {
            KNOWLEDGE_BASE.content = freshData;
            KNOWLEDGE_BASE.lastSynced = new Date();
            console.log(`✨ Chatbot Intelligence: Successfully synced ${freshData.length} pages.`);
        } else {
            console.log("ℹ️ Chatbot Intelligence: No new data found, maintaining current knowledge.");
        }
    } catch (error) {
        console.error("⛔ Chatbot Intelligence: Critical sync failure:", error.message);
    } finally {
        if (browser) await browser.close();
        KNOWLEDGE_BASE.isSyncing = false;
    }
}

// Chat API Route
router.post('/', async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const userMessage = message.toLowerCase();

    try {
        if (process.env.GROQ_API_KEY) {
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
                            Use this company context ONLY: ${JSON.stringify(KNOWLEDGE_BASE.content)}.
                            If the answer isn't in the context, politely state you only assist with Vagarious-related information.
                            Style: Professional, concise, use emojis, bold terms.`
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
        throw new Error("AI provider unavailable");
    } catch (error) {
        console.log("ℹ️ Chatbot: Using local knowledge search...");

        let bestMatch = null;
        let maxScore = 0;

        KNOWLEDGE_BASE.content.forEach(section => {
            let score = 0;
            section.keywords.forEach(kw => {
                if (userMessage.includes(kw)) score += kw.length;
            });
            if (score > maxScore) {
                maxScore = score;
                bestMatch = section.content;
            }
        });

        const response = bestMatch || "Hello! I'm Vagarious Assistant. How can I help you today?";
        return res.json({ response });
    }
});

export default router;
