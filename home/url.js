// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

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

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

/**
 * Function to validate and save a new alias with its target URL.
 * @param {string} alias - The custom alias provided by the user.
 * @param {string} targetUrl - The target URL to be shortened.
 */
async function createShortUrlWithAlias(alias, targetUrl) {
  const aliasRef = ref(database, `Links/${alias}`);

  try {
    const snapshot = await get(aliasRef);
    if (snapshot.exists()) {
      console.error("Alias already exists. Please choose a different one.");
      alert("Alias already exists. Please choose a different one.");
    } else {
      // Alias is unique, save it to the database
      await set(aliasRef, {
        generatedLink: `https://tinyredirect.com/${alias}`,
        targetUrl: targetUrl,
      });
      console.log(`Short URL created: https://tinyredirect.com/${alias}`);
      alert(`Short URL created and copied: https://tinyredirect.com/${alias}`);

      // Set the generated link in the input field
      const genlink = document.getElementById('genLink');
      genlink.value = `https://tinyredirect.com/${alias}`;

      // Copy the generated link to the clipboard
      copyToClipboard(genlink.value);
    }
  } catch (error) {
    console.error("Error creating short URL:", error);
  }
}

/**
 * Copy text to clipboard.
 * @param {string} text - The text to copy.
 */
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert("URL copied to clipboard: " + text);
  }).catch((err) => {
    console.error("Error copying to clipboard:", err);
  });
}

/**
 * Helper function to generate a random alias if the user doesn't provide one.
 * @returns {string} A random string.
 */
function generateRandomAlias() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let alias = "";
  for (let i = 0; i < 6; i++) {
    alias += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return alias;
}

// Event Listener for Button Click
document.getElementById("generateBtn").addEventListener("click", () => {
  const aliasInput = document.getElementById("aliasInput").value.trim();
  const targetUrlInput = document.getElementById("targetUrlInput").value.trim();

  if (!targetUrlInput) {
    alert("Please enter a target URL.");
    return;
  }

  if (!aliasInput) {
    // Generate random alias if none is provided
    const randomAlias = generateRandomAlias();
    createShortUrlWithAlias(randomAlias, targetUrlInput);
  } else {
    // Use the provided alias
    createShortUrlWithAlias(aliasInput, targetUrlInput);
  }
});
