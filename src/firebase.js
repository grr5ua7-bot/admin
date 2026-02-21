// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAOguyakGWZRsxyMhg5T4erp9caAFUBnfU",
  authDomain: "shop-237e4.firebaseapp.com",
  databaseURL: "https://shop-237e4-default-rtdb.firebaseio.com",
  projectId: "shop-237e4",
  storageBucket: "shop-237e4.firebasestorage.app",
  messagingSenderId: "446127940392",
  appId: "1:446127940392:web:f56444648c9387adfa261d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;