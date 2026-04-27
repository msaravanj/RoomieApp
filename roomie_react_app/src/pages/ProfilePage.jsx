import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Avatar,
  Button,
  Input,
  InputGroup,
  FileUpload,
  CloseButton,
  Card,
  Heading,
  Text,
  Image,
  Checkbox,
  NativeSelect,
  Dialog,
  Portal,
} from "@chakra-ui/react";
import { LuFileImage, LuPencil, LuSave, LuX, LuPlus } from "react-icons/lu";
import { toaster } from "../components/ui/toaster";
import { getAuthToken } from "../util/auth";
import { Link } from "react-router-dom";
import { getCoords } from "../util/locationService";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [lifestyleProfile, setLifestyleProfile] = useState(null);
  const [room, setRoom] = useState(null);
  const [roomPhotos, setRoomPhotos] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isRoomEditMode, setIsRoomEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    id: null,
    name: "",
    lastName: "",
    description: "",
    email: "",
    gender: "",
    city: "",
    hasAccomodation: false,
    profilePictureUrl: "",
    lifestyleProfileId: null,
    yob: "",
  });
  const [roomData, setRoomData] = useState({
    id: null,
    name: "",
    address: "",
    city: "",
    description: "",
    capacity: null,
    numberOfRooms: null,
    pricePerMonth: "",
    sizeM2: null,
    isPetFriendly: false,
    availableFrom: "",
    availableTo: "",
    latitude: null,
    longitude: null,
  });
  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [roomPhotoUploading, setRoomPhotoUploading] = useState(false);
  const [selectedRoomImage, setSelectedRoomImage] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteDialogType, setDeleteDialogType] = useState(null);
  const [deleteDialogTargetId, setDeleteDialogTargetId] = useState(null);
  const roomImages = roomPhotos || [];

  const openDeleteDialog = (type, targetId) => {
    setDeleteDialogType(type);
    setDeleteDialogTargetId(targetId);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeleteDialogType(null);
    setDeleteDialogTargetId(null);
  };

  const confirmDeleteDialog = async () => {
    const targetId = deleteDialogTargetId;

    closeDeleteDialog();

    if (!targetId) {
      return;
    }

    if (deleteDialogType === "photo") {
      await deletePhoto(targetId);
      return;
    }

    if (deleteDialogType === "room") {
      await deleteRoom(targetId);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/users/${localStorage.getItem("userId")}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
        },
      );
      const userData = await response.json();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchLifestyleProfile = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/lifestyle-profiles/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
        },
      );
      const lifestyleProfile = await response.json();
      setLifestyleProfile(lifestyleProfile);
      return lifestyleProfile;
    } catch (error) {
      console.error("Error fetching lifestyle profile:", error);
    }
  };

  const fetchRoomPhotos = async (roomId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/photos/housing/${roomId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
        },
      );
      const photos = await response.json();
      setRoomPhotos(photos);
    } catch (error) {
      console.error("Error fetching room photos:", error);
    }
  };

  const fetchRoom = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/housings/user/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
        },
      );
      const room = await response.json();
      setRoom(room);
      setRoomData({
        id: room?.id ?? null,
        name: room?.name || "",
        address: room?.address || "",
        city: room?.city || "",
        description: room?.description || "",
        capacity: room?.capacity ?? null,
        numberOfRooms: room?.numberOfRooms ?? null,
        pricePerMonth: room?.pricePerMonth ?? null,
        sizeM2: room?.sizeM2 ?? null,
        isPetFriendly: Boolean(room?.isPetFriendly),
        availableFrom: room?.availableFrom || "",
        availableTo: room?.availableTo || "",
        latitude: room?.latitude ?? null,
        longitude: room?.longitude ?? null,
      });
      return room;
    } catch (error) {
      console.error("Error fetching room data:", error);
    }
  };

  const deleteRoom = async (roomId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/housings/${roomId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        },
      );
      if (!response.ok) {
        throw new Error("Nije uspjelo obrisati sobu");
      } else {
        toaster.create({
          description: "Soba obrisana uspješno",
          type: "success",
        });
        setRoom(null);
        setRoomPhotos([]);
        setSelectedRoomImage(null);
        setIsRoomEditMode(false);
      }
    } catch (error) {
      console.error("Error deleting room:", error);
      toaster.create({
        description: "Nije uspjelo obrisati sobu",
        type: "error",
      });
    }
  };

  const deletePhoto = async (photoId) => {
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
        throw new Error("Nije uspjelo obrisati fotografiju");
      }

      setRoomPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
      toaster.create({
        description: "Fotografija obrisana uspješno",
        type: "success",
      });
    } catch (error) {
      console.error("Error deleting photo:", error);
      toaster.create({
        description: "Nije uspjelo obrisati fotografiju",
        type: "error",
      });
    }
  };

  useEffect(() => {
    fetchUserData().then(async (userData) => {
      if (userData && userData.lifestyleProfileId) {
        fetchLifestyleProfile(userData.lifestyleProfileId);
      }

      if (userData) {
        setProfileData({
          id: userData.id,
          name: userData.name || "",
          description: userData.description || "",
          email: userData.email || "",
          lastName: userData.lastName || "",
          gender: userData.gender || "",
          city: userData.city || "",
          hasAccomodation: userData.hasAccomodation || false,
          profilePictureUrl: userData.profilePictureUrl || "",
          lifestyleProfileId: userData.lifestyleProfileId || null,
          yob: userData.yob || "",
        });
      }
      if (userData && userData.hasAccomodation) {
        const fetchedRoom = await fetchRoom(userData.id);
        if (fetchedRoom?.id) {
          fetchRoomPhotos(fetchedRoom.id);
        }
      }
    });
  }, []);

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRoomInputChange = (field, value) => {
    setRoomData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const uploadAvatarImage = async (file) => {
    if (!file) return;

    setAvatarUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const response = await fetch("http://localhost:8080/api/photos/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: uploadData,
      });

      if (!response.ok) {
        throw new Error("Nije uspjelo učitati profilnu sliku");
      }

      const uploadedUrl = await response.text();
      handleInputChange("profilePictureUrl", uploadedUrl);
      toaster.create({
        description: "Profilna slika je uspješno učitana",
        type: "success",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toaster.create({
        description: "Nije uspjelo učitati profilnu sliku",
        type: "error",
      });
    } finally {
      setAvatarUploading(false);
    }
  };

  const uploadRoomPhoto = async (file) => {
    if (!file) return;

    const housingId = roomData.id || room?.id;
    if (!housingId) {
      toaster.create({
        description: "Save room info first so photos can be attached.",
        type: "warning",
      });
      return;
    }

    setRoomPhotoUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const uploadResponse = await fetch(
        "http://localhost:8080/api/photos/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
          body: uploadData,
        },
      );

      if (!uploadResponse.ok) {
        throw new Error("Nije uspjelo učitati fotografiju sobe");
      }

      const uploadedUrl = await uploadResponse.text();

      const saveResponse = await fetch("http://localhost:8080/api/photos", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: null,
          url: uploadedUrl,
          housingId,
        }),
      });

      if (!saveResponse.ok) {
        const errorText = await saveResponse.text();
        throw new Error(
          errorText || "Nije uspjelo spremiti fotografiju u bazu",
        );
      }

      await fetchRoomPhotos(housingId);
      toaster.create({
        description: "Fotografija sobe je uspješno učitana",
        type: "success",
      });
    } catch (error) {
      console.error("Error uploading room photo:", error);
      toaster.create({
        description:
          error?.message && error.message !== "[object Object]"
            ? error.message
            : "Nije uspjelo učitati fotografiju sobe",
        type: "error",
      });
    } finally {
      setRoomPhotoUploading(false);
    }
  };

  const handleSaveRoomInfo = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const coords = await getCoords(`${roomData.address}, ${roomData.city}`);
      const payload = {
        id: roomData.id,
        userId: user.id,
        name: roomData.name,
        address: roomData.address,
        city: roomData.city,
        description: roomData.description,
        capacity: roomData.capacity,
        numberOfRooms: roomData.numberOfRooms,
        pricePerMonth: roomData.pricePerMonth,
        sizeM2: roomData.sizeM2,
        isPetFriendly: roomData.isPetFriendly,
        availableFrom: roomData.availableFrom,
        availableTo: roomData.availableTo,
        latitude: coords ? coords[0] : roomData.latitude,
        longitude: coords ? coords[1] : roomData.longitude,
      };
      const response = await fetch(`http://localhost:8080/api/housings`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Nije uspjelo ažurirati info o sobi");
      }
      await fetchRoom(user.id);
      setIsRoomEditMode(false);
      toaster.create({
        description: "Info o sobi je uspješno ažurirana",
        type: "success",
      });
    } catch (error) {
      console.error("Error updating room info:", error);
      toaster.create({
        description:
          error?.message && error.message !== "[object Object]"
            ? error.message
            : "Nije uspjelo ažurirati info o sobi",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRoomInfo = () => {
    setRoomData({
      id: room?.id ?? null,
      userId: user?.id ?? null,
      name: room?.name || "",
      address: room?.address || "",
      city: room?.city || "",
      description: room?.description || "",
      capacity: room?.capacity ?? null,
      numberOfRooms: room?.numberOfRooms ?? null,
      pricePerMonth: room?.pricePerMonth ?? null,
      sizeM2: room?.sizeM2 ?? null,
      isPetFriendly: Boolean(room?.isPetFriendly),
      availableFrom: room?.availableFrom || "",
      availableTo: room?.availableTo || "",
      latitude: room?.latitude ?? null,
      longitude: room?.longitude ?? null,
    });
    setIsRoomEditMode(false);
  };

  const handleSaveProfileInfo = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();

      const payload = {
        id: profileData.id,
        name: profileData.name,
        lastName: profileData.lastName,
        gender: profileData.gender,
        city: profileData.city,
        hasAccomodation: profileData.hasAccomodation,
        profilePictureUrl: profileData.profilePictureUrl,
        yob: profileData.yob,
        lifestyleProfileId: profileData.lifestyleProfileId,
        email: profileData.email,
        description: profileData.description,
      };

      const response = await fetch("http://localhost:8080/api/users", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Nije uspjelo ažurirati profil");
      }

      await fetchUserData();
      setIsEditMode(false);
      toaster.create({
        description: "Profil je uspješno ažuriran",
        type: "success",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toaster.create({
        description:
          error?.message && error.message !== "[object Object]"
            ? error.message
            : "Nije uspjelo ažurirati profil",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelProfileInfo = () => {
    setProfileData({
      id: user?.id || "",
      name: user?.name || "",
      lastName: user?.lastName || "",
      gender: user?.gender || "",
      city: user?.city || "",
      hasAccomodation: user?.hasAccomodation || false,
      profilePictureUrl: user?.profilePictureUrl || "",
      yob: user?.yob || "",
      lifestyleProfileId: user?.lifestyleProfileId || "",
    });
    setIsEditMode(false);
  };

  const getAge = (yob) => {
    if (!yob) return "-";
    return new Date().getFullYear() - Number(yob);
  };

  return (
    <Box minH="100vh" bg="gray.900" py={8} px={4}>
      <Box maxW="2xl" mx="auto">
        {user ? (
          <VStack spacing={6} align="stretch">
            {/* Header Card */}
            <Card.Root borderRadius="2xl" boxShadow="md">
              <Card.Body p={8}>
                <Flex
                  direction={{ base: "column", md: "row" }}
                  gap={8}
                  align="start"
                >
                  {/* Avatar */}
                  <VStack spacing={4} align="center">
                    <Avatar.Root
                      size="2xl"
                      borderRadius="30rem"
                      borderWidth="4px"
                      cursor="pointer"
                      onClick={() =>
                        setSelectedRoomImage(
                          profileData.profilePictureUrl ||
                            user.profilePictureUrl ||
                            null,
                        )
                      }
                    >
                      <Avatar.Fallback
                        name={`${user.name} ${user.lastName}`}
                        fontSize="2xl"
                      />
                      <Avatar.Image
                        src={
                          profileData.profilePictureUrl ||
                          user.profilePictureUrl
                        }
                      />
                    </Avatar.Root>

                    {isEditMode && (
                      <FileUpload.Root
                        accept="image/*"
                        maxFiles={1}
                        onFileAccept={(details) => {
                          uploadAvatarImage(details.files[0]);
                        }}
                      >
                        <FileUpload.HiddenInput />
                        <FileUpload.Label>
                          Učitaj profilnu sliku
                        </FileUpload.Label>
                        <InputGroup
                          startElement={<LuFileImage />}
                          endElement={
                            <FileUpload.ClearTrigger asChild>
                              <CloseButton
                                me="-1"
                                size="xs"
                                variant="plain"
                                focusVisibleRing="inside"
                                focusRingWidth="2px"
                                pointerEvents="auto"
                              />
                            </FileUpload.ClearTrigger>
                          }
                        >
                          <Input asChild>
                            <FileUpload.Trigger>
                              <FileUpload.FileText lineClamp={1} />
                            </FileUpload.Trigger>
                          </Input>
                        </InputGroup>
                        {avatarUploading && (
                          <Text fontSize="sm" color="gray.500">
                            Učitavanje profilne slike...
                          </Text>
                        )}
                      </FileUpload.Root>
                    )}
                  </VStack>

                  {/* User Info / Edit */}
                  <VStack align="start" flex={1} spacing={4}>
                    {!isEditMode ? (
                      <VStack align="start" spacing={2} w="full">
                        <Heading size="lg">
                          {user.name} {user.lastName}
                        </Heading>
                        <Text color="gray.600">{user.gender || "-"}</Text>
                        <HStack>
                          <Text fontWeight="medium">Dob:</Text>
                          <Text>{getAge(user.yob)} godina</Text>
                        </HStack>
                        <HStack>
                          <Text fontWeight="medium">Grad:</Text>
                          <Text>{user.city || "-"}</Text>
                        </HStack>
                      </VStack>
                    ) : (
                      <VStack align="start" spacing={4} w="full">
                        <Box>
                          <Text fontWeight="medium" mb={2}>
                            Ime
                          </Text>
                          <Input
                            value={profileData.name}
                            onChange={(e) =>
                              handleInputChange("name", e.target.value)
                            }
                            placeholder="Upiši ime"
                            size="md"
                          />
                        </Box>
                        <Box>
                          <Text fontWeight="medium" mb={2}>
                            Prezime
                          </Text>
                          <Input
                            value={profileData.lastName}
                            onChange={(e) =>
                              handleInputChange("lastName", e.target.value)
                            }
                            placeholder="Upiši prezime"
                            size="md"
                          />
                        </Box>
                      </VStack>
                    )}
                  </VStack>
                </Flex>
              </Card.Body>
            </Card.Root>

            {/* Profile Details Card */}
            <Card.Root borderRadius="2xl" boxShadow="md">
              <Card.Body p={8}>
                <VStack align="stretch" spacing={6}>
                  <Heading
                    size="md"
                    fontWeight="extrabold"
                    letterSpacing="wider"
                    textTransform="uppercase"
                    color="green.600"
                  >
                    Detalji profila
                  </Heading>

                  {!isEditMode ? (
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Spol</Text>
                        <Text>{user.gender || "-"}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Godina rođenja</Text>
                        <Text>{user.yob || "-"}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Grad</Text>
                        <Text>{user.city || "-"}</Text>
                      </HStack>
                    </VStack>
                  ) : (
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <Text fontWeight="medium" mb={2}>
                          Spol
                        </Text>
                        <NativeSelect.Root size="md">
                          <NativeSelect.Field
                            value={profileData.gender}
                            onChange={(e) =>
                              handleInputChange("gender", e.target.value)
                            }
                          >
                            <option value="">Odaberi spol</option>
                            <option value="Muško">Muško</option>
                            <option value="Žensko">Žensko</option>
                          </NativeSelect.Field>
                        </NativeSelect.Root>
                      </Box>

                      <Box>
                        <Text fontWeight="medium" mb={2}>
                          Godina rođenja
                        </Text>
                        <Input
                          type="number"
                          value={profileData.yob}
                          onChange={(e) =>
                            handleInputChange("yob", e.target.value)
                          }
                          placeholder="GGGG"
                          size="md"
                        />
                      </Box>

                      <Box>
                        <Text fontWeight="medium" mb={2}>
                          Grad
                        </Text>
                        <Input
                          value={profileData.city}
                          onChange={(e) =>
                            handleInputChange("city", e.target.value)
                          }
                          placeholder="Tvoj grad"
                          size="md"
                        />
                      </Box>
                    </VStack>
                  )}

                  <HStack justify="center" spacing={4} pt={2}>
                    {!isEditMode ? (
                      <Button
                        colorPalette="green"
                        size="lg"
                        onClick={() => setIsEditMode(true)}
                        leftIcon={<LuPencil />}
                      >
                        Uredi profil
                      </Button>
                    ) : (
                      <>
                        <Button
                          colorPalette="green"
                          size="lg"
                          onClick={handleSaveProfileInfo}
                          isLoading={loading}
                          leftIcon={<LuSave />}
                        >
                          Spremi promjene
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={handleCancelProfileInfo}
                          leftIcon={<LuX />}
                        >
                          Otkaži
                        </Button>
                      </>
                    )}
                  </HStack>
                </VStack>
              </Card.Body>
            </Card.Root>

            {room && (
              <Card.Root borderRadius="2xl" boxShadow="md">
                <Card.Body p={8}>
                  <VStack align="stretch" spacing={6}>
                    <Heading
                      size="md"
                      fontWeight="extrabold"
                      letterSpacing="wider"
                      textTransform="uppercase"
                      color="green.600"
                    >
                      Info o sobi
                    </Heading>

                    {!isRoomEditMode ? (
                      <VStack spacing={4} align="stretch">
                        <HStack justify="space-between">
                          <Text fontWeight="medium">Naziv</Text>
                          <Text>{room.name || "-"}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontWeight="medium">Adresa</Text>
                          <Text>{room.address || "-"}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontWeight="medium">Grad</Text>
                          <Text>{room.city || "-"}</Text>
                        </HStack>
                        <HStack justify="space-between" align="start">
                          <Text fontWeight="medium">Opis</Text>
                          <Text textAlign="right" maxW="70%">
                            {room.description || "-"}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontWeight="medium">Kapacitet</Text>
                          <Text>{room.capacity ?? "-"}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontWeight="medium">Broj soba</Text>
                          <Text>{room.numberOfRooms ?? "-"}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontWeight="medium">Cijena po mjesecu</Text>
                          <Text>
                            {room.pricePerMonth != null
                              ? `${room.pricePerMonth} EUR`
                              : "-"}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontWeight="medium">Veličina (m²)</Text>
                          <Text>{room.sizeM2 ?? "-"}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontWeight="medium">Dozvoljeni ljubimci</Text>
                          <Text>{room.isPetFriendly ? "Da" : "Ne"}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontWeight="medium">Dostupno od</Text>
                          <Text>{room.availableFrom || "-"}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontWeight="medium">Dostupno do</Text>
                          <Text>{room.availableTo || "-"}</Text>
                        </HStack>
                      </VStack>
                    ) : (
                      <VStack spacing={4} align="stretch">
                        <Box>
                          <Text fontWeight="medium" mb={2}>
                            Naziv
                          </Text>
                          <Input
                            value={roomData.name}
                            onChange={(e) =>
                              handleRoomInputChange("name", e.target.value)
                            }
                            placeholder="Naziv sobe"
                            size="md"
                          />
                        </Box>
                        <Box>
                          <Text fontWeight="medium" mb={2}>
                            Adresa
                          </Text>
                          <Input
                            value={roomData.address}
                            onChange={(e) =>
                              handleRoomInputChange("address", e.target.value)
                            }
                            placeholder="Adresa"
                            size="md"
                          />
                        </Box>
                        <Box>
                          <Text fontWeight="medium" mb={2}>
                            Grad
                          </Text>
                          <Input
                            value={roomData.city}
                            onChange={(e) =>
                              handleRoomInputChange("city", e.target.value)
                            }
                            placeholder="Grad"
                            size="md"
                          />
                        </Box>
                        <Box>
                          <Text fontWeight="medium" mb={2}>
                            Opis
                          </Text>
                          <Input
                            value={roomData.description}
                            onChange={(e) =>
                              handleRoomInputChange(
                                "description",
                                e.target.value,
                              )
                            }
                            placeholder="Opis"
                            size="md"
                          />
                        </Box>
                        <Box>
                          <Text fontWeight="medium" mb={2}>
                            Kapacitet
                          </Text>
                          <Input
                            type="number"
                            value={roomData.capacity}
                            onChange={(e) =>
                              handleRoomInputChange("capacity", e.target.value)
                            }
                            placeholder="Kapacitet"
                            size="md"
                          />
                        </Box>
                        <Box>
                          <Text fontWeight="medium" mb={2}>
                            Broj soba
                          </Text>
                          <Input
                            type="number"
                            value={roomData.numberOfRooms}
                            onChange={(e) =>
                              handleRoomInputChange(
                                "numberOfRooms",
                                e.target.value,
                              )
                            }
                            placeholder="Broj soba"
                            size="md"
                          />
                        </Box>
                        <Box>
                          <Text fontWeight="medium" mb={2}>
                            Cijena po mjesecu
                          </Text>
                          <Input
                            type="number"
                            value={roomData.pricePerMonth}
                            onChange={(e) =>
                              handleRoomInputChange(
                                "pricePerMonth",
                                e.target.value,
                              )
                            }
                            placeholder="Cijena"
                            size="md"
                          />
                        </Box>
                        <Box>
                          <Text fontWeight="medium" mb={2}>
                            Veličina (m²)
                          </Text>
                          <Input
                            type="number"
                            value={roomData.sizeM2}
                            onChange={(e) =>
                              handleRoomInputChange("sizeM2", e.target.value)
                            }
                            placeholder="Veličina"
                            size="md"
                          />
                        </Box>
                        <Box>
                          <Checkbox.Root
                            checked={roomData.isPetFriendly}
                            onCheckedChange={(e) =>
                              handleRoomInputChange(
                                "isPetFriendly",
                                Boolean(e.checked),
                              )
                            }
                          >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control />
                            <Checkbox.Label>Dozvoljeni ljubimci</Checkbox.Label>
                          </Checkbox.Root>
                        </Box>
                        <Box>
                          <Text fontWeight="medium" mb={2}>
                            Dostupno od
                          </Text>
                          <Input
                            type="date"
                            value={roomData.availableFrom}
                            onChange={(e) =>
                              handleRoomInputChange(
                                "availableFrom",
                                e.target.value,
                              )
                            }
                            size="md"
                          />
                        </Box>
                        <Box>
                          <Text fontWeight="medium" mb={2}>
                            Dostupno do
                          </Text>
                          <Input
                            type="date"
                            value={roomData.availableTo}
                            onChange={(e) =>
                              handleRoomInputChange(
                                "availableTo",
                                e.target.value,
                              )
                            }
                            size="md"
                          />
                        </Box>

                        <FileUpload.Root
                          accept="image/*"
                          maxFiles={1}
                          onFileAccept={(details) => {
                            uploadRoomPhoto(details.files[0]);
                          }}
                        >
                          <FileUpload.HiddenInput />
                          <FileUpload.Label>
                            Učitaj fotografiju sobe
                          </FileUpload.Label>
                          <InputGroup
                            startElement={<LuFileImage />}
                            endElement={
                              <FileUpload.ClearTrigger asChild>
                                <CloseButton
                                  me="-1"
                                  size="xs"
                                  variant="plain"
                                  focusVisibleRing="inside"
                                  focusRingWidth="2px"
                                  pointerEvents="auto"
                                />
                              </FileUpload.ClearTrigger>
                            }
                          >
                            <Input asChild>
                              <FileUpload.Trigger>
                                <FileUpload.FileText lineClamp={1} />
                              </FileUpload.Trigger>
                            </Input>
                          </InputGroup>
                          {roomPhotoUploading && (
                            <Text fontSize="sm" color="gray.500">
                              Učitavanje fotografije sobe...
                            </Text>
                          )}
                        </FileUpload.Root>
                      </VStack>
                    )}

                    <Box pt={4}>
                      {roomImages.length > 0 ? (
                        <Flex wrap="wrap" gap={3} justify="center">
                          {roomImages.map((image, index) => (
                            <Box
                              key={`${image.url}-${index}`}
                              position="relative"
                            >
                              <Image
                                src={image.url}
                                alt={`Fotografija sobe ${index + 1}`}
                                boxSize="120px"
                                objectFit="cover"
                                borderRadius="md"
                                borderWidth="1px"
                                borderColor="gray.200"
                                cursor="pointer"
                                onClick={() => setSelectedRoomImage(image.url)}
                              />
                              {isRoomEditMode && image?.id && (
                                <CloseButton
                                  size="xs"
                                  position="absolute"
                                  top="1"
                                  right="1"
                                  bg="red.500"
                                  color="white"
                                  border="1px solid"
                                  borderColor="red.600"
                                  _hover={{ bg: "red.600" }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openDeleteDialog("photo", image.id);
                                  }}
                                />
                              )}
                            </Box>
                          ))}
                        </Flex>
                      ) : (
                        <Text color="gray.500" textAlign="center">
                          Nema dostupnih fotografija sobe.
                        </Text>
                      )}
                    </Box>

                    <HStack justify="center" spacing={4} pt={2}>
                      {!isRoomEditMode ? (
                        <Button
                          colorPalette="green"
                          size="lg"
                          onClick={() => setIsRoomEditMode(true)}
                          leftIcon={<LuPencil />}
                        >
                          Uredi info o sobi
                        </Button>
                      ) : (
                        <>
                          <Button
                            colorPalette="green"
                            size="lg"
                            onClick={handleSaveRoomInfo}
                            isLoading={loading}
                            leftIcon={<LuSave />}
                          >
                            Spremi promjene
                          </Button>
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={handleCancelRoomInfo}
                            leftIcon={<LuX />}
                          >
                            Otkaži
                          </Button>
                          <Button
                            colorPalette="red"
                            size="lg"
                            variant="solid"
                            onClick={() => {
                              const roomId = roomData.id || room?.id;
                              if (roomId) {
                                openDeleteDialog("room", roomId);
                              }
                            }}
                          >
                            Obriši sobu
                          </Button>
                        </>
                      )}
                    </HStack>
                  </VStack>
                </Card.Body>
              </Card.Root>
            )}

            {!room && (
              <Card.Root borderRadius="2xl" boxShadow="md">
                <Card.Body p={8}>
                  <VStack
                    spacing={6}
                    align="center"
                    justify="center"
                    minH="300px"
                  >
                    <Heading size="lg" textAlign="center">
                      Još nije dodana smještaj
                    </Heading>
                    <Text color="gray.600" textAlign="center">
                      Počni s dodavanjem svoje prve nekretnine.
                    </Text>
                    <Button
                      colorPalette="green"
                      size="lg"
                      as={Link}
                      to="/new-place"
                      leftIcon={<LuPlus />}
                    >
                      Dodaj novu nekretninu
                    </Button>
                  </VStack>
                </Card.Body>
              </Card.Root>
            )}

            <Dialog.Root
              open={deleteDialogOpen}
              onOpenChange={(details) => {
                if (!details.open) {
                  closeDeleteDialog();
                }
              }}
            >
              <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                  <Dialog.Content
                    role="alertdialog"
                    aria-label="Delete confirmation"
                    borderRadius="2xl"
                    boxShadow="2xl"
                  >
                    <Dialog.Header>
                      <Dialog.Title>
                        {deleteDialogType === "photo"
                          ? "Obriši fotografiju?"
                          : "Obriši sobu?"}
                      </Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body>
                      <Text>
                        {deleteDialogType === "photo"
                          ? "Ova fotografija će biti trajno obrisana."
                          : "Ova soba će biti trajno obrisana, uključujući njezine fotografije."}
                      </Text>
                    </Dialog.Body>
                    <Dialog.Footer>
                      <Button variant="outline" onClick={closeDeleteDialog}>
                        Otkaži
                      </Button>
                      <Button colorPalette="red" onClick={confirmDeleteDialog}>
                        Obriši
                      </Button>
                    </Dialog.Footer>
                  </Dialog.Content>
                </Dialog.Positioner>
              </Portal>
            </Dialog.Root>

            {selectedRoomImage && (
              <Box
                position="fixed"
                inset={0}
                bg="blackAlpha.800"
                display="flex"
                alignItems="center"
                justifyContent="center"
                zIndex={2000}
                p={4}
                onClick={() => setSelectedRoomImage(null)}
              >
                <Image
                  src={selectedRoomImage}
                  alt="Enlarged room photo"
                  maxW="90vw"
                  maxH="85vh"
                  borderRadius="lg"
                  onClick={(e) => e.stopPropagation()}
                />
              </Box>
            )}
          </VStack>
        ) : (
          <Box textAlign="center" py={12}>
            <Text>Loading profile...</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ProfilePage;
