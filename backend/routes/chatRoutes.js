
import express from 'express';

const router = express.Router();

// --- SITE CONTENT INDEX (Simulating "Reading the Site") ---
const SITE_CONTENT = [
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
    },
    {
        id: "process",
        keywords: ["process", "how it works", "steps", "methodology", "recruitment process", "hiring process", "recuriment"],
        content: `Our Recruitment Process:
        1. Requirement Analysis
        2. Talent Sourcing
        3. Screening & Assessment
        4. Shortlist Presentation
        5. Interview Coordination
        6. Offer & Onboarding`
    },
    {
        id: "reviews",
        keywords: ["review", "testimonial", "feedback", "rating", "satisfaction", "client say"],
        content: `Our clients love us! We have a 98% Client Satisfaction rate.
        "Vagarious Solutions transformed our hiring process... exceptional tech requirements understanding." - CTO, Tech Solutions Inc.
        "Remarkable consistency in delivering quality candidates." - HR Director, Global Services Ltd.`
    },
    {
        id: "social",
        keywords: ["social media", "linkedIn", "facebook", "twitter", "instagram", "follow"],
        content: `Stay connected with us! You can follow Vagarious Solutions on LinkedIn for the latest industry updates, job openings, and company news.`
    },
    {
        id: "system",
        keywords: ["are you ai", "real ai", "how do you work", "artificial intelligence", "bot work", "who created you", "model"],
        content: `I am V-Bot, a virtual assistant powered by advanced AI (Llama 3 via Groq). 
        I am here to help you with everything related to Vagarious Solutions. 
        I can answer your questions, help you find jobs, and provide information about our recruitment services.`
    }
];

const GENERAL_FALLBACK = "I apologize, but I couldn't find specific information about that on our website. I can help you with our Services, Job Openings for Candidates, or Hiring for Employers. What would you like to know?";

router.post('/', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    const userMessage = message.toLowerCase();

    try {
        // 1. Try Groq API (Cloud AI - Recommended for Render)
        if (process.env.GROQ_API_KEY) {
            const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile', // Updated model (Llama 3.3)
                    messages: [
                        {
                            role: 'system',
                            content: `You are V-Bot, a professional AI assistant for "Vagarious Solutions". 
                          Use the following context about the company to answer the user's question briefly and professionally.
                          
                          CONTEXT: ${JSON.stringify(SITE_CONTENT)}
                          
                          Key Rules:
                          1. Only answer based on the provided context.
                          2. Format your response in a **structured, clean way**.
                          3. Use **Recallable Bullet Points**, **Bold Text** for key terms, and short paragraphs.
                          4. **Use Emojis** liberally to make the conversation friendly and engaging. 
                             - Use 🚀 for growth/action
                             - Use 💼 for jobs/work
                             - Use 🤝 for partnership
                             - Use 💻 for tech/IT
                             - Use ✨ for highlights
                          5. Avoid long blocks of text. Make it look organized.
                          6. If you don't know the answer from the context, refuse politely.`
                        },
                        { role: 'user', content: message }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                }),
            });

            if (groqResponse.ok) {
                const data = await groqResponse.json();
                return res.json({ response: data.choices[0].message.content });
            } else {
                console.error("Groq API Error:", await groqResponse.text());
                throw new Error("Groq API Failed");
            }
        }

        // If no API key, force fallback
        throw new Error("No API Key - Using Site Search Mode");

    } catch (error) {
        console.error("Chat Route Error:", error.message);
        if (process.env.GROQ_API_KEY) console.log("Groq Key detected (ending in ...%s)", process.env.GROQ_API_KEY.slice(-4));
        else console.log("No Groq Key detected");

        // 2. "Analyze and Search Site" Logic

        let bestMatchContent = null;
        let maxScore = 0;

        // Simple Scoring Algorithm
        // Score = Number of matching keywords found in the user message

        SITE_CONTENT.forEach(section => {
            let score = 0;
            section.keywords.forEach(keyword => {
                const keywordLower = keyword.toLowerCase();
                // Check if the user message contains the keyword
                if (userMessage.includes(keywordLower)) {
                    // Boost score for exact or longer phrases (length > 4) to prefer "recruitment process" over just "process"
                    score += keywordLower.length > 4 ? 2 : 1;

                    // Extra boost if the keyword appears as a standalone word (regex check could be added here for precision)
                }
            });

            // Boost score for strong intent words relative to the section
            if (section.id === 'contact' && (userMessage.includes('contact') || userMessage.includes('email') || userMessage.includes('address'))) score += 3;
            if (section.id === 'services' && userMessage.includes('services')) score += 3;
            if (section.id === 'candidates' && (userMessage.includes('job') || userMessage.includes('vacancy') || userMessage.includes('opening'))) score += 3;
            if (section.id === 'process' && (userMessage.includes('process') || userMessage.includes('steps'))) score += 5; // Heavy weight for process
            if (section.id === 'reviews' && (userMessage.includes('review') || userMessage.includes('feedback'))) score += 4;
            if (section.id === 'social' && (userMessage.includes('social') || userMessage.includes('media'))) score += 4;

            if (score > maxScore) {
                maxScore = score;
                bestMatchContent = section.content;
            }
        });

        // Threshold: If score is 0, we found nothing relevant.
        // If score > 0, return the content.

        let response = GENERAL_FALLBACK;

        if (maxScore > 0 && bestMatchContent) {
            response = bestMatchContent;
        } else {
            // Basic "Who are you" check if no content matched
            if (userMessage.includes("who are you") || userMessage.includes("bot")) {
                response = "I am V-Bot, your virtual assistant. I've analyzed the Vagarious Solutions website and can answer questions about our Services, Candidates, and Employers.";
            } else if (userMessage.includes("hello") || userMessage.includes("hi ")) {
                response = "Hello! How can I help you find information on the Vagarious website today?";
            }
        }

        // Formatting the response nicely
        return res.json({ response: response });
    }
});

export default router;
