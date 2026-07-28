import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { doc, setDoc, getDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { firebaseAuth, db } from './firebase.js';

const googleProvider = new GoogleAuthProvider();

// ─── Error mapping ────────────────────────────────────────────────────────────
export function friendlyError(code) {
  const map = {
    'auth/email-already-in-use':   'This email is already registered. Please log in.',
    'auth/invalid-email':          'Please enter a valid email address.',
    'auth/weak-password':          'Password must be at least 8 characters.',
    'auth/user-not-found':         'No account found with this email.',
    'auth/wrong-password':         'Incorrect password. Please try again.',
    'auth/invalid-credential':     'Incorrect email or password.',
    'auth/too-many-requests':      'Too many attempts. Please try again later.',
    'auth/popup-closed-by-user':   'Sign-in popup was closed.',
    'auth/network-request-failed': 'Network error. Check your connection.',
  };
  return map[code] || 'Something went wrong. Please try again.';
}

// ─── Firestore helpers ────────────────────────────────────────────────────────
async function createUserDoc(firebaseUser, name = '') {
  const ref = doc(db, 'users', firebaseUser.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return false; // existing user
  await setDoc(ref, {
    uid:        firebaseUser.uid,
    email:      firebaseUser.email,
    name:       name || firebaseUser.displayName || '',
    createdAt:  serverTimestamp(),
    isNewUser:  true,
    preferences: {},
    wishlist:   [],
  });
  return true; // new user created
}

export async function getUserDoc(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

// ─── Auth functions ───────────────────────────────────────────────────────────

/**
 * signupUser(fullName, email, password, confirmPassword)
 * Returns { success, user, error }
 */
export async function signupUser(fullName, email, password, confirmPassword) {
  // Client-side validation
  if (!fullName || !email || !password || !confirmPassword)
    return { success: false, error: 'Please fill in all fields.' };

  if (password !== confirmPassword)
    return { success: false, error: 'Passwords do not match.' };

  if (password.length < 8)
    return { success: false, error: 'Password must be at least 8 characters.' };

  try {
    const { user } = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    await createUserDoc(user, fullName);
    return { success: true, user };
  } catch (e) {
    return { success: false, error: friendlyError(e.code) };
  }
}

/**
 * loginUser(email, password)
 * Returns { success, user, error }
 */
export async function loginUser(email, password) {
  if (!email || !password)
    return { success: false, error: 'Please fill in all fields.' };

  try {
    const { user } = await signInWithEmailAndPassword(firebaseAuth, email, password);
    return { success: true, user };
  } catch (e) {
    return { success: false, error: friendlyError(e.code) };
  }
}

/**
 * loginWithGoogle()
 * Returns { success, user, isNewUser, error }
 */
export async function loginWithGoogle() {
  try {
    const { user } = await signInWithPopup(firebaseAuth, googleProvider);
    const isNewUser = await createUserDoc(user);
    return { success: true, user, isNewUser };
  } catch (e) {
    return { success: false, error: friendlyError(e.code) };
  }
}

/**
 * logoutUser()
 */
export async function logoutUser() {
  await signOut(firebaseAuth);
}

/**
 * watchAuthState(callback)
 * Calls callback(firebaseUser | null) whenever auth state changes.
 * Returns the unsubscribe function.
 */
export function watchAuthState(callback) {
  return onAuthStateChanged(firebaseAuth, callback);
}

export { firebaseAuth };
