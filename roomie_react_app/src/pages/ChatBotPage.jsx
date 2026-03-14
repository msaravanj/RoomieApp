import { Box, Input } from "@chakra-ui/react";
import { useEffect, useState } from "react";

// Stranica za chatbot koji ispituje korisnika o njegovom lifestyleu
// zasad samo skeleton

const ChatBotPage = () => {
  const [message, setMessage] = useState("");
  const [chatBotResponse, setChatBotResponse] = useState([]);
  const [convMessages, setConvMessages] = useState([]);

  const handleSendMessage = () => {
    if (message.trim() === "") return;
    setConvMessages((prev) => [...prev, message]);
    respondToChatBot();
    setMessage("");
  };

  const handleEnterPress = (e) => {
    if (e.key === "Enter") handleSendMessage();
  };

  const startChatBot = () => {
    try {
      const response = fetch("http://localhost:8080/api/chat/start", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        console.error("Failed to start chatbot: ", response.status);
        return;
      }

      const data = response.json();
      setChatBotResponse(data);
      return data;
    } catch (error) {
      console.error("Error starting chatbot: ", error);
      setChatBotResponse([]);
      return null;
    }
  };

  const respondToChatBot = () => {
    try {
      const response = fetch("http://localhost:8080/api/chat/answer", {
        body: JSON.stringify({
          sessionId: chatBotResponse.sessionId,
          answer: message,
        }),
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!response.ok) {
        console.error("Failed to respond to chatbot: ", response.status);
        return;
      }

      const data = response.json();
      setChatBotResponse(data);
      setConvMessages((prev) => [...prev, data.question]);
      return data;
    } catch (error) {
      console.error("Error responding to chatbot: ", error);
      setChatBotResponse([]);
      return null;
    }
  };

  useEffect(() => {
    startChatBot();
  }, []);

  return (
    <Box position="relative" width="100%" height="100vh" padding="4">
      <Box id="chat-window">
        {convMessages.map((msg, index) => (
          <Box key={index}>{msg}</Box>
        ))}
      </Box>
      <Box position="absolute" bottom="5" justifySelf="center" width="50%">
        <Input
          borderRadius="100rem"
          placeholder="Answer the question..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleEnterPress}
        />
      </Box>
    </Box>
  );
};

export default ChatBotPage;
