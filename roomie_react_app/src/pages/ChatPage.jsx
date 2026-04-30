import { Box, Flex } from "@chakra-ui/react";
import ConversationsScrollArea from "../components/ConversationsScrollArea";
import React, { useEffect } from "react";
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
    <Flex direction="row" width="100%" height="100vh" overflow="hidden">
      <Box
        width={{ base: "0", lg: "25%" }}
        minW="0"
        overflow="visible"
        flexShrink="0"
      >
        <ConversationsScrollArea id={searchParams.get("id")} />
      </Box>
      <Box width={{ base: "100%", lg: "75%" }} minW="0">
        <MessagingWindow />
      </Box>
    </Flex>
  );
};

export default ChatPage;
