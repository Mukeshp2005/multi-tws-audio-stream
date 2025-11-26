const joinBtn = document.getElementById("joinBtn");
const codeInput = document.getElementById("codeInput");
const audioPlayer = document.getElementById("audioPlayer");
const statusText = document.getElementById("statusText");
const themeToggle = document.getElementById("themeToggle");

joinBtn.onclick = async () => {
  const code = codeInput.value.trim();
  if (!code) return alert("Please enter the 6-digit code.");

  try {
    statusText.textContent = "🔗 Connecting...";
    const res = await fetch(`http://localhost:3000/api/auth/join?code=${code}`);
    if (!res.ok) throw new Error("Invalid code");

    const { streamUrl } = await res.json();
    if (!streamUrl) throw new Error("Stream URL missing.");

    audioPlayer.src = streamUrl;
    statusText.textContent = "✅ Connected. Audio streaming...";
  } catch (err) {
    console.error("Error:", err);
    statusText.textContent = "❌ Connection failed.";
    alert(err.message);
  }
};

// 🌗 Dark/Light Theme Toggle
themeToggle.onclick = () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  themeToggle.textContent = isDark ? "☀️ Light" : "🌙 Dark";
};
