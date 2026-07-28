import { auth } from '../auth.js';
import { router } from '../router.js';
import { getIcon } from '../icons.js';
import { renderBottomNav, attachNavListeners, fetchPexelsImage } from './shared.js';

const CATEGORIES = [
  { id: 'all',       label: 'All',        emoji: '🌍' },
  { id: 'beaches',   label: 'Beaches',    emoji: '🏖️' },
  { id: 'mountains', label: 'Mountains',  emoji: '🏔️' },
  { id: 'heritage',  label: 'Heritage',   emoji: '🏛️' },
  { id: 'nature',    label: 'Nature',     emoji: '🌿' },
  { id: 'spiritual', label: 'Spiritual',  emoji: '🕌' },
  { id: 'adventure', label: 'Adventure',  emoji: '🧗' },
  { id: 'hills',     label: 'Hill Stations', emoji: '⛰️' },
];

const ALL_DESTINATIONS = [
  { name: 'Goa',           state: 'Goa',              query: 'Goa beach India',              category: 'beaches',   rating: '4.6', budget: '₹8k–15k',  duration: '3–4 days' },
  { name: 'Andaman',       state: 'A&N Islands',      query: 'Andaman islands beach India',  category: 'beaches',   rating: '4.8', budget: '₹15k–25k', duration: '5–6 days' },
  { name: 'Varkala',       state: 'Kerala',           query: 'Varkala cliff beach Kerala',   category: 'beaches',   rating: '4.5', budget: '₹6k–12k',  duration: '2–3 days' },
  { name: 'Manali',        state: 'Himachal Pradesh', query: 'Manali snow mountains India',  category: 'mountains', rating: '4.5', budget: '₹7k–14k',  duration: '4–5 days' },
  { name: 'Spiti Valley',  state: 'Himachal Pradesh', query: 'Spiti valley mountains India', category: 'mountains', rating: '4.7', budget: '₹10k–18k', duration: '6–7 days' },
  { name: 'Kedarnath',     state: 'Uttarakhand',      query: 'Kedarnath temple mountains',   category: 'mountains', rating: '4.8', budget: '₹8k–14k',  duration: '3–4 days' },
  { name: 'Jaipur',        state: 'Rajasthan',        query: 'Jaipur palace India',          category: 'heritage',  rating: '4.5', budget: '₹5k–12k',  duration: '2–3 days' },
  { name: 'Agra',          state: 'Uttar Pradesh',    query: 'Taj Mahal Agra India',         category: 'heritage',  rating: '4.6', budget: '₹5k–10k',  duration: '1–2 days' },
  { name: 'Hampi',         state: 'Karnataka',        query: 'Hampi ruins Karnataka India',  category: 'heritage',  rating: '4.7', budget: '₹4k–9k',   duration: '2–3 days' },
  { name: 'Munnar',        state: 'Kerala',           query: 'Munnar tea hills Kerala',      category: 'nature',    rating: '4.7', budget: '₹6k–10k',  duration: '3–4 days' },
  { name: 'Coorg',         state: 'Karnataka',        query: 'Coorg coffee forest Karnataka',category: 'nature',    rating: '4.6', budget: '₹6k–12k',  duration: '2–3 days' },
  { name: 'Kaziranga',     state: 'Assam',            query: 'Kaziranga national park Assam',category: 'nature',    rating: '4.7', budget: '₹8k–14k',  duration: '2–3 days' },
  { name: 'Varanasi',      state: 'Uttar Pradesh',    query: 'Varanasi ghats India',         category: 'spiritual', rating: '4.4', budget: '₹4k–8k',   duration: '2–3 days' },
  { name: 'Rishikesh',     state: 'Uttarakhand',      query: 'Rishikesh river yoga India',   category: 'spiritual', rating: '4.5', budget: '₹4k–9k',   duration: '2–3 days' },
  { name: 'Tirupati',      state: 'Andhra Pradesh',   query: 'Tirupati temple India',        category: 'spiritual', rating: '4.6', budget: '₹3k–7k',   duration: '1–2 days' },
  { name: 'Rishikesh',     state: 'Uttarakhand',      query: 'Rishikesh rafting adventure',  category: 'adventure', rating: '4.5', budget: '₹5k–10k',  duration: '2–3 days' },
  { name: 'Bir Billing',   state: 'Himachal Pradesh', query: 'Bir Billing paragliding India',category: 'adventure', rating: '4.6', budget: '₹6k–11k',  duration: '2–3 days' },
  { name: 'Darjeeling',    state: 'West Bengal',      query: 'Darjeeling tea hills India',   category: 'hills',     rating: '4.5', budget: '₹5k–11k',  duration: '3–4 days' },
  { name: 'Ooty',          state: 'Tamil Nadu',       query: 'Ooty hills Tamil Nadu India',  category: 'hills',     rating: '4.4', budget: '₹5k–10k',  duration: '2–3 days' },
  { name: 'Mussoorie',     state: 'Uttarakhand',      query: 'Mussoorie hill station India', category: 'hills',     rating: '4.4', budget: '₹5k–10k',  duration: '2–3 days' },
];

let activeCategory = 'all';

export function renderExplore() {
  document.getElementById('app').innerHTML = `
    <div style="min-height:100vh; background:var(--background); padding-bottom:5rem;">

      <!-- Header -->
      <div style="background:var(--primary); padding:1.25rem 1rem 1.5rem;">
        <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1rem;">
          <button id="backBtn" style="width:2rem; height:2rem; background:rgba(255,255,255,0.2); border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; flex-shrink:0;">
            ${getIcon('chevronLeft')}
          </button>
          <h1 style="color:white; font-size:1.25rem; font-weight:700;">Explore India</h1>
        </div>
        <!-- Search bar -->
        <div style="position:relative;">
          <span style="position:absolute; left:0.875rem; top:50%; transform:translateY(-50%); color:var(--muted-foreground);">${getIcon('search')}</span>
          <input id="exploreSearch" type="text" placeholder="Search destinations..." style="padding-left:2.5rem; height:2.75rem; border-radius:0.75rem; border:none; font-size:0.9rem; background:white; width:100%;" />
        </div>
      </div>

      <!-- Category chips -->
      <div style="display:flex; gap:0.5rem; padding:1rem; overflow-x:auto;" class="scrollbar-hide" id="categoryBar">
        ${CATEGORIES.map(c => `
          <button class="cat-chip" data-id="${c.id}" style="
            flex-shrink:0; display:flex; align-items:center; gap:0.375rem;
            padding:0.4rem 0.875rem; border-radius:9999px; font-size:0.8rem; font-weight:600;
            border:1.5px solid ${c.id === activeCategory ? 'var(--primary)' : 'var(--border)'};
            background:${c.id === activeCategory ? 'var(--primary)' : 'white'};
            color:${c.id === activeCategory ? 'white' : 'var(--foreground)'};
            transition:all 0.2s; cursor:pointer; white-space:nowrap;
          ">${c.emoji} ${c.label}</button>
        `).join('')}
      </div>

      <!-- Grid -->
      <div id="exploreGrid" style="display:grid; grid-template-columns:repeat(2,1fr); gap:0.875rem; padding:0 1rem;"></div>
    </div>
    ${renderBottomNav('/explore')}
  `;

  document.getElementById('backBtn').addEventListener('click', () => router.navigate('/home'));
  document.getElementById('exploreSearch').addEventListener('input', (e) => renderGrid(e.target.value.trim()));
  document.querySelectorAll('.cat-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.id;
      document.querySelectorAll('.cat-chip').forEach(b => {
        const active = b.dataset.id === activeCategory;
        b.style.background = active ? 'var(--primary)' : 'white';
        b.style.color = active ? 'white' : 'var(--foreground)';
        b.style.borderColor = active ? 'var(--primary)' : 'var(--border)';
      });
      renderGrid(document.getElementById('exploreSearch').value.trim());
    });
  });

  renderGrid('');
  attachNavListeners();
}

function renderGrid(search) {
  const filtered = ALL_DESTINATIONS.filter(d => {
    const matchCat = activeCategory === 'all' || d.category === activeCategory;
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.state.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const grid = document.getElementById('exploreGrid');
  if (!grid) return;

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:3rem 1rem; color:var(--muted-foreground);">No destinations found</div>`;
    return;
  }

  grid.innerHTML = filtered.map((d, i) => `
    <div class="explore-card" data-name="${d.name}" style="
      border-radius:1rem; overflow:hidden; cursor:pointer;
      background:var(--card); border:1px solid var(--border);
      box-shadow:0 2px 8px rgba(0,0,0,0.06);
      transition:all 0.3s cubic-bezier(0.4,0,0.2,1);
    ">
      <div style="position:relative; height:9rem; background:var(--muted); overflow:hidden;">
        <div class="shimmer-bg" style="position:absolute; inset:0; background:linear-gradient(90deg,var(--muted) 25%,#e8e8e8 50%,var(--muted) 75%); background-size:200% 100%; animation:shimmer 1.4s infinite;"></div>
        <img data-query="${d.query}" alt="${d.name}" style="width:100%; height:100%; object-fit:cover; display:none; opacity:0; transition:opacity 0.4s;" />
        <div style="position:absolute; inset:0; background:linear-gradient(to bottom,transparent 40%,rgba(0,0,0,0.65) 100%);"></div>
        <div style="position:absolute; bottom:0.6rem; left:0.75rem; right:0.75rem;">
          <p style="color:white; font-weight:700; font-size:0.95rem; text-shadow:0 1px 4px rgba(0,0,0,0.5);">${d.name}</p>
          <p style="color:rgba(255,255,255,0.85); font-size:0.68rem;">${d.state}</p>
        </div>
        <div style="position:absolute; top:0.6rem; right:0.6rem; background:rgba(255,255,255,0.95); border-radius:9999px; padding:0.2rem 0.5rem; display:flex; align-items:center; gap:0.2rem; font-size:0.7rem; font-weight:700;">
          <span style="color:#f59e0b;">★</span><span>${d.rating}</span>
        </div>
      </div>
      <div style="padding:0.625rem 0.75rem; display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:0.75rem; font-weight:700; color:var(--primary);">${d.budget}</span>
        <span style="font-size:0.68rem; color:var(--muted-foreground);">🕐 ${d.duration}</span>
      </div>
    </div>
  `).join('');

  // Load Pexels images
  grid.querySelectorAll('img[data-query]').forEach(async (img) => {
    const url = await fetchPexelsImage(img.dataset.query);
    if (url) {
      img.src = url;
      img.style.display = 'block';
      img.onload = () => {
        img.style.opacity = '1';
        const sk = img.previousElementSibling;
        if (sk) sk.style.display = 'none';
      };
    }
  });

  // Card interactions
  grid.querySelectorAll('.explore-card').forEach(card => {
    card.addEventListener('click', () => {
      const user = auth.getUserData();
      router.navigate('/planner');
      setTimeout(() => {
        const src = document.getElementById('source');
        const dst = document.getElementById('destination');
        if (src && user?.preferences?.location) src.value = user.preferences.location;
        if (dst) dst.value = card.dataset.name;
      }, 100);
    });
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-5px)';
      card.style.boxShadow = '0 14px 28px rgba(0,0,0,0.12)';
      card.style.borderColor = 'var(--primary)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
      card.style.borderColor = 'var(--border)';
    });
  });
}
