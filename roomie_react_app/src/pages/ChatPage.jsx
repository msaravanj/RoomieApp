import { Box, Flex } from "@chakra-ui/react";
import ConversationsScrollArea from "../components/ConversationsScrollArea";
import React, { useState, useEffect } from "react";
import MessagingWindow from "../components/MessagingWindow";
import { connectWebSocket } from "../services/websocket.js";
import { useSearchParams } from "react-router-dom";

const ChatPage = () => {
  let [searchParams] = useSearchParams();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    connectWebSocket(token, userId, (msg) => {
      console.log("[ChatPage] Received message from WebSocket:", msg);
      console.log("[ChatPage] Dispatching chat-message event");

      // global event → MessagingWindow će ga pokupiti
      window.dispatchEvent(new CustomEvent("chat-message", { detail: msg }));
    });
  }, []);

  return (
    <Flex direction="row" maxH="100vh" width="100%">
      <Box width="25%">
        <ConversationsScrollArea id={searchParams.get("id")} />
      </Box>
      <Box width="75%">
        <MessagingWindow />
      </Box>
    </Flex>
  );
};

export default ChatPage;
