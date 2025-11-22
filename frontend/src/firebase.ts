import { initializeApp } from "firebase/app";
import { getAuth, signInWithCredential, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB_zn_qlA4zC0-Uh65kaViJIIv3q0QLG_A",
  authDomain: "chatbot-58bcb.firebaseapp.com",
  projectId: "chatbot-58bcb",
  storageBucket: "chatbot-58bcb.firebasestorage.app",
  messagingSenderId: "656560197296",
  appId: "1:656560197296:web:00f50518a396e2f8fa3575"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
