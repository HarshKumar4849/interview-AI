import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDezxIK8TuhLEtniohg1-rby2hnXNHlXmE",
  authDomain: "interview-ai-a893e.firebaseapp.com",
  projectId: "interview-ai-a893e",
  storageBucket: "interview-ai-a893e.firebasestorage.app",
  messagingSenderId: "481337869863",
  appId: "1:481337869863:web:2dee85ff4c7219476e7002",
  measurementId: "G-TQPWM9BD4Q"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();