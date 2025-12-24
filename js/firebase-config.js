// Import Firebase core
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
// Import services
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyANhgborXXro4Kgh3NrjHcIRYRwAzqqqfU",
  authDomain: "task-management-b8.firebaseapp.com",
  projectId: "task-management-b8",
  storageBucket: "task-management-b8.firebasestorage.app",
  messagingSenderId: "604867240136",
  appId: "1:604867240136:web:7e58839da121daee1dc5fd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);

// Export so other files can use them
export { auth, db };
