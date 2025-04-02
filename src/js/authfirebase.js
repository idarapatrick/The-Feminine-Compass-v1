// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-analytics.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    signOut, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    sendPasswordResetEmail,
    updateProfile 
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    getDoc, 
    setDoc, 
    collection, 
    query, 
    where, 
    getDocs, 
    updateDoc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBYjdUbbYY8CssJ_gIf35sO2H9z90BKALI",
    authDomain: "the-feminine-compass.firebaseapp.com",
    projectId: "the-feminine-compass",
    storageBucket: "the-feminine-compass.appspot.com",
    messagingSenderId: "1043749795698",
    appId: "1:1043749795698:web:2075c3bdfdedd9ff17cfeb",
    measurementId: "G-G750NE6WCR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Check authentication state
function initAuthStateListener() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("User authenticated:", user.uid);
            window.location.href = '/src/pages/dashboard.html';
        } else {
            console.log("No user authenticated");
            window.location.href = '/signin.html';
        }
    });
}

// Load user data from Firestore
async function loadUserData(userId) {
    try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            displayUserInfo(userData);
            return userData;
        } else {
            console.log("No user data found in Firestore!");
            // Try to get data from auth profile as fallback
            const user = auth.currentUser;
            if (user && user.displayName) {
                const basicUserData = {
                    firstName: user.displayName.split(' ')[0],
                    email: user.email
                };
                displayUserInfo(basicUserData);
                return basicUserData;
            }
        }
    } catch (error) {
        console.error("Error getting user data:", error);
    }
    return null;
}

// Display user info in the UI
function displayUserInfo(userData) {
    const userFirstName = document.getElementById('user-first-name');
    if (userFirstName && userData.firstName) {
        userFirstName.textContent = userData.firstName;
    }
    
    // Dispatch event for other components that need user data
    document.dispatchEvent(new CustomEvent('userDataLoaded', { detail: userData }));
}

// Sign-up function
async function signUp(email, password, firstName, lastName) {
    try {
        // Create the user account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Set display name in auth profile
        await updateProfile(user, {
            displayName: `${firstName} ${lastName}`
        });
        
        // Store additional user data in Firestore
        await setDoc(doc(db, "users", user.uid), {
            firstName,
            lastName,
            email,
            createdAt: serverTimestamp(),
            preferences: { 
                notifications: { 
                    reminders: true, 
                    insights: true, 
                    community: true 
                } 
            }
        });
        
        return { success: true, user };
    } catch (error) {
        console.error("Sign-up error:", error);
        return { success: false, error };
    }
}

// Sign-in function
async function signIn(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error("Sign-in error:", error);
        return { success: false, error };
    }
}

// Password reset function
async function resetPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error) {
        console.error("Password reset error:", error);
        return { success: false, error };
    }
}

// Sign-out function
async function signOutUser() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        console.error("Sign out error:", error);
        return { success: false, error };
    }
}

// Function to get current user
function getCurrentUser() {
    return auth.currentUser;
}

// Init auth listener on page load
document.addEventListener('DOMContentLoaded', initAuthStateListener);

// Export Firebase services for use in other files
export { app, analytics, auth, db, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, updateProfile, doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc, serverTimestamp };

// Export functions and objects
export { 
    signUp, 
    signIn, 
    resetPassword, 
    signOutUser,
    getCurrentUser,
    loadUserData
};
