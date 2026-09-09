// APT Advanced Trailer — AI Chatbot Backend
// Node/Express server that proxies chat messages to the Claude API,
// keeping your Anthropic API key safe on the server (never expose it in the widget/browser).

const express = require("express");
const cors = require("cors");

const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

const app = express();
app.use(express.json());

// --- CORS: only allow requests from your live site(s) ---
const ALLOWED_ORIGINS = [
  "https://advancedtrailer.com",
  "https://www.advancedtrailer.com",
  // add a staging/preview URL here while testing, e.g. "https://apt-staging.godaddysites.com"
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

// --- Company knowledge base ---
// Edit this freely. This is the ONLY source of truth the bot is allowed to use
// for facts about trailers, pricing, specs, and the company. Update it whenever
// your specs/pricing/staff change — the bot will pick it up automatically.
const COMPANY_KNOWLEDGE = `
COMPANY: Advanced Trailer (APT Advanced Trailer and Equipment, LP)
Website: advancedtrailer.com
Founded: 1995, started as a semi trailer dealership in Vienna, Georgia.

HISTORY:
- Began as a semi trailer dealership. After a customer bought 100 trailers to dry peanuts in them, the company shifted into converting/manufacturing peanut-drying trailers.
- By 2003, fully committed to converting semi trailers for peanut drying. Redesigned trailers into a stronger "super-trailer" spec based on customer feedback.
- Now also active in hemp drying trailers.
- Has distributed thousands of trailers nationwide (marketing copy on the site cites figures in the 6,000–10,000 range historically — do not state an exact number unless the visitor needs a rough sense of scale; say "thousands of trailers nationwide" instead).

PRODUCTS:
- Peanut drying/hauling semi trailers (core product)
  - Standard length: 48 feet (45' or 53' available by special request)
  - Drying floor: 40%
  - Regular price: $27,400
  - CURRENT PROMO (through September 30): $1,500 off — $25,900
  - Comes standard with: tarps, brand new tires, clean white paint
  - Landing gear: floating foot as standard; duck feet (sand shoes) available if requested
  - Custom metal floors or walls available if requested
- Hemp drying trailers
- In-house replacement parts for these trailers
- Trailer repair & service — includes an in-the-field service truck and repair team

WHY CUSTOMERS CHOOSE APT:
- Market leadership: 30 years in business, reputation for loyalty and consistency
- Integrity: trailer design improvements are customer-driven, strong safety focus
- Reliability: known for fulfilling orders on time — important for farming customers with tight harvest windows

LOCATIONS / CONTACT:
- Services / Operations: David Koshy, General Manager — 405 Keaton Street, Vienna, Georgia 31092 — Phone: 1-434-209-4042
- Business Office: Jimmy Mathews, CEO/President — 750 Gateway Blvd, Coppell, TX 75019 (also listed at 2106 E State Highway 114, STE 303, Southlake, TX 76092) — Toll Free: 1 (800) 860-1360

WHAT THE BOT SHOULD DO:
- Answer visitor questions about what APT does, trailer types, service/repair, and how to get in touch.
- For the peanut drying trailer, quote the real price and promo above when asked — mention the September 30 deadline so visitors know it's time-limited.
- For anything NOT covered in this knowledge base (hemp trailer pricing, exact lead times, financing options, availability/stock, custom specs, part prices, etc.): do NOT guess or make up numbers. Instead, collect the visitor's name, phone/email, and what they're looking for, and let them know someone from APT will follow up — or give them the Vienna, GA phone number (1-434-209-4042) to call directly.
- Keep answers short, friendly, and professional — visitors are often farmers, trucking companies, or ag/distribution businesses trying to get a quick answer.
`;

const SYSTEM_PROMPT = `You are the AI assistant on the Advanced Trailer (APT) website, advancedtrailer.com. APT manufactures and repairs peanut and hemp drying semi trailers, based in Vienna, Georgia.

Use ONLY the information below as fact about the company. If a visitor asks something not covered here (exact pricing, specific stock/availability, detailed technical specs, delivery timelines), do not invent an answer — tell them you'll pass it to the team, and offer to collect their contact info or give them the phone number to call.

${COMPANY_KNOWLEDGE}

Tone: helpful, concise, professional — a few sentences per answer, not long essays. This is a B2B industrial audience (farmers, ag companies, trucking/distribution businesses), not a casual consumer chat.`;

// --- Chat endpoint ---
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    // messages: [{ role: "user"|"assistant", content: "..." }, ...]

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array is required" });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", errText);
      return res.status(502).json({ error: "Upstream AI error" });
    }

    const data = await response.json();
    const reply = data.content?.find((b) => b.type === "text")?.text || "Sorry, I couldn't generate a reply.";

    res.json({ reply });
  } catch (err) {
    console.error("Chat endpoint error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`APT chatbot backend running on port ${PORT}`));
