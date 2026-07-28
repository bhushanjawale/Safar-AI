import { router } from '../router.js';
import { getIcon } from '../icons.js';

const PEXELS_KEY = 'HQfjJI4ycqsW1GmKR94RoJcEqickgMz8jUZw1N4vQD4s4qgswFzesvuw';
const pexelsCache = {};

export async function fetchPexelsImage(query) {
  if (pexelsCache[query]) return pexelsCache[query];
  try {
    const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`, {
      headers: { Authorization: PEXELS_KEY }
    });
    const data = await res.json();
    const url = data.photos?.[0]?.src?.large || null;
    pexelsCache[query] = url;
    return url;
  } catch { return null; }
}

export function renderBottomNav(activePath) {
  const currentPath = activePath || router.getCurrentPath();
  const navItems = [
    { path: '/home',      icon: 'home',        label: 'Home' },
    { path: '/planner',   icon: 'search',      label: 'Plan' },
    { path: '/assistant', icon: 'bot',         label: 'AI Chat' },
    { path: '/help',      icon: 'helpCircle',  label: 'Help' },
    { path: '/profile',   icon: 'user',        label: 'Profile' },
  ];
  return `
    <nav class="bottom-nav">
      <div class="bottom-nav-items">
        ${navItems.map(item => `
          <a href="${item.path}" class="nav-item ${currentPath === item.path ? 'active' : ''}" data-path="${item.path}">
            ${getIcon(item.icon)}
            <span>${item.label}</span>
          </a>
        `).join('')}
      </div>
    </nav>
  `;
}

export function attachNavListeners() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      router.navigate(item.dataset.path);
    });
  });
}
