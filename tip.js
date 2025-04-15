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
    connectBtn.textContent = "Loading...";

    try {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      currentWalletAddress = accounts[0];
      walletAddress.textContent = currentWalletAddress;

      // Save wallet address (basic presence)
      await db.ref("wallets/" + currentWalletAddress).set({
        address: currentWalletAddress,
      });

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
  document.getElementById("qrcode").innerHTML = ""; // Clear old QR
  new QRCode(document.getElementById("qrcode"), {
    text: link,
    width: 128,
    height: 128
  });
}

// Copy tip link
copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(tipLink.value).then(() => {
    copyBtn.textContent = "Copied!";
    setTimeout(() => copyBtn.textContent = "Copy Link", 2000);
  }).catch(err => {
    console.error("Clipboard error:", err);
    alert("Failed to copy.");
  });
});

// Save nickname & message → THEN generate the tip link
saveBtn.addEventListener("click", async () => {
  const nickname = nicknameInput.value.trim();
  const tipMessage = tipMessageInput.value.trim();

  if (!nickname || !currentWalletAddress) {
    alert("Please connect wallet and enter a nickname.");
    return;
  }

  try {
    await db.ref("redirects/" + nickname.toLowerCase()).set({
      address: currentWalletAddress,
      message: tipMessage,
      nickname: nickname,
    });

    const userTipLink = `${window.location.origin}/tip.html?to=${nickname}`;
    tipLink.value = userTipLink;
    tipLink.style.display = "block";
    copyBtn.style.display = "inline-block";

    generateQR(userTipLink);

    alert("Tip saved successfully! Your link is ready.");
  } catch (error) {
    console.error("Error saving tip:", error);
    alert("Could not save tip details.");
  }
});

connectBtn.addEventListener("click", connectWallet);
