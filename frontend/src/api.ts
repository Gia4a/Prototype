// api.ts - Shared API functions for TanStack Query
import { getFunctions, httpsCallable } from 'firebase/functions';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

export async function fetchMixologistSuggestion(query: string) {
    const getMixologistSuggestion = httpsCallable(functions, 'getMixologistSuggestion');
    const result = await getMixologistSuggestion({ query });
    return result.data;
}

export async function fetchHoroscope(sign: string, displayName: string) {
    const response = await fetch("https://us-central1-blind-pig-bar.cloudfunctions.net/getAllRecipesForSign", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sign, displayName, date: new Date().toISOString() })
    });
    if (!response.ok) throw new Error(`Firebase function error: ${response.status}`);
    return response.json();
}
