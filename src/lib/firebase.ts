// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDEIJGIZoPtO5EcfrHzJQvtUUpaZZdf5vs",
  authDomain: "scoreboard-saga-yoi5v.firebaseapp.com",
  projectId: "scoreboard-saga-yoi5v",
  storageBucket: "scoreboard-saga-yoi5v.firebasestorage.app",
  messagingSenderId: "41563317452",
  appId: "1:41563317452:web:96fb29442ee591d31b8e69"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
}

const db = getFirestore(app);

export { db };
