const connectBtn = document.getElementById('connectBtn');
const walletAddress = document.getElementById('walletAddress');
const tipLink = document.getElementById('tipLink');
const copyBtn = document.getElementById('copyBtn');
const saveBtn = document.getElementById('saveBtn');
const nicknameInput = document.getElementById('nickname');
const tipMessageInput = document.getElementById('tipMessage');
const liveTipMessage = document.getElementById('liveTipMessage'); // Element to show live message

// Firebase config
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

// Connect wallet and generate tip link
async function connectWallet() {
  if (typeof window.ethereum === "undefined") {
    alert("Please install MetaMask to use this app.");
    return;
  }

  connectBtn.textContent = "Loading...";
  try {
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    currentWalletAddress = accounts[0];
    walletAddress.textContent = currentWalletAddress;

    await db.ref("wallets/" + currentWalletAddress).set({ address: currentWalletAddress });

    const userTipLink = `${window.location.origin}/tip.html?to=${nicknameInput.value.trim()}`;
    tipLink.value = userTipLink;

    connectBtn.textContent = "Connected";
    connectBtn.disabled = true;
  } catch (err) {
    console.error("Error connecting to MetaMask:", err);
    connectBtn.textContent = "Connect Wallet";
  }
}

// Copy link
copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(tipLink.value).then(() => {
    copyBtn.textContent = "Copied!";
    setTimeout(() => copyBtn.textContent = "Copy Link", 2000);
  }).catch(err => {
    console.error("Copy failed:", err);
    alert("Failed to copy the link.");
  });
});

// Save nickname and message
saveBtn.addEventListener("click", async () => {
  event.preventDefault(); 
  const nickname = nicknameInput.value.trim();
  const tipMessage = tipMessageInput.value.trim();

  if (!nickname || !currentWalletAddress) {
    alert("Nickname and wallet address are required.");
    return;
  }

  try {
    await db.ref("redirects/" + nickname.toLowerCase()).set({
      address: currentWalletAddress,
      message: tipMessage,
      nickname: nickname,
    });

    // Show live feedback in the UI without reloading
    const link = `${window.location.origin}/tip.html?to=${currentWalletAddress}`;
    tipLink.value = link;
    if (liveTipMessage) {
      liveTipMessage.textContent = `“${tipMessage}”`;
    }

    alert("Tip saved successfully!");
  } catch (error) {
    console.error("Error saving:", error);
    alert("Failed to save tip.");
  }
});

connectBtn.addEventListener("click", connectWallet);
