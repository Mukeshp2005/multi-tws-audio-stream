const WebSocket = require("ws");

const PORT = process.env.PORT || 10000;
const wss = new WebSocket.Server({ port: PORT });

// Stores rooms: { [otp_code]: { sender: ws, receivers: Set([ws, ws]) } }
const rooms = {};

wss.on("connection", (ws) => {
  let userCode = null;
  let isSender = false;

  ws.on("message", (data) => {
    try {
      // Try to parse as JSON (Control messages: registration/count)
      const msg = JSON.parse(data);

      if (msg.type === "register_sender") {
        userCode = msg.code;
        isSender = true;
        if (!rooms[userCode]) rooms[userCode] = { sender: null, receivers: new Set() };
        rooms[userCode].sender = ws;
        console.log(`🎙️ Broadcaster linked to code: ${userCode}`);
      }
      else if (msg.type === "register_client") {
        userCode = msg.code;
        isSender = false;
        if (!rooms[userCode]) rooms[userCode] = { sender: null, receivers: new Set() };
        rooms[userCode].receivers.add(ws);
        console.log(`🎧 Listener joined code: ${userCode}`);

        // Notify the Sender of the new count
        updateSenderCount(userCode);
      }
    } catch (e) {
      // If not JSON, it's audio binary data
      if (isSender && userCode && rooms[userCode]) {
        rooms[userCode].receivers.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(data); // Relay audio to listeners
          }
        });
      }
    }
  });

  ws.on("close", () => {
    if (userCode && rooms[userCode]) {
      if (isSender) {
        rooms[userCode].sender = null;
      } else {
        rooms[userCode].receivers.delete(ws);
        updateSenderCount(userCode); // Update sender count when listener leaves
      }
      // Cleanup empty rooms
      if (!rooms[userCode].sender && rooms[userCode].receivers.size === 0) {
        delete rooms[userCode];
      }
    }
  });
});

function updateSenderCount(code) {
  const room = rooms[code];
  if (room && room.sender && room.sender.readyState === WebSocket.OPEN) {
    room.sender.send(JSON.stringify({
      type: "count",
      value: room.receivers.size
    }));
  }
}

console.log(`✅ WebSocket Audio Relay running on port ${PORT}`);
