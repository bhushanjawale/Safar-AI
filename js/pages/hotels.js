import { router } from '../router.js';
import { auth } from '../auth.js';
import { getIcon } from '../icons.js';

const API_URL = 'http://localhost:5000/api';

export function renderHotels() {
  const user = auth.getUserData();
  const userCity = user?.preferences?.location || '';

  document.getElementById('app').innerHTML = `
    <div style="min-height:100vh;background:var(--background);padding-bottom:5rem;">
      <div style="background:linear-gradient(135deg,#8b5cf6,#7c3aed);padding:1.5rem 1rem 2.5rem;">
        <button id="backBtn" class="flex items-center gap-2 mb-4" style="color:white;opacity:0.9;">
          ${getIcon('chevronLeft')} Back
        </button>
        <h1 class="text-2xl font-bold" style="color:white;">🏨 Search Hotels</h1>
        <p class="text-sm mt-1" style="color:rgba(255,255,255,0.85);">Find perfect stays with AI</p>
      </div>

      <div class="px-4" style="margin-top:-1.25rem;">
        <div class="glass-card p-5" style="display:flex;flex-direction:column;gap:1rem;">

          <div>
            <label class="text-sm font-semibold">Destination / City</label>
            <input type="text" id="hotelCity" placeholder="e.g., Goa, Jaipur, Mumbai" style="height:3rem;border-radius:var(--radius);margin-top:0.5rem;">
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
            <div>
              <label class="text-sm font-semibold">Check-in</label>
              <input type="date" id="checkIn" style="height:3rem;border-radius:var(--radius);margin-top:0.5rem;">
            </div>
            <div>
              <label class="text-sm font-semibold">Check-out</label>
              <input type="date" id="checkOut" style="height:3rem;border-radius:var(--radius);margin-top:0.5rem;">
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
            <div>
              <label class="text-sm font-semibold">Guests</label>
              <select id="guests" style="height:3rem;border-radius:var(--radius);margin-top:0.5rem;width:100%;padding:0 1rem;border:1px solid var(--border);background:var(--card);font-family:inherit;font-size:0.875rem;">
                <option value="1">1 Guest</option>
                <option value="2" selected>2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4 Guests</option>
                <option value="5">5+ Guests</option>
              </select>
            </div>
            <div>
              <label class="text-sm font-semibold">Rooms</label>
              <select id="rooms" style="height:3rem;border-radius:var(--radius);margin-top:0.5rem;width:100%;padding:0 1rem;border:1px solid var(--border);background:var(--card);font-family:inherit;font-size:0.875rem;">
                <option value="1" selected>1 Room</option>
                <option value="2">2 Rooms</option>
                <option value="3">3 Rooms</option>
              </select>
            </div>
          </div>

          <div>
            <label class="text-sm font-semibold mb-2" style="display:block;">Budget per Night</label>
            <div style="display:flex;gap:0.5rem;">
              ${[
                { value: 'budget', label: '💰 Budget', sub: 'Under ₹2,000' },
                { value: 'mid', label: '🏷️ Mid-range', sub: '₹2k–₹6k' },
                { value: 'luxury', label: '✨ Luxury', sub: '₹6,000+' }
              ].map(b => `
                <div class="hotel-budget-opt" data-budget="${b.value}" style="flex:1;border:2px solid var(--border);border-radius:var(--radius);padding:0.625rem 0.5rem;text-align:center;cursor:pointer;transition:all 0.2s;">
                  <div style="font-size:0.875rem;font-weight:600;">${b.label}</div>
                  <div style="font-size:0.7rem;color:var(--muted-foreground);margin-top:0.125rem;">${b.sub}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <div>
            <label class="text-sm font-semibold mb-2" style="display:block;">Property Type</label>
            <div style="display:flex;flex-wrap:wrap;gap:0.5rem;">
              ${['Hotel', 'Resort', 'Hostel', 'Villa', 'Homestay', 'Boutique'].map(t => `
                <button class="prop-type-chip" data-type="${t}" style="padding:0.375rem 0.875rem;border-radius:9999px;border:2px solid var(--border);font-size:0.8rem;font-weight:500;transition:all 0.2s;">${t}</button>
              `).join('')}
            </div>
          </div>

          <button id="searchHotelsBtn" class="btn btn-primary w-full" style="background:linear-gradient(135deg,#8b5cf6,#7c3aed);">
            ${getIcon('search')} Search Hotels
          </button>
        </div>
      </div>

      <div id="hotelResults" class="px-4 mt-4"></div>
    </div>
    ${renderBottomNav()}
  `;

  // Set default dates
  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const dayAfter = new Date(today); dayAfter.setDate(today.getDate() + 3);
  document.getElementById('checkIn').value = tomorrow.toISOString().split('T')[0];
  document.getElementById('checkOut').value = dayAfter.toISOString().split('T')[0];

  // Budget selection
  let selectedBudget = 'mid';
  document.querySelectorAll('.hotel-budget-opt').forEach(opt => {
    if (opt.dataset.budget === 'mid') activateBudget(opt);
    opt.addEventListener('click', () => {
      document.querySelectorAll('.hotel-budget-opt').forEach(o => deactivateBudget(o));
      activateBudget(opt);
      selectedBudget = opt.dataset.budget;
    });
  });

  // Property type chips
  const selectedTypes = new Set();
  document.querySelectorAll('.prop-type-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      if (selectedTypes.has(chip.dataset.type)) {
        selectedTypes.delete(chip.dataset.type);
        chip.style.background = 'transparent';
        chip.style.borderColor = 'var(--border)';
        chip.style.color = 'var(--foreground)';
      } else {
        selectedTypes.add(chip.dataset.type);
        chip.style.background = '#8b5cf6';
        chip.style.borderColor = '#8b5cf6';
        chip.style.color = 'white';
      }
    });
  });

  document.getElementById('backBtn').addEventListener('click', () => router.navigate('/home'));
  document.getElementById('searchHotelsBtn').addEventListener('click', () => handleHotelSearch(selectedBudget, selectedTypes));

  attachNavListeners();
}

function activateBudget(el) {
  el.style.borderColor = '#8b5cf6';
  el.style.background = 'rgba(139,92,246,0.08)';
}
function deactivateBudget(el) {
  el.style.borderColor = 'var(--border)';
  el.style.background = 'transparent';
}

async function handleHotelSearch(budget, propertyTypes) {
  const city = document.getElementById('hotelCity').value.trim();
  const checkIn = document.getElementById('checkIn').value;
  const checkOut = document.getElementById('checkOut').value;
  const guests = document.getElementById('guests').value;
  const rooms = document.getElementById('rooms').value;

  if (!city) { alert('Please enter a destination'); return; }
  if (!checkIn || !checkOut) { alert('Please select check-in and check-out dates'); return; }

  const nights = Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000));

  const btn = document.getElementById('searchHotelsBtn');
  const results = document.getElementById('hotelResults');

  btn.disabled = true;
  btn.innerHTML = '<div style="width:1.25rem;height:1.25rem;border:3px solid rgba(255,255,255,0.4);border-top-color:white;border-radius:50%;animation:spin 0.8s linear infinite;"></div> Searching...';
  results.innerHTML = '';

  try {
    const res = await fetch(`${API_URL}/hotels/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        city, check_in: checkIn, check_out: checkOut,
        guests, rooms, budget,
        property_types: [...propertyTypes]
      })
    });
    const data = await res.json();
    if (data.success) {
      results.innerHTML = renderHotelResults(data.hotels, city, checkIn, checkOut, nights, guests);
      results.scrollIntoView({ behavior: 'smooth' });
    } else {
      results.innerHTML = `<div class="glass-card p-5" style="color:var(--destructive);">⚠️ ${data.error || 'Search failed'}</div>`;
    }
  } catch {
    results.innerHTML = `<div class="glass-card p-5" style="color:var(--destructive);">⚠️ Could not connect to server</div>`;
  }

  btn.disabled = false;
  btn.innerHTML = `${getIcon('search')} Search Hotels`;
}

function renderHotelResults(hotels, city, checkIn, checkOut, nights, guests) {
  if (!hotels?.length) return `<div class="glass-card p-5 text-center" style="color:var(--muted-foreground);">No hotels found</div>`;

  const sorted = [...hotels].sort((a, b) => b.rating - a.rating);

  return `
    <div style="display:flex;flex-direction:column;gap:0.75rem;padding-bottom:1rem;">
      <div class="flex items-center justify-between px-1">
        <div>
          <p class="font-bold text-lg">🏨 ${city}</p>
          <p class="text-sm" style="color:var(--muted-foreground);">${formatDate(checkIn)} – ${formatDate(checkOut)} • ${nights} night${nights > 1 ? 's' : ''} • ${guests} guest${guests > 1 ? 's' : ''}</p>
        </div>
        <span class="tag-badge" style="background:rgba(139,92,246,0.1);color:#8b5cf6;">${hotels.length} hotels</span>
      </div>

      ${sorted.map((h, i) => `
        <div class="hotel-result-card ${i === 0 ? 'top-pick' : ''}">
          ${i === 0 ? '<div class="hotel-ribbon">Top Pick</div>' : ''}
          <div class="hotel-img-placeholder" style="background:${hotelGradient(i)};">
            <span style="font-size:2.5rem;">🏨</span>
            <div class="hotel-rating-pill">⭐ ${h.rating}</div>
          </div>
          <div style="padding:1rem;">
            <div style="display:flex;justify-content:space-between;align-items:start;gap:0.5rem;">
              <div>
                <div class="font-bold" style="font-size:1.05rem;">${h.name}</div>
                <div class="text-sm" style="color:var(--muted-foreground);margin-top:0.125rem;">📍 ${h.location} • ${h.type}</div>
              </div>
              <div style="text-align:right;flex-shrink:0;">
                <div style="font-size:1.25rem;font-weight:700;color:#8b5cf6;">${typeof h.price_per_night === 'number' ? '₹' + h.price_per_night.toLocaleString('en-IN') : h.price_per_night}</div>
                <div class="text-xs" style="color:var(--muted-foreground);">per night</div>
              </div>
            </div>

            <div style="margin-top:0.75rem;padding:0.625rem;background:rgba(139,92,246,0.06);border-radius:0.5rem;display:flex;justify-content:space-between;align-items:center;">
              <span class="text-sm" style="color:var(--muted-foreground);">${nights} night${nights > 1 ? 's' : ''} total</span>
              <span class="font-bold" style="color:#8b5cf6;">${calcTotal(h.price_per_night, nights)}</span>
            </div>

            <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.75rem;">
              ${h.amenities?.slice(0, 5).map(a => `<span class="amenity-badge">${a}</span>`).join('') || ''}
            </div>

            ${h.highlight ? `<p style="margin-top:0.625rem;font-size:0.8rem;color:#8b5cf6;background:rgba(139,92,246,0.08);padding:0.5rem 0.75rem;border-radius:0.5rem;">✨ ${h.highlight}</p>` : ''}

            <button class="btn w-full" style="margin-top:0.75rem;height:2.5rem;font-size:0.875rem;background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:white;border-radius:var(--radius);">Book Now</button>
          </div>
        </div>
      `).join('')}
    </div>
    <style>
      .hotel-result-card{position:relative;background:var(--card);border:2px solid var(--border);border-radius:1rem;overflow:hidden;transition:all 0.2s;}
      .hotel-result-card:hover{border-color:#8b5cf6;transform:translateY(-2px);box-shadow:0 8px 24px rgba(139,92,246,0.12);}
      .hotel-result-card.top-pick{border-color:#8b5cf6;}
      .hotel-ribbon{position:absolute;top:0;right:0;background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:white;font-size:0.7rem;font-weight:700;padding:0.25rem 0.75rem;border-bottom-left-radius:0.75rem;z-index:2;}
      .hotel-img-placeholder{height:9rem;display:flex;align-items:center;justify-content:center;position:relative;}
      .hotel-rating-pill{position:absolute;bottom:0.625rem;left:0.75rem;background:rgba(255,255,255,0.95);backdrop-filter:blur(8px);padding:0.25rem 0.625rem;border-radius:9999px;font-size:0.75rem;font-weight:700;}
      @keyframes spin{to{transform:rotate(360deg);}}
    </style>
  `;
}

function hotelGradient(i) {
  const g = [
    'linear-gradient(135deg,#8b5cf6,#7c3aed)',
    'linear-gradient(135deg,#3b82f6,#2563eb)',
    'linear-gradient(135deg,#10b981,#059669)',
    'linear-gradient(135deg,#f59e0b,#d97706)',
    'linear-gradient(135deg,#ef4444,#dc2626)',
    'linear-gradient(135deg,#06b6d4,#0891b2)',
  ];
  return g[i % g.length];
}

function calcTotal(price, nights) {
  const num = typeof price === 'number' ? price : parseInt((price || '0').toString().replace(/[^0-9]/g, '')) || 0;
  return '₹' + (num * nights).toLocaleString('en-IN');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function renderBottomNav() {
  const currentPath = router.getCurrentPath();
  const navItems = [
    { path: '/home', icon: 'home', label: 'Home' },
    { path: '/planner', icon: 'search', label: 'Plan' },
    { path: '/my-trips', icon: 'bookmark', label: 'Trips' },
    { path: '/wishlist', icon: 'heart', label: 'Wishlist' },
    { path: '/profile', icon: 'user', label: 'Profile' }
  ];
  return `
    <nav class="bottom-nav">
      <div class="bottom-nav-items">
        ${navItems.map(item => `
          <a href="${item.path}" class="nav-item ${currentPath === item.path ? 'active' : ''}" data-path="${item.path}">
            ${getIcon(item.icon)}<span>${item.label}</span>
          </a>
        `).join('')}
      </div>
    </nav>
  `;
}

function attachNavListeners() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => { e.preventDefault(); router.navigate(item.dataset.path); });
  });
}
