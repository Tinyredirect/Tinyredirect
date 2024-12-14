// Initialize Eruda (for debugging purposes)
eruda.init();


import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  get,
  push,
  query,
  orderByChild,
  equalTo
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAN0d34eH_JowTlB5KZEeAap1PtGGoFBVc",
  authDomain: "tiny-redirect.firebaseapp.com",
  databaseURL: "https://tiny-redirect-default-rtdb.firebaseio.com",
  projectId: "tiny-redirect",
  storageBucket: "tiny-redirect.appspot.com", // Fixed storage bucket
  messagingSenderId: "483985123684",
  appId: "1:483985123684:web:0e2f992f3ae1729ee23271",
  measurementId: "G-PQLS777XNJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Menu toggle functionality
const menuIcon = document.getElementById('menuIcon');
const sidebar = document.getElementById('sidebar');

if (menuIcon && sidebar) {
  menuIcon.addEventListener('click', () => {
    sidebar.classList.toggle('active'); // Toggle active class for the sidebar
  });
}

window.redirect = function(url) {
  if (url) {
    const encodedUrl = encodeURIComponent(url);
    window.location.href = `https://tinyredirect.com/r/${encodedUrl}`; // Fixed redirect path
  }
};

// Wait for DOM to load before adding event listeners
document.addEventListener('DOMContentLoaded', () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      setupAuthenticatedUser(user);
    } else {
      // Redirect unauthenticated users to login page
      window.location.href = 'https://tinyredirect.com/login';
    }
  });

  function setupAuthenticatedUser(user) {
    const userPic = document.querySelector('.user-avatar');
    const photoUrl = user.photoURL || 'defaultPic.jpeg';
    if (userPic) userPic.src = photoUrl;

    const userData = {
      plan: 'Free-plan',
      email: user.email,
      profilePhoto: photoUrl,
      uid: user.uid
    };

    const userRef = ref(database, `users/${user.uid}`);
    get(userRef).then((snapshot) => {
      if (!snapshot.exists()) {
        set(userRef, userData)
          .then(() => console.log('User added to the database:', userData))
          .catch((error) => console.error('Error adding user to database:', error));
      } else {
        console.log('User already exists in the database');
      }
    }).catch((error) => console.error('Error checking user in database:', error));

    setupLinkCreation(user.uid);
  }

  function setupLinkCreation(userId) {
    const crtBtn = document.getElementById('crtBtn');
    if (!crtBtn) return;

    crtBtn.addEventListener('click', () => {
      let Durl = document.getElementById('Durl').value.trim();
      const halveBackInput = document.getElementById('halveBack').value.trim();
      const anaLink = document.getElementById('anaLink').checked;
      const qrLink = document.getElementById('qrLink').checked;
      let titleLink = document.getElementById('titleLink').value.trim();

      if (!Durl) {
        alert("Please enter a valid url.");
        return;
      }
      if (!Durl.startsWith("http://") && !Durl.startsWith("https://")) {
        Durl = `https://${Durl}`;
      }
      if (!titleLink) {
        titleLink = generateTitle(Durl);
      }

      const linksRef = ref(database, 'links');
      const userLinksRef = ref(database, `users/${userId}/userLinks`);

      generateUniqueHalveBack(halveBackInput, linksRef, (uniqueHalveBack) => {
        const targetUrl = `https://tinyredirect.com/${uniqueHalveBack}`;

        const UrlData = {
          Durl,
          halveBack: uniqueHalveBack,
          anaLink,
          qrLink,
          titleLink
        };

        const linkData = {
          Durl,
          TargetUrl: targetUrl,
          halveBack: uniqueHalveBack
        };

        push(userLinksRef, UrlData)
          .then(() => {
            push(linksRef, linkData)
              .then(() => {
                alert("Link data saved successfully!");
                console.log("Constructed URL:", targetUrl);

                document.getElementById('Durl').value = '';
                document.getElementById('halveBack').value = '';
                document.getElementById('titleLink').value = '';
                document.getElementById('anaLink').checked = false;
                document.getElementById('qrLink').checked = false;
              })
              .catch((linkError) => {
                console.error("Error saving link to links node:", linkError);
                alert("Failed to save link to global database.");
              });
          })
          .catch((error) => {
            console.error("Error saving user link data:", error);
            alert("Failed to save link data.");
          });
      });
    });
  }

  function generateUniqueHalveBack(input, linksRef, callback, retryCount = 0) {
    if (retryCount > 10) {
      console.error("Failed to generate a unique halveBack after 10 attempts.");
      alert("Unable to generate a unique short link. Please try again.");
      return;
    }

    const generatedHalveBack = input || generateRandomString(6);
    const queryRef = query(linksRef, orderByChild("halveBack"), equalTo(generatedHalveBack));
    get(queryRef).then((snapshot) => {
      if (snapshot.exists()) {
        generateUniqueHalveBack(input, linksRef, callback, retryCount + 1);
      } else {
        callback(generatedHalveBack);
      }
    });
  }

  function generateRandomString(length) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  function generateTitle(url) {
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace("www.", "");
    } catch (e) {
      console.error("Error generating title:", e);
      return "Generated Title";
    }
  }
});


// Constants and Variables
const radioButtons = document.querySelectorAll('.radio-button');
const selectedColorText = document.getElementById('selected-color');
const destinationInput = document.getElementById('Durl');
const titleInput = document.getElementById('titleLink');
const halveBackInput = document.getElementById('halveBack');
const analyticsCheckbox = document.getElementById('anaLink');
const qrCodeCanvas = document.getElementById('qrcodeCanvas');
const saveBtn = document.getElementById('save-btn');

let selectedColor = "#000000"; // Default color

/**
 * Generate QR Code with the specified data and color.
 */
const updateQRCode = () => {
  const url = destinationInput.value.trim();
  if (!url) return;

  const qr = qrcode(0, 'H'); // Error correction level 'H' (high)
  qr.addData(url);
  qr.make();

  const ctx = qrCodeCanvas.getContext('2d');
  const size = qrCodeCanvas.width;
  const cellSize = Math.floor(size / qr.getModuleCount());

  ctx.clearRect(0, 0, size, size);

  for (let row = 0; row < qr.getModuleCount(); row++) {
    for (let col = 0; col < qr.getModuleCount(); col++) {
      ctx.fillStyle = qr.isDark(row, col) ? selectedColor : "#ffffff";
      ctx.fillRect(
        col * cellSize,
        row * cellSize,
        cellSize + 1,
        cellSize + 1
      );
    }
  }
};

/**
 * Save QR Code Canvas as PNG.
 */
const saveQRCodeAsPNG = (canvasId, filename) => {
  const canvas = document.getElementById(canvasId);
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png"); // Get PNG image data
  link.download = filename; // Set the download filename
  link.click(); // Trigger the download
};

/**
 * Save Data to Firebase.
 */
const saveData = async () => {
  const userId = auth.currentUser ? auth.currentUser.uid : "guest";
  const destinationUrl = destinationInput.value.trim();
  const title = titleInput.value.trim() || "Untitled";
  const halveBack = halveBackInput.value.trim() || Math.random().toString(36).substr(2, 6);
  const analytics = analyticsCheckbox.checked;

  if (!destinationUrl) {
    alert("Please enter a destination URL.");
    return;
  }

  // Generate the QR code image as a Base64 string
  const canvasDataUrl = qrCodeCanvas.toDataURL("image/png");

  // Create references
  const userLinksRef = ref(database, `users/${userId}/userLinks/${halveBack}`);
  const linksRef = ref(database, `links/${halveBack}`);

  // Prepare data
  const userLinkData = {
    linkType: "qrcode",
    title,
    halveBack,
    analytics,
    qrCodeUrl: canvasDataUrl,
    createdAt: new Date().toISOString(),
  };

  const linkData = {
    durl: destinationUrl,
    targetUrl: 'https://tinyredirect.com/' + halveBack,
  };

  try {
    // Save to userLinks
    await set(userLinksRef, userLinkData);

    // Save to links
    await set(linksRef, linkData);

    alert("QR code saved successfully!");
    // Reset form
    destinationInput.value = "";
    titleInput.value = "";
    halveBackInput.value = "";
    analyticsCheckbox.checked = false;

    // Allow download
    saveQRCodeAsPNG("qrcodeCanvas", `${halveBack}.png`);
  } catch (error) {
    console.error("Error saving data:", error);
    alert("Failed to save data. Please try again.");
  }
};

/**
 * Event Listener for Color Selection.
 */
radioButtons.forEach((radio) => {
  radio.addEventListener('change', function() {
    selectedColor = this.value; // Update selected color
    selectedColorText.textContent = `Selected color: ${selectedColor}`;
    updateQRCode(); // Update QR code with the new color
  });
});

/**
 * Initialize QR Code and Attach Event Listeners.
 */
const initializeQRCodeGenerator = () => {
  saveBtn.addEventListener("click", saveData);
  destinationInput.addEventListener("input", updateQRCode);
  updateQRCode(); // Generate initial QR code
};

// Initialize the QR Code Generator
initializeQRCodeGenerator();
