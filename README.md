# Multi TWS Audio Streaming

Stream Windows laptop audio to multiple devices in real-time, each playing through its own TWS earbuds. Secure, simple, and cross-platform.

⚡ Features

Broadcast system audio from Windows to multiple devices.

OTP-based secure connections for receivers.

Real-time streaming using WebSockets.

Interactive UI with audio waveform & bitrate display.

Receivers work on any modern browser.

🛠 Tech Stack

Electron + HTML/JS/CSS → Sender UI

Node.js + WebSocket → Audio relay server

FFmpeg → Audio capture & encoding

🚀 How to Use

Launch the app → select Sender (mobile cannot host).

Click “Start Sending Audio” → OTP is generated.

Receivers: Enter OTP in browser → join stream.

Listen via TWS earbuds on each device.

🔒 Note

Stereo Mix must be enabled on Windows for sending.
