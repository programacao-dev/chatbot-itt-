import { initializeApp } from "firebase/app";
import { getAuth, signInWithCredential, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.FIREBASE_API_KEY,
  authDomain: "chatbot-58bcb.firebaseapp.com",
  projectId: "chatbot-58bcb",
  storageBucket: "chatbot-58bcb.firebasestorage.app",
  messagingSenderId: "656560197296",
  appId: import.meta.env.FIREBASE_APP_ID
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
