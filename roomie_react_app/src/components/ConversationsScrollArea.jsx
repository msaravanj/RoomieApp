import { ScrollArea } from "@chakra-ui/react";
import ConversationSelect from "./ConversationSelect";
import React, { useEffect, useState } from "react";

const ScrollAreaComp = (props) => {
  const [conversationPartnerIds, setConversationPartnerIds] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [conversationPartners, setConversationPartners] = useState([]);
  const [unreadConversations, setUnreadConversations] = useState(new Set());

  // vraća User objekt s id-om partnera, koji je sugovornik u tom razgovoru
  const fetchConversationPartner = async (partnerId) => {
    await fetch(`http://localhost:8080/api/users/${partnerId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setConversationPartners((prev) => [...prev, data]);
        console.log("Fetched partner - ", partnerId);
      });
  };

  // vraća Conversation objekt sa userId i partnerId
  const fetchConversation = async (otherId) => {
    await fetch(
      `http://localhost:8080/api/conversations/users/${localStorage.getItem("userId")}/${otherId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      },
    )
      .then((res) => res.json())
      .then((data) => {
        setConversations((prev) => [...prev, data]);
        console.log("Fetched conversation for - ", otherId);
      });
  };

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem("token");

    // vraća niz ID-eva svih sugovornika (partnera) s kojima je trenutni user imao razgovor
    fetch("http://localhost:8080/api/conversations/partners", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;

        setConversationPartnerIds(data);
        setConversations([]);
        setConversationPartners([]);

        data.forEach((id) => {
          fetchConversation(id);
          fetchConversationPartner(id);
        });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Osluškuj nove poruke i ažuriraj conversations state
  useEffect(() => {
    const handleNewMessage = (event) => {
      const message = event.detail;
      const currentUserId = Number(localStorage.getItem("userId"));
      const currentChatUserId = Number(props.id); // trenutno otvorena konverzacija

      // Pronađi conversation koji se odnosi na ovu poruku
      setConversations((prevConversations) => {
        return prevConversations.map((conv) => {
          const isThisConversation =
            (conv.user1_Id === message.senderId &&
              conv.user2_Id === message.receiverId) ||
            (conv.user1_Id === message.receiverId &&
              conv.user2_Id === message.senderId);

          if (isThisConversation) {
            // Ako je poruka primljena (senderId nije trenutni user) i nije otvorena ta konverzacija
            if (
              message.senderId !== currentUserId &&
              message.senderId !== currentChatUserId
            ) {
              setUnreadConversations(
                (prev) => new Set([...prev, message.senderId]),
              );
            }

            // Ažuriraj conversation sa novom porukom i vremenom
            return {
              ...conv,
              lastMessageContent: message.content,
              lastUpdated: new Date().toISOString(),
            };
          }
          return conv;
        });
      });
    };

    window.addEventListener("chat-message", handleNewMessage);

    return () => {
      window.removeEventListener("chat-message", handleNewMessage);
    };
  }, [props.id]);

  // Ukloni notifikaciju kada se otvori konverzacija
  useEffect(() => {
    if (props.id) {
      const userId = Number(props.id);
      setUnreadConversations((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  }, [props.id]);

  return (
    <ScrollArea.Root
      height="100vh"
      maxW="100%"
      alignItems="center"
      border="1px solid transparent"
      borderColor="gray.700"
    >
      <ScrollArea.Viewport
        css={{
          "--scroll-shadow-size": "4rem",
          maskImage:
            "linear-gradient(#000,#000,transparent 0,#000 var(--scroll-shadow-size),#000 calc(100% - var(--scroll-shadow-size)),transparent)",
          "&[data-at-top]": {
            maskImage:
              "linear-gradient(180deg,#000 calc(100% - var(--scroll-shadow-size)),transparent)",
          },
          "&[data-at-bottom]": {
            maskImage:
              "linear-gradient(0deg,#000 calc(100% - var(--scroll-shadow-size)),transparent)",
          },
        }}
      >
        <ScrollArea.Content>
          {conversations
            .sort((a, b) => {
              return new Date(b.lastUpdated) - new Date(a.lastUpdated);
            })
            .map((conversation) => {
              const partner = conversationPartners.find(
                (p) =>
                  p.id === conversation.user1_Id ||
                  p.id === conversation.user2_Id,
              );
              if (!partner) return null;
              return (
                <ConversationSelect
                  key={partner.id}
                  photoUrl={partner.photoUrl}
                  name={partner.name + " " + partner.lastName}
                  userId={partner.id}
                  lastMessage={conversation.lastMessageContent}
                  hasUnread={unreadConversations.has(partner.id)}
                  onRead={() => {
                    setUnreadConversations((prev) => {
                      const newSet = new Set(prev);
                      newSet.delete(partner.id);
                      return newSet;
                    });
                  }}
                />
              );
            })}
        </ScrollArea.Content>
      </ScrollArea.Viewport>
    </ScrollArea.Root>
  );
};

export default ScrollAreaComp;
