<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Multi-TWS Audio Sender</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<button class="theme-toggle" onclick="toggleTheme()">🌙 / ☀️</button>

<h1>🎙️ Multi-TWS Audio Sender</h1>
<p style="opacity:0.8;margin-bottom:15px;">Broadcast system audio to connected receivers</p>

<div class="card">
  <button id="startBtn">🚀 Start Sending Audio</button>
  <div id="otpDisplay">
    <span id="otp">🔑 OTP: —</span>
  </div>
  <p id="status">Status: Idle</p>
</div>

<script>
const ffmpegPath = require('ffmpeg-static');
const { spawn } = require('child_process');
const WS = require('ws');

const AUTH_SERVER = "https://multi-tws-audio-stream.onrender.com";
const WS_SERVER = "wss://multi-tws-audio-backend.onrender.com";

const otpEl = document.getElementById("otp");
const statusEl = document.getElementById("status");
let ffmpeg;

async function generateOtp() {
  try {
    const res = await fetch(`${AUTH_SERVER}/api/auth/generate`, { method: "POST" });
    const data = await res.json();
    otpEl.innerText = `🔑 OTP: ${data.code}`;
    otpEl.style.color = "#ffea00";
    return data.code;
  } catch (err) {
    statusEl.innerText = "❌ Failed to generate OTP";
    throw err;
  }
}

async function startSender() {
  const code = await generateOtp();
  const ws = new WS(WS_SERVER);
  ws.binaryType = "arraybuffer";

  ws.onopen = () => {
    statusEl.innerText = `✅ Connected | Streaming audio...`;
    ws.send(JSON.stringify({ type: "register_sender", code }));

    ffmpeg = spawn(ffmpegPath, [
      "-f", "dshow",
      "-i", "audio=Stereo Mix (Realtek(R) Audio)",
      "-ac", "1",
      "-ar", "44100",
      "-c:a", "aac",
      "-b:a", "128k",
      "-f", "adts",
      "-"
    ]);

    ffmpeg.stdout.on("data", chunk => {
      if (ws.readyState === WS.OPEN) ws.send(chunk);
    });
    ffmpeg.stderr.on("data", data => console.log("FFmpeg:", data.toString()));
  };

  ws.onclose = () => {
    statusEl.innerText = "❌ WebSocket disconnected";
    if (ffmpeg) ffmpeg.kill();
  };
  ws.onerror = (err) => {
    console.error(err);
    statusEl.innerText = "⚠️ WebSocket error";
    if (ffmpeg) ffmpeg.kill();
  };
}
document.getElementById("startBtn").onclick = startSender;
function toggleTheme(){ document.body.classList.toggle("dark"); }
</script>
</body>
</html>
