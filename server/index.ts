import http from "http";
import dotenv from "dotenv";
import { createApp } from "./app.js";
import { realtimeHub } from "./services/realtimeService.js";

dotenv.config();

const PORT = process.env["PORT"] || 3001;
const app = createApp();
const server = http.createServer(app);

// Initialize realtime WebSocket server
realtimeHub.init(server);

server.listen(PORT, () => {
  console.log(`[LifeRoute API] Server listening on http://localhost:${PORT}`);
  console.log(`[LifeRoute Realtime] WebSocket listening on ws://localhost:${PORT}/api/realtime`);
});

export { server, app };
