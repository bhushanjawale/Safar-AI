import { router } from '../router.js';
import { generateItinerary, saveTrip } from '../api.js';
import { getIcon } from '../icons.js';

let currentItinerary = null;
let currentSource = '';
let currentDestination = '';
let currentDays = 3;
let currentBudget = 'balanced';
let currentItineraryId = null;
let loaderInterval = null;

export function renderPlanner() {
  document.getElementById('app').innerHTML = `
    <div class="planner-page">

      <div class="planner-hero">
        <div class="planner-hero-orb orb1"></div>
        <div class="planner-hero-orb orb2"></div>
        <div class="planner-hero-inner">
          <button id="backBtn" class="planner-back-btn">${getIcon('chevronLeft')}</button>
          <div class="planner-hero-text">
            <span class="planner-ai-badge">✦ AI Powered</span>
            <h1 class="planner-hero-title">Trip Planner</h1>
            <p class="planner-hero-sub">Craft your perfect journey in seconds</p>
          </div>
          <div class="planner-hero-emoji">🗺️</div>
        </div>
      </div>

      <div class="planner-form-wrap">
        <div class="planner-form-card animate-slide-up">

          <div class="planner-route-row">
            <div class="planner-field">
              <span class="pf-icon">📍</span>
              <input type="text" id="source" class="pf-input" placeholder="From city…">
              <label class="pf-label">From</label>
            </div>
            <button class="planner-swap" id="swapBtn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M7 16V4m0 0L3 8m4-4l4 4"/><path d="M17 8v12m0 0l4-4m-4 4l-4-4"/>
              </svg>
            </button>
            <div class="planner-field">
              <span class="pf-icon">🏁</span>
              <input type="text" id="destination" class="pf-input" placeholder="To city…">
              <label class="pf-label">To</label>
            </div>
          </div>

          <div class="planner-meta-row">
            <div class="planner-days-ctrl">
              <span class="pf-icon" style="font-size:1rem">📅</span>
              <button class="day-step" id="decDay">−</button>
              <div class="days-display">
                <span id="daysDisplay">3</span>
                <span class="days-unit">days</span>
              </div>
              <button class="day-step" id="incDay">+</button>
              <input type="hidden" id="days" value="3">
            </div>
          </div>

          <div class="planner-budget-row">
            <span class="budget-label">Budget</span>
            <div class="budget-chips">
              <button class="b-chip" data-val="budget">🪙 Budget</button>
              <button class="b-chip active" data-val="balanced">⚖️ Balanced</button>
              <button class="b-chip" data-val="premium">💎 Premium</button>
            </div>
            <input type="hidden" id="budget" value="balanced">
          </div>

          <button id="generateBtn" class="planner-gen-btn">
            <span class="gen-sparkle">✦</span>
            Generate My Itinerary
            <span class="gen-arrow">→</span>
          </button>
        </div>
      </div>

      <div id="loading" class="planner-loading hidden">
        <div class="pl-ring-wrap">
          <div class="pl-ring"></div>
          <div class="pl-ring-inner">✈️</div>
        </div>
        <p class="pl-title">Building your trip…</p>
        <div class="pl-steps">
          <div class="pl-step active" id="ls0">🔍 Analysing route</div>
          <div class="pl-step" id="ls1">✈️ Finding transport</div>
          <div class="pl-step" id="ls2">🏨 Curating hotels</div>
          <div class="pl-step" id="ls3">📅 Building itinerary</div>
        </div>
      </div>

      <div id="result" class="hidden planner-result"></div>

    </div>
    ${renderBottomNav()}
  `;

  document.getElementById('backBtn').addEventListener('click', () => router.navigate('/home'));
  document.getElementById('generateBtn').addEventListener('click', handleGenerate);
  attachNavListeners();

  document.getElementById('swapBtn').addEventListener('click', () => {
    const s = document.getElementById('source');
    const d = document.getElementById('destination');
    [s.value, d.value] = [d.value, s.value];
    const btn = document.getElementById('swapBtn');
    btn.classList.add('swapping');
    setTimeout(() => btn.classList.remove('swapping'), 400);
  });

  document.getElementById('decDay').addEventListener('click', () => {
    const inp = document.getElementById('days');
    const v = Math.max(1, parseInt(inp.value) - 1);
    inp.value = v;
    document.getElementById('daysDisplay').textContent = v;
    animateDayChange();
  });

  document.getElementById('incDay').addEventListener('click', () => {
    const inp = document.getElementById('days');
    const v = Math.min(30, parseInt(inp.value) + 1);
    inp.value = v;
    document.getElementById('daysDisplay').textContent = v;
    animateDayChange();
  });

  document.querySelectorAll('.b-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.b-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      document.getElementById('budget').value = chip.dataset.val;
    });
  });
}

function animateDayChange() {
  const el = document.getElementById('daysDisplay');
  el.classList.add('day-pop');
  setTimeout(() => el.classList.remove('day-pop'), 300);
}

function startLoaderSteps() {
  let step = 0;
  document.querySelectorAll('.pl-step').forEach(s => s.classList.remove('active', 'done'));
  document.getElementById('ls0').classList.add('active');
  loaderInterval = setInterval(() => {
    document.getElementById(`ls${step}`)?.classList.replace('active', 'done');
    step++;
    if (step < 4) document.getElementById(`ls${step}`)?.classList.add('active');
    else clearInterval(loaderInterval);
  }, 1200);
}

function stopLoaderSteps() {
  clearInterval(loaderInterval);
}

async function handleGenerate() {
  const source = document.getElementById('source').value.trim();
  const destination = document.getElementById('destination').value.trim();
  const days = parseInt(document.getElementById('days').value);
  const budget = document.getElementById('budget').value;

  if (!source || !destination) {
    shakeForm();
    return;
  }

  const loading = document.getElementById('loading');
  const result = document.getElementById('result');
  const generateBtn = document.getElementById('generateBtn');

  loading.classList.remove('hidden');
  result.classList.add('hidden');
  generateBtn.disabled = true;
  generateBtn.classList.add('loading');
  startLoaderSteps();

  try {
    let chunkCount = 0;
    const plTitle = document.querySelector('.pl-title');
    const response = await generateItinerary(source, destination, days, budget, () => {
      chunkCount++;
      if (plTitle) plTitle.textContent = `Generating… (${chunkCount} tokens)`;
    });

    if (response.success) {
      currentItinerary = response.data;
      currentSource = source;
      currentDestination = destination;
      currentDays = days;
      currentBudget = budget;
      currentItineraryId = response.id;

      result.innerHTML = renderItineraryCards(response.data, source, destination);
      result.classList.remove('hidden');
      animateResultCards();
      attachCardListeners();
    } else {
      result.innerHTML = `<div class="planner-error">⚠️ ${response.error}</div>`;
      result.classList.remove('hidden');
    }
  } catch (error) {
    result.innerHTML = `<div class="planner-error">⚠️ Failed to generate itinerary. Please try again.</div>`;
    result.classList.remove('hidden');
  }

  stopLoaderSteps();
  loading.classList.add('hidden');
  generateBtn.disabled = false;
  generateBtn.classList.remove('loading');
}

function shakeForm() {
  const card = document.querySelector('.planner-form-card');
  card.classList.add('shake');
  setTimeout(() => card.classList.remove('shake'), 500);
}

function animateResultCards() {
  document.querySelectorAll('.premium-card').forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(24px)';
    setTimeout(() => {
      card.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, i * 120);
  });
}

function renderItineraryCards(data, source, destination) {
  return `
    <div style="display:flex;flex-direction:column;gap:1rem;padding-bottom:1rem;">
      ${renderFlightsCard(data.flights || [])}
      ${renderTrainsCard(data.trains || [])}
      ${renderCabsCard(data.cabs || [])}
      ${renderHotelsCard(data.hotels || [])}
      ${renderDetailedItinerary(data.itinerary || [], destination)}
    </div>
  `;
}

function renderFlightsCard(flights) {
  if (!flights.length) return '';
  return `
    <div class="premium-card">
      <div class="card-header">
        <div class="flex items-center gap-3">
          <div class="icon-circle" style="background:linear-gradient(135deg,#3b82f6,#2563eb)">✈️</div>
          <div>
            <h3 class="card-title">Flight Options</h3>
            <p class="card-subtitle">${flights.length} available flights</p>
          </div>
        </div>
      </div>
      <div class="card-content">
        ${flights.map((f, i) => `
          <div class="option-card ${i === 0 ? 'recommended' : ''}">
            ${i === 0 ? '<span class="badge-recommended">Recommended</span>' : ''}
            <div class="flex justify-between items-center mb-3">
              <div>
                <div class="option-title">${f.airline}</div>
                <div class="option-subtitle">${f.class}</div>
              </div>
              <div class="option-price">${f.price}</div>
            </div>
            <div class="flex items-center gap-4 text-sm" style="color:var(--muted-foreground)">
              <span>🛫 ${f.departure}</span><span>→</span><span>🛬 ${f.arrival}</span>
              <span class="badge-time">${f.duration}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderTrainsCard(trains) {
  if (!trains.length) return '';
  return `
    <div class="premium-card">
      <div class="card-header">
        <div class="flex items-center gap-3">
          <div class="icon-circle" style="background:linear-gradient(135deg,#10b981,#059669)">🚆</div>
          <div>
            <h3 class="card-title">Train Options</h3>
            <p class="card-subtitle">${trains.length} available trains</p>
          </div>
        </div>
      </div>
      <div class="card-content">
        ${trains.map((t, i) => `
          <div class="option-card ${i === 0 ? 'recommended' : ''}">
            ${i === 0 ? '<span class="badge-recommended">Recommended</span>' : ''}
            <div class="flex justify-between items-center mb-3">
              <div>
                <div class="option-title">${t.name}</div>
                <div class="option-subtitle">${t.number} • ${t.class}</div>
              </div>
              <div class="option-price">${t.price}</div>
            </div>
            <div class="flex items-center gap-4 text-sm" style="color:var(--muted-foreground)">
              <span>🚉 ${t.departure}</span><span>→</span><span>🚉 ${t.arrival}</span>
              <span class="badge-time">${t.duration}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderCabsCard(cabs) {
  if (!cabs.length) return '';
  return `
    <div class="premium-card">
      <div class="card-header">
        <div class="flex items-center gap-3">
          <div class="icon-circle" style="background:linear-gradient(135deg,#f59e0b,#d97706)">🚕</div>
          <div>
            <h3 class="card-title">Local Transport</h3>
            <p class="card-subtitle">Cab & taxi services</p>
          </div>
        </div>
      </div>
      <div class="card-content">
        ${cabs.map(c => `
          <div class="option-card">
            <div class="flex justify-between items-center mb-2">
              <div>
                <div class="option-title">${c.type}</div>
                <div class="option-subtitle">${c.service}</div>
              </div>
              <div class="option-price">${c.price}</div>
            </div>
            <div class="text-sm" style="color:var(--muted-foreground)">📍 ${c.route} • ${c.duration}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderHotelsCard(hotels) {
  if (!hotels.length) return '';
  return `
    <div class="premium-card">
      <div class="card-header">
        <div class="flex items-center gap-3">
          <div class="icon-circle" style="background:linear-gradient(135deg,#8b5cf6,#7c3aed)">🏨</div>
          <div>
            <h3 class="card-title">Accommodation</h3>
            <p class="card-subtitle">${hotels.length} hotel options</p>
          </div>
        </div>
      </div>
      <div class="card-content">
        ${hotels.map((h, i) => `
          <div class="option-card ${i === 0 ? 'recommended' : ''}">
            ${i === 0 ? '<span class="badge-recommended">Best Value</span>' : ''}
            <div class="flex justify-between items-center mb-3">
              <div>
                <div class="option-title">${h.name}</div>
                <div class="flex items-center gap-2 mt-1">
                  <span style="color:#f59e0b">${'⭐'.repeat(Math.floor(h.rating))}</span>
                  <span class="option-subtitle">${h.rating} • ${h.location}</span>
                </div>
              </div>
              <div class="option-price">${h.pricePerNight}<span style="font-size:.75rem;font-weight:400">/night</span></div>
            </div>
            <div class="flex gap-2 flex-wrap">
              ${h.amenities.map(a => `<span class="amenity-badge">${a}</span>`).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderDetailedItinerary(itinerary, destination) {
  if (!itinerary.length) return '';
  return `
    <div class="premium-card">
      <div class="card-header">
        <div class="flex items-center gap-3">
          <div class="icon-circle" style="background:linear-gradient(135deg,var(--primary),var(--accent))">📅</div>
          <div>
            <h3 class="card-title">Detailed Itinerary</h3>
            <p class="card-subtitle">${destination} • ${itinerary.length} days</p>
          </div>
        </div>
      </div>
      <div class="card-content">
        ${itinerary.map((day, idx) => `
          <div class="day-card" data-day="${idx}">
            <div class="day-header" onclick="toggleDay(${idx})">
              <div class="flex items-center gap-3">
                <div class="day-number">Day ${day.day}</div>
                <div class="day-title">${day.title}</div>
              </div>
              <svg class="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            <div class="day-content">
              ${day.activities.map(act => `
                <div class="activity-item">
                  <div class="activity-time">${act.time}</div>
                  <div class="activity-details">
                    <div class="activity-title">${act.activity}</div>
                    <div class="activity-desc">${act.description}</div>
                    <div class="flex gap-3 mt-2">
                      <span class="activity-meta">⏱️ ${act.duration}</span>
                      <span class="activity-meta">💰 ${act.cost}</span>
                    </div>
                  </div>
                </div>
              `).join('')}
              ${day.meals && day.meals.length ? `
                <div class="meals-section">
                  <div class="meals-title">🍽️ Meals</div>
                  ${day.meals.map(m => `
                    <div class="meal-item">
                      <span class="meal-type">${m.type}</span>
                      <span class="meal-name">${m.restaurant}</span>
                      <span class="meal-cuisine">${m.cuisine}</span>
                      <span class="meal-cost">${m.cost}</span>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>
      <div style="padding:0 1.25rem 1.25rem">
        <button id="saveTrip" class="btn btn-primary w-full">💾 Save Trip</button>
      </div>
    </div>
  `;
}

function attachCardListeners() {
  document.getElementById('saveTrip')?.addEventListener('click', async () => {
    if (!currentItinerary || !currentItineraryId) { alert('No itinerary to save'); return; }
    const saveBtn = document.getElementById('saveTrip');
    saveBtn.disabled = true;
    saveBtn.textContent = '💾 Saving…';
    try {
      const response = await saveTrip({
        destination: currentDestination, source: currentSource,
        days: currentDays, budget: currentBudget,
        itinerary_id: currentItineraryId, itinerary_data: currentItinerary
      });
      if (response.success) { alert('Trip saved successfully!'); router.navigate('/my-trips'); }
      else { alert('Failed to save trip: ' + (response.error || 'Unknown error')); saveBtn.disabled = false; saveBtn.textContent = '💾 Save Trip'; }
    } catch (error) {
      alert('Error saving trip: ' + error.message);
      saveBtn.disabled = false; saveBtn.textContent = '💾 Save Trip';
    }
  });
}

window.toggleDay = function(idx) {
  document.querySelector(`[data-day="${idx}"]`).classList.toggle('expanded');
};

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
