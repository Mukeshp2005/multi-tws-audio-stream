"MULTI TWS AUDIO STREAMING SYSTEM"
Multi-TWS is a cross-platform audio streaming system that captures system audio from a Windows laptop and streams it to multiple smartphones or devices simultaneously. Users can listen via a browser—no app installation required.

🚀 Features

OTP-secured streaming: Connects receivers with a unique 6-digit code.

Browser-based mobile receiver: Listen to streams without installing any app.

Unlimited listeners: Bypasses Bluetooth’s 1–2 device limitation.

Cross-platform support: Streams from Windows laptops to Android/iOS devices.

Real-time audio: Uses FFmpeg to capture system audio and Node.js backend to relay streams.

🧩 Technology Stack

Backend: Node.js, WebSocket, FFmpeg

Frontend: HTML, JS (receiver), Electron (desktop sender)

Streaming: Real-time audio chunks over WebSocket

Security: OTP authentication

⚙️ How It Works

Sender (Laptop/PC):

Captures system audio using FFmpeg via Stereo Mix.

Streams audio chunks over WebSocket.

Generates OTP codes for secure receiver connections.

Receiver (Mobile/Browser):

Opens a browser and enters the 6-digit OTP.

Connects to the WebSocket server.

Plays the received audio in real-time using MediaSource API.

Server (Node.js):

Relays audio chunks from sender to all connected receivers.

Ensures low-latency streaming and manages connections.

💻 Project Structure
/Multi-TWS
├─ main.js          # Electron launcher and mode handler
├─ sender.js        # Desktop sender code (capturing & streaming audio)
├─ client.html      # Browser-based receiver
├─ server.js        # Node.js WebSocket server
├─ style.css        # Shared styles for sender & launcher
└─ launcher.html    # Electron app launcher (optional)

📌 Getting Started

Install dependencies:

npm install


Run WebSocket server:

node server.js


Run Electron app:

npm start


Use the app:

Choose Sender → Start streaming → Copy OTP.

On a mobile browser, choose Receiver → Enter OTP → Listen.

⚡ Unique Advantage

Unlike traditional Bluetooth TWS:

Supports unlimited listeners over the internet.

Works cross-platform with zero app installation on mobile.

Secure and real-time streaming for group listening experiences.
