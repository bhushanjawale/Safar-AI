import { renderBottomNav, attachNavListeners } from './shared.js';
import { router } from '../router.js';

const FAQS = [
  {
    category: 'Getting Started',
    icon: '🚀',
    items: [
      {
        q: 'How do I create my first trip plan?',
        a: 'Tap "Plan" in the bottom nav, enter your source city, destination, travel dates, and budget. Hit "Generate Itinerary" and our AI will build a full day-by-day plan for you in seconds.'
      },
      {
        q: 'How does the AI personalise my itinerary?',
        a: 'During onboarding you set your interests, budget style, and travel preferences. The AI uses these along with your destination to craft recommendations that match your style — from offbeat gems to popular landmarks.'
      },
      {
        q: 'Do I need an account to use Safar AI?',
        a: 'Yes, a free account is required so your trips, wishlist, and preferences are saved securely across devices. Sign up takes under a minute with email or Google.'
      },
    ]
  },
  {
    category: 'Trip Planning',
    icon: '🗺️',
    items: [
      {
        q: 'Can I edit the generated itinerary?',
        a: 'Absolutely. After generation, each day\'s activities are listed and you can use the AI chat assistant to swap activities, adjust timings, or ask for alternatives.'
      },
      {
        q: 'What does "balanced", "budget", and "luxury" budget mean?',
        a: '"Budget" focuses on hostels, street food, and free attractions. "Balanced" mixes mid-range stays with local experiences. "Luxury" recommends premium hotels, fine dining, and exclusive experiences.'
      },
      {
        q: 'How many days can I plan for?',
        a: 'You can plan trips from 1 to 30 days. For longer trips the AI breaks the itinerary into themed segments to keep it manageable.'
      },
    ]
  },
  {
    category: 'Account & Data',
    icon: '👤',
    items: [
      {
        q: 'How do I update my travel preferences?',
        a: 'Go to Profile → Edit Preferences. You can update your home city, interests, budget style, and trip style at any time. Changes apply to all future AI recommendations.'
      },
      {
        q: 'Is my data safe?',
        a: 'Yes. Safar AI uses Firebase Authentication and Firestore with strict security rules. Your data is never sold or shared with third parties.'
      },
      {
        q: 'How do I delete my account?',
        a: 'Go to Profile → scroll to the bottom → tap "Delete Account". This permanently removes all your trips, preferences, and personal data.'
      },
    ]
  },
  {
    category: 'Flights & Hotels',
    icon: '✈️',
    items: [
      {
        q: 'Does Safar AI book flights or hotels directly?',
        a: 'Not yet — the Flights and Hotels sections currently show curated options and redirect you to partner booking sites. Direct in-app booking is on our roadmap.'
      },
      {
        q: 'Why are flight prices different from what I see on other sites?',
        a: 'Prices shown are indicative and fetched in real time. Final prices depend on availability at the time of booking on the partner site.'
      },
    ]
  },
];

const QUICK_TOPICS = [
  { icon: '🤖', label: 'AI Chat Assistant', desc: 'Ask anything about your trip', action: '/planner' },
  { icon: '✈️', label: 'Flights Help',       desc: 'Search & booking queries',   action: '/flights' },
  { icon: '🏨', label: 'Hotels Help',        desc: 'Accommodation questions',    action: '/hotels' },
  { icon: '👤', label: 'Account Settings',   desc: 'Profile & preferences',      action: '/profile' },
];

export function renderHelp() {
  document.getElementById('app').innerHTML = `
    <div style="min-height:100vh;background:var(--background);padding-bottom:5rem;">

      <!-- Header -->
      <div style="background:linear-gradient(135deg,#d84040,#e8622a);padding:2rem 1.25rem 3.5rem;position:relative;overflow:hidden;">
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% 120%,rgba(255,150,50,0.3) 0%,transparent 70%);pointer-events:none;"></div>
        <h1 style="color:#fff;font-size:1.6rem;font-weight:900;margin:0 0 0.25rem;text-shadow:0 2px 12px rgba(0,0,0,0.25);">Help Centre</h1>
        <p style="color:rgba(255,255,255,0.85);font-size:0.875rem;margin:0;">How can we help you today?</p>

        <!-- Search bar -->
        <div style="margin-top:1.25rem;position:relative;">
          <input id="helpSearch" type="text" placeholder="Search for answers…"
            style="width:100%;box-sizing:border-box;padding:0.75rem 1rem 0.75rem 2.75rem;border-radius:0.875rem;border:none;font-size:0.9rem;background:rgba(255,255,255,0.97);color:#1a1a1a;outline:none;box-shadow:0 4px 20px rgba(0,0,0,0.15);" />
          <span style="position:absolute;left:0.875rem;top:50%;transform:translateY(-50%);color:#999;pointer-events:none;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </span>
          <button id="helpSearchClear" style="display:none;position:absolute;right:0.875rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#999;font-size:1.1rem;line-height:1;">✕</button>
        </div>
      </div>

      <!-- Search results -->
      <div id="helpSearchResults" style="display:none;padding:1rem 1.25rem 0;"></div>

      <!-- Main content (hidden during search) -->
      <div id="helpMainContent">

        <!-- Quick topics -->
        <div style="padding:1.25rem 1.25rem 0;">
          <p style="font-size:0.7rem;font-weight:700;color:var(--muted-foreground);text-transform:uppercase;letter-spacing:0.1em;margin:0 0 0.75rem;">Quick Topics</p>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:0.75rem;">
            ${QUICK_TOPICS.map(t => `
              <div class="help-topic-card" data-action="${t.action}" style="background:var(--card);border:1px solid var(--border);border-radius:0.875rem;padding:0.875rem;cursor:pointer;transition:all 0.2s;">
                <div style="font-size:1.5rem;margin-bottom:0.35rem;">${t.icon}</div>
                <p style="font-size:0.8rem;font-weight:700;color:var(--foreground);margin:0 0 0.15rem;">${t.label}</p>
                <p style="font-size:0.7rem;color:var(--muted-foreground);margin:0;">${t.desc}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- FAQ sections -->
        <div style="padding:1.5rem 1.25rem 0;" id="faqContainer">
          ${FAQS.map((section, si) => `
            <div style="margin-bottom:1.5rem;">
              <p style="font-size:0.7rem;font-weight:700;color:var(--muted-foreground);text-transform:uppercase;letter-spacing:0.1em;margin:0 0 0.625rem;">${section.icon} ${section.category}</p>
              <div style="background:var(--card);border:1px solid var(--border);border-radius:0.875rem;overflow:hidden;">
                ${section.items.map((faq, fi) => `
                  <div class="faq-item" data-si="${si}" data-fi="${fi}" style="border-bottom:1px solid var(--border);last-child:border-none;">
                    <button class="faq-q" style="width:100%;text-align:left;padding:0.875rem 1rem;background:none;border:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:0.75rem;">
                      <span style="font-size:0.85rem;font-weight:600;color:var(--foreground);line-height:1.4;">${faq.q}</span>
                      <span class="faq-chevron" style="flex-shrink:0;color:var(--muted-foreground);transition:transform 0.25s;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
                      </span>
                    </button>
                    <div class="faq-a" style="max-height:0;overflow:hidden;transition:max-height 0.3s ease,padding 0.3s ease;padding:0 1rem;">
                      <p style="font-size:0.82rem;color:var(--muted-foreground);line-height:1.6;margin:0;padding-bottom:0.875rem;">${faq.a}</p>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Contact section -->
        <div style="margin:0 1.25rem 1.5rem;background:linear-gradient(135deg,rgba(216,64,64,0.08),rgba(232,98,42,0.06));border:1px solid rgba(216,64,64,0.2);border-radius:1rem;padding:1.25rem;text-align:center;">
          <div style="font-size:1.75rem;margin-bottom:0.5rem;">💬</div>
          <p style="font-size:0.95rem;font-weight:700;color:var(--foreground);margin:0 0 0.25rem;">Still need help?</p>
          <p style="font-size:0.8rem;color:var(--muted-foreground);margin:0 0 1rem;">Our support team usually replies within a few hours.</p>
          <a href="mailto:support@safarai.app" style="display:inline-block;padding:0.6rem 1.5rem;background:var(--primary);color:#fff;border-radius:9999px;font-size:0.85rem;font-weight:700;text-decoration:none;transition:opacity 0.2s;" onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">
            Contact Support
          </a>
        </div>

      </div>
    </div>
    ${renderBottomNav()}
  `;

  attachNavListeners();
  attachHelpListeners();
}

function attachHelpListeners() {
  // FAQ accordion
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const answer = item.querySelector('.faq-a');
      const chevron = item.querySelector('.faq-chevron');
      const isOpen = answer.style.maxHeight && answer.style.maxHeight !== '0px';

      // Close all others in same group
      const group = item.parentElement;
      group.querySelectorAll('.faq-a').forEach(a => { a.style.maxHeight = '0'; a.style.paddingTop = '0'; });
      group.querySelectorAll('.faq-chevron').forEach(c => { c.style.transform = ''; });

      if (!isOpen) {
        answer.style.maxHeight = answer.scrollHeight + 'px';
        chevron.style.transform = 'rotate(180deg)';
      }
    });
  });

  // Quick topic cards
  document.querySelectorAll('.help-topic-card').forEach(card => {
    card.addEventListener('click', () => router.navigate(card.dataset.action));
    card.addEventListener('mouseenter', () => {
      card.style.borderColor = 'var(--primary)';
      card.style.transform = 'translateY(-2px)';
      card.style.boxShadow = '0 6px 20px rgba(216,64,64,0.12)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.borderColor = 'var(--border)';
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  });

  // Search
  const input = document.getElementById('helpSearch');
  const results = document.getElementById('helpSearchResults');
  const main = document.getElementById('helpMainContent');
  const clear = document.getElementById('helpSearchClear');

  const allFaqs = FAQS.flatMap(s => s.items.map(f => ({ ...f, category: s.category, icon: s.icon })));

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    clear.style.display = q ? 'block' : 'none';

    if (!q) {
      results.style.display = 'none';
      main.style.display = '';
      return;
    }

    main.style.display = 'none';
    results.style.display = 'block';

    const matches = allFaqs.filter(f =>
      f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)
    );

    if (!matches.length) {
      results.innerHTML = `
        <div style="text-align:center;padding:2.5rem 1rem;">
          <div style="font-size:2.5rem;margin-bottom:0.75rem;">🔍</div>
          <p style="font-weight:700;color:var(--foreground);margin:0 0 0.25rem;">No results found</p>
          <p style="font-size:0.82rem;color:var(--muted-foreground);margin:0;">Try different keywords or browse the topics below.</p>
        </div>`;
      return;
    }

    results.innerHTML = `
      <p style="font-size:0.75rem;color:var(--muted-foreground);margin:0 0 0.75rem;">${matches.length} result${matches.length > 1 ? 's' : ''} for "<strong>${input.value.trim()}</strong>"</p>
      <div style="background:var(--card);border:1px solid var(--border);border-radius:0.875rem;overflow:hidden;">
        ${matches.map((f, i) => `
          <div class="faq-item" style="${i < matches.length - 1 ? 'border-bottom:1px solid var(--border);' : ''}">
            <button class="faq-q" style="width:100%;text-align:left;padding:0.875rem 1rem;background:none;border:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:0.75rem;">
              <div>
                <span style="font-size:0.65rem;font-weight:700;color:var(--primary);text-transform:uppercase;letter-spacing:0.05em;">${f.icon} ${f.category}</span>
                <p style="font-size:0.85rem;font-weight:600;color:var(--foreground);margin:0.2rem 0 0;line-height:1.4;">${f.q}</p>
              </div>
              <span class="faq-chevron" style="flex-shrink:0;color:var(--muted-foreground);transition:transform 0.25s;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
              </span>
            </button>
            <div class="faq-a" style="max-height:0;overflow:hidden;transition:max-height 0.3s ease;padding:0 1rem;">
              <p style="font-size:0.82rem;color:var(--muted-foreground);line-height:1.6;margin:0;padding-bottom:0.875rem;">${f.a}</p>
            </div>
          </div>
        `).join('')}
      </div>`;

    // Re-attach accordion for search results
    results.querySelectorAll('.faq-q').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const answer = item.querySelector('.faq-a');
        const chevron = item.querySelector('.faq-chevron');
        const isOpen = answer.style.maxHeight && answer.style.maxHeight !== '0px';
        results.querySelectorAll('.faq-a').forEach(a => { a.style.maxHeight = '0'; });
        results.querySelectorAll('.faq-chevron').forEach(c => { c.style.transform = ''; });
        if (!isOpen) {
          answer.style.maxHeight = answer.scrollHeight + 'px';
          chevron.style.transform = 'rotate(180deg)';
        }
      });
    });
  });

  clear.addEventListener('click', () => {
    input.value = '';
    clear.style.display = 'none';
    results.style.display = 'none';
    main.style.display = '';
    input.focus();
  });
}
