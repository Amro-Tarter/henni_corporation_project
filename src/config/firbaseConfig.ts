// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
// TODO: Add SDKs for Firebase products that you want to use

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAIr7HfC8TPWAv_DaFx5uQbnCF4xyPX2gI",
  authDomain: "henini-prj.firebaseapp.com",
  projectId: "henini-prj",
  storageBucket: "henini-prj.firebasestorage.app",
  messagingSenderId: "702193062188",
  appId: "1:702193062188:web:8d7220d07ab17ef48a1c89",
  measurementId: "G-5JHE2J4RP2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Auth
const auth = getAuth(app);

// Initialize Firebase Storage
const storage = getStorage(app);

// Initialize Firebase Functions
const functions = getFunctions(app);

export { app, db, auth, storage, functions };