import { doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { db, firebaseAuth } from './firebase.js';
import {
  signupUser,
  loginUser,
  loginWithGoogle as fbLoginWithGoogle,
  logoutUser,
  watchAuthState,
  getUserDoc,
} from './authService.js';

class AuthManager {
  constructor() {
    this.user     = null;
    this.wishlist = [];
    this.listeners = [];
    this._ready   = false;
    this._readyResolvers = [];

    // Single source of truth: Firebase auth state
    watchAuthState(async (firebaseUser) => {
      if (firebaseUser) {
        const data = await getUserDoc(firebaseUser.uid);
        this.user     = data ? { uid: firebaseUser.uid, ...data } : { uid: firebaseUser.uid, email: firebaseUser.email };
        this.wishlist = this.user.wishlist || [];
      } else {
        this.user     = null;
        this.wishlist = [];
      }
      this._resolveReady();
      this.notify();
    });
  }

  // Resolves all pending getUser() calls once auth state is known
  _resolveReady() {
    if (!this._ready) {
      this._ready = true;
      this._readyResolvers.forEach(r => r(this.user));
      this._readyResolvers = [];
    }
  }

  // Waits for the first onAuthStateChanged to fire before returning
  getUser() {
    if (this._ready) return Promise.resolve(this.user);
    return new Promise(resolve => this._readyResolvers.push(resolve));
  }

  subscribe(listener) { this.listeners.push(listener); }
  notify()            { this.listeners.forEach(l => l(this.user)); }

  // ── Auth actions ────────────────────────────────────────────────────────────

  async signup(name, email, password, confirmPassword = password) {
    const result = await signupUser(name, email, password, confirmPassword);
    return result; // { success, error }
  }

  async login(email, password) {
    const result = await loginUser(email, password);
    if (!result.success) return { success: false, error: result.error };
    // Wait for onAuthStateChanged to fire and populate this.user
    await new Promise(resolve => {
      const unsub = watchAuthState((u) => { if (u) { unsub(); resolve(); } });
    });
    return { success: true };
  }

  async loginWithGoogle() {
    const result = await fbLoginWithGoogle();
    if (!result.success) return { success: false };
    // Wait for onAuthStateChanged to populate this.user
    await this.getUser();
    return { success: true, isNewUser: result.isNewUser };
  }

  // backward compat alias
  async googleLogin() { return this.loginWithGoogle(); }

  async logout() {
    await logoutUser();
    this.user     = null;
    this.wishlist = [];
    this._ready   = true;
    this._readyResolvers = [];
    this.notify();
  }

  // ── Profile / Wishlist ──────────────────────────────────────────────────────

  async completeOnboarding(preferences) {
    if (!this.user) return;
    await setDoc(doc(db, 'users', this.user.uid), { isNewUser: false, preferences }, { merge: true });
    this.user.isNewUser  = false;
    this.user.preferences = preferences;
    this.notify();
  }

  async toggleWishlist(id) {
    if (!this.user) return;
    const inList  = this.wishlist.includes(id);
    this.wishlist = inList ? this.wishlist.filter(i => i !== id) : [...this.wishlist, id];
    await setDoc(doc(db, 'users', this.user.uid), { wishlist: this.wishlist }, { merge: true });
    this.notify();
  }

  async loadWishlist() {
    if (!this.user) return;
    const data    = await getUserDoc(this.user.uid);
    this.wishlist = data?.wishlist || [];
  }

  isAuthenticated() { return !!this.user; }
  getUserData()     { return this.user; }
  isInWishlist(id)  { return this.wishlist.includes(id); }
}

export const auth = new AuthManager();
