// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBpjK0lnUCB0O9DL-jjEBonUkkcQdqTbnU",
  authDomain: "mipu-social-v1.firebaseapp.com",
  projectId: "mipu-social-v1",
  storageBucket: "mipu-social-v1.appspot.com",
  messagingSenderId: "233605451888",
  appId: "1:233605451888:web:d4d0dc895c1e925f0ce4b5",
  measurementId: "G-2516T5S7QV"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore();
const storage = getStorage();

export { app, db, storage };