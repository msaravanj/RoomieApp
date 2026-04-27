import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Flex,
  Heading,
  Input,
  SimpleGrid,
  Spinner,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { OverlayUser } from "@/components/OverlayUser";
import { OverlayRoom } from "@/components/OverlayRoom";
import { getAuthToken } from "@/util/auth";

const apiBaseUrl = "http://localhost:8080/api";

const cardStyles = {
  border: "1px solid",
  borderColor: "whiteAlpha.200",
  bg: "whiteAlpha.50",
  backdropFilter: "blur(14px)",
  borderRadius: "2xl",
  boxShadow: "lg",
};

const emptyCell = "-";

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return emptyCell;
  }

  if (typeof value === "boolean") {
    return value ? "Da" : "Ne";
  }

  return String(value);
};

const formatRoomPrice = (price) => {
  if (price === null || price === undefined || price === "") {
    return emptyCell;
  }

  return `${price} €`;
};

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [roomSearch, setRoomSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserOverlayOpen, setIsUserOverlayOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isRoomOverlayOpen, setIsRoomOverlayOpen] = useState(false);

  useEffect(() => {
    let isActive = true;

    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const token = getAuthToken();
        const requestInit = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        };

        const [usersResponse, roomsResponse] = await Promise.all([
          fetch(`${apiBaseUrl}/users`, requestInit),
          fetch(`${apiBaseUrl}/housings`, requestInit),
        ]);

        if (!usersResponse.ok) {
          throw new Error("Failed to fetch users");
        }

        if (!roomsResponse.ok) {
          throw new Error("Failed to fetch rooms");
        }

        const [usersData, roomsData] = await Promise.all([
          usersResponse.json(),
          roomsResponse.json(),
        ]);

        if (!isActive) return;

        setUsers(Array.isArray(usersData) ? usersData : []);
        setRooms(Array.isArray(roomsData) ? roomsData : []);
      } catch (fetchError) {
        console.error("Greška pri učitavanju admin podataka:", fetchError);
        if (isActive) {
          setError(
            fetchError?.message || "Nije moguće učitati podatke admin panela",
          );
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isActive = false;
    };
  }, []);

  const totalUsers = useMemo(() => users.length, [users]);
  const totalRooms = useMemo(() => rooms.length, [rooms]);
  const userNameById = useMemo(() => {
    const lookup = new Map();

    for (const user of users) {
      if (user?.id === undefined || user?.id === null) {
        continue;
      }

      const fullName = [user?.name, user?.lastName]
        .filter(Boolean)
        .map((value) => String(value))
        .join(" ");

      lookup.set(String(user.id), fullName || formatValue(user?.id));
    }

    return lookup;
  }, [users]);
  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) => {
      const searchValues = [
        user?.name,
        user?.lastName,
        user?.email,
        user?.city,
        user?.gender,
        user?.role,
        user?.userRole,
        user?.id,
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());

      return searchValues.some((value) => value.includes(query));
    });
  }, [users, userSearch]);
  const filteredRooms = useMemo(() => {
    const query = roomSearch.trim().toLowerCase();

    if (!query) {
      return rooms;
    }

    return rooms.filter((room) => {
      const searchValues = [
        room?.name,
        room?.address,
        room?.city,
        room?.description,
        room?.pricePerMonth,
        room?.capacity,
        room?.numberOfRooms,
        users.find((user) => String(user?.id) === String(room?.userId))?.name +
          " " +
          users.find((user) => String(user?.id) === String(room?.userId))
            ?.lastName,
        room?.id,
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());

      return searchValues.some((value) => value.includes(query));
    });
  }, [rooms, roomSearch]);

  const openUserOverlay = (user) => {
    setSelectedUser(user);
    setIsUserOverlayOpen(true);
  };

  const openRoomOverlay = (room) => {
    setSelectedRoom(room);
    setIsRoomOverlayOpen(true);
  };

  const handleUserDeleted = (deletedUserId) => {
    const deletedId = String(deletedUserId);

    setUsers((prevUsers) =>
      prevUsers.filter((user) => String(user?.id) !== deletedId),
    );
    setRooms((prevRooms) =>
      prevRooms.filter((room) => String(room?.userId) !== deletedId),
    );
    setSelectedUser(null);
  };

  const handleUserUpdated = (updatedUser) => {
    if (!updatedUser?.id) {
      return;
    }

    const updatedId = String(updatedUser.id);

    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        String(user?.id) === updatedId ? { ...user, ...updatedUser } : user,
      ),
    );
    setSelectedUser((prevSelected) =>
      String(prevSelected?.id) === updatedId
        ? { ...prevSelected, ...updatedUser }
        : prevSelected,
    );
  };

  const handleRoomDeleted = (deletedRoomId) => {
    const deletedId = String(deletedRoomId);

    setRooms((prevRooms) =>
      prevRooms.filter((room) => String(room?.id) !== deletedId),
    );
    setSelectedRoom(null);
  };

  const handleRoomUpdated = (updatedRoom) => {
    if (!updatedRoom?.id) {
      return;
    }

    const updatedId = String(updatedRoom.id);

    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        String(room?.id) === updatedId ? { ...room, ...updatedRoom } : room,
      ),
    );
    setSelectedRoom((prevSelected) =>
      String(prevSelected?.id) === updatedId
        ? { ...prevSelected, ...updatedRoom }
        : prevSelected,
    );
  };

  return (
    <Box
      minH="100vh"
      px={{ base: 4, md: 8 }}
      py={{ base: 6, md: 10 }}
      bgGradient="linear(to-br, #0f172a 0%, #111827 45%, #1f2937 100%)"
      color="white"
    >
      <Box maxW="7xl" mx="auto">
        <Flex direction="column" gap={3} mb={8}>
          <Badge
            alignSelf="flex-start"
            px={3}
            py={1}
            borderRadius="full"
            colorPalette="cyan"
            variant="subtle"
          >
            Admin Panel
          </Badge>
          <Heading as="h1" size="3xl">
            Administracija Roomie-a
          </Heading>
          <Text maxW="2xl" color="whiteAlpha.800" fontSize="lg">
            Pregled platforme s brzim pristupom korisničkim i sobnim podacima.
          </Text>
        </Flex>

        {loading ? (
          <Flex
            minH="320px"
            align="center"
            justify="center"
            direction="column"
            gap={4}
            {...cardStyles}
          >
            <Spinner size="xl" color="cyan.300" />
            <Text color="whiteAlpha.800">Učitavanje admin podataka...</Text>
          </Flex>
        ) : error ? (
          <Box p={6} {...cardStyles}>
            <Heading as="h2" size="md" mb={2}>
              Nije moguće učitati admin podatke
            </Heading>
            <Text color="red.200">{error}</Text>
          </Box>
        ) : (
          <Tabs.Root defaultValue="dashboard" colorPalette="cyan">
            <Box
              p={2}
              mb={6}
              borderRadius="2xl"
              bg="whiteAlpha.100"
              border="1px solid"
              borderColor="whiteAlpha.200"
            >
              <Tabs.List gap={2} border="none">
                <Tabs.Trigger value="dashboard" px={4} py={3} borderRadius="xl">
                  Nadzorna ploča
                </Tabs.Trigger>
                <Tabs.Trigger value="users" px={4} py={3} borderRadius="xl">
                  Korisnici
                </Tabs.Trigger>
                <Tabs.Trigger value="rooms" px={4} py={3} borderRadius="xl">
                  Sobe
                </Tabs.Trigger>
              </Tabs.List>
            </Box>

            <Tabs.Content value="dashboard">
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                <Box p={6} {...cardStyles}>
                  <Text color="whiteAlpha.700" mb={2}>
                    Ukupno korisnika
                  </Text>
                  <Heading as="p" size="4xl">
                    {totalUsers}
                  </Heading>
                </Box>

                <Box p={6} {...cardStyles}>
                  <Text color="whiteAlpha.700" mb={2}>
                    Ukupno soba
                  </Text>
                  <Heading as="p" size="4xl">
                    {totalRooms}
                  </Heading>
                </Box>
              </SimpleGrid>
            </Tabs.Content>

            <Tabs.Content value="users">
              <Box p={6} overflowX="auto" {...cardStyles}>
                <Heading as="h2" size="lg" mb={4}>
                  Korisnici
                </Heading>
                <Input
                  mb={5}
                  maxW="420px"
                  placeholder="Pretraži po imenu, prezimenu, email..."
                  value={userSearch}
                  onChange={(event) => setUserSearch(event.target.value)}
                  bg="whiteAlpha.100"
                  borderColor="whiteAlpha.300"
                  _placeholder={{ color: "whiteAlpha.500" }}
                />
                <Box as="table" w="full" minW="900px" borderCollapse="collapse">
                  <Box as="thead">
                    <Box
                      as="tr"
                      borderBottom="1px solid"
                      borderColor="whiteAlpha.300"
                    >
                      {[
                        "ID",
                        "Ime",
                        "Prezime",
                        "Email",
                        "Grad",
                        "Spol",
                        "Uloga",
                      ].map((header) => (
                        <Box
                          as="th"
                          key={header}
                          textAlign="left"
                          py={3}
                          pl={4}
                          pr={4}
                          fontSize="sm"
                          color="whiteAlpha.700"
                          fontWeight="semibold"
                        >
                          {header}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                  <Box as="tbody">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <Box
                          as="tr"
                          key={user?.id ?? `${user?.email}-${user?.name}`}
                          borderBottom="1px solid"
                          borderColor="whiteAlpha.100"
                          cursor="pointer"
                          _hover={{ bg: "whiteAlpha.100" }}
                          onClick={() => openUserOverlay(user)}
                        >
                          <Box as="td" py={3} pl={4} pr={4}>
                            {formatValue(user?.id)}
                          </Box>
                          <Box as="td" py={3} pl={4} pr={4}>
                            {formatValue(user?.name)}
                          </Box>
                          <Box as="td" py={3} pl={4} pr={4}>
                            {formatValue(user?.lastName)}
                          </Box>
                          <Box as="td" py={3} pl={4} pr={4}>
                            {formatValue(user?.email)}
                          </Box>
                          <Box as="td" py={3} pl={4} pr={4}>
                            {formatValue(user?.city)}
                          </Box>
                          <Box as="td" py={3} pl={4} pr={4}>
                            {formatValue(user?.gender)}
                          </Box>
                          <Box as="td" py={3} pl={4} pr={4}>
                            <Badge colorPalette="cyan" variant="subtle">
                              {formatValue(user?.role)}
                            </Badge>
                          </Box>
                        </Box>
                      ))
                    ) : (
                      <Box as="tr">
                        <Box as="td" py={5} color="whiteAlpha.700" colSpan={7}>
                          Nema korisnika koji odgovaraju trenutnoj pretrazi.
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            </Tabs.Content>

            <Tabs.Content value="rooms">
              <Box p={6} overflowX="auto" {...cardStyles}>
                <Heading as="h2" size="lg" mb={4}>
                  Sobe
                </Heading>
                <Input
                  mb={5}
                  maxW="420px"
                  placeholder="Pretraži po imenu, adresi, gradu..."
                  value={roomSearch}
                  onChange={(event) => setRoomSearch(event.target.value)}
                  bg="whiteAlpha.100"
                  borderColor="whiteAlpha.300"
                  _placeholder={{ color: "whiteAlpha.500" }}
                />
                <Box
                  as="table"
                  w="full"
                  minW="1100px"
                  borderCollapse="collapse"
                  mx="auto"
                >
                  <Box as="thead">
                    <Box
                      as="tr"
                      borderBottom="1px solid"
                      borderColor="whiteAlpha.300"
                    >
                      {[
                        "ID",
                        "Naziv",
                        "Adresa",
                        "Grad",
                        "Cijena",
                        "Vlasnik",
                        "Kapacitet",
                      ].map((header) => (
                        <Box
                          as="th"
                          key={header}
                          textAlign="left"
                          py={3}
                          pl={4}
                          pr={4}
                          fontSize="sm"
                          color="whiteAlpha.700"
                          fontWeight="semibold"
                        >
                          {header}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                  <Box as="tbody">
                    {filteredRooms.length > 0 ? (
                      filteredRooms.map((room) => (
                        <Box
                          as="tr"
                          key={room?.id ?? `${room?.name}-${room?.address}`}
                          borderBottom="1px solid"
                          borderColor="whiteAlpha.100"
                          cursor="pointer"
                          _hover={{ bg: "whiteAlpha.100" }}
                          onClick={() => openRoomOverlay(room)}
                        >
                          <Box as="td" py={3} pl={4} pr={4}>
                            {formatValue(room?.id)}
                          </Box>
                          <Box as="td" py={3} pl={4} pr={4}>
                            {formatValue(room?.name)}
                          </Box>
                          <Box as="td" py={3} pl={4} pr={4}>
                            {formatValue(room?.address)}
                          </Box>
                          <Box as="td" py={3} pl={4} pr={4}>
                            {formatValue(room?.city)}
                          </Box>
                          <Box as="td" py={3} pl={4} pr={4}>
                            {formatRoomPrice(room?.pricePerMonth)}
                          </Box>
                          <Box as="td" py={3} pl={4} pr={4}>
                            {userNameById.get(String(room?.userId)) ??
                              formatValue(room?.userId)}
                          </Box>
                          <Box as="td" py={3} pl={4} pr={4}>
                            {formatValue(room?.capacity)}
                          </Box>
                        </Box>
                      ))
                    ) : (
                      <Box as="tr">
                        <Box
                          as="td"
                          py={5}
                          pl={4}
                          color="whiteAlpha.700"
                          colSpan={7}
                        >
                          Nema soba koje odgovaraju trenutnoj pretrazi.
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            </Tabs.Content>
          </Tabs.Root>
        )}
        <OverlayUser
          user={selectedUser}
          open={isUserOverlayOpen}
          onDeleted={handleUserDeleted}
          onUpdated={handleUserUpdated}
          onOpenChange={({ open }) => {
            setIsUserOverlayOpen(open);
            if (!open) {
              setSelectedUser(null);
            }
          }}
        />
        <OverlayRoom
          room={selectedRoom}
          open={isRoomOverlayOpen}
          onDeleted={handleRoomDeleted}
          onUpdated={handleRoomUpdated}
          onOpenChange={({ open }) => {
            setIsRoomOverlayOpen(open);
            if (!open) {
              setSelectedRoom(null);
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default AdminPage;
