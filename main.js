const connectBtn = document.getElementById('connectBtn');
const walletAddress = document.getElementById('walletAddress');
const tipLink = document.getElementById('tipLink');
const copyBtn = document.getElementById('copyBtn');

async function connectWallet() {
  if (typeof window.ethereum !== "undefined") {
    connectBtn.textContent = "Loading...";
    try {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      const address = accounts[0];
      walletAddress.textContent = address;
      tipLink.value = `${window.location.origin}/tip.html?to=${address}`;
      generateQR(tipLink.value);
      connectBtn.textContent = "Connected";
      connectBtn.disabled = true;
    } catch (err) {
      console.error(err);
      connectBtn.textContent = "Connect Wallet";
    }
  } else {
    alert("Please install MetaMask to use this app.");
  }
}

connectBtn.addEventListener("click", connectWallet);

function generateQR(link) {
  const qrcode = new QRCode(document.getElementById("qrcode"), {
    text: link,
    width: 128,
    height: 128
  });
}

copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(tipLink.value);
  copyBtn.textContent = "Copied!";
  setTimeout(() => copyBtn.textContent = "Copy Link", 2000);
});
