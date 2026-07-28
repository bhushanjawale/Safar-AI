import { auth } from '../auth.js';
import { router } from '../router.js';
import { interests, budgetOptions, tripStyles, indianCities } from '../data.js';
import { getIcon } from '../icons.js';

let currentStep = 0;
let selectedInterests = [];
let budget = '';
let tripStyle = '';
let offbeat = false;
let location = '';

export function renderOnboarding() {
  document.getElementById('app').innerHTML = `
    <div style="min-height: 100vh; display: flex; flex-direction: column; background: var(--background);">
      <div class="px-6 pt-6 pb-2">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-medium" style="color: var(--muted-foreground);">Step ${currentStep + 1} of 4</span>
          ${currentStep > 0 ? `<button id="backBtn" class="text-sm font-medium flex items-center gap-1" style="color: var(--primary);">${getIcon('chevronLeft')} Back</button>` : ''}
        </div>
        <div class="flex gap-1">
          ${[0,1,2,3].map(i => `<div style="height: 0.25rem; flex: 1; border-radius: 9999px; ${i <= currentStep ? 'background: linear-gradient(135deg, var(--primary), var(--accent));' : 'background: var(--muted);'}"></div>`).join('')}
        </div>
      </div>

      <div class="flex-1 px-6 py-6 overflow-y-auto" id="stepContent"></div>

      <div class="px-6 pb-8 pt-2">
        <button id="continueBtn" class="btn btn-primary w-full">
          ${currentStep === 3 ? 'Start Exploring 🚀' : `Continue ${getIcon('chevronRight')}`}
        </button>
      </div>
    </div>
  `;

  renderStep();
  
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      currentStep--;
      renderOnboarding();
    });
  }
  
  document.getElementById('continueBtn').addEventListener('click', () => {
    if (currentStep === 3) {
      auth.completeOnboarding({ location, interests: selectedInterests, budget, tripStyle, offbeat });
      router.navigate('/home');
    } else {
      currentStep++;
      renderOnboarding();
    }
  });
  
  updateContinueBtn();
}

function renderStep() {
  const content = document.getElementById('stepContent');
  
  if (currentStep === 0) {
    content.innerHTML = `
      <div class="animate-slide-up" style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div>
          <h2 class="text-2xl font-bold">📍 Where are you from?</h2>
          <p class="text-sm mt-2" style="color: var(--muted-foreground);">We'll show trips near you (300–500 km radius)</p>
        </div>

        <!-- Live location button -->
        <button id="detectLocationBtn" style="display:flex;align-items:center;justify-content:center;gap:0.6rem;padding:0.75rem 1rem;border-radius:var(--radius);border:2px dashed var(--primary);background:rgba(216,64,64,0.05);color:var(--primary);font-weight:600;font-size:0.875rem;cursor:pointer;transition:all 0.2s;width:100%;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" opacity="0.3"/></svg>
          <span id="detectBtnText">Detect my location</span>
        </button>

        <!-- Detected location display -->
        <div id="detectedLocationCard" style="display:none;align-items:center;gap:0.75rem;padding:0.875rem 1rem;border-radius:var(--radius);background:rgba(216,64,64,0.07);border:1.5px solid rgba(216,64,64,0.25);">
          <div style="width:2.25rem;height:2.25rem;border-radius:9999px;background:linear-gradient(135deg,var(--primary),var(--accent));display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <div style="flex:1;min-width:0;">
            <p style="font-size:0.7rem;color:var(--primary);font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 0.1rem;">Live Location Detected</p>
            <p id="detectedCityName" style="font-size:0.95rem;font-weight:700;color:var(--foreground);margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"></p>
            <p id="detectedFullAddr" style="font-size:0.72rem;color:var(--muted-foreground);margin:0.1rem 0 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"></p>
          </div>
          <button id="clearDetected" style="background:none;border:none;cursor:pointer;color:var(--muted-foreground);font-size:1rem;padding:0.25rem;line-height:1;">✕</button>
        </div>

        <div style="display:flex;align-items:center;gap:0.75rem;">
          <div style="flex:1;height:1px;background:var(--border);"></div>
          <span style="font-size:0.72rem;color:var(--muted-foreground);font-weight:500;">or choose manually</span>
          <div style="flex:1;height:1px;background:var(--border);"></div>
        </div>

        <div>
          <label class="text-sm font-medium" style="display: block; margin-bottom: 0.5rem;">Select your city</label>
          <select id="locationSelect" class="glass-card" style="width: 100%; padding: 1rem; border-radius: var(--radius); font-size: 1rem; border: 2px solid var(--muted);">
            <option value="">Choose your city...</option>
            ${indianCities.map(city => `<option value="${city}" ${location === city ? 'selected' : ''}>${city}</option>`).join('')}
          </select>
        </div>
      </div>
    `;

    document.getElementById('locationSelect').addEventListener('change', (e) => {
      location = e.target.value;
      // Clear detected card if user manually picks
      document.getElementById('detectedLocationCard').style.display = 'none';
      updateContinueBtn();
    });

    document.getElementById('detectLocationBtn').addEventListener('click', () => detectLiveLocation());
    document.getElementById('clearDetected').addEventListener('click', () => {
      document.getElementById('detectedLocationCard').style.display = 'none';
      document.getElementById('locationSelect').value = '';
      location = '';
      updateContinueBtn();
    });
  } else if (currentStep === 1) {
    content.innerHTML = `
      <div class="animate-slide-up" style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div>
          <h2 class="text-2xl font-bold">🎯 What excites you?</h2>
          <p class="text-sm mt-1" style="color: var(--muted-foreground);">Pick all that interest you</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">
          ${interests.map((item, idx) => `
            <div class="interest-card animate-fade-in-delay stagger-${idx + 1} ${selectedInterests.includes(item.id) ? 'selected' : ''}" data-id="${item.id}">
              <div class="icon-box ${selectedInterests.includes(item.id) ? 'gradient-primary' : ''}" style="width: 2.5rem; height: 2.5rem; border-radius: var(--radius); display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem; background: ${selectedInterests.includes(item.id) ? '' : 'var(--muted)'};">
                ${getIcon(item.icon)}
              </div>
              <p class="text-sm font-semibold" style="color: ${selectedInterests.includes(item.id) ? 'var(--primary)' : 'var(--foreground)'};">${item.label}</p>
              ${selectedInterests.includes(item.id) ? `<div class="gradient-primary" style="position: absolute; top: 0.5rem; right: 0.5rem; width: 1.25rem; height: 1.25rem; border-radius: 9999px; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.75rem;">✓</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    document.querySelectorAll('.interest-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        if (selectedInterests.includes(id)) {
          selectedInterests = selectedInterests.filter(i => i !== id);
        } else {
          selectedInterests.push(id);
        }
        renderStep();
      });
    });
  } else if (currentStep === 2) {
    content.innerHTML = `
      <div class="animate-slide-up" style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div>
          <h2 class="text-2xl font-bold">💰 Budget comfort</h2>
          <p class="text-sm mt-1" style="color: var(--muted-foreground);">Used to filter transport, stays, and activities</p>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          ${budgetOptions.map(opt => `
            <div class="budget-option ${budget === opt.id ? 'selected' : ''}" data-id="${opt.id}">
              <span style="font-size: 2rem;">${opt.emoji}</span>
              <p class="font-bold mt-1">${opt.label}</p>
              <p class="text-xs" style="color: var(--muted-foreground);">${opt.desc}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    document.querySelectorAll('.budget-option').forEach(opt => {
      opt.addEventListener('click', () => {
        budget = opt.dataset.id;
        renderStep();
      });
    });
  } else if (currentStep === 3) {
    content.innerHTML = `
      <div class="animate-slide-up" style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div>
          <h2 class="text-2xl font-bold">🧳 Trip style</h2>
          <p class="text-sm mt-1" style="color: var(--muted-foreground);">How do you like to travel?</p>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
          ${tripStyles.map(s => `
            <div class="style-chip ${tripStyle === s.id ? 'selected' : ''}" data-id="${s.id}">${s.label}</div>
          `).join('')}
        </div>
        <div class="glass-card p-4 flex items-center justify-between cursor-pointer" id="offbeatToggle">
          <div>
            <p class="font-semibold">${offbeat ? '🌿 Offbeat / Less-Crowded' : '⭐ Popular Destinations'}</p>
            <p class="text-xs mt-1" style="color: var(--muted-foreground);">${offbeat ? 'Hidden gems away from crowds' : 'Trending and well-known spots'}</p>
          </div>
          <div class="toggle-switch ${offbeat ? 'active' : ''}">
            <div class="toggle-thumb"></div>
          </div>
        </div>
      </div>
    `;
    
    document.querySelectorAll('.style-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        tripStyle = chip.dataset.id;
        renderStep();
      });
    });
    
    document.getElementById('offbeatToggle').addEventListener('click', () => {
      offbeat = !offbeat;
      renderStep();
    });
  }
  
  updateContinueBtn();
}

function updateContinueBtn() {
  const btn = document.getElementById('continueBtn');
  const canContinue = (currentStep === 0 && location) || 
    (currentStep === 1 && selectedInterests.length > 0) ||
    (currentStep === 2 && budget) ||
    (currentStep === 3 && tripStyle);
  btn.disabled = !canContinue;
}

async function detectLiveLocation() {
  const btn = document.getElementById('detectLocationBtn');
  const btnText = document.getElementById('detectBtnText');
  if (!btn || !btnText) return;

  if (!navigator.geolocation) {
    btnText.textContent = 'Geolocation not supported';
    return;
  }

  // Loading state
  btn.disabled = true;
  btn.style.opacity = '0.7';
  btnText.innerHTML = '<span style="display:inline-block;animation:spin 0.8s linear infinite;">⟳</span> Detecting…';

  navigator.geolocation.getCurrentPosition(
    async ({ coords }) => {
      try {
        const res = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${coords.latitude}+${coords.longitude}&key=f642735fe5984870b3b5800ae0313901&language=en&limit=1`
        );
        const data = await res.json();
        const comp = data.results?.[0]?.components || {};
        const formatted = data.results?.[0]?.formatted || '';

        // Best city name from components
        const city = comp.city || comp.town || comp.village || comp.county || comp.state_district || comp.state || '';
        const state = comp.state || '';
        const display = city || 'Your Location';

        // Try to match against indianCities list
        const matched = indianCities.find(c => c.toLowerCase() === city.toLowerCase())
          || indianCities.find(c => city.toLowerCase().includes(c.toLowerCase()))
          || indianCities.find(c => c.toLowerCase().includes(city.toLowerCase()));

        location = matched || city;

        // Update select if matched
        const select = document.getElementById('locationSelect');
        if (select && matched) select.value = matched;

        // Show detected card
        document.getElementById('detectedCityName').textContent = matched || display;
        document.getElementById('detectedFullAddr').textContent = formatted || `${city}${state ? ', ' + state : ''}`;
        document.getElementById('detectedLocationCard').style.display = 'flex';

        btn.disabled = false;
        btn.style.opacity = '1';
        btnText.textContent = 'Detect my location';
        updateContinueBtn();
      } catch {
        _locationError(btn, btnText, 'Could not fetch location');
      }
    },
    () => _locationError(btn, btnText, 'Permission denied')
  );
}

function _locationError(btn, btnText, msg) {
  btn.disabled = false;
  btn.style.opacity = '1';
  btnText.textContent = msg + ' — try again';
}
