// Firebase Authentication Service
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from './config.js'

// Google Auth Provider
const googleProvider = new GoogleAuthProvider()

// Register new user with email and password
export const registerUser = async (email, password, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    // Update user profile
    await updateProfile(user, {
      displayName: userData.username || userData.name
    })
    
    // Save additional user data to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      username: userData.username || userData.name,
      role: userData.role || 'teenager',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    })
    
    return { success: true, user }
  } catch (error) {
    console.error('Registration error:', error)
    return { success: false, error: error.message }
  }
}

// Sign in user with email and password
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    // Update last login time
    const userDoc = doc(db, 'users', user.uid)
    await setDoc(userDoc, {
      lastLogin: new Date().toISOString()
    }, { merge: true })
    
    return { success: true, user }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: error.message }
  }
}

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    const user = result.user
    
    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    
    if (!userDoc.exists()) {
      // Create new user document
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        username: user.displayName,
        role: 'teenager',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      })
    } else {
      // Update last login time
      await setDoc(doc(db, 'users', user.uid), {
        lastLogin: new Date().toISOString()
      }, { merge: true })
    }
    
    return { success: true, user }
  } catch (error) {
    console.error('Google sign-in error:', error)
    return { success: false, error: error.message }
  }
}

// Sign out user
export const logoutUser = async () => {
  try {
    await signOut(auth)
    return { success: true }
  } catch (error) {
    console.error('Logout error:', error)
    return { success: false, error: error.message }
  }
}

// Send password reset email
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email)
    return { success: true }
  } catch (error) {
    console.error('Password reset error:', error)
    return { success: false, error: error.message }
  }
}

// Get current user data from Firestore
export const getCurrentUserData = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (userDoc.exists()) {
      return { success: true, userData: userDoc.data() }
    } else {
      return { success: false, error: 'User data not found' }
    }
  } catch (error) {
    console.error('Get user data error:', error)
    return { success: false, error: error.message }
  }
}

// Auth state observer
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback)
}

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser
}