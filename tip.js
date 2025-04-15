const urlParams = new URLSearchParams(window.location.search);
const recipient = urlParams.get('to');
document.getElementById("recipient").innerText = recipient;

document.getElementById("sendTipBtn").onclick = async () => {
  const amount = document.getElementById("amount").value;
  if (!window.ethereum) return alert("No wallet found");
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  try {
    const tx = await signer.sendTransaction({
      to: recipient,
      value: ethers.utils.parseEther(amount)
    });
    document.getElementById("status").innerText = "Sent! Tx: " + tx.hash;
  } catch (err) {
    document.getElementById("status").innerText = "Error: " + err.message;
  }
};