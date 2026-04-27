import {
  Box,
  Dialog,
  Portal,
  Text,
  Flex,
  HStack,
  Heading,
  Avatar,
  Button,
  CloseButton,
  Image,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  LuMapPin,
  LuReceiptEuro,
  LuUsers,
  LuHouse,
  LuCalendar,
  LuCigarette,
  LuMessageCircleMore,
} from "react-icons/lu";
import { MdOutlineBedroomParent, MdOutlinePets } from "react-icons/md";
import { GiCardRandom } from "react-icons/gi";
import { IoMaleFemale } from "react-icons/io5";
import CarouselComp from "./CarouselComp";
import { Link } from "react-router-dom";

const OverlayCard = ({
  room,
  photos,
  matching,
  open,
  onOpenChange,
  openMapDialog,
}) => {
  const [user, setUser] = useState(null);
  const [lifestyleProfile, setLifestyleProfile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const formatMatchingScore = (score) => {
    const numericScore = Number(score);

    if (!Number.isFinite(numericScore)) {
      return score;
    }

    const percentage = numericScore <= 1 ? numericScore * 100 : numericScore;
    return `${Math.round(percentage)}%`;
  };

  const findLifestyleProfile = async (userId) => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/lifestyle-profiles/" + userId,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      const data = await response.json();

      return data;
    } catch (error) {
      console.error("Error fetching lifestyle profile:", error);
    }
  };

  const findUser = async (userId) => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/users/" + userId,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  useEffect(() => {
    if (!open || !room?.userId) return;

    let isActive = true;

    setUser(null);
    setLifestyleProfile(null);

    findUser(room.userId).then((userData) => {
      if (!isActive || !userData) return;

      setUser(userData);

      if (!userData.lifestyleProfileId) return;

      findLifestyleProfile(userData.lifestyleProfileId).then((profileData) => {
        if (!isActive) return;
        setLifestyleProfile(profileData);
      });
    });

    return () => {
      isActive = false;
    };
  }, [open, room?.userId]);

  return (
    <Dialog.Root
      size="xl"
      placement="center"
      open={open}
      onOpenChange={onOpenChange}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            width="min(94vw, 960px)"
            borderRadius="2xl"
            overflow="hidden"
          >
            <Dialog.Body p={{ base: 4, md: 6 }} maxH="85vh" overflowY="auto">
              <Dialog.Title
                fontSize={{ base: "2xl", md: "3xl" }}
                fontWeight="bold"
              >
                {room?.name}
              </Dialog.Title>
              <Flex direction="column" gap="5" marginTop="6" fontSize="md">
                {room?.description && (
                  <Text color="fg.muted" lineHeight="tall">
                    {room.description}
                  </Text>
                )}

                <Box
                  borderWidth="1px"
                  borderColor="border.muted"
                  borderRadius="xl"
                  p={{ base: 4, md: 5 }}
                >
                  <Heading size="md" mb="4">
                    O ovoj nekretnini
                  </Heading>
                  <Flex direction="column" gap="3">
                    {room?.address && room?.city && (
                      <HStack gap="2" align="center">
                        <LuMapPin />
                        <Text
                          as="span"
                          onClick={openMapDialog}
                          cursor="pointer"
                          textDecoration="underline"
                          textUnderlineOffset="3px"
                        >
                          {room?.address}, {room?.city}
                        </Text>
                      </HStack>
                    )}
                    {room?.capacity && (
                      <HStack gap="2" align="center">
                        <LuUsers />
                        <Text>{room.capacity} cimera kapacitet</Text>
                      </HStack>
                    )}
                    {room?.pricePerMonth && (
                      <HStack gap="2" align="center">
                        <LuReceiptEuro />
                        <Text>{room.pricePerMonth}€ po osobi</Text>
                      </HStack>
                    )}
                    {room?.numberOfRooms && (
                      <HStack gap="2" align="center">
                        <MdOutlineBedroomParent />
                        <Text>{room.numberOfRooms} soba/sobe</Text>
                      </HStack>
                    )}
                    {room?.sizeM2 && (
                      <HStack gap="2" align="center">
                        <LuHouse />
                        <Text>{room.sizeM2} m² veličina apartmana</Text>
                      </HStack>
                    )}
                    {room?.isPetFriendly && (
                      <HStack gap="2" align="center">
                        <MdOutlinePets />
                        <Text>Dozvoljeni ljubimci</Text>
                      </HStack>
                    )}
                    {room?.availableFrom && (
                      <HStack gap="2" align="center">
                        <LuCalendar />
                        <Text>
                          Dostupno od:{" "}
                          {new Date(room.availableFrom).toLocaleDateString()}
                          {room?.availableTo &&
                            ` - ${new Date(room.availableTo).toLocaleDateString()}`}
                        </Text>
                      </HStack>
                    )}
                  </Flex>
                </Box>

                <Box
                  borderWidth="1px"
                  borderColor="border.muted"
                  borderRadius="xl"
                  p={{ base: 4, md: 5 }}
                >
                  <Heading size="md" mb="4">
                    Informacije o cimeru
                  </Heading>
                  {user && (
                    <Flex direction="column" justifyContent="center" gap="4">
                      <HStack gap="4" align="center" marginBottom="2">
                        <Avatar.Root
                          size="2xl"
                          key="user"
                          cursor={
                            user.profilePictureUrl ? "pointer" : "default"
                          }
                          onClick={() =>
                            user.profilePictureUrl &&
                            setSelectedImage(user.profilePictureUrl)
                          }
                        >
                          <Avatar.Fallback
                            name={`${user.name} ${user.lastName}`}
                          />
                          <Avatar.Image src={user.profilePictureUrl} />
                        </Avatar.Root>
                        <Text fontSize="lg" fontWeight="medium">
                          {user.name} {user.lastName},{"  "}
                          {new Date().getFullYear() - user.yob}
                        </Text>
                      </HStack>
                      <HStack gap="2" align="center">
                        <IoMaleFemale />
                        <Text>{user.gender}</Text>
                      </HStack>
                      {matching?.score !== undefined &&
                        matching?.score !== null && (
                          <HStack gap="2" align="center">
                            <Text fontWeight="medium" color="green.500">
                              Roomie podudaranje:
                            </Text>
                            <Text fontWeight="bold" color="green.500">
                              {formatMatchingScore(matching.score)}
                            </Text>
                          </HStack>
                        )}
                      {lifestyleProfile && (
                        <Flex
                          direction="column"
                          justifyContent="center"
                          gap="4"
                        >
                          <HStack gap="2" align="center">
                            <LuCigarette />
                            <Text>
                              {lifestyleProfile.isSmoker ? "Pušač" : "Nepušač"}
                            </Text>
                          </HStack>
                          <HStack gap="2" align="center">
                            <GiCardRandom />
                            <Text>{lifestyleProfile.hobbies}</Text>
                          </HStack>
                        </Flex>
                      )}
                      <Button
                        variant="outline"
                        marginTop="2"
                        colorPalette="green"
                        maxW="10rem"
                        as={Link}
                        to={`/chat?id=${user.id}`}
                      >
                        <LuMessageCircleMore /> Pošalji poruku
                      </Button>
                    </Flex>
                  )}
                </Box>

                {photos?.length && (
                  <Box marginTop="2" width="100%">
                    <CarouselComp photos={photos} />
                  </Box>
                )}
              </Flex>

              {selectedImage && (
                <Box
                  position="fixed"
                  inset={0}
                  bg="blackAlpha.800"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  zIndex={3000}
                  p={4}
                  onClick={() => setSelectedImage(null)}
                >
                  <Image
                    src={selectedImage}
                    alt="Uvećana profilna fotografija"
                    maxW="90vw"
                    maxH="85vh"
                    borderRadius="lg"
                    onClick={(e) => e.stopPropagation()}
                  />
                </Box>
              )}
            </Dialog.Body>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="md" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default OverlayCard;
