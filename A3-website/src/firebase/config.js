// Firebase configuration
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Your web app's Firebase configuration
// For Firebase JS SDK v9-compat and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAJa7NkwQ8V_BI8iMBQE7ktl2UUHlugn_8",
  authDomain: "qian-yiwei-s-project.firebaseapp.com",
  projectId: "qian-yiwei-s-project",
  storageBucket: "qian-yiwei-s-project.firebasestorage.app",
  messagingSenderId: "780498273657",
  appId: "1:780498273657:web:575e77972f52c0e6e55ba8"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

export default app