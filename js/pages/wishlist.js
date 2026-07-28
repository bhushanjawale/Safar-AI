import { auth } from '../auth.js';
import { router } from '../router.js';
import { destinations } from '../data.js';
import { getIcon } from '../icons.js';

export function renderWishlist() {
  auth.loadWishlist();
  const wishlist = auth.wishlist;
  const wishlisted = destinations.filter(d => wishlist.includes(d.id));

  document.getElementById('app').innerHTML = `
    <div style="min-height: 100vh; background: var(--background); padding-bottom: 4rem;">
      <div class="px-4 pt-5 pb-3">
        <h1 class="text-2xl font-bold">My Wishlist</h1>
        <p class="text-sm mt-1" style="color: var(--muted-foreground);">${wishlisted.length} destinations saved</p>
      </div>

      <div class="px-4">
        ${wishlisted.length === 0 ? `
          <div style="text-align: center; padding: 4rem 2rem;">
            <p style="font-size: 3rem;">❤️</p>
            <p class="font-bold mt-3">No destinations yet</p>
            <p class="text-sm mt-1" style="color: var(--muted-foreground);">Start adding places you love!</p>
            <button class="btn btn-primary mt-4" id="exploreBtn">Explore Destinations</button>
          </div>
        ` : `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">
            ${wishlisted.map(d => renderDestCard(d)).join('')}
          </div>
        `}
      </div>
    </div>
    ${renderBottomNav()}
  `;

  const exploreBtn = document.getElementById('exploreBtn');
  if (exploreBtn) {
    exploreBtn.addEventListener('click', () => router.navigate('/home'));
  }

  attachListeners();
}

function renderDestCard(dest) {
  return `
    <div class="dest-card" data-id="${dest.id}">
      <div style="position: relative; height: 11rem; overflow: hidden; border-radius: 1rem 1rem 0 0;">
        <img src="${dest.image}" alt="${dest.name}" style="width: 100%; height: 100%; object-fit: cover;">
        <button class="wishlist-btn" data-id="${dest.id}" style="position: absolute; top: 0.75rem; right: 0.75rem; padding: 0.5rem; border-radius: 9999px; background: rgba(255,255,255,0.8);">
          ${getIcon('heartFilled').replace('currentColor', 'var(--primary)')}
        </button>
      </div>
      <div class="p-3">
        <h3 class="font-bold">${dest.name}</h3>
        <p class="text-xs" style="color: var(--muted-foreground);">${dest.state}</p>
        <p class="text-sm font-bold mt-2" style="color: var(--primary);">${dest.budget}</p>
      </div>
    </div>
  `;
}

function renderBottomNav() {
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
          <a href="${item.path}" class="nav-item ${router.getCurrentPath() === item.path ? 'active' : ''}" data-path="${item.path}">
            ${getIcon(item.icon)}
            <span>${item.label}</span>
          </a>
        `).join('')}
      </div>
    </nav>
  `;
}

function attachListeners() {
  document.querySelectorAll('.dest-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.wishlist-btn')) {
        router.navigate(`/itinerary/${card.dataset.id}`);
      }
    });
  });

  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      auth.toggleWishlist(btn.dataset.id);
      renderWishlist();
    });
  });

  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      router.navigate(item.dataset.path);
    });
  });
}
