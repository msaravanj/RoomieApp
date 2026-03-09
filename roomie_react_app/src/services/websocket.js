import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let stompClient = null;

export const connectWebSocket = (token, userId, onMessageReceived) => {
  if (stompClient && stompClient.active) {
    console.log("WebSocket already connected");
    return;
  }

  const socket = new SockJS("http://localhost:8080/ws");

  stompClient = new Client({
    webSocketFactory: () => socket,

    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },

    onConnect: () => {
      console.log("[WebSocket] Connected for user:", userId);

      stompClient.subscribe("/user/queue/messages", (message) => {
        const body = JSON.parse(message.body);
        onMessageReceived(body);
      });
    },

    onStompError: (frame) => {
      console.error("STOMP error:", frame);
    },
  });

  stompClient.activate();
};

export const sendMessage = (message) => {
  stompClient.publish({
    destination: "/app/chat.send",
    body: JSON.stringify(message),
  });
};
