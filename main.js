const connectBtn = document.getElementById('connectBtn');
const walletAddress = document.getElementById('walletAddress');
const tipLink = document.getElementById('tipLink');
const copyBtn = document.getElementById('copyBtn');
const saveBtn = document.getElementById('saveBtn');
const nicknameInput = document.getElementById('nickname');
const tipMessageInput = document.getElementById('tipMessage');

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB0QtZ8pHEVH-D2VNko9nW-LRSP0Btv2dg",
  authDomain: "tinytip-856d8.firebaseapp.com",
  databaseURL: "https://tinytip-856d8-default-rtdb.firebaseio.com",
  projectId: "tinytip-856d8",
  storageBucket: "tinytip-856d8.appspot.com",
  messagingSenderId: "348256301193",
  appId: "1:348256301193:web:a8f24524db1142e17f9658",
  measurementId: "G-2WCQL5MHHN"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let currentWalletAddress = "";

async function connectWallet() {
  if (typeof window.ethereum !== "undefined") {
    connectBtn.textContent = "Loading...";  // Show "Loading..." while waiting

    try {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      currentWalletAddress = accounts[0];
      walletAddress.textContent = currentWalletAddress;

      // Store wallet address to Firebase
      await db.ref("wallets/" + currentWalletAddress).set({
        address: currentWalletAddress,
      });

      const userTipLink = `${window.location.origin}/tip.html?to=${currentWalletAddress}`;
      tipLink.value = userTipLink;

      // Generate QR code
      generateQR(userTipLink);

      connectBtn.textContent = "Connected";
      connectBtn.disabled = true;
    } catch (err) {
      console.error("Error connecting to MetaMask:", err);
      connectBtn.textContent = "Connect Wallet";
    }
  } else {
    alert("Please install MetaMask to use this app.");
  }
}

// Generate QR code for the tip link
function generateQR(link) {
  const qrcode = new QRCode(document.getElementById("qrcode"), {
    text: link,
    width: 128,
    height: 128
  });
}

// Handle copying the tip link to the clipboard
copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(tipLink.value).then(() => {
    copyBtn.textContent = "Copied!";
    setTimeout(() => copyBtn.textContent = "Copy Link", 2000);
  }).catch((err) => {
    console.error("Failed to copy text:", err);
    alert("Failed to copy the link.");
  });
});

// Handle saving the nickname and tip message to Firebase
saveBtn.addEventListener("click", async () => {
  const nickname = nicknameInput.value.trim();
  const tipMessage = tipMessageInput.value.trim();

  if (!nickname || !currentWalletAddress) {
    alert("Nickname and wallet address are required.");
    return;
  }

  // Save the nickname and tip message to Firebase
  try {
    await db.ref("redirects/" + nickname.toLowerCase()).set({
      address: currentWalletAddress,
      message: tipMessage,
      nickname: nickname,
    });

    alert("Tip saved successfully! Your link is ready.");
  } catch (error) {
    console.error("Error saving to Firebase:", error);
    alert("Failed to save tip details.");
  }
});

// Event listener for the "Connect Wallet" button
connectBtn.addEventListener("click", connectWallet);
