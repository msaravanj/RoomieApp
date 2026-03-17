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
  LuX,
} from "react-icons/lu";
import { MdOutlineBedroomParent, MdOutlinePets } from "react-icons/md";
import { GiCardRandom } from "react-icons/gi";
import { IoMaleFemale } from "react-icons/io5";
import CarouselComp from "./CarouselComp";
import { Link } from "react-router-dom";

const OverlayCard = ({ room, photos, open, onOpenChange }) => {
  const [user, setUser] = useState(null);
  const [lifestyleProfile, setLifestyleProfile] = useState(null);

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
          <Dialog.Content>
            <Dialog.Body>
              <Dialog.Title fontSize="3xl" fontWeight="bold" marginTop="1rem">
                {room?.name}
              </Dialog.Title>
              <Flex direction="column" gap="4" marginTop="3rem" fontSize="md">
                {room?.description && <Text>{room.description}</Text>}
                {room?.address && room?.city && (
                  <HStack gap="2" align="center">
                    <LuMapPin />
                    <Text>
                      {room?.address}, {room?.city}
                    </Text>
                  </HStack>
                )}
                {room?.capacity && (
                  <HStack gap="2" align="center">
                    <LuUsers />
                    <Text>{room.capacity} roommates capacity</Text>
                  </HStack>
                )}
                {room?.pricePerMonth && (
                  <HStack gap="2" align="center">
                    <LuReceiptEuro />
                    <Text>{room.pricePerMonth}€ each</Text>
                  </HStack>
                )}
                {room?.numberOfRooms && (
                  <HStack gap="2" align="center">
                    <MdOutlineBedroomParent />
                    <Text>{room.numberOfRooms} bedroom(s)</Text>
                  </HStack>
                )}
                {room?.sizeM2 && (
                  <HStack gap="2" align="center">
                    <LuHouse />
                    <Text>{room.sizeM2} m² apartment size</Text>
                  </HStack>
                )}
                {room?.isPetFriendly && (
                  <HStack gap="2" align="center">
                    <MdOutlinePets />
                    <Text>Pet friendly</Text>
                  </HStack>
                )}
                {room?.availableFrom && (
                  <HStack gap="2" align="center">
                    <LuCalendar />
                    <Text>
                      Available from:{" "}
                      {new Date(room.availableFrom).toLocaleDateString()}
                      {room?.availableTo &&
                        ` - ${new Date(room.availableTo).toLocaleDateString()}`}
                    </Text>
                  </HStack>
                )}
                <Heading size="xl" marginTop="2rem">
                  Roommate information
                </Heading>
                {user && (
                  <Flex direction="column" justifyContent="center" gap="4">
                    <HStack gap="4" align="center" marginBottom="4">
                      <Avatar.Root size="2xl" key="user">
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
                    {lifestyleProfile && (
                      <Flex direction="column" justifyContent="center" gap="4">
                        <HStack gap="2" align="center">
                          <LuCigarette />
                          <Text>
                            {lifestyleProfile.isSmoker
                              ? "Smoker"
                              : "Non-smoker"}
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
                      marginTop="6"
                      colorPalette="green"
                      maxW="10rem"
                      as={Link}
                      to={`/chat?id=${user.id}`}
                    >
                      <LuMessageCircleMore /> Send message
                    </Button>
                  </Flex>
                )}

                {photos?.length && (
                  <Box margin="2.5rem 0">
                    <CarouselComp photos={photos} />
                  </Box>
                )}
              </Flex>
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
