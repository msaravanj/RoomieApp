import {
  Avatar,
  Badge,
  Box,
  Button,
  CloseButton,
  Dialog,
  Flex,
  Heading,
  HStack,
  Image,
  Input,
  NativeSelect,
  Portal,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  LuCalendar,
  LuHouse,
  LuMapPin,
  LuPencil,
  LuReceiptEuro,
  LuSave,
  LuTrash,
  LuUser,
  LuUsers,
  LuX,
} from "react-icons/lu";
import { MdOutlineBedroomParent, MdOutlinePets } from "react-icons/md";
import { toaster } from "@/components/ui/toaster";
import { getAuthToken } from "@/util/auth";

const infoCardStyles = {
  borderWidth: "1px",
  borderColor: "border.muted",
  borderRadius: "xl",
  p: { base: 4, md: 5 },
};

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
};

const formatDate = (value) => {
  if (!value) return "-";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return parsed.toLocaleDateString();
};

const toInputDateValue = (value) => {
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toISOString().split("T")[0];
};

const buildRoomData = (room) => ({
  id: room?.id ?? null,
  name: room?.name || "",
  description: room?.description || "",
  address: room?.address || "",
  city: room?.city || "",
  pricePerMonth:
    room?.pricePerMonth !== undefined && room?.pricePerMonth !== null
      ? String(room.pricePerMonth)
      : "",
  latitude:
    room?.latitude !== undefined && room?.latitude !== null
      ? String(room.latitude)
      : "",
  longitude:
    room?.longitude !== undefined && room?.longitude !== null
      ? String(room.longitude)
      : "",
  numberOfRooms:
    room?.numberOfRooms !== undefined && room?.numberOfRooms !== null
      ? String(room.numberOfRooms)
      : "",
  capacity:
    room?.capacity !== undefined && room?.capacity !== null
      ? String(room.capacity)
      : "",
  availableFrom: toInputDateValue(room?.availableFrom),
  availableTo: toInputDateValue(room?.availableTo),
  userId:
    room?.userId !== undefined && room?.userId !== null
      ? String(room.userId)
      : "",
  sizeM2:
    room?.sizeM2 !== undefined && room?.sizeM2 !== null
      ? String(room.sizeM2)
      : "",
  isPetFriendly: Boolean(room?.isPetFriendly),
});

export const OverlayRoom = ({
  room,
  open,
  onOpenChange,
  onDeleted,
  onUpdated,
}) => {
  const [currentRoom, setCurrentRoom] = useState(room || null);
  const [roomData, setRoomData] = useState(() => buildRoomData(room));
  const [owner, setOwner] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPhotoDeleting, setIsPhotoDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPhotoConfirmOpen, setIsPhotoConfirmOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState(null);

  const handleInputChange = (field, value) => {
    setRoomData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCancelEdit = () => {
    setRoomData(buildRoomData(currentRoom));
    setIsEditMode(false);
  };

  const handleSaveRoom = async () => {
    if (!roomData?.id || isSaving) {
      return;
    }

    const validateNonNegativeNumber = (value, label) => {
      if (value === "") {
        return null;
      }

      const parsed = Number(value);

      if (!Number.isFinite(parsed)) {
        return `${label} must be a valid number`;
      }

      if (parsed < 0) {
        return `${label} cannot be below 0`;
      }

      return null;
    };

    const numericValidationError =
      validateNonNegativeNumber(roomData.pricePerMonth, "Price per month") ||
      validateNonNegativeNumber(roomData.capacity, "Capacity") ||
      validateNonNegativeNumber(roomData.numberOfRooms, "Number of rooms") ||
      validateNonNegativeNumber(roomData.sizeM2, "Size");

    if (numericValidationError) {
      toaster.create({
        description: numericValidationError,
        type: "error",
      });
      return;
    }

    if (roomData.availableFrom && roomData.availableTo) {
      const fromDate = new Date(roomData.availableFrom);
      const toDate = new Date(roomData.availableTo);

      if (toDate < fromDate) {
        toaster.create({
          description: "Available to date cannot be before available from date",
          type: "error",
        });
        return;
      }
    }

    setIsSaving(true);

    try {
      const payload = {
        id: roomData.id,
        name: roomData.name,
        description: roomData.description,
        address: roomData.address,
        city: roomData.city,
        pricePerMonth:
          roomData.pricePerMonth === "" ? null : Number(roomData.pricePerMonth),
        latitude: roomData.latitude === "" ? null : Number(roomData.latitude),
        longitude:
          roomData.longitude === "" ? null : Number(roomData.longitude),
        numberOfRooms:
          roomData.numberOfRooms === "" ? null : Number(roomData.numberOfRooms),
        capacity: roomData.capacity === "" ? null : Number(roomData.capacity),
        availableFrom: roomData.availableFrom || null,
        availableTo: roomData.availableTo || null,
        userId: roomData.userId === "" ? null : Number(roomData.userId),
        sizeM2: roomData.sizeM2 === "" ? null : Number(roomData.sizeM2),
        isPetFriendly: Boolean(roomData.isPetFriendly),
      };

      const response = await fetch("http://localhost:8080/api/housings", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to update room");
      }

      const updatedRoom = {
        ...(currentRoom || {}),
        ...payload,
      };

      setCurrentRoom(updatedRoom);
      setRoomData(buildRoomData(updatedRoom));
      setIsEditMode(false);

      if (typeof onUpdated === "function") {
        onUpdated(updatedRoom);
      }

      toaster.create({
        description: "Room updated successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error updating room:", error);
      toaster.create({
        description:
          error?.message && error.message !== "[object Object]"
            ? error.message
            : "Failed to update room",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDeleteRoom = async () => {
    if (!room?.id || isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(
        `http://localhost:8080/api/housings/${room.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to delete room");
      }

      toaster.create({
        description: "Room deleted successfully",
        type: "success",
      });

      if (typeof onDeleted === "function") {
        onDeleted(room.id);
      }

      setIsConfirmOpen(false);
      onOpenChange?.({ open: false });
    } catch (error) {
      console.error("Error deleting room:", error);
      toaster.create({
        description:
          error?.message && error.message !== "[object Object]"
            ? error.message
            : "Failed to delete room",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const openPhotoDeleteConfirm = (photo) => {
    setPhotoToDelete(photo || null);
    setIsPhotoConfirmOpen(true);
  };

  const confirmDeletePhoto = async () => {
    const photoId = photoToDelete?.id;

    if (!photoId || isPhotoDeleting) {
      return;
    }

    setIsPhotoDeleting(true);

    try {
      const response = await fetch(
        `http://localhost:8080/api/photos/${photoId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to delete photo");
      }

      setPhotos((prev) => prev.filter((photo) => photo?.id !== photoId));

      if (selectedImage && selectedImage === photoToDelete?.url) {
        setSelectedImage(null);
      }

      toaster.create({
        description: "Photo deleted successfully",
        type: "success",
      });

      setIsPhotoConfirmOpen(false);
      setPhotoToDelete(null);
    } catch (error) {
      console.error("Error deleting photo:", error);
      toaster.create({
        description:
          error?.message && error.message !== "[object Object]"
            ? error.message
            : "Failed to delete photo",
        type: "error",
      });
    } finally {
      setIsPhotoDeleting(false);
    }
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    setCurrentRoom(room || null);
    setRoomData(buildRoomData(room));
    setIsEditMode(false);
  }, [open, room]);

  useEffect(() => {
    if (!open || !currentRoom?.id) {
      setOwner(null);
      setPhotos([]);
      return undefined;
    }

    let isActive = true;

    const fetchOwner = async () => {
      if (!currentRoom?.userId) {
        setOwner(null);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:8080/api/users/${currentRoom.userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        const data = await response.json();

        if (isActive) {
          setOwner(data);
        }
      } catch (error) {
        console.error("Error fetching room owner:", error);
        if (isActive) {
          setOwner(null);
        }
      }
    };

    const fetchPhotos = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/photos/housing/${currentRoom.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        const data = await response.json();

        if (isActive) {
          setPhotos(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error fetching room photos:", error);
        if (isActive) {
          setPhotos([]);
        }
      }
    };

    fetchOwner();
    fetchPhotos();

    return () => {
      isActive = false;
    };
  }, [open, currentRoom?.id, currentRoom?.userId]);

  return (
    <>
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
              width="min(94vw, 900px)"
              borderRadius="2xl"
              overflow="hidden"
            >
              <Dialog.Body p={{ base: 4, md: 6 }} maxH="85vh" overflowY="auto">
                <Dialog.Title
                  fontSize={{ base: "2xl", md: "3xl" }}
                  fontWeight="bold"
                >
                  Room details
                </Dialog.Title>

                <Flex direction="column" gap="5" marginTop="6">
                  <Box {...infoCardStyles}>
                    <Heading size="lg">
                      {formatValue(currentRoom?.name)}
                    </Heading>
                    {currentRoom?.description && (
                      <Text color="fg.muted" mt="2" lineHeight="tall">
                        {currentRoom.description}
                      </Text>
                    )}
                    <HStack gap="2" mt="4" wrap="wrap">
                      <Badge colorPalette="cyan" variant="subtle">
                        ID: {formatValue(currentRoom?.id)}
                      </Badge>
                      <Badge colorPalette="orange" variant="subtle">
                        Owner ID: {formatValue(currentRoom?.userId)}
                      </Badge>
                    </HStack>
                  </Box>

                  <Box {...infoCardStyles}>
                    <Heading size="md" mb="4">
                      Basic information
                    </Heading>
                    <VStack align="stretch" gap="3">
                      {!isEditMode ? (
                        <>
                          <HStack gap="2">
                            <LuMapPin />
                            <Text>
                              Address: {formatValue(currentRoom?.address)},{" "}
                              {formatValue(currentRoom?.city)}
                            </Text>
                          </HStack>
                          <HStack gap="2">
                            <LuUsers />
                            <Text>
                              Capacity: {formatValue(currentRoom?.capacity)}
                            </Text>
                          </HStack>
                          <HStack gap="2">
                            <LuReceiptEuro />
                            <Text>
                              Price per month:{" "}
                              {formatValue(currentRoom?.pricePerMonth)} EUR
                            </Text>
                          </HStack>
                          <HStack gap="2">
                            <MdOutlineBedroomParent />
                            <Text>
                              Number of rooms:{" "}
                              {formatValue(currentRoom?.numberOfRooms)}
                            </Text>
                          </HStack>
                          <HStack gap="2">
                            <LuHouse />
                            <Text>
                              Size: {formatValue(currentRoom?.sizeM2)} m2
                            </Text>
                          </HStack>
                          <HStack gap="2">
                            <MdOutlinePets />
                            <Text>
                              Pet friendly:{" "}
                              {formatValue(currentRoom?.isPetFriendly)}
                            </Text>
                          </HStack>
                          <HStack gap="2">
                            <LuCalendar />
                            <Text>
                              Available:{" "}
                              {formatDate(currentRoom?.availableFrom)} -{" "}
                              {formatDate(currentRoom?.availableTo)}
                            </Text>
                          </HStack>
                        </>
                      ) : (
                        <>
                          <Box>
                            <Text fontSize="sm" color="fg.muted" mb="1">
                              Name
                            </Text>
                            <Input
                              value={roomData.name}
                              onChange={(event) =>
                                handleInputChange("name", event.target.value)
                              }
                              placeholder="Room name"
                            />
                          </Box>
                          <Box>
                            <Text fontSize="sm" color="fg.muted" mb="1">
                              Description
                            </Text>
                            <Textarea
                              value={roomData.description}
                              onChange={(event) =>
                                handleInputChange(
                                  "description",
                                  event.target.value,
                                )
                              }
                              minH="100px"
                            />
                          </Box>
                          <Box>
                            <Text fontSize="sm" color="fg.muted" mb="1">
                              Address
                            </Text>
                            <Input
                              value={roomData.address}
                              onChange={(event) =>
                                handleInputChange("address", event.target.value)
                              }
                              placeholder="Address"
                            />
                          </Box>
                          <Box>
                            <Text fontSize="sm" color="fg.muted" mb="1">
                              City
                            </Text>
                            <Input
                              value={roomData.city}
                              onChange={(event) =>
                                handleInputChange("city", event.target.value)
                              }
                              placeholder="City"
                            />
                          </Box>
                          <Box>
                            <Text fontSize="sm" color="fg.muted" mb="1">
                              Capacity
                            </Text>
                            <Input
                              type="number"
                              min={0}
                              value={roomData.capacity}
                              onChange={(event) =>
                                handleInputChange(
                                  "capacity",
                                  event.target.value,
                                )
                              }
                            />
                          </Box>
                          <Box>
                            <Text fontSize="sm" color="fg.muted" mb="1">
                              Price per month (EUR)
                            </Text>
                            <Input
                              type="number"
                              min={0}
                              value={roomData.pricePerMonth}
                              onChange={(event) =>
                                handleInputChange(
                                  "pricePerMonth",
                                  event.target.value,
                                )
                              }
                            />
                          </Box>
                          <Box>
                            <Text fontSize="sm" color="fg.muted" mb="1">
                              Number of rooms
                            </Text>
                            <Input
                              type="number"
                              min={0}
                              value={roomData.numberOfRooms}
                              onChange={(event) =>
                                handleInputChange(
                                  "numberOfRooms",
                                  event.target.value,
                                )
                              }
                            />
                          </Box>
                          <Box>
                            <Text fontSize="sm" color="fg.muted" mb="1">
                              Size (m2)
                            </Text>
                            <Input
                              type="number"
                              min={0}
                              value={roomData.sizeM2}
                              onChange={(event) =>
                                handleInputChange("sizeM2", event.target.value)
                              }
                            />
                          </Box>
                          <Box>
                            <Text fontSize="sm" color="fg.muted" mb="1">
                              Available from
                            </Text>
                            <Input
                              type="date"
                              value={roomData.availableFrom}
                              onChange={(event) =>
                                handleInputChange(
                                  "availableFrom",
                                  event.target.value,
                                )
                              }
                            />
                          </Box>
                          <Box>
                            <Text fontSize="sm" color="fg.muted" mb="1">
                              Available to
                            </Text>
                            <Input
                              type="date"
                              value={roomData.availableTo}
                              onChange={(event) =>
                                handleInputChange(
                                  "availableTo",
                                  event.target.value,
                                )
                              }
                            />
                          </Box>
                          <Box>
                            <Text fontSize="sm" color="fg.muted" mb="1">
                              Pet friendly
                            </Text>
                            <NativeSelect.Root>
                              <NativeSelect.Field
                                value={
                                  roomData.isPetFriendly ? "true" : "false"
                                }
                                onChange={(event) =>
                                  handleInputChange(
                                    "isPetFriendly",
                                    event.target.value === "true",
                                  )
                                }
                              >
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                              </NativeSelect.Field>
                            </NativeSelect.Root>
                          </Box>
                        </>
                      )}
                    </VStack>

                    <Flex mt="5" justify="flex-end">
                      {!isEditMode ? (
                        <Button
                          variant="outline"
                          onClick={() => setIsEditMode(true)}
                        >
                          <LuPencil /> Edit
                        </Button>
                      ) : (
                        <HStack gap="3">
                          <Button
                            colorPalette="green"
                            onClick={handleSaveRoom}
                            loading={isSaving}
                          >
                            <LuSave /> Save
                          </Button>
                          <Button variant="outline" onClick={handleCancelEdit}>
                            <LuX /> Cancel
                          </Button>
                        </HStack>
                      )}
                    </Flex>
                  </Box>

                  <Box {...infoCardStyles}>
                    <Heading size="md" mb="4">
                      Owner information
                    </Heading>
                    {owner ? (
                      <Flex
                        direction={{ base: "column", md: "row" }}
                        gap="4"
                        align={{ md: "center" }}
                      >
                        <Avatar.Root
                          size="xl"
                          cursor={
                            owner?.profilePictureUrl ? "pointer" : "default"
                          }
                          onClick={() =>
                            owner?.profilePictureUrl &&
                            setSelectedImage(owner.profilePictureUrl)
                          }
                        >
                          <Avatar.Fallback
                            name={`${owner?.name || ""} ${owner?.lastName || ""}`}
                          />
                          <Avatar.Image src={owner?.profilePictureUrl} />
                        </Avatar.Root>
                        <VStack align="start" gap="1">
                          <Text fontWeight="semibold" fontSize="lg">
                            {formatValue(owner?.name)}{" "}
                            {formatValue(owner?.lastName)}
                          </Text>
                          <Text color="fg.muted">
                            {formatValue(owner?.email)}
                          </Text>
                          <Text color="fg.muted">
                            City: {formatValue(owner?.city)}
                          </Text>
                          <Text color="fg.muted">
                            Gender: {formatValue(owner?.gender)}
                          </Text>
                        </VStack>
                      </Flex>
                    ) : (
                      <HStack gap="2">
                        <LuUser />
                        <Text color="fg.muted">
                          Owner details are not available.
                        </Text>
                      </HStack>
                    )}
                  </Box>

                  {photos.length > 0 && (
                    <Box {...infoCardStyles}>
                      <Heading size="md" mb="4">
                        Photos
                      </Heading>
                      <Flex gap="3" wrap="wrap">
                        {photos.map((photo) => (
                          <Box
                            key={photo?.id ?? photo?.url}
                            position="relative"
                            width={{ base: "100%", md: "200px" }}
                          >
                            <Image
                              src={photo?.url}
                              alt="Room photo"
                              width="100%"
                              height="130px"
                              objectFit="cover"
                              borderRadius="md"
                              cursor="pointer"
                              onClick={() =>
                                photo?.url && setSelectedImage(photo.url)
                              }
                            />
                            <Button
                              size="xs"
                              colorPalette="red"
                              position="absolute"
                              top="2"
                              right="2"
                              zIndex="1"
                              onClick={(event) => {
                                event.stopPropagation();
                                openPhotoDeleteConfirm(photo);
                              }}
                              disabled={!photo?.id}
                            >
                              <LuTrash /> Delete
                            </Button>
                          </Box>
                        ))}
                      </Flex>
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
                      alt="Enlarged image"
                      maxW="90vw"
                      maxH="85vh"
                      borderRadius="lg"
                      onClick={(event) => event.stopPropagation()}
                    />
                  </Box>
                )}

                {!isEditMode && (
                  <Flex mt="6" justify="flex-end">
                    <Button
                      colorPalette="red"
                      variant="solid"
                      onClick={() => setIsConfirmOpen(true)}
                      loading={isDeleting}
                    >
                      <LuTrash /> Delete room
                    </Button>
                  </Flex>
                )}
              </Dialog.Body>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="md" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <Dialog.Root
        role="alertdialog"
        open={isConfirmOpen}
        onOpenChange={({ open: nextOpen }) => setIsConfirmOpen(nextOpen)}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="md">
              <Dialog.Header>
                <Dialog.Title>Delete room</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Text>
                  Are you sure you want to delete {currentRoom?.name || "this"}{" "}
                  room?
                </Text>
              </Dialog.Body>
              <Dialog.Footer gap="3">
                <Button
                  variant="outline"
                  onClick={() => setIsConfirmOpen(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  colorPalette="red"
                  onClick={confirmDeleteRoom}
                  loading={isDeleting}
                >
                  Delete
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <Dialog.Root
        role="alertdialog"
        open={isPhotoConfirmOpen}
        onOpenChange={({ open: nextOpen }) => {
          setIsPhotoConfirmOpen(nextOpen);
          if (!nextOpen) {
            setPhotoToDelete(null);
          }
        }}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="md">
              <Dialog.Header>
                <Dialog.Title>Delete photo</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Text>Are you sure you want to delete this photo?</Text>
              </Dialog.Body>
              <Dialog.Footer gap="3">
                <Button
                  variant="outline"
                  onClick={() => setIsPhotoConfirmOpen(false)}
                  disabled={isPhotoDeleting}
                >
                  Cancel
                </Button>
                <Button
                  colorPalette="red"
                  onClick={confirmDeletePhoto}
                  loading={isPhotoDeleting}
                >
                  Delete
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
};

export default OverlayRoom;
