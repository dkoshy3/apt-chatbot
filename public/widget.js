/*
  APT Advanced Trailer — AI Chat Widget
  Drop this on the site via: <script src="https://YOUR-BACKEND-URL/widget.js"></script>
  It builds its own button + chat window, no other setup needed on the WordPress side.
*/
(function () {
  // ⬇️ CHANGE THIS to your deployed backend URL (e.g. Render URL) once live
  const BACKEND_URL = "https://apt-chatbot.onrender.com/api/chat";

  const COLORS = { primary: "#8f0000", dark: "#212c51", bg: "#ffffff" };

  // --- Styles ---
  const style = document.createElement("style");
  style.textContent = `
    #apt-chat-btn {
      position: fixed; bottom: 24px; right: 24px; z-index: 999999;
      width: 60px; height: 60px; border-radius: 50%;
      background: ${COLORS.primary}; color: white; border: none;
      box-shadow: 0 4px 14px rgba(0,0,0,0.25); cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 26px; transition: transform 0.15s ease;
    }
    #apt-chat-btn:hover { transform: scale(1.06); background: ${COLORS.dark}; }
    #apt-chat-window {
      position: fixed; bottom: 96px; right: 24px; z-index: 999999;
      width: 340px; max-width: 90vw; height: 460px; max-height: 70vh;
      background: ${COLORS.bg}; border-radius: 12px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.3);
      display: none; flex-direction: column; overflow: hidden;
      font-family: Arial, Helvetica, sans-serif;
    }
    #apt-chat-window.open { display: flex; }
    #apt-chat-header {
      background: ${COLORS.primary}; color: white; padding: 14px 16px;
      font-weight: bold; font-size: 15px; display: flex; justify-content: space-between; align-items: center;
    }
    #apt-chat-close { cursor: pointer; font-size: 18px; line-height: 1; }
    #apt-chat-messages {
      flex: 1; overflow-y: auto; padding: 12px; font-size: 14px; color: #222;
    }
    .apt-msg { margin-bottom: 10px; line-height: 1.4; }
    .apt-msg.user { text-align: right; }
    .apt-msg.user .bubble { background: ${COLORS.dark}; color: white; }
    .apt-msg.bot .bubble { background: #f0f0f0; color: #222; }
    .apt-msg .bubble {
      display: inline-block; padding: 8px 12px; border-radius: 12px; max-width: 85%;
    }
    #apt-chat-input-row {
      display: flex; border-top: 1px solid #eee; padding: 8px;
    }
    #apt-chat-input {
      flex: 1; border: 1px solid #ddd; border-radius: 8px; padding: 8px 10px;
      font-size: 14px; outline: none;
    }
    #apt-chat-send {
      margin-left: 6px; background: ${COLORS.primary}; color: white; border: none;
      border-radius: 8px; padding: 0 14px; cursor: pointer; font-size: 14px;
    }
    #apt-chat-send:hover { background: ${COLORS.dark}; }
  `;
  document.head.appendChild(style);

  // --- Elements ---
  const btn = document.createElement("button");
  btn.id = "apt-chat-btn";
  btn.innerHTML = "💬";
  btn.setAttribute("aria-label", "Chat with Advanced Trailer");

  const win = document.createElement("div");
  win.id = "apt-chat-window";
  win.innerHTML = `
    <div id="apt-chat-header">
      <span>Advanced Trailer — Ask us anything</span>
      <span id="apt-chat-close">✕</span>
    </div>
    <div id="apt-chat-messages"></div>
    <div id="apt-chat-input-row">
      <input id="apt-chat-input" type="text" placeholder="Type a message..." />
      <button id="apt-chat-send">Send</button>
    </div>
  `;

  document.body.appendChild(btn);
  document.body.appendChild(win);

  const messagesEl = win.querySelector("#apt-chat-messages");
  const inputEl = win.querySelector("#apt-chat-input");
  const sendBtn = win.querySelector("#apt-chat-send");
  const closeBtn = win.querySelector("#apt-chat-close");

  let history = [];
  let greeted = false;

  function addMessage(role, text) {
    const div = document.createElement("div");
    div.className = `apt-msg ${role}`;
    div.innerHTML = `<span class="bubble"></span>`;
    div.querySelector(".bubble").textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  btn.addEventListener("click", () => {
    win.classList.toggle("open");
    if (!greeted) {
      addMessage("bot", "Hi! I'm the Advanced Trailer assistant. Ask me about our peanut & hemp drying trailers, parts, or repair service.");
      greeted = true;
    }
  });
  closeBtn.addEventListener("click", () => win.classList.remove("open"));

  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text) return;
    addMessage("user", text);
    history.push({ role: "user", content: text });
    inputEl.value = "";
    sendBtn.disabled = true;

    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      const reply = data.reply || "Sorry, something went wrong. Please call us at 1-434-209-4042.";
      addMessage("bot", reply);
      history.push({ role: "assistant", content: reply });
    } catch (e) {
      addMessage("bot", "Sorry, I'm having trouble connecting. Please call us at 1-434-209-4042.");
    } finally {
      sendBtn.disabled = false;
    }
  }

  sendBtn.addEventListener("click", sendMessage);
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
})();
