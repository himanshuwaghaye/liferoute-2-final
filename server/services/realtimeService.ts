import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";

export interface RealtimeMessage {
  event: string;
  payload: unknown;
}

export class RealtimeHub {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();

  init(server: Server) {
    this.wss = new WebSocketServer({ server, path: "/api/realtime" });

    this.wss.on("connection", (ws: WebSocket) => {
      this.clients.add(ws);

      ws.on("message", (raw: string) => {
        try {
          const message = JSON.parse(raw.toString()) as RealtimeMessage;
          // Echo / broadcast message to all listening peers
          this.broadcast(message.event, message.payload, ws);
        } catch (err) {
          console.error("Malformed WebSocket message:", err);
        }
      });

      ws.on("close", () => {
        this.clients.delete(ws);
      });

      // Send initial connection handshake
      ws.send(
        JSON.stringify({ event: "connected", payload: { timestamp: new Date().toISOString() } }),
      );
    });
  }

  broadcast(event: string, payload: unknown, excludeSender?: WebSocket) {
    const payloadStr = JSON.stringify({ event, payload });
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN && client !== excludeSender) {
        client.send(payloadStr);
      }
    }
  }
}

export const realtimeHub = new RealtimeHub();
