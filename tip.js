const urlParams = new URLSearchParams(window.location.search);
const toParam = urlParams.get("to");

const recipientEl = document.getElementById("recipient");
const statusEl = document.getElementById("status");
const sendTipBtn = document.getElementById("sendTipBtn");

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

let finalRecipient = toParam;

async function resolveAddress(toParam) {
  if (toParam.startsWith("0x")) {
    recipientEl.innerText = toParam;
    return toParam;
  }

  const ref = db.ref("redirects/" + toParam.toLowerCase());
  const snap = await ref.once("value");
  if (snap.exists()) {
    const data = snap.val();
    const { address, nickname, message } = data;

    recipientEl.innerHTML = `<strong>${nickname}</strong><br><code>${address}</code>`;
    if (message) {
      const msgEl = document.createElement("p");
      msgEl.innerText = message;
      msgEl.style.fontStyle = "italic";
      msgEl.style.marginTop = "10px";
      recipientEl.appendChild(msgEl);
    }

    return address;
  } else {
    recipientEl.innerText = "Unknown recipient.";
    sendTipBtn.disabled = true;
    throw new Error("Unknown nickname");
  }
}

resolveAddress(toParam).then(address => {
  finalRecipient = address;
}).catch(err => {
  statusEl.innerText = "Error: " + err.message;
});

sendTipBtn.onclick = async () => {
  const amount = document.getElementById("amount").value;
  if (!window.ethereum) return alert("No wallet found");

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();

  try {
    const tx = await signer.sendTransaction({
      to: finalRecipient,
      value: ethers.utils.parseEther(amount)
    });
    statusEl.innerText = "✅ Sent! Tx: " + tx.hash;
  } catch (err) {
    statusEl.innerText = "Error: " + err.message;
  }
};
