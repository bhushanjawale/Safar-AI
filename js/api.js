import { db } from './firebase.js';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { auth } from './auth.js';

const API_URL = 'http://localhost:5000/api';

export async function generateItinerary(source, destination, days, budget, onChunk) {
  const res = await fetch(`${API_URL}/itinerary/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source, destination, days, budget })
  });

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const processBuffer = () => {
    const lines = buffer.split('\n');
    buffer = lines.pop(); // keep incomplete last line
    for (const line of lines) {
      if (!line.startsWith('data:')) continue;
      try {
        const parsed = JSON.parse(line.slice(5).trim());
        if (parsed.chunk && onChunk) onChunk(parsed.chunk);
        if (parsed.done) return { success: true, data: parsed.data };
        if (parsed.error) return { success: false, error: parsed.error };
      } catch { /* incomplete line, skip */ }
    }
    return null;
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      // flush remaining buffer
      buffer += '\n';
      const final = processBuffer();
      if (final) return final;
      break;
    }
    buffer += decoder.decode(value, { stream: true });
    const result = processBuffer();
    if (result) return result;
  }
  return { success: false, error: 'Stream ended unexpectedly.' };
}

export async function chatWithAssistant(message) {
  const res = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  return res.json();
}

export async function getRecommendations(preferences = {}) {
  const res = await fetch(`${API_URL}/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preferences)
  });
  return res.json();
}

export async function getNearby(location = 'India') {
  const res = await fetch(`${API_URL}/nearby`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location })
  });
  return res.json();
}

export async function saveTrip(tripData) {
  const user = auth.getUserData();
  if (!user) return { success: false, error: 'Not authenticated' };
  try {
    const ref = await addDoc(collection(db, 'trips'), {
      user_id: user.uid,
      ...tripData,
      status: 'planned',
      created_at: serverTimestamp()
    });
    return { success: true, id: ref.id };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export async function getTrips() {
  const user = auth.getUserData();
  if (!user) return [];
  const q = query(collection(db, 'trips'), where('user_id', '==', user.uid));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
