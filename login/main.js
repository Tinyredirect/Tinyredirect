// Firebase imports
import { 
  initializeApp 
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAN0d34eH_JowTlB5KZEeAap1PtGGoFBVc",
  authDomain: "tiny-redirect.firebaseapp.com",
  databaseURL: "https://tiny-redirect-default-rtdb.firebaseio.com",
  projectId: "tiny-redirect",
  storageBucket: "tiny-redirect.firebasestorage.app",
  messagingSenderId: "483985123684",
  appId: "1:483985123684:web:0e2f992f3ae1729ee23271",
  measurementId: "G-PQLS777XNJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Retrieve elements
const emailT = document.getElementById("emailT");
const passwordT = document.getElementById("passwordT");
const SignUpBtn = document.getElementById("SignUpBtn");
const ForgotPasswordBtn = document.getElementById("ForgotPasswordBtn");

// Handle Login
document.querySelector("form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = emailT.value;
  const password = passwordT.value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Login successful!", user);
    alert("Welcome back, " + user.email);
  } catch (error) {
    console.error("Error during login:", error.message);
    alert("Login failed: " + error.message);
  }
});

// Handle Sign-Up

// Handle Forgot Password
ForgotPasswordBtn.addEventListener("click", async () => {
  const email = emailT.value;

  if (!email) {
    alert("Please enter your email to reset your password.");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    console.log("Password reset email sent to", email);
    alert("Password reset email sent. Check your inbox.");
  } catch (error) {
    console.error("Error sending password reset email:", error.message);
    alert("Failed to send password reset email: " + error.message);
  }
});

// Google Login
document.getElementById("GoogleLoginBtn").addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("Google login successful!", user);
    alert("Logged in as " + user.displayName);
  } catch (error) {
    if (error.code === 'auth/popup-closed-by-user') {
      alert("Google login was canceled.");
    } else if (error.code === 'auth/network-request-failed') {
      alert("Network issue. Check your connection.");
    } else {
      console.error("Error during Google login:", error.message);
      alert("Google Login failed: " + error.message);
    }
  }
});
