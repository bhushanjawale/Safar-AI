import { router } from '../router.js';
import { auth } from '../auth.js';
import { getIcon } from '../icons.js';

const API_URL = 'http://localhost:5000/api';

export function renderFlights() {
  const user = auth.getUserData();
  const userCity = user?.preferences?.location || '';

  document.getElementById('app').innerHTML = `
    <div style="min-height:100vh;background:var(--background);padding-bottom:5rem;">
      <div style="background:linear-gradient(135deg,var(--primary),var(--accent));padding:1.5rem 1rem 2.5rem;">
        <button id="backBtn" class="flex items-center gap-2 mb-4" style="color:white;opacity:0.9;">
          ${getIcon('chevronLeft')} Back
        </button>
        <h1 class="text-2xl font-bold" style="color:white;">✈️ Search Flights</h1>
        <p class="text-sm mt-1" style="color:rgba(255,255,255,0.85);">Find the best fares with AI</p>
      </div>

      <div class="px-4" style="margin-top:-1.25rem;">
        <div class="glass-card p-5" style="display:flex;flex-direction:column;gap:1rem;">

          <div style="display:flex;gap:0.5rem;background:var(--muted);border-radius:var(--radius);padding:0.25rem;">
            <button class="trip-type-btn active" data-type="one-way" style="flex:1;padding:0.5rem;border-radius:calc(var(--radius) - 2px);font-size:0.875rem;font-weight:600;transition:all 0.2s;">One Way</button>
            <button class="trip-type-btn" data-type="round-trip" style="flex:1;padding:0.5rem;border-radius:calc(var(--radius) - 2px);font-size:0.875rem;font-weight:600;transition:all 0.2s;">Round Trip</button>
          </div>

          <div style="position:relative;">
            <label class="text-sm font-semibold">From</label>
            <input type="text" id="flightFrom" placeholder="City or Airport" value="${userCity}" style="height:3rem;border-radius:var(--radius);margin-top:0.5rem;">
          </div>

          <div style="display:flex;justify-content:center;margin:-0.5rem 0;">
            <button id="swapBtn" style="width:2.5rem;height:2.5rem;border-radius:50%;background:var(--primary);color:white;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(237,108,33,0.3);transition:all 0.2s;">
              ⇅
            </button>
          </div>

          <div>
            <label class="text-sm font-semibold">To</label>
            <input type="text" id="flightTo" placeholder="City or Airport" style="height:3rem;border-radius:var(--radius);margin-top:0.5rem;">
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
            <div>
              <label class="text-sm font-semibold">Departure</label>
              <input type="date" id="departDate" style="height:3rem;border-radius:var(--radius);margin-top:0.5rem;">
            </div>
            <div id="returnDateWrap">
              <label class="text-sm font-semibold">Return</label>
              <input type="date" id="returnDate" style="height:3rem;border-radius:var(--radius);margin-top:0.5rem;" disabled>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
            <div>
              <label class="text-sm font-semibold">Passengers</label>
              <select id="passengers" style="height:3rem;border-radius:var(--radius);margin-top:0.5rem;width:100%;padding:0 1rem;border:1px solid var(--border);background:var(--card);font-family:inherit;font-size:0.875rem;">
                <option value="1">1 Adult</option>
                <option value="2">2 Adults</option>
                <option value="3">3 Adults</option>
                <option value="4">4 Adults</option>
              </select>
            </div>
            <div>
              <label class="text-sm font-semibold">Class</label>
              <select id="cabinClass" style="height:3rem;border-radius:var(--radius);margin-top:0.5rem;width:100%;padding:0 1rem;border:1px solid var(--border);background:var(--card);font-family:inherit;font-size:0.875rem;">
                <option value="economy">Economy</option>
                <option value="premium-economy">Prem. Economy</option>
                <option value="business">Business</option>
                <option value="first">First Class</option>
              </select>
            </div>
          </div>

          <button id="searchFlightsBtn" class="btn btn-primary w-full">
            ${getIcon('search')} Search Flights
          </button>
        </div>
      </div>

      <div id="flightResults" class="px-4 mt-4"></div>
    </div>
    ${renderBottomNav()}
  `;

  // Set default date to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('departDate').value = today;

  document.getElementById('backBtn').addEventListener('click', () => router.navigate('/home'));
  document.getElementById('swapBtn').addEventListener('click', swapCities);
  document.getElementById('searchFlightsBtn').addEventListener('click', handleFlightSearch);

  document.querySelectorAll('.trip-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.trip-type-btn').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.color = 'var(--muted-foreground)';
      });
      btn.classList.add('active');
      btn.style.background = 'var(--card)';
      btn.style.color = 'var(--primary)';
      const isRound = btn.dataset.type === 'round-trip';
      document.getElementById('returnDate').disabled = !isRound;
    });
  });

  // Style active tab initially
  const activeTab = document.querySelector('.trip-type-btn.active');
  if (activeTab) { activeTab.style.background = 'var(--card)'; activeTab.style.color = 'var(--primary)'; }

  attachNavListeners();
}

function swapCities() {
  const from = document.getElementById('flightFrom');
  const to = document.getElementById('flightTo');
  [from.value, to.value] = [to.value, from.value];
  const btn = document.getElementById('swapBtn');
  btn.style.transform = 'rotate(180deg)';
  setTimeout(() => btn.style.transform = '', 300);
}

async function handleFlightSearch() {
  const from = document.getElementById('flightFrom').value.trim();
  const to = document.getElementById('flightTo').value.trim();
  const date = document.getElementById('departDate').value;
  const passengers = document.getElementById('passengers').value;
  const cabinClass = document.getElementById('cabinClass').value;

  if (!from || !to) { alert('Please enter origin and destination'); return; }

  const btn = document.getElementById('searchFlightsBtn');
  const results = document.getElementById('flightResults');

  btn.disabled = true;
  btn.innerHTML = '<div style="width:1.25rem;height:1.25rem;border:3px solid rgba(255,255,255,0.4);border-top-color:white;border-radius:50%;animation:spin 0.8s linear infinite;"></div> Searching...';
  results.innerHTML = '';

  try {
    const res = await fetch(`${API_URL}/flights/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, date, passengers, cabin_class: cabinClass })
    });
    const data = await res.json();
    if (data.success) {
      results.innerHTML = renderFlightResults(data.flights, from, to, date, passengers);
      results.scrollIntoView({ behavior: 'smooth' });
    } else {
      results.innerHTML = `<div class="glass-card p-5" style="color:var(--destructive);">⚠️ ${data.error || 'Search failed'}</div>`;
    }
  } catch {
    results.innerHTML = `<div class="glass-card p-5" style="color:var(--destructive);">⚠️ Could not connect to server</div>`;
  }

  btn.disabled = false;
  btn.innerHTML = `${getIcon('search')} Search Flights`;
}

function renderFlightResults(flights, from, to, date, passengers) {
  if (!flights?.length) return `<div class="glass-card p-5 text-center" style="color:var(--muted-foreground);">No flights found</div>`;

  const sorted = [...flights].sort((a, b) => parsePriceNum(a.price) - parsePriceNum(b.price));

  return `
    <div style="display:flex;flex-direction:column;gap:0.75rem;padding-bottom:1rem;">
      <div class="flex items-center justify-between px-1">
        <div>
          <p class="font-bold text-lg">${from} → ${to}</p>
          <p class="text-sm" style="color:var(--muted-foreground);">${formatDate(date)} • ${passengers} passenger${passengers > 1 ? 's' : ''}</p>
        </div>
        <span class="tag-badge">${flights.length} flights</span>
      </div>

      ${sorted.map((f, i) => `
        <div class="flight-result-card ${i === 0 ? 'best-deal' : ''}">
          ${i === 0 ? '<div class="deal-ribbon">Best Deal</div>' : ''}
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
            <div style="display:flex;align-items:center;gap:0.75rem;">
              <div class="airline-logo">${f.airline.charAt(0)}</div>
              <div>
                <div class="font-semibold">${f.airline}</div>
                <div class="text-xs" style="color:var(--muted-foreground);">${f.flight_number} • ${f.cabin_class}</div>
              </div>
            </div>
            <div style="text-align:right;">
              <div class="option-price">${typeof f.price === 'number' ? '₹' + f.price.toLocaleString('en-IN') : f.price}</div>
              <div class="text-xs" style="color:var(--muted-foreground);">per person</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <div style="text-align:center;">
              <div class="font-bold text-lg">${f.departure_time}</div>
              <div class="text-xs" style="color:var(--muted-foreground);">${f.from_code}</div>
            </div>
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:0.25rem;">
              <div class="text-xs" style="color:var(--muted-foreground);">${f.duration}</div>
              <div style="width:100%;height:1px;background:var(--border);position:relative;">
                <div style="position:absolute;top:-4px;right:0;width:8px;height:8px;border-radius:50%;background:var(--primary);"></div>
              </div>
              <div class="text-xs" style="color:var(--muted-foreground);">${f.stops === 0 || f.stops === 'Non-Stop' || f.stops === 'non-stop' ? 'Non-stop' : f.stops + ' stop'}</div>
            </div>
            <div style="text-align:center;">
              <div class="font-bold text-lg">${f.arrival_time}</div>
              <div class="text-xs" style="color:var(--muted-foreground);">${f.to_code}</div>
            </div>
          </div>
          <div style="display:flex;gap:0.5rem;margin-top:0.75rem;flex-wrap:wrap;">
            ${f.amenities?.map(a => `<span class="amenity-badge">${a}</span>`).join('') || ''}
          </div>
          <button class="btn btn-primary w-full" style="margin-top:0.75rem;height:2.5rem;font-size:0.875rem;">Book Now</button>
        </div>
      `).join('')}
    </div>
    <style>
      .flight-result-card{position:relative;background:var(--card);border:2px solid var(--border);border-radius:1rem;padding:1.25rem;transition:all 0.2s;overflow:hidden;}
      .flight-result-card:hover{border-color:var(--primary);transform:translateY(-2px);box-shadow:0 8px 24px rgba(237,108,33,0.1);}
      .flight-result-card.best-deal{border-color:var(--primary);background:linear-gradient(135deg,rgba(237,108,33,0.04),rgba(255,193,7,0.04));}
      .deal-ribbon{position:absolute;top:0;right:0;background:linear-gradient(135deg,var(--primary),var(--accent));color:white;font-size:0.7rem;font-weight:700;padding:0.25rem 0.75rem;border-bottom-left-radius:0.75rem;}
      .airline-logo{width:2.5rem;height:2.5rem;border-radius:0.5rem;background:linear-gradient(135deg,var(--primary),var(--accent));color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.125rem;}
      @keyframes spin{to{transform:rotate(360deg);}}
    </style>
  `;
}

function parsePriceNum(price) {
  if (typeof price === 'number') return price;
  return parseInt((price || '0').toString().replace(/[^0-9]/g, '')) || 0;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
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
