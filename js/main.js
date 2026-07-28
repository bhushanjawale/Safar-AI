import { auth } from './auth.js';
import { router } from './router.js';
import { renderLogin } from './pages/login.js';
import { renderRegister } from './pages/register.js';
import { renderOnboarding } from './pages/onboarding.js';
import { renderHome } from './pages/home.js';
import { renderPlanner } from './pages/planner.js';
import { renderWishlist } from './pages/wishlist.js';
import { renderProfile } from './pages/profile.js';
import { renderFlights } from './pages/flights.js';
import { renderHotels } from './pages/hotels.js';
import { renderExplore } from './pages/explore.js';
import { renderDeals } from './pages/deals.js';
import { renderHelp } from './pages/help.js';
import { renderAssistant } from './pages/assistant.js';

router.register('/', async () => {
  // getUser() waits for onAuthStateChanged to fire before resolving
  const user = await auth.getUser();
  if (user) {
    router.navigate(user.isNewUser ? '/onboarding' : '/home', true);
  } else {
    router.navigate('/login', true);
  }
});

router.register('/login', renderLogin);
router.register('/register', renderRegister);
router.register('/onboarding', renderOnboarding);
router.register('/home', renderHome);
router.register('/planner', renderPlanner);
router.register('/flights', renderFlights);
router.register('/hotels', renderHotels);
router.register('/explore', renderExplore);
router.register('/deals', renderDeals);
router.register('/help', renderHelp);
router.register('/assistant', renderAssistant);
router.register('/wishlist', renderWishlist);
router.register('/profile', renderProfile);
router.register('/my-trips', () => {
  document.getElementById('app').innerHTML = '<div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding-bottom: 4rem;"><div style="text-align: center;"><h1 class="text-2xl font-bold">My Trips</h1><p class="mt-2" style="color: var(--muted-foreground);">Coming soon...</p></div></div>';
});
router.register('/itinerary/:id', (params) => {
  document.getElementById('app').innerHTML = `<div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding-bottom: 4rem;"><div style="text-align: center;"><h1 class="text-2xl font-bold">Itinerary: ${params.id}</h1><p class="mt-2" style="color: var(--muted-foreground);">Coming soon...</p></div></div>`;
});

router.handleRoute();
