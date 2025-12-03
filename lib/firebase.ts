// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAoJXxcreRgcOL5RP57BiBq8xlXB2DF944",
  authDomain: "duesignal.firebaseapp.com",
  projectId: "duesignal",
  storageBucket: "duesignal.firebasestorage.app",
  messagingSenderId: "313825735587",
  appId: "1:313825735587:web:163aac67dc954fa921a016",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
