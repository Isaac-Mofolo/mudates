import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "https://mudates.tiguleni.com";

let socket = null;
let currentToken = null;

export function getSocket() {
  return socket;
}

export function initSocket(token) {
  if (!token) return null;

  // If socket exists and token unchanged, reuse it
  if (socket && currentToken === token) return socket;

  // If token changed, reconnect with new token
  if (socket) {
    try { socket.disconnect(); } catch {}
    socket = null;
  }

  currentToken = token;

  socket = io(SOCKET_URL, {
    transports: ["websocket"],
    auth: { token: `Bearer ${token}` },
    reconnection: true,
  });

  socket.on("connect", () => console.log("[socket] ✅ connected", socket.id));
  socket.on("disconnect", (reason) => console.log("[socket] 🔌 disconnected:", reason));
  socket.on("connect_error", (err) => console.error("[socket] ❌ connect_error:", err.message));

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    try { socket.disconnect(); } catch {}
  }
  socket = null;
  currentToken = null;
}
