import { auth } from '../auth.js';
import { router } from '../router.js';
import { getIcon } from '../icons.js';
import { interests, budgetOptions, tripStyles, indianCities } from '../data.js';
import { renderBottomNav, attachNavListeners, fetchPexelsImage } from './shared.js';

let editPrefs = {};

// ── Badge definitions ────────────────────────────────────────────────────────
const BADGES = [
  { id: 'explorer',    icon: '🧭', label: 'Explorer',       desc: 'Completed onboarding',         color: '#3b82f6', unlocked: u => !u?.isNewUser },
  { id: 'wanderer',    icon: '✈️', label: 'Wanderer',       desc: 'Added a destination to wishlist',color: '#8b5cf6', unlocked: u => (u?.wishlist?.length || 0) >= 1 },
  { id: 'collector',   icon: '❤️', label: 'Collector',      desc: 'Wishlisted 5+ destinations',    color: '#ec4899', unlocked: u => (u?.wishlist?.length || 0) >= 5 },
  { id: 'planner',     icon: '🗺️', label: 'Trip Planner',   desc: 'Generated your first itinerary', color: '#f59e0b', unlocked: () => false },
  { id: 'adventurer',  icon: '🏔️', label: 'Adventurer',     desc: 'Chose Adventure as interest',   color: '#10b981', unlocked: u => u?.preferences?.interests?.includes('adventure') },
  { id: 'foodie',      icon: '🍜', label: 'Foodie',         desc: 'Chose Food & Culture interest', color: '#f97316', unlocked: u => u?.preferences?.interests?.includes('food') },
  { id: 'offbeater',   icon: '🌿', label: 'Offbeater',      desc: 'Enabled offbeat destinations',  color: '#06b6d4', unlocked: u => !!u?.preferences?.offbeat },
  { id: 'premium',     icon: '💎', label: 'Premium Taste',  desc: 'Selected Premium budget',       color: '#a855f7', unlocked: u => u?.preferences?.budget === 'premium' },
];

const COVER_QUERIES = [
  'India travel landscape mountains',
  'India Rajasthan desert sunset',
  'Kerala backwater India scenic',
  'Himalayas India mountains snow',
];

export async function renderProfile() {
  const user = auth.getUserData();
  const unlockedCount = BADGES.filter(b => b.unlocked(user)).length;

  // Pick cover based on user location preference
  const coverQuery = user?.preferences?.location
    ? `${user.preferences.location} India travel`
    : COVER_QUERIES[Math.floor(Math.random() * COVER_QUERIES.length)];

  document.getElementById('app').innerHTML = `
    <div style="min-height:100vh; background:var(--background); padding-bottom:5rem;">

      <!-- Cover + Avatar -->
      <div style="position:relative; height:13rem; background:var(--muted);">
        <div id="coverShimmer" style="position:absolute; inset:0; background:linear-gradient(90deg,var(--muted) 25%,#e8e8e8 50%,var(--muted) 75%); background-size:200% 100%; animation:shimmer 1.4s infinite;"></div>
        <img id="coverImg" alt="cover" style="width:100%; height:100%; object-fit:cover; display:none; opacity:0; transition:opacity 0.5s;" />
        <div style="position:absolute; inset:0; background:linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%);"></div>

        <!-- Back button -->
        <button id="backBtn" style="position:absolute; top:1rem; left:1rem; width:2.25rem; height:2.25rem; background:rgba(255,255,255,0.2); backdrop-filter:blur(8px); border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; border:1px solid rgba(255,255,255,0.3);">
          ${getIcon('chevronLeft')}
        </button>

        <!-- Badge count pill -->
        <div style="position:absolute; top:1rem; right:1rem; background:rgba(255,255,255,0.2); backdrop-filter:blur(8px); border:1px solid rgba(255,255,255,0.3); border-radius:9999px; padding:0.3rem 0.75rem; display:flex; align-items:center; gap:0.375rem;">
          <span style="font-size:0.9rem;">🏅</span>
          <span style="color:white; font-size:0.75rem; font-weight:700;">${unlockedCount}/${BADGES.length} Badges</span>
        </div>

        <!-- Avatar -->
        <div style="position:absolute; bottom:-2.5rem; left:1.25rem;">
          <div style="width:5rem; height:5rem; border-radius:50%; background:linear-gradient(135deg,var(--primary),var(--primary-dark)); display:flex; align-items:center; justify-content:center; color:white; font-size:2rem; font-weight:800; border:3px solid white; box-shadow:0 4px 16px rgba(0,0,0,0.2);">
            ${user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      </div>

      <!-- Name + email -->
      <div style="padding:3.25rem 1.25rem 0; display:flex; align-items:flex-end; justify-content:space-between;">
        <div>
          <h2 style="font-size:1.3rem; font-weight:800; color:var(--foreground);">${user?.name || 'Traveller'}</h2>
          <p style="font-size:0.8rem; color:var(--muted-foreground); margin-top:0.1rem;">${user?.email || ''}</p>
          ${user?.preferences?.location ? `<p style="font-size:0.78rem; color:var(--primary); font-weight:600; margin-top:0.2rem;">${getIcon('mapPin')} ${user.preferences.location}</p>` : ''}
        </div>
        <button id="editPrefsBtn" style="display:flex; align-items:center; gap:0.375rem; background:var(--primary); color:white; padding:0.5rem 1rem; border-radius:9999px; font-size:0.8rem; font-weight:700; border:none; cursor:pointer; box-shadow:0 4px 12px rgba(216,64,64,0.3);">
          ${getIcon('edit')} Edit
        </button>
      </div>

      <div style="padding:1.25rem; display:flex; flex-direction:column; gap:1.5rem;">

        <!-- Stats row -->
        <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:0.75rem;">
          ${[
            ['🗺️', user?.wishlist?.length || 0, 'Wishlisted'],
            ['🏅', unlockedCount, 'Badges'],
            ['✈️', '0', 'Trips'],
          ].map(([e, v, l]) => `
            <div style="background:white; border:1px solid var(--border); border-radius:1rem; padding:1rem; text-align:center; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
              <div style="font-size:1.5rem;">${e}</div>
              <div style="font-size:1.5rem; font-weight:800; color:var(--primary); line-height:1.2; margin-top:0.25rem;">${v}</div>
              <div style="font-size:0.7rem; color:var(--muted-foreground); font-weight:500; margin-top:0.1rem;">${l}</div>
            </div>
          `).join('')}
        </div>

        <!-- Traveller Badges -->
        <div style="background:white; border:1px solid var(--border); border-radius:1rem; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
          <div style="padding:1rem 1.25rem; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between;">
            <div>
              <h3 style="font-size:1rem; font-weight:700;">🏅 Traveller Badges</h3>
              <p style="font-size:0.72rem; color:var(--muted-foreground); margin-top:0.1rem;">${unlockedCount} of ${BADGES.length} unlocked</p>
            </div>
            <!-- Progress bar -->
            <div style="width:5rem; height:0.4rem; background:var(--muted); border-radius:9999px; overflow:hidden;">
              <div style="height:100%; width:${Math.round((unlockedCount/BADGES.length)*100)}%; background:linear-gradient(90deg,var(--primary),var(--primary-dark)); border-radius:9999px; transition:width 0.6s ease;"></div>
            </div>
          </div>
          <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:0; padding:0.75rem;">
            ${BADGES.map(b => {
              const on = b.unlocked(user);
              return `
                <div class="badge-item" data-desc="${b.desc}" data-label="${b.label}" style="display:flex; flex-direction:column; align-items:center; gap:0.3rem; padding:0.75rem 0.25rem; border-radius:0.75rem; cursor:pointer; transition:background 0.2s; position:relative;">
                  <div style="width:3rem; height:3rem; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.4rem;
                    background:${on ? `${b.color}18` : 'var(--muted)'};
                    border:2px solid ${on ? b.color : 'transparent'};
                    box-shadow:${on ? `0 4px 12px ${b.color}30` : 'none'};
                    filter:${on ? 'none' : 'grayscale(1) opacity(0.4)'};
                    transition:all 0.3s;">
                    ${b.icon}
                  </div>
                  <span style="font-size:0.6rem; font-weight:${on ? '700' : '500'}; color:${on ? 'var(--foreground)' : 'var(--muted-foreground)'}; text-align:center; line-height:1.2;">${b.label}</span>
                  ${on ? `<div style="width:0.4rem; height:0.4rem; border-radius:50%; background:${b.color};"></div>` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Badge tooltip -->
        <div id="badgeTooltip" class="hidden" style="background:var(--foreground); color:white; padding:0.625rem 1rem; border-radius:0.75rem; font-size:0.8rem; text-align:center; transition:all 0.2s;"></div>

        <!-- Preferences summary -->
        <div style="background:white; border:1px solid var(--border); border-radius:1rem; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
          <div style="padding:1rem 1.25rem; border-bottom:1px solid var(--border);">
            <h3 style="font-size:1rem; font-weight:700;">⚙️ Travel Preferences</h3>
          </div>
          <div id="preferencesContent" style="padding:1.25rem;">
            ${renderPrefsView(user)}
          </div>
        </div>

        <!-- Settings list -->
        <div style="background:white; border:1px solid var(--border); border-radius:1rem; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
          ${[
            ['🔔', 'Notifications', 'Manage alerts'],
            ['🔒', 'Privacy & Security', 'Account settings'],
            ['💬', 'Help & Support', 'FAQs and contact'],
            ['⭐', 'Rate the App', 'Share your feedback'],
          ].map(([e, t, s], i, arr) => `
            <div style="display:flex; align-items:center; gap:0.875rem; padding:1rem 1.25rem; cursor:pointer; transition:background 0.15s; ${i < arr.length-1 ? 'border-bottom:1px solid var(--border);' : ''}"
              onmouseenter="this.style.background='rgba(216,64,64,0.03)'" onmouseleave="this.style.background='white'">
              <div style="width:2.25rem; height:2.25rem; background:rgba(216,64,64,0.08); border-radius:0.625rem; display:flex; align-items:center; justify-content:center; font-size:1.1rem; flex-shrink:0;">${e}</div>
              <div style="flex:1;">
                <p style="font-size:0.9rem; font-weight:600;">${t}</p>
                <p style="font-size:0.72rem; color:var(--muted-foreground);">${s}</p>
              </div>
              <span style="color:var(--muted-foreground);">${getIcon('chevronRight')}</span>
            </div>
          `).join('')}
        </div>

        <!-- Logout -->
        <button id="logoutBtn" style="width:100%; padding:0.875rem; border-radius:1rem; border:1.5px solid var(--destructive); background:white; color:var(--destructive); font-size:0.95rem; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:0.5rem; transition:all 0.2s;">
          ${getIcon('logOut')} Sign Out
        </button>

      </div>
    </div>
    ${renderBottomNav('/profile')}
  `;

  // Load cover image
  fetchPexelsImage(coverQuery).then(url => {
    if (!url) return;
    const img = document.getElementById('coverImg');
    img.src = url;
    img.style.display = 'block';
    img.onload = () => {
      img.style.opacity = '1';
      document.getElementById('coverShimmer').style.display = 'none';
    };
  });

  // Badge tooltips
  document.querySelectorAll('.badge-item').forEach(item => {
    item.addEventListener('click', () => {
      const tip = document.getElementById('badgeTooltip');
      tip.textContent = `${item.dataset.label}: ${item.dataset.desc}`;
      tip.classList.remove('hidden');
      setTimeout(() => tip.classList.add('hidden'), 2500);
    });
  });

  document.getElementById('backBtn').addEventListener('click', () => router.navigate('/home'));

  document.getElementById('editPrefsBtn').addEventListener('click', () => {
    editPrefs = { ...user?.preferences };
    document.getElementById('preferencesContent').innerHTML = renderEditForm();
    attachEditListeners();
    document.getElementById('preferencesContent').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await auth.logout();
    router.navigate('/login', true);
  });

  attachNavListeners();
}

// ── Preferences view ─────────────────────────────────────────────────────────
function renderPrefsView(user) {
  if (!user?.preferences) return `<p style="font-size:0.875rem; color:var(--muted-foreground);">No preferences set yet.</p>`;
  const p = user.preferences;
  const budgetLabel = budgetOptions.find(b => b.id === p.budget)?.label || p.budget;
  const styleLabel  = tripStyles.find(s => s.id === p.tripStyle)?.label || p.tripStyle;
  return `
    <div style="display:flex; flex-direction:column; gap:0.875rem;">
      ${[
        ['📍', 'Home City', p.location],
        ['💰', 'Budget', budgetLabel],
        ['🧳', 'Trip Style', styleLabel],
        ['🌿', 'Offbeat', p.offbeat ? 'Yes — hidden gems' : 'No — popular spots'],
      ].map(([e, l, v]) => `
        <div style="display:flex; align-items:center; justify-content:space-between; padding:0.625rem 0; border-bottom:1px solid var(--border);">
          <span style="font-size:0.85rem; color:var(--muted-foreground); display:flex; align-items:center; gap:0.5rem;">${e} ${l}</span>
          <span style="font-size:0.85rem; font-weight:600; color:var(--foreground);">${v}</span>
        </div>
      `).join('')}
      <div>
        <p style="font-size:0.8rem; color:var(--muted-foreground); margin-bottom:0.5rem;">🎯 Interests</p>
        <div style="display:flex; flex-wrap:wrap; gap:0.375rem;">
          ${(p.interests || []).map(id => {
            const item = interests.find(i => i.id === id);
            return item ? `<span style="font-size:0.75rem; background:rgba(216,64,64,0.08); color:var(--primary); padding:0.25rem 0.625rem; border-radius:9999px; font-weight:600;">${item.label}</span>` : '';
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

// ── Edit form ─────────────────────────────────────────────────────────────────
function renderEditForm() {
  return `
    <div style="display:flex; flex-direction:column; gap:1.25rem;">

      <div>
        <label style="font-size:0.78rem; font-weight:600; display:block; margin-bottom:0.375rem; color:var(--muted-foreground);">📍 Home City</label>
        <select id="editLocation" style="width:100%; padding:0.75rem; border-radius:var(--radius); font-size:0.875rem; border:1.5px solid var(--border); background:white;">
          ${indianCities.map(c => `<option value="${c}" ${editPrefs.location === c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
      </div>

      <div>
        <label style="font-size:0.78rem; font-weight:600; display:block; margin-bottom:0.375rem; color:var(--muted-foreground);">💰 Budget</label>
        <div style="display:flex; gap:0.5rem;">
          ${budgetOptions.map(opt => `
            <button class="budget-edit-btn" data-id="${opt.id}" style="flex:1; padding:0.625rem 0.25rem; border-radius:var(--radius); border:2px solid ${editPrefs.budget === opt.id ? 'var(--primary)' : 'var(--border)'}; background:${editPrefs.budget === opt.id ? 'var(--primary)' : 'white'}; color:${editPrefs.budget === opt.id ? 'white' : 'var(--foreground)'}; font-size:0.72rem; font-weight:700; cursor:pointer; transition:all 0.2s;">
              ${opt.emoji}<br/>${opt.label}
            </button>
          `).join('')}
        </div>
      </div>

      <div>
        <label style="font-size:0.78rem; font-weight:600; display:block; margin-bottom:0.375rem; color:var(--muted-foreground);">🧳 Trip Style</label>
        <div style="display:flex; flex-wrap:wrap; gap:0.375rem;">
          ${tripStyles.map(s => `
            <button class="style-edit-btn" data-id="${s.id}" style="padding:0.4rem 0.875rem; border-radius:9999px; border:2px solid ${editPrefs.tripStyle === s.id ? 'var(--primary)' : 'var(--border)'}; background:${editPrefs.tripStyle === s.id ? 'var(--primary)' : 'white'}; color:${editPrefs.tripStyle === s.id ? 'white' : 'var(--foreground)'}; font-size:0.78rem; font-weight:600; cursor:pointer; transition:all 0.2s;">
              ${s.label}
            </button>
          `).join('')}
        </div>
      </div>

      <div>
        <label style="font-size:0.78rem; font-weight:600; display:block; margin-bottom:0.375rem; color:var(--muted-foreground);">🎯 Interests</label>
        <div style="display:grid; grid-template-columns:repeat(2,1fr); gap:0.5rem;">
          ${interests.map(item => {
            const sel = (editPrefs.interests || []).includes(item.id);
            return `
              <button class="interest-edit-btn" data-id="${item.id}" style="padding:0.5rem 0.75rem; border-radius:var(--radius); border:2px solid ${sel ? 'var(--primary)' : 'var(--border)'}; background:${sel ? 'rgba(216,64,64,0.06)' : 'white'}; color:${sel ? 'var(--primary)' : 'var(--foreground)'}; font-size:0.78rem; font-weight:600; cursor:pointer; text-align:left; transition:all 0.2s; display:flex; align-items:center; gap:0.375rem;">
                ${getIcon(item.icon)} ${item.label}
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <div style="display:flex; align-items:center; justify-content:space-between; padding:0.875rem; border-radius:var(--radius); background:var(--muted);">
        <div>
          <p style="font-size:0.875rem; font-weight:600;">🌿 Offbeat Destinations</p>
          <p style="font-size:0.72rem; color:var(--muted-foreground); margin-top:0.1rem;">Hidden gems away from crowds</p>
        </div>
        <button id="offbeatToggle" class="toggle-switch ${editPrefs.offbeat ? 'active' : ''}">
          <div class="toggle-thumb"></div>
        </button>
      </div>

      <div style="display:flex; gap:0.625rem;">
        <button id="cancelEditBtn" style="flex:1; padding:0.75rem; border-radius:var(--radius); border:1.5px solid var(--border); background:white; color:var(--foreground); font-weight:600; cursor:pointer;">Cancel</button>
        <button id="saveEditBtn" class="btn btn-primary" style="flex:2; height:2.75rem;">Save Changes</button>
      </div>
    </div>
  `;
}

function attachEditListeners() {
  document.getElementById('editLocation').addEventListener('change', e => { editPrefs.location = e.target.value; });

  document.querySelectorAll('.budget-edit-btn').forEach(btn => btn.addEventListener('click', () => {
    editPrefs.budget = btn.dataset.id;
    document.getElementById('preferencesContent').innerHTML = renderEditForm();
    attachEditListeners();
  }));

  document.querySelectorAll('.style-edit-btn').forEach(btn => btn.addEventListener('click', () => {
    editPrefs.tripStyle = btn.dataset.id;
    document.getElementById('preferencesContent').innerHTML = renderEditForm();
    attachEditListeners();
  }));

  document.querySelectorAll('.interest-edit-btn').forEach(btn => btn.addEventListener('click', () => {
    const id = btn.dataset.id;
    if (!editPrefs.interests) editPrefs.interests = [];
    editPrefs.interests = editPrefs.interests.includes(id)
      ? editPrefs.interests.filter(i => i !== id)
      : [...editPrefs.interests, id];
    document.getElementById('preferencesContent').innerHTML = renderEditForm();
    attachEditListeners();
  }));

  document.getElementById('offbeatToggle').addEventListener('click', () => {
    editPrefs.offbeat = !editPrefs.offbeat;
    document.getElementById('preferencesContent').innerHTML = renderEditForm();
    attachEditListeners();
  });

  document.getElementById('cancelEditBtn').addEventListener('click', () => {
    const user = auth.getUserData();
    document.getElementById('preferencesContent').innerHTML = renderPrefsView(user);
  });

  document.getElementById('saveEditBtn').addEventListener('click', async () => {
    const btn = document.getElementById('saveEditBtn');
    btn.disabled = true;
    btn.textContent = 'Saving…';
    await auth.completeOnboarding(editPrefs);
    renderProfile();
  });
}
