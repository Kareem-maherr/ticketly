import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC3X3g_J09IYUjQnz6eFdHUCr91SdG8-u0",
  authDomain: "arabemerge-ticket.firebaseapp.com",
  projectId: "arabemerge-ticket",
  storageBucket: "arabemerge-ticket.firebasestorage.app",
  messagingSenderId: "1081596127429",
  appId: "1:1081596127429:web:d0a690799134bd032928ac"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
