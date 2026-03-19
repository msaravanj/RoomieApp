import { Box, Input, ScrollArea } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import SplitText from "gsap/SplitText";
import { useNavigate } from "react-router-dom";

gsap.registerPlugin(SplitText);

// Stranica za chatbot koji ispituje korisnika o njegovom lifestyleu

const ChatBotPage = () => {
  const [message, setMessage] = useState("");
  const [chatBotResponse, setChatBotResponse] = useState([]);
  const [convMessages, setConvMessages] = useState([]);
  const hasStartedRef = useRef(false);

  const scrollAreaRef = useRef(null);
  const lastBotMsgRef = useRef(null);
  const lastAnimatedIndexRef = useRef(-1);
  const splitTextRef = useRef(null);

  const navigate = useNavigate();

  // Pronađi index zadnje chatbot poruke
  const getLastBotMessageIndex = () => {
    for (let i = convMessages.length - 1; i >= 0; i--) {
      if (convMessages[i].sender === "chatbot") {
        return i;
      }
    }
    return -1;
  };

  useGSAP(() => {
    const lastBotIndex = getLastBotMessageIndex();
    // Animiraj samo ako je ovo nova poruka (index se promijenio)
    if (
      lastBotMsgRef.current &&
      lastBotIndex !== -1 &&
      lastBotIndex !== lastAnimatedIndexRef.current
    ) {
      if (splitTextRef.current) {
        splitTextRef.current.revert();
      }

      lastAnimatedIndexRef.current = lastBotIndex;
      const splitText = new SplitText(lastBotMsgRef.current, {
        type: "words,chars",
      });
      splitTextRef.current = splitText;

      gsap.set(splitText.words, {
        display: "inline-block",
        whiteSpace: "nowrap",
      });

      gsap.fromTo(
        splitText.chars,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.05,
          stagger: 0.05,
        },
      );
    }
  }, [convMessages]);

  useEffect(() => {
    return () => {
      if (splitTextRef.current) {
        splitTextRef.current.revert();
      }
    };
  }, []);

  const handleSendMessage = () => {
    if (message.trim() === "") return;
    setConvMessages((prev) => [
      ...prev,
      { message: message, sender: localStorage.getItem("userId") },
    ]);
    respondToChatBot().then(() => setMessage(""));
  };

  const handleEnterPress = (e) => {
    if (e.key === "Enter") handleSendMessage();
  };

  const startChatBot = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/chat/start", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        console.error("Failed to start chatbot: ", response.status);
        return;
      }

      const data = await response.json();
      let initialText =
        "Bok! Kako bi tvoj pronalazak cimera bio što uspješniji, molim te da mi iskreno odgovoriš na nekoliko pitanja o tvom životnom stilu - to će pomoći da te povežem s najboljim mogućim cimerom. Prvo pitanje: ";
      setChatBotResponse(data);
      setConvMessages((prev) => [
        ...prev,
        { message: initialText + data.question, sender: "chatbot" },
      ]);
      return data;
    } catch (error) {
      console.error("Error starting chatbot: ", error);
      setChatBotResponse([]);
      return null;
    }
  };

  const respondToChatBot = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/chat/answer", {
        body: JSON.stringify({
          sessionId: chatBotResponse.sessionId,
          answer: message,
        }),
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        console.error("Failed to respond to chatbot: ", response.status);
        return;
      }

      const data = await response.json();
      setChatBotResponse(data);
      setConvMessages((prev) => [
        ...prev,
        {
          message: data.error
            ? data.error + " " + data.question
            : data.question,
          sender: "chatbot",
        },
      ]);

      if (data.finished) {
        setTimeout(() => {
          navigate("/rooms");
        }, 3000);
      }
      return data;
    } catch (error) {
      console.error("Error responding to chatbot: ", error);
      setChatBotResponse([]);
      return null;
    }
  };

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    startChatBot();
  }, []);

  // autoscroll
  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector(
        '[data-part="viewport"]',
      );
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    }
  }, [convMessages]);

  return (
    <Box position="relative" width="100%" height="100vh" padding="4">
      <Box
        id="chat-window"
        justifySelf="center"
        height="70vh"
        width={{ base: "95%", md: "50%" }}
        marginTop="2rem"
      >
        <ScrollArea.Root padding="4" ref={scrollAreaRef}>
          <ScrollArea.Viewport>
            <ScrollArea.Content>
              {convMessages.map((msg, index) =>
                msg.sender === "chatbot" ? (
                  <Box
                    key={`bot-${index}`}
                    marginTop="2rem"
                    whiteSpace="normal"
                    wordBreak="keep-all"
                    overflowWrap="normal"
                    ref={
                      index === getLastBotMessageIndex() ? lastBotMsgRef : null
                    }
                  >
                    {msg.message}
                  </Box>
                ) : (
                  <Box
                    key={`user-${index}`}
                    marginTop="2rem"
                    padding="1rem"
                    borderRadius="1rem"
                    bg="gray.700"
                    textAlign="right"
                    whiteSpace="normal"
                    wordBreak="keep-all"
                    overflowWrap="normal"
                  >
                    {msg.message}
                  </Box>
                ),
              )}
            </ScrollArea.Content>
          </ScrollArea.Viewport>
        </ScrollArea.Root>
      </Box>
      <Box
        position="absolute"
        bottom="20"
        justifySelf="center"
        width={{ base: "95%", md: "65%" }}
      >
        <Input
          borderRadius="100rem"
          placeholder="Odgovori na pitanje..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleEnterPress}
        />
      </Box>
    </Box>
  );
};

export default ChatBotPage;
