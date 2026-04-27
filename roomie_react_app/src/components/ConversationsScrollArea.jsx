import {
  ScrollArea,
  Drawer,
  Portal,
  Button,
  Box,
  useBreakpointValue,
  Input,
  Separator,
  Text,
  Stack,
} from "@chakra-ui/react";
import ConversationSelect from "./ConversationSelect";
import React, { useEffect, useMemo, useState } from "react";

const ScrollAreaComp = (props) => {
  const [conversationPartnerIds, setConversationPartnerIds] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [conversationPartners, setConversationPartners] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
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

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:8080/api/users", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setAllUsers(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("Failed to fetch all users: ", error);
      });
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

  const searchResults = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return [];

    const conversationPartnerIdsSet = new Set(
      conversationPartnerIds.map(Number),
    );
    const currentUserId = Number(localStorage.getItem("userId"));

    return allUsers
      .filter((user) => user.id !== currentUserId)
      .filter((user) => {
        const fullName = `${user.name || ""} ${user.lastName || ""}`
          .trim()
          .toLowerCase();
        return fullName.includes(query);
      })
      .sort((a, b) => {
        const aIsExistingConversation = conversationPartnerIdsSet.has(a.id);
        const bIsExistingConversation = conversationPartnerIdsSet.has(b.id);

        if (aIsExistingConversation !== bIsExistingConversation) {
          return aIsExistingConversation ? -1 : 1;
        }

        const aName = `${a.name || ""} ${a.lastName || ""}`.toLowerCase();
        const bName = `${b.name || ""} ${b.lastName || ""}`.toLowerCase();
        return aName.localeCompare(bName);
      });
  }, [allUsers, searchTerm, conversationPartnerIds]);

  const renderUserResult = (user) => {
    const hasExistingConversation = conversationPartnerIds.includes(user.id);

    return (
      <Box key={user.id} onClick={closeDrawerIfMobile}>
        <ConversationSelect
          photoUrl={user.profilePictureUrl}
          name={user.name + " " + user.lastName}
          userId={user.id}
          lastMessage={
            hasExistingConversation ? "Postojeći razgovor" : "Novi razgovor"
          }
          hasUnread={unreadConversations.has(user.id)}
          onRead={() => {
            setUnreadConversations((prev) => {
              const newSet = new Set(prev);
              newSet.delete(user.id);
              return newSet;
            });
          }}
        />
      </Box>
    );
  };

  const renderConversationList = (height = "100vh") => (
    <Box
      height={height}
      maxW="100%"
      border="1px solid transparent"
      borderColor="gray.700"
    >
      <Box p="4" pb="3">
        <Input
          borderRadius="full"
          placeholder="Pretraži korisnike po imenu i prezimenu..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>

      <ScrollArea.Root
        height={`calc(${height} - 72px)`}
        maxW="100%"
        alignItems="center"
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
            <Stack gap="2" pb="2">
              {searchTerm.trim() && (
                <>
                  <Text
                    px="4"
                    pt="3"
                    fontSize="sm"
                    fontWeight="semibold"
                    color="fg.muted"
                  >
                    Rezultati pretrage
                  </Text>
                  {searchResults.length > 0 ? (
                    searchResults.map((user) => renderUserResult(user))
                  ) : (
                    <Text px="4" pb="2" color="fg.muted" fontSize="sm">
                      Nema korisnika za uneseni pojam.
                    </Text>
                  )}
                </>
              )}

              {searchTerm.trim() && sortedConversations.length > 0 && (
                <Box px="4" pt="2" pb="1">
                  <Separator borderColor="gray.600" />
                </Box>
              )}

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
            </Stack>
          </ScrollArea.Content>
        </ScrollArea.Viewport>
      </ScrollArea.Root>
    </Box>
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
        Poruke
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
            <Drawer.Content maxW={{ base: "80vw", sm: "74vw", md: "66vw" }}>
              <Drawer.Header>
                <Drawer.Title>Poruke</Drawer.Title>
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
