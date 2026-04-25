import {
  ScrollArea,
  Drawer,
  Portal,
  Button,
  Box,
  useBreakpointValue,
} from "@chakra-ui/react";
import ConversationSelect from "./ConversationSelect";
import React, { useEffect, useMemo, useState } from "react";

const ScrollAreaComp = (props) => {
  const [conversationPartnerIds, setConversationPartnerIds] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [conversationPartners, setConversationPartners] = useState([]);
  const [unreadConversations, setUnreadConversations] = useState(new Set());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // true na mobitelima i tabletima, false na širokim ekranima
  const isMobileOrTablet = useBreakpointValue({ base: true, lg: false });

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

      setConversations((prevConversations) => {
        return prevConversations.map((conv) => {
          const isThisConversation =
            (conv.user1_Id === message.senderId &&
              conv.user2_Id === message.receiverId) ||
            (conv.user1_Id === message.receiverId &&
              conv.user2_Id === message.senderId);

          if (isThisConversation) {
            if (
              message.senderId !== currentUserId &&
              message.senderId !== currentChatUserId
            ) {
              setUnreadConversations(
                (prev) => new Set([...prev, message.senderId]),
              );
            }

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

  // ukloni notifikaciju kada se otvori konverzacija
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

  const closeDrawerIfMobile = () => {
    if (isMobileOrTablet) {
      setIsDrawerOpen(false);
    }
  };

  const sortedConversations = useMemo(() => {
    return [...conversations].sort(
      (a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated),
    );
  }, [conversations]);

  const renderConversationList = (height = "100vh") => (
    <ScrollArea.Root
      height={height}
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
          {sortedConversations.map((conversation) => {
            const partner = conversationPartners.find(
              (p) =>
                p.id === conversation.user1_Id ||
                p.id === conversation.user2_Id,
            );
            if (!partner) return null;

            return (
              <Box key={partner.id} onClick={closeDrawerIfMobile}>
                <ConversationSelect
                  photoUrl={partner.profilePictureUrl}
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
              </Box>
            );
          })}
        </ScrollArea.Content>
      </ScrollArea.Viewport>
    </ScrollArea.Root>
  );

  // Široki ekrani
  if (!isMobileOrTablet) {
    return renderConversationList("100vh");
  }

  // mobitel i tablet: Drawer
  return (
    <>
      <Button
        size="sm"
        variant="solid"
        onClick={() => setIsDrawerOpen(true)}
        mb={2}
        px={4}
        borderRadius="full"
        bg="blue.600"
        color="white"
        fontWeight="700"
        letterSpacing="0.2px"
        boxShadow="sm"
        _hover={{
          bg: "blue.500",
          boxShadow: "md",
        }}
        _active={{ bg: "blue.700", transform: "scale(0.98)" }}
        _focusVisible={{ boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.6)" }}
      >
        Chats
      </Button>

      <Drawer.Root
        open={isDrawerOpen}
        onOpenChange={(details) => setIsDrawerOpen(details.open)}
        placement="start"
        closeOnInteractOutside={true}
        closeOnEscape={true}
      >
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content
              maxW={{ base: "80vw", sm: "74vw", md: "66vw" }}
              onPointerDownOutside={() => setIsDrawerOpen(false)}
            >
              <Drawer.Header>
                <Drawer.Title>Chats</Drawer.Title>
              </Drawer.Header>
              <Drawer.CloseTrigger />
              <Drawer.Body p={0}>{renderConversationList("100%")}</Drawer.Body>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </>
  );
};

export default ScrollAreaComp;
