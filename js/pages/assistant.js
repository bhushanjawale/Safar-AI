import { auth } from '../auth.js';
import { renderBottomNav, attachNavListeners } from './shared.js';

const API_URL = 'http://localhost:5000/api';

const SUGGESTIONS = [
  { icon: '🗺️', text: 'Plan a 3-day trip to Goa from Mumbai' },
  { icon: '🏔️', text: 'Best time to visit Manali?' },
  { icon: '💰', text: 'Budget trip ideas under ₹10,000' },
  { icon: '🍜', text: 'Must-try street food in Jaipur' },
  { icon: '🚂', text: 'Train routes from Delhi to Varanasi' },
  { icon: '🏖️', text: 'Hidden beaches in Kerala' },
];

let messages = []; // { role: 'user'|'assistant', text, id }
let isTyping = false;

export function renderAssistant() {
  const user = auth.getUserData();
  messages = [];
  isTyping = false;

  document.getElementById('app').innerHTML = `
    <div style="display:flex;flex-direction:column;height:100vh;background:var(--background);overflow:hidden;">

      <!-- Header -->
      <div style="flex-shrink:0;background:linear-gradient(135deg,#d84040,#e8622a);padding:1rem 1.25rem 1rem;display:flex;align-items:center;gap:0.875rem;box-shadow:0 2px 12px rgba(216,64,64,0.3);">
        <div style="width:2.5rem;height:2.5rem;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;border:2px solid rgba(255,255,255,0.4);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect width="18" height="10" x="3" y="11" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>
        </div>
        <div style="flex:1;min-width:0;">
          <p style="color:#fff;font-weight:800;font-size:1rem;margin:0;line-height:1.2;">Safar AI Assistant</p>
          <p style="color:rgba(255,255,255,0.8);font-size:0.72rem;margin:0;" id="assistantStatus">
            <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#4ade80;margin-right:4px;vertical-align:middle;"></span>Online · Powered by Groq
          </p>
        </div>
        <button id="clearChatBtn" style="background:rgba(255,255,255,0.15);border:none;border-radius:0.5rem;padding:0.4rem 0.75rem;color:#fff;font-size:0.75rem;font-weight:600;cursor:pointer;transition:background 0.2s;">Clear</button>
      </div>

      <!-- Messages area -->
      <div id="chatMessages" style="flex:1;overflow-y:auto;padding:1rem 1rem 0.5rem;display:flex;flex-direction:column;gap:0.875rem;">

        <!-- Welcome state -->
        <div id="welcomeState" style="display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;gap:1.25rem;padding:1rem 0 0.5rem;text-align:center;">
          <div style="width:4.5rem;height:4.5rem;border-radius:50%;background:linear-gradient(135deg,#d84040,#e8622a);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(216,64,64,0.35);">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect width="18" height="10" x="3" y="11" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>
          </div>
          <div>
            <h2 style="font-size:1.2rem;font-weight:800;color:var(--foreground);margin:0 0 0.35rem;">Hey ${user?.name?.split(' ')[0] || 'Traveller'} 👋</h2>
            <p style="font-size:0.82rem;color:var(--muted-foreground);margin:0;line-height:1.5;">I'm your personal travel assistant.<br>Ask me anything about trips, destinations, or travel tips!</p>
          </div>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:0.625rem;width:100%;max-width:360px;">
            ${SUGGESTIONS.map(s => `
              <button class="suggestion-chip" data-text="${s.text}" style="display:flex;align-items:flex-start;gap:0.5rem;padding:0.625rem 0.75rem;background:var(--card);border:1px solid var(--border);border-radius:0.75rem;cursor:pointer;text-align:left;transition:all 0.2s;font-size:0.75rem;color:var(--foreground);font-weight:500;line-height:1.4;">
                <span style="font-size:1rem;flex-shrink:0;">${s.icon}</span>
                <span>${s.text}</span>
              </button>
            `).join('')}
          </div>
        </div>

      </div>

      <!-- Input bar -->
      <div style="flex-shrink:0;padding:0.75rem 1rem;border-top:1px solid var(--border);background:var(--background);padding-bottom:calc(0.75rem + env(safe-area-inset-bottom));">
        <div style="display:flex;align-items:flex-end;gap:0.625rem;background:var(--card);border:1.5px solid var(--border);border-radius:1.25rem;padding:0.5rem 0.5rem 0.5rem 1rem;transition:border-color 0.2s;" id="inputWrap">
          <textarea id="chatInput" rows="1" placeholder="Ask about any destination, trip, or travel tip…" style="flex:1;border:none;background:transparent;resize:none;font-size:0.875rem;color:var(--foreground);outline:none;line-height:1.5;max-height:7rem;overflow-y:auto;font-family:inherit;padding:0.25rem 0;"></textarea>
          <button id="sendBtn" style="width:2.25rem;height:2.25rem;border-radius:50%;background:linear-gradient(135deg,#d84040,#e8622a);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:all 0.2s;opacity:0.5;" disabled>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </button>
        </div>
        <p style="font-size:0.65rem;color:var(--muted-foreground);text-align:center;margin:0.4rem 0 0;">Safar AI can make mistakes. Verify important travel info.</p>
      </div>

      <!-- Bottom nav spacer handled by padding-bottom on outer container -->
    </div>
    ${renderBottomNav()}
  `;

  // Fix layout: the bottom nav overlaps, so add bottom padding to chat area
  const chatMessages = document.getElementById('chatMessages');
  const nav = document.querySelector('.bottom-nav');
  if (nav) {
    const navH = nav.offsetHeight || 64;
    document.querySelector('#app > div').style.height = `calc(100vh - ${navH}px)`;
  }

  attachNavListeners();
  attachAssistantListeners();
}

function attachAssistantListeners() {
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  const inputWrap = document.getElementById('inputWrap');

  // Auto-resize textarea
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 112) + 'px';
    const hasText = input.value.trim().length > 0;
    sendBtn.disabled = !hasText || isTyping;
    sendBtn.style.opacity = (!hasText || isTyping) ? '0.5' : '1';
  });

  input.addEventListener('focus', () => { inputWrap.style.borderColor = 'var(--primary)'; });
  input.addEventListener('blur',  () => { inputWrap.style.borderColor = 'var(--border)'; });

  // Send on Enter (not Shift+Enter)
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled) sendMessage();
    }
  });

  sendBtn.addEventListener('click', sendMessage);

  // Suggestion chips
  document.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      input.value = chip.dataset.text;
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 112) + 'px';
      sendBtn.disabled = false;
      sendBtn.style.opacity = '1';
      sendMessage();
    });
    chip.addEventListener('mouseenter', () => {
      chip.style.borderColor = 'var(--primary)';
      chip.style.background = 'rgba(216,64,64,0.05)';
    });
    chip.addEventListener('mouseleave', () => {
      chip.style.borderColor = 'var(--border)';
      chip.style.background = 'var(--card)';
    });
  });

  document.getElementById('clearChatBtn').addEventListener('click', () => {
    messages = [];
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = '';
    renderWelcome();
  });
}

async function sendMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text || isTyping) return;

  // Hide welcome state
  const welcome = document.getElementById('welcomeState');
  if (welcome) welcome.remove();

  // Add user message
  const msgId = Date.now();
  messages.push({ role: 'user', text, id: msgId });
  appendMessage('user', text, msgId);

  // Reset input
  input.value = '';
  input.style.height = 'auto';
  const sendBtn = document.getElementById('sendBtn');
  sendBtn.disabled = true;
  sendBtn.style.opacity = '0.5';

  // Show typing indicator
  isTyping = true;
  const typingId = 'typing-' + Date.now();
  appendTyping(typingId);
  scrollToBottom();

  try {
    // Build context-aware prompt
    const history = messages.slice(-10, -1).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.text
    }));

    const res = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, history })
    });
    const data = await res.json();
    const reply = data.response || data.error || 'Sorry, I could not get a response. Please try again.';

    removeTyping(typingId);
    isTyping = false;

    const replyId = Date.now();
    messages.push({ role: 'assistant', text: reply, id: replyId });
    appendMessage('assistant', reply, replyId);
  } catch {
    removeTyping(typingId);
    isTyping = false;
    const errId = Date.now();
    const errMsg = '⚠️ Could not connect to the AI. Make sure the backend is running.';
    messages.push({ role: 'assistant', text: errMsg, id: errId });
    appendMessage('assistant', errMsg, errId);
  }

  sendBtn.disabled = false;
  sendBtn.style.opacity = '1';
  scrollToBottom();
}

function appendMessage(role, text, id) {
  const container = document.getElementById('chatMessages');
  const isUser = role === 'user';

  const div = document.createElement('div');
  div.id = 'msg-' + id;
  div.style.cssText = `display:flex;flex-direction:column;align-items:${isUser ? 'flex-end' : 'flex-start'};gap:0.25rem;animation:fadeSlideUp 0.25s ease;`;

  const bubble = document.createElement('div');
  bubble.style.cssText = `
    max-width:82%;padding:0.75rem 1rem;border-radius:${isUser ? '1.25rem 1.25rem 0.25rem 1.25rem' : '1.25rem 1.25rem 1.25rem 0.25rem'};
    font-size:0.875rem;line-height:1.6;word-break:break-word;
    ${isUser
      ? 'background:linear-gradient(135deg,#d84040,#e8622a);color:#fff;box-shadow:0 2px 12px rgba(216,64,64,0.3);'
      : 'background:var(--card);color:var(--foreground);border:1px solid var(--border);box-shadow:0 1px 4px rgba(0,0,0,0.06);'}
  `;

  if (isUser) {
    bubble.textContent = text;
  } else {
    bubble.innerHTML = formatAssistantText(text);
  }

  // Timestamp
  const time = document.createElement('span');
  time.style.cssText = 'font-size:0.65rem;color:var(--muted-foreground);padding:0 0.25rem;';
  time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (!isUser) {
    // Avatar
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:flex-end;gap:0.5rem;';
    const avatar = document.createElement('div');
    avatar.style.cssText = 'width:1.75rem;height:1.75rem;border-radius:50%;background:linear-gradient(135deg,#d84040,#e8622a);display:flex;align-items:center;justify-content:center;flex-shrink:0;';
    avatar.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect width="18" height="10" x="3" y="11" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/></svg>';
    row.appendChild(avatar);
    row.appendChild(bubble);
    div.appendChild(row);
  } else {
    div.appendChild(bubble);
  }
  div.appendChild(time);

  container.appendChild(div);
  scrollToBottom();
}

function appendTyping(id) {
  const container = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.id = id;
  div.style.cssText = 'display:flex;align-items:flex-end;gap:0.5rem;animation:fadeSlideUp 0.2s ease;';

  const avatar = document.createElement('div');
  avatar.style.cssText = 'width:1.75rem;height:1.75rem;border-radius:50%;background:linear-gradient(135deg,#d84040,#e8622a);display:flex;align-items:center;justify-content:center;flex-shrink:0;';
  avatar.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect width="18" height="10" x="3" y="11" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/></svg>';

  const bubble = document.createElement('div');
  bubble.style.cssText = 'padding:0.75rem 1rem;background:var(--card);border:1px solid var(--border);border-radius:1.25rem 1.25rem 1.25rem 0.25rem;display:flex;align-items:center;gap:0.3rem;';
  bubble.innerHTML = `
    <span style="width:7px;height:7px;border-radius:50%;background:var(--muted-foreground);animation:typingDot 1.2s ease-in-out infinite;"></span>
    <span style="width:7px;height:7px;border-radius:50%;background:var(--muted-foreground);animation:typingDot 1.2s ease-in-out 0.2s infinite;"></span>
    <span style="width:7px;height:7px;border-radius:50%;background:var(--muted-foreground);animation:typingDot 1.2s ease-in-out 0.4s infinite;"></span>
  `;

  div.appendChild(avatar);
  div.appendChild(bubble);
  container.appendChild(div);
}

function removeTyping(id) {
  document.getElementById(id)?.remove();
}

function scrollToBottom() {
  const c = document.getElementById('chatMessages');
  if (c) c.scrollTop = c.scrollHeight;
}

function renderWelcome() {
  const container = document.getElementById('chatMessages');
  const user = auth.getUserData();
  const div = document.createElement('div');
  div.id = 'welcomeState';
  div.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;gap:1.25rem;padding:1rem 0 0.5rem;text-align:center;';
  div.innerHTML = `
    <div style="width:4.5rem;height:4.5rem;border-radius:50%;background:linear-gradient(135deg,#d84040,#e8622a);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(216,64,64,0.35);">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect width="18" height="10" x="3" y="11" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/></svg>
    </div>
    <div>
      <h2 style="font-size:1.2rem;font-weight:800;color:var(--foreground);margin:0 0 0.35rem;">Hey ${user?.name?.split(' ')[0] || 'Traveller'} 👋</h2>
      <p style="font-size:0.82rem;color:var(--muted-foreground);margin:0;line-height:1.5;">I'm your personal travel assistant.<br>Ask me anything about trips, destinations, or travel tips!</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:0.625rem;width:100%;max-width:360px;">
      ${SUGGESTIONS.map(s => `
        <button class="suggestion-chip" data-text="${s.text}" style="display:flex;align-items:flex-start;gap:0.5rem;padding:0.625rem 0.75rem;background:var(--card);border:1px solid var(--border);border-radius:0.75rem;cursor:pointer;text-align:left;transition:all 0.2s;font-size:0.75rem;color:var(--foreground);font-weight:500;line-height:1.4;">
          <span style="font-size:1rem;flex-shrink:0;">${s.icon}</span>
          <span>${s.text}</span>
        </button>
      `).join('')}
    </div>
  `;
  container.appendChild(div);

  // Re-attach suggestion listeners
  div.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const input = document.getElementById('chatInput');
      input.value = chip.dataset.text;
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 112) + 'px';
      const sendBtn = document.getElementById('sendBtn');
      sendBtn.disabled = false;
      sendBtn.style.opacity = '1';
      sendMessage();
    });
    chip.addEventListener('mouseenter', () => { chip.style.borderColor = 'var(--primary)'; chip.style.background = 'rgba(216,64,64,0.05)'; });
    chip.addEventListener('mouseleave', () => { chip.style.borderColor = 'var(--border)'; chip.style.background = 'var(--card)'; });
  });
}

// Lightweight markdown-like formatter for assistant responses
function formatAssistantText(text) {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:rgba(0,0,0,0.07);padding:0.1em 0.35em;border-radius:0.25rem;font-size:0.82em;">$1</code>')
    .replace(/^#{1,3}\s+(.+)$/gm, '<p style="font-weight:700;margin:0.5rem 0 0.25rem;">$1</p>')
    .replace(/^•\s+(.+)$/gm, '<div style="display:flex;gap:0.5rem;margin:0.2rem 0;"><span style="color:var(--primary);flex-shrink:0;">•</span><span>$1</span></div>')
    .replace(/^[-*]\s+(.+)$/gm, '<div style="display:flex;gap:0.5rem;margin:0.2rem 0;"><span style="color:var(--primary);flex-shrink:0;">•</span><span>$1</span></div>')
    .replace(/\n{2,}/g, '<br><br>')
    .replace(/\n/g, '<br>');
}
