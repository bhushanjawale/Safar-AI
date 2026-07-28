import { auth } from '../auth.js';
import { router } from '../router.js';
import { getIcon } from '../icons.js';
import { renderBottomNav, attachNavListeners, fetchPexelsImage } from './shared.js';

const POPULAR_DESTINATIONS = [
  { name: 'Goa',        state: 'Goa',               query: 'Goa beach India',           tags: ['Beaches', 'Nightlife'],        rating: '4.6', budget: '₹8k–15k' },
  { name: 'Jaipur',     state: 'Rajasthan',          query: 'Jaipur palace India',        tags: ['Heritage', 'Culture'],         rating: '4.5', budget: '₹5k–12k' },
  { name: 'Manali',     state: 'Himachal Pradesh',   query: 'Manali mountains snow India', tags: ['Adventure', 'Snow'],           rating: '4.5', budget: '₹7k–14k' },
  { name: 'Varanasi',   state: 'Uttar Pradesh',      query: 'Varanasi ghats India',       tags: ['Spiritual', 'Culture'],        rating: '4.4', budget: '₹4k–8k' },
  { name: 'Udaipur',    state: 'Rajasthan',          query: 'Udaipur lake palace India',  tags: ['Romantic', 'Heritage'],        rating: '4.7', budget: '₹6k–13k' },
  { name: 'Munnar',     state: 'Kerala',             query: 'Munnar tea hills Kerala',    tags: ['Nature', 'Scenic'],            rating: '4.7', budget: '₹6k–10k' },
  { name: 'Rishikesh',  state: 'Uttarakhand',        query: 'Rishikesh river India',      tags: ['Adventure', 'Spiritual'],      rating: '4.5', budget: '₹4k–9k' },
  { name: 'Agra',       state: 'Uttar Pradesh',      query: 'Taj Mahal Agra India',       tags: ['Heritage', 'History'],         rating: '4.6', budget: '₹5k–10k' },
  { name: 'Darjeeling', state: 'West Bengal',        query: 'Darjeeling tea garden India',tags: ['Scenic', 'Hills'],             rating: '4.5', budget: '₹5k–11k' },
  { name: 'Coorg',      state: 'Karnataka',          query: 'Coorg coffee plantation',    tags: ['Nature', 'Offbeat'],           rating: '4.6', budget: '₹6k–12k' },
];

export function renderHome() {
  const user = auth.getUserData();
  
  auth.loadWishlist();
  
  document.getElementById('app').innerHTML = `
    <div style="min-height: 100vh; background: var(--background); padding-bottom: 4rem;">
      <div class="home-header">
        <div>
          <p class="text-sm" style="color: var(--muted-foreground);">Hey, ${user?.name || 'Traveller'} 👋</p>
          <h1 class="text-2xl font-bold" style="background: linear-gradient(135deg, var(--primary), var(--accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Where to next?</h1>
        </div>
        <div class="flex items-center gap-3">
          <div class="location-badge">
            ${getIcon('mapPin')} ${user?.preferences?.location || 'Mumbai'}
          </div>
          <button class="icon-btn">
            ${getIcon('bell')}
          </button>
        </div>
      </div>

      <div id="heroBanner" style="position:relative; width:100%; height:18rem; overflow:hidden; cursor:pointer; margin-bottom:1.25rem;">
        <canvas id="sunsetCanvas" style="position:absolute;inset:0;width:100%;height:100%;"></canvas>
        <div id="heroParallax" style="position:absolute;inset:0;pointer-events:none;">
          <div id="heroLayer1" style="position:absolute;inset:0;background:radial-gradient(ellipse 60% 40% at 50% 62%,rgba(255,160,50,0.55) 0%,transparent 70%);transition:transform 0.1s ease-out;"></div>
          <div id="heroLayer2" style="position:absolute;inset:0;background:radial-gradient(ellipse 30% 20% at 50% 62%,rgba(255,220,80,0.35) 0%,transparent 60%);transition:transform 0.08s ease-out;"></div>
        </div>
        <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0.5rem;">
          <p style="font-size:0.85rem;color:rgba(255,220,180,0.9);letter-spacing:0.15em;text-transform:uppercase;font-weight:600;text-shadow:0 1px 8px rgba(0,0,0,0.6);">AI-Powered Travel</p>
          <h2 style="font-size:2rem;font-weight:900;color:#fff;text-shadow:0 2px 20px rgba(0,0,0,0.5),0 0 40px rgba(255,120,50,0.4);letter-spacing:-0.02em;margin:0;">Plan Your Journey</h2>
          <p style="font-size:0.8rem;color:rgba(255,200,150,0.85);text-shadow:0 1px 6px rgba(0,0,0,0.5);">Personalised itineraries in seconds</p>
          <button id="heroCtaBtn" style="margin-top:0.5rem;padding:0.55rem 1.5rem;background:rgba(255,255,255,0.15);border:1.5px solid rgba(255,255,255,0.5);border-radius:9999px;color:#fff;font-weight:700;font-size:0.85rem;backdrop-filter:blur(8px);cursor:pointer;transition:all 0.25s;letter-spacing:0.03em;">Start Planning →</button>
        </div>
      </div>

      <div class="px-4 mb-4">
        <div class="quick-actions">
          <div class="quick-action" data-action="flights">
            <div class="quick-icon">✈️</div>
            <span>Flights</span>
          </div>
          <div class="quick-action" data-action="hotels">
            <div class="quick-icon">🏨</div>
            <span>Hotels</span>
          </div>
          <div class="quick-action" data-action="explore">
            <div class="quick-icon">🗺️</div>
            <span>Explore</span>
          </div>
          <div class="quick-action" data-action="deals">
            <div class="quick-icon">🎁</div>
            <span>Deals</span>
          </div>
        </div>
      </div>

      <!-- Popular Destinations -->
      <div class="section-wrapper" style="margin-top: 0.5rem;">
        <div class="section-header">
          <div>
            <h3 class="section-title">🇮🇳 Popular in India</h3>
            <p class="section-subtitle">Top destinations to explore</p>
          </div>
        </div>
        <div id="popularGrid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.875rem; padding: 0 1rem;">
          ${POPULAR_DESTINATIONS.map((d, i) => renderPopularCardSkeleton(d, i)).join('')}
        </div>
      </div>
    </div>
    ${renderBottomNav()}
  `;

  initSunsetBanner();
  document.getElementById('heroCtaBtn').addEventListener('click', (e) => { e.stopPropagation(); router.navigate('/planner'); });
  document.getElementById('heroBanner').addEventListener('click', () => router.navigate('/planner'));
  document.querySelectorAll('.quick-action').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action === 'flights') router.navigate('/flights');
      else if (action === 'hotels') router.navigate('/hotels');
      else if (action === 'explore') router.navigate('/explore');
      else if (action === 'deals') router.navigate('/deals');
    });
  });
  loadPopularDestinations();
  attachNavListeners();
}

function renderPopularCardSkeleton(dest, index) {
  return `
    <div class="popular-dest-card animate-fade-in-delay stagger-${(index % 8) + 1}" data-name="${dest.name}" style="
      border-radius: 1rem; overflow: hidden; cursor: pointer;
      background: var(--card); border: 1px solid var(--border);
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
    ">
      <div class="popular-img-wrap" style="position: relative; height: 9rem; background: var(--muted); overflow: hidden;">
        <div class="popular-img-skeleton" style="position: absolute; inset: 0; background: linear-gradient(90deg, var(--muted) 25%, #e8e8e8 50%, var(--muted) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite;"></div>
        <img data-query="${dest.query}" data-dest="${dest.name}" alt="${dest.name}" style="width:100%; height:100%; object-fit:cover; display:none; transition: opacity 0.4s;" />
        <div style="position:absolute; inset:0; background: linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.65) 100%);"></div>
        <div style="position:absolute; bottom:0.6rem; left:0.75rem; right:0.75rem;">
          <p style="color:white; font-weight:700; font-size:1rem; line-height:1.2; text-shadow:0 1px 4px rgba(0,0,0,0.5);">${dest.name}</p>
          <p style="color:rgba(255,255,255,0.85); font-size:0.7rem; margin-top:0.1rem;">${dest.state}</p>
        </div>
        <div style="position:absolute; top:0.6rem; right:0.6rem; background:rgba(255,255,255,0.95); border-radius:9999px; padding:0.2rem 0.5rem; display:flex; align-items:center; gap:0.2rem; font-size:0.7rem; font-weight:700;">
          <span style="color:#f59e0b;">★</span><span>${dest.rating}</span>
        </div>
      </div>
      <div style="padding: 0.625rem 0.75rem;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.75rem; font-weight:700; color:var(--primary);">${dest.budget}</span>
          <div style="display:flex; gap:0.3rem;">
            ${dest.tags.slice(0,2).map(t => `<span style="font-size:0.65rem; background:rgba(216,64,64,0.08); color:var(--primary); padding:0.15rem 0.4rem; border-radius:9999px; font-weight:600;">${t}</span>`).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

async function loadPopularDestinations() {
  const cards = document.querySelectorAll('.popular-dest-card img[data-query]');
  await Promise.all([...cards].map(async (img) => {
    const url = await fetchPexelsImage(img.dataset.query);
    if (url) {
      img.src = url;
      img.style.display = 'block';
      img.onload = () => {
        img.style.opacity = '1';
        const skeleton = img.previousElementSibling;
        if (skeleton) skeleton.style.display = 'none';
      };
    }
  }));

  document.querySelectorAll('.popular-dest-card').forEach(card => {
    card.addEventListener('click', () => {
      const name = card.dataset.name;
      const user = auth.getUserData();
      router.navigate('/planner');
      setTimeout(() => {
        const src = document.getElementById('source');
        const dst = document.getElementById('destination');
        if (src && user?.preferences?.location) src.value = user.preferences.location;
        if (dst) dst.value = name;
      }, 100);
    });
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-6px) scale(1.02)';
      card.style.boxShadow = '0 16px 32px rgba(0,0,0,0.14)';
      card.style.borderColor = 'var(--primary)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
      card.style.borderColor = 'var(--border)';
    });
  });
}

function initSunsetBanner() {
  const canvas = document.getElementById('sunsetCanvas');
  const banner = document.getElementById('heroBanner');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Particles (fireflies / dust)
  const particles = Array.from({ length: 55 }, () => ({
    x: Math.random(), y: Math.random(),
    r: Math.random() * 1.8 + 0.4,
    speed: Math.random() * 0.00015 + 0.00005,
    drift: (Math.random() - 0.5) * 0.0002,
    alpha: Math.random() * 0.6 + 0.2,
    phase: Math.random() * Math.PI * 2,
  }));

  // Mouse parallax state
  let mx = 0.5, my = 0.5, tmx = 0.5, tmy = 0.5;
  banner.addEventListener('mousemove', e => {
    const r = banner.getBoundingClientRect();
    tmx = (e.clientX - r.left) / r.width;
    tmy = (e.clientY - r.top) / r.height;
  });
  banner.addEventListener('mouseleave', () => { tmx = 0.5; tmy = 0.5; });

  // CTA hover
  const cta = document.getElementById('heroCtaBtn');
  if (cta) {
    cta.addEventListener('mouseenter', () => { cta.style.background = 'rgba(255,255,255,0.28)'; cta.style.transform = 'scale(1.05)'; });
    cta.addEventListener('mouseleave', () => { cta.style.background = 'rgba(255,255,255,0.15)'; cta.style.transform = ''; });
  }

  let raf;
  function draw(ts) {
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }

    // Smooth parallax
    mx += (tmx - mx) * 0.06;
    my += (tmy - my) * 0.06;
    const px = (mx - 0.5) * 18, py = (my - 0.5) * 10;

    // Sky gradient — deep indigo → crimson → amber → warm orange
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0,    '#0d0d2b');
    sky.addColorStop(0.28, '#1a0a3d');
    sky.addColorStop(0.52, '#7b1e1e');
    sky.addColorStop(0.72, '#c0392b');
    sky.addColorStop(0.88, '#e8622a');
    sky.addColorStop(1,    '#f0a050');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    const horizon = H * 0.62;

    // Sun glow halo (large soft)
    const sunX = W * 0.5 + px * 0.3, sunY = horizon + py * 0.2;
    const halo = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, W * 0.38);
    halo.addColorStop(0,   'rgba(255,200,60,0.38)');
    halo.addColorStop(0.4, 'rgba(255,100,30,0.18)');
    halo.addColorStop(1,   'rgba(255,60,0,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, W, H);

    // Sun disc
    const sunR = W * 0.065;
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR);
    sunGrad.addColorStop(0,   '#fff9c4');
    sunGrad.addColorStop(0.3, '#ffd700');
    sunGrad.addColorStop(0.7, '#ff8c00');
    sunGrad.addColorStop(1,   'rgba(255,80,0,0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
    ctx.fill();

    // Horizon shimmer line
    const shimmer = ctx.createLinearGradient(0, 0, W, 0);
    shimmer.addColorStop(0,   'rgba(255,120,30,0)');
    shimmer.addColorStop(0.5, 'rgba(255,180,60,0.55)');
    shimmer.addColorStop(1,   'rgba(255,120,30,0)');
    ctx.fillStyle = shimmer;
    ctx.fillRect(0, horizon - 2, W, 5);

    // Water reflection (lower half)
    const water = ctx.createLinearGradient(0, horizon, 0, H);
    water.addColorStop(0,   'rgba(200,80,20,0.55)');
    water.addColorStop(0.4, 'rgba(120,40,10,0.35)');
    water.addColorStop(1,   'rgba(20,10,5,0.9)');
    ctx.fillStyle = water;
    ctx.fillRect(0, horizon, W, H - horizon);

    // Sun reflection on water
    const refX = sunX, refY = horizon + (H - horizon) * 0.18;
    const ref = ctx.createRadialGradient(refX, refY, 0, refX, refY, W * 0.12);
    ref.addColorStop(0,   'rgba(255,200,60,0.45)');
    ref.addColorStop(0.5, 'rgba(255,100,20,0.2)');
    ref.addColorStop(1,   'rgba(255,60,0,0)');
    ctx.fillStyle = ref;
    ctx.fillRect(0, horizon, W, H - horizon);

    // Ripple lines on water
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = '#ffcc66';
    ctx.lineWidth = 1;
    for (let i = 0; i < 7; i++) {
      const ry = horizon + (H - horizon) * (0.08 + i * 0.13);
      const rw = (W * 0.06) * (1 + i * 0.5);
      ctx.beginPath();
      ctx.ellipse(sunX, ry, rw, 2 + i * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // Mountain silhouettes (parallax layers)
    // Far mountains
    ctx.save();
    ctx.translate(px * 0.15, py * 0.08);
    ctx.fillStyle = 'rgba(60,15,15,0.72)';
    ctx.beginPath();
    ctx.moveTo(0, horizon + 2);
    ctx.bezierCurveTo(W*0.05, horizon-H*0.12, W*0.15, horizon-H*0.18, W*0.25, horizon-H*0.06);
    ctx.bezierCurveTo(W*0.35, horizon-H*0.14, W*0.45, horizon-H*0.22, W*0.55, horizon-H*0.08);
    ctx.bezierCurveTo(W*0.65, horizon-H*0.16, W*0.75, horizon-H*0.2,  W*0.85, horizon-H*0.07);
    ctx.bezierCurveTo(W*0.92, horizon-H*0.13, W*0.97, horizon-H*0.05, W, horizon+2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Near mountains
    ctx.save();
    ctx.translate(px * 0.3, py * 0.15);
    ctx.fillStyle = 'rgba(25,8,8,0.88)';
    ctx.beginPath();
    ctx.moveTo(0, horizon + 2);
    ctx.bezierCurveTo(W*0.08, horizon-H*0.07, W*0.18, horizon-H*0.13, W*0.3, horizon-H*0.04);
    ctx.bezierCurveTo(W*0.4,  horizon-H*0.1,  W*0.5,  horizon-H*0.16, W*0.62, horizon-H*0.05);
    ctx.bezierCurveTo(W*0.72, horizon-H*0.11, W*0.82, horizon-H*0.14, W*0.95, horizon-H*0.04);
    ctx.lineTo(W, horizon + 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Stars (upper sky)
    ctx.save();
    ctx.translate(px * 0.05, py * 0.05);
    for (const p of particles) {
      if (p.y > 0.45) continue; // only in sky
      const flicker = 0.5 + 0.5 * Math.sin(ts * 0.001 * (p.speed * 8000) + p.phase);
      ctx.globalAlpha = p.alpha * flicker * (1 - p.y / 0.45);
      ctx.fillStyle = '#fff8e0';
      ctx.beginPath();
      ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Firefly particles (lower sky / horizon)
    ctx.save();
    for (const p of particles) {
      if (p.y <= 0.45) continue;
      p.x += p.drift;
      p.y -= p.speed;
      if (p.y < 0.3) { p.y = 0.95; p.x = Math.random(); }
      if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0;
      const flicker = 0.4 + 0.6 * Math.sin(ts * 0.002 + p.phase);
      ctx.globalAlpha = p.alpha * flicker * 0.7;
      ctx.fillStyle = '#ffdd88';
      ctx.shadowColor = '#ffaa00';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x * W, p.y * H, p.r * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.restore();

    // Parallax overlay layers (CSS divs)
    const l1 = document.getElementById('heroLayer1');
    const l2 = document.getElementById('heroLayer2');
    if (l1) l1.style.transform = `translate(${px * 0.4}px,${py * 0.3}px)`;
    if (l2) l2.style.transform = `translate(${px * 0.7}px,${py * 0.5}px)`;

    raf = requestAnimationFrame(draw);
  }

  raf = requestAnimationFrame(draw);

  // Cleanup when navigating away
  const obs = new MutationObserver(() => {
    if (!document.getElementById('sunsetCanvas')) { cancelAnimationFrame(raf); obs.disconnect(); }
  });
  obs.observe(document.getElementById('app'), { childList: true });
}
