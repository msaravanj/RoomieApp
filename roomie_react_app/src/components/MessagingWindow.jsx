import { Box, HStack, Avatar, Text, ScrollArea, Input } from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import { sendMessage } from "../services/websocket.js";
import { useSearchParams } from "react-router-dom";

const MessagingWindow = (props) => {
  const currentUserId = Number(localStorage.getItem("userId"));

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversation, setConversation] = useState(null);
  const [receiver, setReceiver] = useState(null);

  const scrollAreaRef = useRef(null);

  const updateConversation = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/conversations", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          id: conversation.id,
          user1_Id: conversation.user1_Id,
          user2_Id: conversation.user2_Id,
          lastMessageContent: message,
          lastUpdated: new Date(),
        }),
      });
      if (!response.ok) {
        console.error("Failed to update conversation: ", response.status);
        return;
      }
    } catch (error) {
      console.error("Error updating conversation: ", error);
    }
  };

  useEffect(() => {
    if (searchParams.get("id") > 0) {
      (async () => {
        try {
          const response = await fetch(
            `http://localhost:8080/api/users/${searchParams.get("id")}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            },
          );
          if (!response.ok) {
            console.error("Failed to fetch user data: ", response.status);
            setSearchParams("");
            return;
          }
          const userData = await response.json();
          setReceiver(userData);
          console.log("Fetched user data for userId - ", userData.id);
        } catch (error) {
          console.error("Error fetching user data: ", error);
        }
      })();
    }
  }, [searchParams]);

  // LOAD history iz baze
  useEffect(() => {
    let isMounted = true;
    let otherUserId = searchParams.get("id");

    if (otherUserId > 0) {
      (async () => {
        try {
          const response = await fetch(
            `http://localhost:8080/api/conversations/users/${localStorage.getItem("userId")}/${otherUserId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            },
          );
          if (!response.ok) {
            console.error(
              "Failed to fetch conversation for users: ",
              response.status,
            );
            setSearchParams("");
            return;
          }
          const conversation = await response.json();
          if (!isMounted) return;
          setConversation(conversation);
          const res = await fetch(
            `http://localhost:8080/api/messages/conversation/${conversation.id}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            },
          );

          if (!res.ok) {
            console.error(
              "Failed to fetch messages for conversation: ",
              res.status,
            );
            setSearchParams("");
            return;
          }
          const messages = await res.json();
          if (isMounted && messages) {
            setMessages(messages);
            console.log("Fetched messages for userId - ", otherUserId);
          }
        } catch (error) {
          console.error("Error fetching conversation or messages: ", error);
          setSearchParams("");
        }
      })();
    } else {
      setMessages([]);
      setSearchParams("");
    }

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  // LISTEN real-time
  useEffect(() => {
    if (searchParams.get("id") > 0) {
      const userId = Number(searchParams.get("id"));

      const handler = (event) => {
        const msg = event.detail;
        console.log("[MessagingWindow] Received chat-message event:", msg);

        if (msg.senderId === userId || msg.receiverId === userId) {
          // Provjeri da poruka već ne postoji (izbjegni duplikate)
          setMessages((prev) => {
            const exists = prev.some(
              (m) =>
                m.content === msg.content &&
                m.senderId === msg.senderId &&
                Math.abs(new Date(m.timestamp) - new Date(msg.timestamp)) <
                  2000,
            );
            if (exists) {
              return prev;
            }
            return [...prev, msg];
          });
        } else {
          console.log("[MessagingWindow] Message does not pass filter");
        }
      };

      window.addEventListener("chat-message", handler);

      return () => window.removeEventListener("chat-message", handler);
    } else {
      console.log("No userId in search params");
      return;
    }
  }, [searchParams]);

  // autoscroll
  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector(
        '[data-part="viewport"]',
      );
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages]);

  // SEND message
  const handleSendMessage = () => {
    if (!receiver || !message.trim()) return;

    const msgObj = {
      conversationId: conversation.id,
      senderId: currentUserId,
      receiverId: Number(searchParams.get("id")),
      content: message,
      timestamp: new Date(),
      isRead: false,
    };

    // odmah UI update
    setMessages((prev) => [...prev, { ...msgObj, id: Date.now() }]);

    sendMessage(msgObj); // ide u Spring + DB
    updateConversation();

    window.dispatchEvent(new CustomEvent("chat-message", { detail: msgObj }));
    setMessage("");
  };

  const handleEnterPress = (e) => {
    if (e.key === "Enter") handleSendMessage();
  };

  return (
    <Box
      maxW="100%"
      height="100%"
      minH="100vh"
      display="flex"
      flexDirection="column"
      overflow="hidden"
      pb={{ base: "7rem", lg: "0" }}
    >
      {receiver && (
        <HStack gap="8" bg="gray.800" padding="4" flexShrink="0">
          <Avatar.Root>
            <Avatar.Fallback name={receiver.name + " " + receiver.lastName} />
            <Avatar.Image src={receiver.profilePictureUrl} />
          </Avatar.Root>
          <Text fontWeight="medium">
            {receiver.name + " " + receiver.lastName}
          </Text>
        </HStack>
      )}

      <ScrollArea.Root padding="4" ref={scrollAreaRef} flex="1" minH="0">
        <ScrollArea.Viewport style={{ height: "100%" }}>
          <ScrollArea.Content pb={receiver ? "80px" : "2"}>
            {messages.map((msg) => (
              <Box
                key={msg.id}
                display="flex"
                justifyContent={
                  msg.senderId === currentUserId ? "flex-end" : "flex-start"
                }
                marginBottom="2"
                alignItems="flex-end"
                gap="2"
                onMouseEnter={() => setHoveredMessageId(msg.id)}
                onMouseLeave={() => setHoveredMessageId(null)}
              >
                <Box position="relative">
                  <Text
                    padding="2"
                    bg={
                      msg.senderId === currentUserId ? "blue.600" : "gray.700"
                    }
                    borderRadius="md"
                    width="fit-content"
                    wordBreak="break-word"
                  >
                    {msg.content}
                  </Text>
                  {hoveredMessageId === msg.id && msg.timestamp && (
                    <Text
                      position="absolute"
                      fontSize="xs"
                      color="gray.400"
                      whiteSpace="nowrap"
                      bottom="-5"
                      zIndex="1000"
                      right={msg.senderId === currentUserId ? "0" : "auto"}
                      left={msg.senderId === currentUserId ? "auto" : "0"}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString("hr-HR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  )}
                </Box>
              </Box>
            ))}
          </ScrollArea.Content>
        </ScrollArea.Viewport>
      </ScrollArea.Root>

      {receiver && (
        <Box p="4" pt="0" flexShrink="0">
          <Input
            borderRadius="100rem"
            placeholder="Upiši poruku..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleEnterPress}
          />
        </Box>
      )}
    </Box>
  );
};

export default MessagingWindow;
