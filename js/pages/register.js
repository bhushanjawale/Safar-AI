import { auth } from '../auth.js';
import { router } from '../router.js';
import { getIcon } from '../icons.js';

export function renderRegister() {
  document.getElementById('app').innerHTML = `
    <div style="min-height: 100vh; display: flex; background: white;">

      <!-- Red brand panel (hidden on mobile) -->
      <div style="display: none; flex-direction: column; align-items: center; justify-content: center; width: 45%; background: linear-gradient(160deg, var(--primary) 0%, var(--primary-dark) 100%); padding: 3rem; position: relative; overflow: hidden;" class="auth-brand-panel">
        <div style="position: absolute; inset: 0; background: url('data:image/svg+xml,<svg width=\'80\' height=\'80\' xmlns=\'http://www.w3.org/2000/svg\'><circle cx=\'40\' cy=\'40\' r=\'3\' fill=\'white\' opacity=\'0.08\'/></svg>');">
        </div>
        <div style="position: relative; text-align: center; color: white;">
          <div style="width: 5rem; height: 5rem; background: rgba(255,255,255,0.15); border-radius: 1.5rem; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.2);">
            <span style="font-size: 2.5rem;">✈️</span>
          </div>
          <h1 style="font-size: 2.5rem; font-weight: 800; margin-bottom: 0.75rem; letter-spacing: -0.5px;">Safar AI</h1>
          <p style="font-size: 1.1rem; opacity: 0.85; line-height: 1.6; max-width: 280px;">Join thousands of travellers planning smarter trips with AI</p>
          <div style="margin-top: 2.5rem; display: flex; flex-direction: column; gap: 1rem; text-align: left;">
            ${['🗺️ AI-powered itineraries', '🏨 Smart hotel picks', '✈️ Flight recommendations', '💡 Personalized for you'].map(f => `<div style="display: flex; align-items: center; gap: 0.75rem; font-size: 0.95rem; opacity: 0.9;">${f}</div>`).join('')}
          </div>
        </div>
      </div>

      <!-- White form panel -->
      <div style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem; background: #fff; overflow-y: auto;">
        <div style="width: 100%; max-width: 400px;">

          <!-- Mobile logo -->
          <div style="text-align: center; margin-bottom: 2rem;" class="auth-mobile-logo">
            <div style="width: 3.5rem; height: 3.5rem; background: var(--primary); border-radius: 1rem; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 0.75rem; box-shadow: 0 8px 20px rgba(216,64,64,0.35); animation: pulse 2s ease-in-out infinite;">
              <span style="font-size: 1.75rem;">✈️</span>
            </div>
            <h1 style="font-size: 1.75rem; font-weight: 800; color: var(--primary);">Safar AI</h1>
          </div>

          <div style="margin-bottom: 2rem;">
            <h2 style="font-size: 1.75rem; font-weight: 700; color: var(--foreground); margin-bottom: 0.375rem;">Create Account</h2>
            <p style="font-size: 0.9rem; color: var(--muted-foreground);">Start planning your adventures</p>
          </div>

          <form id="registerForm" style="display: flex; flex-direction: column; gap: 1rem;" novalidate>
            <div id="errorMsg" class="hidden" style="font-size: 0.875rem; color: var(--destructive); background: rgba(216,64,64,0.08); padding: 0.75rem; border-radius: 0.5rem; border: 1px solid rgba(216,64,64,0.2);"></div>

            <div style="display: flex; flex-direction: column; gap: 0.4rem;">
              <label class="text-sm font-semibold">Full Name</label>
              <input type="text" id="name" placeholder="Your full name" style="height: 3rem; border-radius: var(--radius);" required>
            </div>

            <div style="display: flex; flex-direction: column; gap: 0.4rem;">
              <label class="text-sm font-semibold">Email Address</label>
              <input type="email" id="email" placeholder="you@example.com" style="height: 3rem; border-radius: var(--radius);" required>
            </div>

            <div style="display: flex; flex-direction: column; gap: 0.4rem;">
              <label class="text-sm font-semibold">Create Password</label>
              <div style="position: relative;">
                <input type="password" id="password" placeholder="Min. 8 characters" style="height: 3rem; border-radius: var(--radius); padding-right: 2.5rem;" required>
                <button type="button" id="togglePw" style="position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--muted-foreground);">
                  ${getIcon('eye')}
                </button>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 0.4rem;">
              <label class="text-sm font-semibold">Confirm Password</label>
              <div style="position: relative;">
                <input type="password" id="confirmPassword" placeholder="Re-enter your password" style="height: 3rem; border-radius: var(--radius); padding-right: 2.5rem;" required>
                <button type="button" id="toggleConfirmPw" style="position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--muted-foreground);">
                  ${getIcon('eye')}
                </button>
              </div>
            </div>

            <button type="submit" class="btn btn-primary w-full" id="submitBtn" style="height: 3rem; margin-top: 0.25rem; border-radius: var(--radius); font-size: 1rem; font-weight: 700; letter-spacing: 0.3px;">
              Create free account
            </button>
          </form>

          <div style="display: flex; align-items: center; gap: 1rem; margin: 1.25rem 0;">
            <div style="flex: 1; height: 1px; background: var(--border);"></div>
            <span class="text-xs" style="color: var(--muted-foreground);">OR</span>
            <div style="flex: 1; height: 1px; background: var(--border);"></div>
          </div>

          <button id="googleSignupBtn" class="btn" style="width: 100%; height: 3rem; border: 1.5px solid var(--border); background: white; color: var(--foreground); display: flex; align-items: center; justify-content: center; gap: 0.75rem; border-radius: var(--radius); font-weight: 600;">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p style="text-align: center; font-size: 0.875rem; color: var(--muted-foreground); margin-top: 1.5rem;">
            Already have an account?
            <a href="/login" class="font-semibold" style="color: var(--primary); text-decoration: none;" id="loginLink">Sign In</a>
          </p>
        </div>
      </div>
    </div>
  `;

  const form            = document.getElementById('registerForm');
  const errorMsg        = document.getElementById('errorMsg');
  const submitBtn       = document.getElementById('submitBtn');
  const passwordInput   = document.getElementById('password');
  const confirmPwInput  = document.getElementById('confirmPassword');

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.remove('hidden');
  }

  function hideError() {
    errorMsg.classList.add('hidden');
  }

  function toggleVisibility(inputEl, btnEl) {
    const isPassword = inputEl.type === 'password';
    inputEl.type     = isPassword ? 'text' : 'password';
    btnEl.innerHTML  = isPassword ? getIcon('eyeOff') : getIcon('eye');
  }

  document.getElementById('togglePw').addEventListener('click', () =>
    toggleVisibility(passwordInput, document.getElementById('togglePw'))
  );
  document.getElementById('toggleConfirmPw').addEventListener('click', () =>
    toggleVisibility(confirmPwInput, document.getElementById('toggleConfirmPw'))
  );

  document.getElementById('loginLink').addEventListener('click', (e) => {
    e.preventDefault();
    router.navigate('/login');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    const name            = document.getElementById('name').value.trim();
    const email           = document.getElementById('email').value.trim();
    const password        = passwordInput.value;
    const confirmPassword = confirmPwInput.value;

    submitBtn.disabled    = true;
    submitBtn.textContent = 'Creating account…';

    const result = await auth.signup(name, email, password, confirmPassword);

    if (result.success) {
      router.navigate('/onboarding', true);
    } else {
      showError(result.error);
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Create free account';
    }
  });

  document.getElementById('googleSignupBtn').addEventListener('click', async () => {
    hideError();
    const result = await auth.loginWithGoogle();
    if (result.success) {
      router.navigate(result.isNewUser ? '/onboarding' : '/home', true);
    } else {
      showError('Google sign-up failed. Please try again.');
    }
  });
}
