import { router } from '../router.js';
import { getIcon } from '../icons.js';
import { renderBottomNav, attachNavListeners, fetchPexelsImage } from './shared.js';

const FLIGHT_DEALS = [
  { from: 'Mumbai', to: 'Goa',       price: '₹1,299', original: '₹3,200', discount: '59%', airline: 'IndiGo',    date: '15 Jan – 18 Jan', seats: 4 },
  { from: 'Delhi',  to: 'Manali',    price: '₹2,199', original: '₹4,800', discount: '54%', airline: 'Air India', date: '20 Jan – 25 Jan', seats: 6 },
  { from: 'Pune',   to: 'Jaipur',    price: '₹1,599', original: '₹3,500', discount: '54%', airline: 'SpiceJet',  date: '22 Jan – 25 Jan', seats: 3 },
  { from: 'Kolkata',to: 'Andaman',   price: '₹3,499', original: '₹7,200', discount: '51%', airline: 'IndiGo',    date: '1 Feb – 7 Feb',   seats: 5 },
];

const HOTEL_DEALS = [
  { name: 'Taj Exotica',       location: 'Goa',       price: '₹4,200/night', original: '₹9,500', discount: '55%', rating: '4.8', query: 'luxury resort Goa beach pool',    amenities: ['Pool', 'Spa', 'Beach'] },
  { name: 'The Oberoi',        location: 'Jaipur',    price: '₹5,800/night', original: '₹12,000', discount: '51%', rating: '4.9', query: 'luxury hotel Jaipur palace',      amenities: ['Pool', 'Spa', 'Gym'] },
  { name: 'Zostel Manali',     location: 'Manali',    price: '₹699/night',   original: '₹1,800',  discount: '61%', rating: '4.4', query: 'hostel Manali mountains view',    amenities: ['WiFi', 'Café', 'Bonfire'] },
  { name: 'Kumarakom Resort',  location: 'Kerala',    price: '₹6,500/night', original: '₹14,000', discount: '53%', rating: '4.8', query: 'backwater resort Kerala houseboat',amenities: ['Houseboat', 'Spa', 'Pool'] },
];

const PACKAGE_DEALS = [
  { title: 'Goa Beach Escape',      duration: '3N/4D', price: '₹12,999', original: '₹22,000', discount: '41%', includes: ['Flights', 'Hotel', 'Transfers'], query: 'Goa beach sunset India',         badge: '🔥 Hot Deal' },
  { title: 'Rajasthan Heritage Tour',duration: '5N/6D', price: '₹18,499', original: '₹32,000', discount: '42%', includes: ['Hotel', 'Meals', 'Guide'],     query: 'Rajasthan desert camel India',   badge: '⭐ Best Seller' },
  { title: 'Kerala Backwaters',      duration: '4N/5D', price: '₹15,999', original: '₹28,000', discount: '42%', includes: ['Houseboat', 'Meals', 'Transfers'], query: 'Kerala backwater houseboat',  badge: '💚 Eco Pick' },
  { title: 'Manali Snow Adventure',  duration: '4N/5D', price: '₹14,499', original: '₹24,000', discount: '39%', includes: ['Hotel', 'Activities', 'Meals'], query: 'Manali snow adventure skiing',  badge: '🏔️ Adventure' },
  { title: 'Andaman Island Bliss',   duration: '5N/6D', price: '₹24,999', original: '₹42,000', discount: '40%', includes: ['Flights', 'Hotel', 'Snorkeling'], query: 'Andaman snorkeling coral reef', badge: '🌊 Premium' },
  { title: 'Varanasi Spiritual Tour', duration: '2N/3D', price: '₹7,999',  original: '₹14,000', discount: '42%', includes: ['Hotel', 'Ghat Tour', 'Meals'],  query: 'Varanasi ganga aarti evening',  badge: '🕌 Spiritual' },
];

export function renderDeals() {
  document.getElementById('app').innerHTML = `
    <div style="min-height:100vh; background:var(--background); padding-bottom:5rem;">

      <!-- Header -->
      <div style="background:var(--primary); padding:1.25rem 1rem 1.75rem;">
        <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.5rem;">
          <button id="backBtn" style="width:2rem; height:2rem; background:rgba(255,255,255,0.2); border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; flex-shrink:0;">
            ${getIcon('chevronLeft')}
          </button>
          <div>
            <h1 style="color:white; font-size:1.25rem; font-weight:700;">Best Deals</h1>
            <p style="color:rgba(255,255,255,0.85); font-size:0.75rem;">Limited time offers — grab before they expire!</p>
          </div>
        </div>

        <!-- Deal stats strip -->
        <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:0.5rem; margin-top:1rem;">
          ${[['✈️','Flight Deals','4 offers'],['🏨','Hotel Deals','4 offers'],['📦','Packages','6 offers']].map(([e,t,s]) => `
            <div style="background:rgba(255,255,255,0.15); border-radius:0.75rem; padding:0.625rem; text-align:center; backdrop-filter:blur(8px);">
              <div style="font-size:1.25rem;">${e}</div>
              <div style="color:white; font-size:0.7rem; font-weight:700; margin-top:0.2rem;">${t}</div>
              <div style="color:rgba(255,255,255,0.8); font-size:0.65rem;">${s}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div style="padding:1.25rem 1rem; display:flex; flex-direction:column; gap:2rem;">

        <!-- Flash Sale Banner -->
        <div style="background:linear-gradient(135deg,#1a1a2e,#16213e); border-radius:1rem; padding:1.25rem; display:flex; align-items:center; justify-content:space-between; overflow:hidden; position:relative;">
          <div style="position:absolute; right:-1rem; top:-1rem; font-size:6rem; opacity:0.08;">⚡</div>
          <div>
            <div style="display:inline-flex; align-items:center; gap:0.375rem; background:#ff4444; color:white; padding:0.2rem 0.6rem; border-radius:9999px; font-size:0.7rem; font-weight:700; margin-bottom:0.5rem;">
              ⚡ FLASH SALE
            </div>
            <p style="color:white; font-size:1.1rem; font-weight:700;">Up to 60% OFF</p>
            <p style="color:rgba(255,255,255,0.7); font-size:0.8rem; margin-top:0.2rem;">On flights + hotels combo</p>
          </div>
          <div style="text-align:right;">
            <p style="color:rgba(255,255,255,0.6); font-size:0.7rem;">Ends in</p>
            <p id="countdown" style="color:#ffd700; font-size:1.25rem; font-weight:800; font-variant-numeric:tabular-nums;">--:--:--</p>
            <button style="margin-top:0.5rem; background:var(--primary); color:white; padding:0.4rem 1rem; border-radius:9999px; font-size:0.8rem; font-weight:700; border:none; cursor:pointer;">Grab Now</button>
          </div>
        </div>

        <!-- Flight Deals -->
        <div>
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.875rem;">
            <h2 style="font-size:1.1rem; font-weight:700;">✈️ Flight Deals</h2>
            <span style="font-size:0.75rem; color:var(--primary); font-weight:600;">${FLIGHT_DEALS.length} offers</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:0.75rem;">
            ${FLIGHT_DEALS.map(f => `
              <div class="deal-card" style="background:white; border:1px solid var(--border); border-radius:1rem; padding:1rem; display:flex; align-items:center; justify-content:space-between; gap:1rem; cursor:pointer; transition:all 0.2s; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                <div style="display:flex; align-items:center; gap:0.875rem; flex:1; min-width:0;">
                  <div style="width:2.5rem; height:2.5rem; background:rgba(216,64,64,0.08); border-radius:0.75rem; display:flex; align-items:center; justify-content:center; font-size:1.25rem; flex-shrink:0;">✈️</div>
                  <div style="min-width:0;">
                    <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                      <span style="font-weight:700; font-size:0.95rem;">${f.from}</span>
                      <span style="color:var(--primary); font-size:0.8rem;">→</span>
                      <span style="font-weight:700; font-size:0.95rem;">${f.to}</span>
                    </div>
                    <p style="font-size:0.72rem; color:var(--muted-foreground); margin-top:0.15rem;">${f.airline} · ${f.date}</p>
                    <p style="font-size:0.7rem; color:#e53e3e; margin-top:0.1rem; font-weight:600;">Only ${f.seats} seats left!</p>
                  </div>
                </div>
                <div style="text-align:right; flex-shrink:0;">
                  <div style="display:inline-block; background:rgba(216,64,64,0.1); color:var(--primary); padding:0.15rem 0.5rem; border-radius:9999px; font-size:0.7rem; font-weight:700; margin-bottom:0.25rem;">${f.discount} OFF</div>
                  <p style="font-size:1.1rem; font-weight:800; color:var(--primary);">${f.price}</p>
                  <p style="font-size:0.72rem; color:var(--muted-foreground); text-decoration:line-through;">${f.original}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Hotel Deals -->
        <div>
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.875rem;">
            <h2 style="font-size:1.1rem; font-weight:700;">🏨 Hotel Deals</h2>
            <span style="font-size:0.75rem; color:var(--primary); font-weight:600;">${HOTEL_DEALS.length} offers</span>
          </div>
          <div style="display:grid; grid-template-columns:repeat(2,1fr); gap:0.75rem;" id="hotelDealsGrid">
            ${HOTEL_DEALS.map(h => `
              <div class="deal-card" style="background:white; border:1px solid var(--border); border-radius:1rem; overflow:hidden; cursor:pointer; transition:all 0.2s; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                <div style="position:relative; height:7rem; background:var(--muted);">
                  <div class="shimmer-bg" style="position:absolute; inset:0; background:linear-gradient(90deg,var(--muted) 25%,#e8e8e8 50%,var(--muted) 75%); background-size:200% 100%; animation:shimmer 1.4s infinite;"></div>
                  <img data-query="${h.query}" alt="${h.name}" style="width:100%; height:100%; object-fit:cover; display:none; opacity:0; transition:opacity 0.4s;" />
                  <div style="position:absolute; inset:0; background:linear-gradient(to bottom,transparent 30%,rgba(0,0,0,0.5) 100%);"></div>
                  <div style="position:absolute; top:0.5rem; left:0.5rem; background:var(--primary); color:white; padding:0.15rem 0.5rem; border-radius:9999px; font-size:0.65rem; font-weight:700;">${h.discount} OFF</div>
                  <div style="position:absolute; bottom:0.5rem; right:0.5rem; background:rgba(255,255,255,0.95); border-radius:9999px; padding:0.15rem 0.4rem; font-size:0.65rem; font-weight:700; display:flex; align-items:center; gap:0.15rem;">
                    <span style="color:#f59e0b;">★</span>${h.rating}
                  </div>
                </div>
                <div style="padding:0.625rem;">
                  <p style="font-weight:700; font-size:0.85rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${h.name}</p>
                  <p style="font-size:0.7rem; color:var(--muted-foreground);">${h.location}</p>
                  <div style="display:flex; align-items:baseline; gap:0.375rem; margin-top:0.375rem;">
                    <span style="font-size:0.9rem; font-weight:800; color:var(--primary);">${h.price}</span>
                    <span style="font-size:0.65rem; color:var(--muted-foreground); text-decoration:line-through;">${h.original}</span>
                  </div>
                  <div style="display:flex; flex-wrap:wrap; gap:0.25rem; margin-top:0.375rem;">
                    ${h.amenities.map(a => `<span style="font-size:0.6rem; background:rgba(216,64,64,0.08); color:var(--primary); padding:0.1rem 0.35rem; border-radius:9999px; font-weight:600;">${a}</span>`).join('')}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Package Deals -->
        <div>
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.875rem;">
            <h2 style="font-size:1.1rem; font-weight:700;">📦 Holiday Packages</h2>
            <span style="font-size:0.75rem; color:var(--primary); font-weight:600;">${PACKAGE_DEALS.length} offers</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:0.875rem;" id="packageDealsGrid">
            ${PACKAGE_DEALS.map(p => `
              <div class="deal-card" style="background:white; border:1px solid var(--border); border-radius:1rem; overflow:hidden; cursor:pointer; transition:all 0.2s; box-shadow:0 2px 8px rgba(0,0,0,0.05); display:flex;">
                <div style="position:relative; width:7.5rem; flex-shrink:0; background:var(--muted);">
                  <div class="shimmer-bg" style="position:absolute; inset:0; background:linear-gradient(90deg,var(--muted) 25%,#e8e8e8 50%,var(--muted) 75%); background-size:200% 100%; animation:shimmer 1.4s infinite;"></div>
                  <img data-query="${p.query}" alt="${p.title}" style="width:100%; height:100%; object-fit:cover; display:none; opacity:0; transition:opacity 0.4s;" />
                </div>
                <div style="padding:0.875rem; flex:1; min-width:0;">
                  <div style="display:flex; align-items:start; justify-content:space-between; gap:0.5rem;">
                    <div style="min-width:0;">
                      <span style="font-size:0.7rem; font-weight:700; color:var(--primary);">${p.badge}</span>
                      <p style="font-weight:700; font-size:0.95rem; margin-top:0.15rem; line-height:1.3;">${p.title}</p>
                      <p style="font-size:0.72rem; color:var(--muted-foreground); margin-top:0.1rem;">🕐 ${p.duration}</p>
                    </div>
                    <div style="text-align:right; flex-shrink:0;">
                      <div style="background:rgba(216,64,64,0.1); color:var(--primary); padding:0.15rem 0.4rem; border-radius:9999px; font-size:0.65rem; font-weight:700;">${p.discount} OFF</div>
                      <p style="font-size:1rem; font-weight:800; color:var(--primary); margin-top:0.25rem;">${p.price}</p>
                      <p style="font-size:0.68rem; color:var(--muted-foreground); text-decoration:line-through;">${p.original}</p>
                    </div>
                  </div>
                  <div style="display:flex; flex-wrap:wrap; gap:0.3rem; margin-top:0.625rem;">
                    ${p.includes.map(inc => `<span style="font-size:0.65rem; background:var(--muted); color:var(--foreground); padding:0.15rem 0.45rem; border-radius:9999px; font-weight:500;">✓ ${inc}</span>`).join('')}
                  </div>
                  <button style="margin-top:0.625rem; width:100%; background:var(--primary); color:white; padding:0.45rem; border-radius:0.5rem; font-size:0.8rem; font-weight:700; border:none; cursor:pointer; transition:opacity 0.2s;">Book Now</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    </div>
    ${renderBottomNav('/deals')}
  `;

  document.getElementById('backBtn').addEventListener('click', () => router.navigate('/home'));

  // Hover effects on deal cards
  document.querySelectorAll('.deal-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-3px)';
      card.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
      card.style.borderColor = 'var(--primary)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
      card.style.borderColor = 'var(--border)';
    });
  });

  // Load Pexels images
  document.querySelectorAll('img[data-query]').forEach(async (img) => {
    const url = await fetchPexelsImage(img.dataset.query);
    if (url) {
      img.src = url;
      img.style.display = 'block';
      img.onload = () => {
        img.style.opacity = '1';
        const sk = img.previousElementSibling;
        if (sk?.classList.contains('shimmer-bg')) sk.style.display = 'none';
      };
    }
  });

  // Countdown timer
  startCountdown();
  attachNavListeners();
}

function startCountdown() {
  const end = new Date();
  end.setHours(23, 59, 59, 0);

  function tick() {
    const el = document.getElementById('countdown');
    if (!el) return;
    const diff = end - Date.now();
    if (diff <= 0) { el.textContent = '00:00:00'; return; }
    const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
    const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
    const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
    el.textContent = `${h}:${m}:${s}`;
    setTimeout(tick, 1000);
  }
  tick();
}
