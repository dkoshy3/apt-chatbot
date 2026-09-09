# APT Advanced Trailer — AI Chatbot

A custom AI chatbot for advancedtrailer.com, trained only on facts about APT (no made-up pricing or specs). Same stack pattern as the coaching site: Node/Express backend + a small embeddable widget, deployable on Render.

## What's in here
- `server.js` — backend that talks to the Claude API. Keeps your API key private.
- `public/widget.js` — the actual chat bubble that goes on the WordPress site.
- The company facts the bot is allowed to use live in `COMPANY_KNOWLEDGE` inside `server.js` — edit that block any time specs, pricing approach, staff, or locations change.

## 1. Deploy the backend (Render — same as the coaching site)
1. Push this folder to a new GitHub repo (e.g. `apt-chatbot`).
2. In Render: **New → Web Service** → connect the repo.
   - Build command: `npm install`
   - Start command: `npm start`
3. Add an environment variable in Render:
   - `ANTHROPIC_API_KEY` = your Anthropic API key (get one at console.anthropic.com if you don't have one yet)
4. Deploy. Render will give you a URL like `https://apt-chatbot.onrender.com`.
5. Test it's alive by visiting `https://apt-chatbot.onrender.com/health` — should return `{"status":"ok"}`.

## 2. Point the widget at your backend
Open `public/widget.js`, find this line near the top:
```js
const BACKEND_URL = "https://apt-chatbot.onrender.com/api/chat";
```
Replace it with your actual Render URL + `/api/chat`. Commit and redeploy (Render auto-redeploys on push).

## 3. Add the widget to WordPress
You do NOT need to touch the WPBakery page content for this. Easiest ways:

**Option A — Header/Footer plugin (recommended, no theme editing)**
1. In wp-admin: **Plugins → Add New** → search **"Insert Headers and Footers"** (by WPCode or similar) → Install & Activate.
2. Go to its settings → **Footer** section → paste:
   ```html
   <script src="https://apt-chatbot.onrender.com/widget.js"></script>
   ```
   (use your real Render URL)
3. Save. The chat bubble will now appear on every page, bottom-right corner.

**Option B — Theme footer directly** (if you're comfortable editing theme files)
- **Appearance → Theme File Editor → footer.php**, paste the same `<script>` tag right before `</body>`.

## 4. Update CORS
In `server.js`, the `ALLOWED_ORIGINS` list only allows requests from `advancedtrailer.com`. If you test on a staging URL first, add that URL to the list before testing there.

## Keeping the bot accurate
Whenever your specs, pricing approach, or contact info change, just update the `COMPANY_KNOWLEDGE` block in `server.js` and redeploy — no need to touch the widget or WordPress again. The bot is instructed to never guess exact pricing/specs it doesn't have — it'll collect the visitor's contact info instead so a human can follow up.
