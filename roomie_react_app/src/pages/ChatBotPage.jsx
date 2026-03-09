import { Box } from "@chakra-ui/react";
import { useState } from "react";

// Stranica za chatbot koji ispituje korisnika o njegovom lifestyleu
// zasad samo skeleton

const ChatBotPage = () => {
  const [message, setMessage] = useState("");
  const [chatBotResponse, setChatBotResponse] = useState([]);

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
      return data;
    } catch (error) {
      console.error("Error responding to chatbot: ", error);
      setChatBotResponse([]);
      return null;
    }
  };

  return <Box></Box>;
};

export default ChatBotPage;
