require('electron').app.commandLine.appendSwitch('enable-logging');
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { fork } = require("child_process");
const WebSocket = require("ws");

let mainWindow;

function createLauncher() {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  mainWindow.loadFile(path.join(__dirname, "launcher.html"));
}

function createModeWindow(mode) {
  const win = new BrowserWindow({
    width: 600,
    height: 450,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (mode === "sender")
    win.loadFile(path.join(__dirname, "sender.html"));
  else if (mode === "receiver")
    win.loadFile(path.join(__dirname, "client.html"));
}

app.whenReady().then(() => {
  createLauncher();

  ipcMain.on("launch-mode", (event, mode) => {
    createModeWindow(mode);
  });

  // 🟢 Start Sender (via fork, not spawn)
  ipcMain.handle("start-sender", async () => {
    return new Promise((resolve, reject) => {
      const senderPath = path.join(__dirname, "sender.html");
      console.log("🟩 Launching sender via fork:", senderPath);

      const child = fork(senderPath, {
        cwd: __dirname,
        stdio: ["pipe", "pipe", "pipe", "ipc"],
      });

      const onData = (data) => {
        const text = data.toString();
        console.log("sender.js:", text.trim());
        const m = text.match(/OTP_CODE:(\d{6})/);
        if (m) {
          clearTimeout(timeout);
          resolve(m[1]);
        }
      };

      child.stdout?.on("data", onData);
      child.stderr?.on("data", onData);

      const timeout = setTimeout(() => {
        child.kill();
        reject(new Error("Timeout waiting for OTP"));
      }, 15000);
    });
  });

  // 🟡 Receiver WebSocket
  ipcMain.handle("connect-receiver", async (event, code) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;

    const ws = new WebSocket("wss://multi-tws-audio-backend.onrender.com");
    ws.binaryType = "arraybuffer";

    ws.on("open", () => {
      console.log("✅ Receiver connected to WS");
      win.webContents.send("receiver-status", "✅ Connected to WebSocket");
      ws.send(JSON.stringify({ type: "register_client", code }));
    });

    ws.on("message", (data) => {
      win.webContents.send("receiver-chunk", data);
    });

    ws.on("error", (err) => {
      console.error("Receiver WS error:", err);
      win.webContents.send("receiver-status", "❌ WebSocket error");
    });

    ws.on("close", () => {
      console.log("❌ Receiver disconnected from WS");
      win.webContents.send("receiver-status", "❌ Disconnected");
    });
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createLauncher();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
