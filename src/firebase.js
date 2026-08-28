import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyByovxDho_9U9bzg-yHYRvqbWh7oBdCAbA",
  authDomain: "track-fuel.firebaseapp.com",
  projectId: "track-fuel",
  storageBucket: "track-fuel.firebasestorage.app",
  messagingSenderId: "571914929602",
  appId: "1:571914929602:web:f92a7ac779dec6ae97425b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();