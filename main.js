document.getElementById("connectBtn").onclick = async function () {
  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    document.getElementById("walletAddress").innerText = address;
    const tipUrl = window.location.origin + "/tip.html?to=" + address;
    document.getElementById("tipLink").value = tipUrl;
    document.getElementById("tipSection").style.display = "block";

    const qr = new QRCode(document.getElementById("qrcode"), {
      text: tipUrl,
      width: 128,
      height: 128
    });

    document.getElementById("copyBtn").onclick = () => {
      navigator.clipboard.writeText(tipUrl);
      alert("Copied!");
    };
  } else {
    alert("Install MetaMask or use a web3 wallet.");
  }
};