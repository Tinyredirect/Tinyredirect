// Initialize Firebase
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
 * Validate and sanitize the URL by adding https:// if missing.
 * @param {string} url - The user-provided URL.
 * @returns {string} A valid URL with the protocol included.
 */
function sanitizeUrl(url) {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }
  return url;
}

/**
 * Function to validate and save a new alias with its target URL.
 * @param {string} alias - The custom alias provided by the user.
 * @param {string} targetUrl - The target URL to be shortened.
 */
async function createShortUrlWithAlias(alias, targetUrl) {
  const aliasRef = ref(database, `Links/${alias}`);
  const genLinkInput = document.getElementById("genLink");
  const generateBtn = document.getElementById("generateBtn");

  try {
    const snapshot = await get(aliasRef);
    if (snapshot.exists()) {
      alert("Alias already exists. Please choose a different one.");
    } else {
      const generatedLink = `https://tinyredirect.com/${alias}`;
      await set(aliasRef, {
        generatedLink: generatedLink,
        targetUrl: targetUrl,
      });

      genLinkInput.value = generatedLink;
      genLinkInput.style.display = "block";
      generateBtn.textContent = "Copy Link";
      generateBtn.classList.add("copy-mode");

      // Automatically copy the generated link to the clipboard
      copyToClipboard(generatedLink);
      alert(`Short URL created and copied: ${generatedLink}`);
    }
  } catch (error) {
    console.error("Error creating short URL:", error);
    alert("An error occurred. Please try again.");
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

/**
 * Validate reCAPTCHA and proceed with URL shortening.
 * @param {string} alias - The alias provided by the user.
 * @param {string} targetUrl - The target URL provided by the user.
 */
function validateRecaptchaAndShorten(alias, targetUrl) {
  grecaptcha.enterprise.execute('6LewSokqAAAAAG9Jip3JsBTPBPAIGeYYiDBLfDYQ', { action: 'submit' })
    .then((token) => {
      console.log("reCAPTCHA token:", token);
      // Proceed with creating the short URL
      createShortUrlWithAlias(alias, targetUrl);
    })
    .catch((error) => {
      console.error("reCAPTCHA validation failed:", error);
      alert("reCAPTCHA validation failed. Please try again.");
    });
}

// Event Listener for Button Click
document.getElementById("generateBtn").addEventListener("click", function() {
  const aliasInput = document.getElementById("aliasInput").value.trim();
  const targetUrlInput = document.getElementById("targetUrlInput").value.trim();
  const generateBtn = document.getElementById("generateBtn");

  // If the button is in "Copy" mode, copy the generated link
  if (generateBtn.classList.contains("copy-mode")) {
    const genLinkInput = document.getElementById("genLink");
    copyToClipboard(genLinkInput.value);
    alert("URL copied to clipboard!");
    return;
  }

  if (!targetUrlInput) {
    alert("Please enter a target URL.");
    return;
  }

  const sanitizedUrl = sanitizeUrl(targetUrlInput);

  if (!aliasInput) {
    // Generate random alias if none is provided
    const randomAlias = generateRandomAlias();
    validateRecaptchaAndShorten(randomAlias, sanitizedUrl);
  } else {
    // Use the provided alias
    validateRecaptchaAndShorten(aliasInput, sanitizedUrl);
  }
});
