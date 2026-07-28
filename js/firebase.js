import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyB-2OuAlWFjHTqZnD0IUHGZA4mjPY7ePz4",
  authDomain: "safar-ai-f3ae6.firebaseapp.com",
  projectId: "safar-ai-f3ae6",
  storageBucket: "safar-ai-f3ae6.firebasestorage.app",
  messagingSenderId: "573689679154",
  appId: "1:573689679154:web:9f3431c3da2a6182579b2b",
  measurementId: "G-W0TZVZ0PQF"
};

const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);
export const db = getFirestore(app);
