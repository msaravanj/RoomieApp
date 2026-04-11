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
  Checkbox,
  NativeSelect,
} from "@chakra-ui/react";
import { LuFileImage, LuPencil, LuSave, LuX } from "react-icons/lu";
import { toaster } from "../components/ui/toaster";
import { getAuthToken } from "../util/auth";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [lifestyleProfile, setLifestyleProfile] = useState(null);
  const [room, setRoom] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
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
  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

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
      return room;
    } catch (error) {
      console.error("Error fetching room data:", error);
    }
  };

  useEffect(() => {
    fetchUserData().then((userData) => {
      if (userData && userData.lifestyleProfileId) {
        fetchLifestyleProfile(userData.lifestyleProfileId);
      }
      if (userData && userData.hasAccomodation) {
        fetchRoom(userData.id);
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
      if (userData.hasAccomodation) {
        fetchRoom(userData.id);
      }
    });
  }, []);

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({
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
        throw new Error("Failed to upload avatar");
      }

      const uploadedUrl = await response.text();
      handleInputChange("profilePictureUrl", uploadedUrl);
      toaster.create({
        description: "Avatar uploaded successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toaster.create({
        description: "Failed to upload avatar",
        type: "error",
      });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSave = async () => {
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
        throw new Error(errorText || "Failed to update profile");
      }

      await fetchUserData();
      setIsEditMode(false);
      toaster.create({
        description: "Profile updated successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toaster.create({
        description:
          error?.message && error.message !== "[object Object]"
            ? error.message
            : "Failed to update profile",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
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
                        <FileUpload.Label>Upload avatar image</FileUpload.Label>
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
                            Uploading avatar...
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
                          <Text fontWeight="medium">Age:</Text>
                          <Text>{getAge(user.yob)} years old</Text>
                        </HStack>
                        <HStack>
                          <Text fontWeight="medium">City:</Text>
                          <Text>{user.city || "-"}</Text>
                        </HStack>
                        <HStack>
                          <Text fontWeight="medium">Has accommodation:</Text>
                          <Text>{user.hasAccomodation ? "✓ Yes" : "✗ No"}</Text>
                        </HStack>
                      </VStack>
                    ) : (
                      <VStack align="start" spacing={4} w="full">
                        <Box>
                          <Text fontWeight="medium" mb={2}>
                            First Name
                          </Text>
                          <Input
                            value={profileData.name}
                            onChange={(e) =>
                              handleInputChange("name", e.target.value)
                            }
                            placeholder="First name"
                            size="md"
                          />
                        </Box>
                        <Box>
                          <Text fontWeight="medium" mb={2}>
                            Last Name
                          </Text>
                          <Input
                            value={profileData.lastName}
                            onChange={(e) =>
                              handleInputChange("lastName", e.target.value)
                            }
                            placeholder="Last name"
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
                    Profile Details
                  </Heading>

                  {!isEditMode ? (
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Gender</Text>
                        <Text>{user.gender || "-"}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Year of Birth</Text>
                        <Text>{user.yob || "-"}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="medium">City</Text>
                        <Text>{user.city || "-"}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Has Accommodation</Text>
                        <Text>{user.hasAccomodation ? "Yes" : "No"}</Text>
                      </HStack>
                    </VStack>
                  ) : (
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <Text fontWeight="medium" mb={2}>
                          Gender
                        </Text>
                        <NativeSelect.Root size="md">
                          <NativeSelect.Field
                            value={profileData.gender}
                            onChange={(e) =>
                              handleInputChange("gender", e.target.value)
                            }
                          >
                            <option value="">Select gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </NativeSelect.Field>
                        </NativeSelect.Root>
                      </Box>

                      <Box>
                        <Text fontWeight="medium" mb={2}>
                          Year of Birth
                        </Text>
                        <Input
                          type="number"
                          value={profileData.yob}
                          onChange={(e) =>
                            handleInputChange("yob", e.target.value)
                          }
                          placeholder="YYYY"
                          size="md"
                        />
                      </Box>

                      <Box>
                        <Text fontWeight="medium" mb={2}>
                          City
                        </Text>
                        <Input
                          value={profileData.city}
                          onChange={(e) =>
                            handleInputChange("city", e.target.value)
                          }
                          placeholder="Your city"
                          size="md"
                        />
                      </Box>

                      <Box>
                        <Checkbox.Root
                          checked={profileData.hasAccomodation}
                          onCheckedChange={(e) =>
                            handleInputChange(
                              "hasAccomodation",
                              Boolean(e.checked),
                            )
                          }
                        >
                          <Checkbox.HiddenInput />
                          <Checkbox.Control />
                          <Checkbox.Label>I have accommodation</Checkbox.Label>
                        </Checkbox.Root>
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
                        Edit Profile
                      </Button>
                    ) : (
                      <>
                        <Button
                          colorPalette="green"
                          size="lg"
                          onClick={handleSave}
                          isLoading={loading}
                          leftIcon={<LuSave />}
                        >
                          Save Changes
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={handleCancel}
                          leftIcon={<LuX />}
                        >
                          Cancel
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
                      Room Info
                    </Heading>

                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Name</Text>
                        <Text>{room.name || "-"}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Address</Text>
                        <Text>{room.address || "-"}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="medium">City</Text>
                        <Text>{room.city || "-"}</Text>
                      </HStack>
                      <HStack justify="space-between" align="start">
                        <Text fontWeight="medium">Description</Text>
                        <Text textAlign="right" maxW="70%">
                          {room.description || "-"}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Capacity</Text>
                        <Text>{room.capacity ?? "-"}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Number of Rooms</Text>
                        <Text>{room.numberOfRooms ?? "-"}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Price per Month</Text>
                        <Text>
                          {room.pricePerMonth != null
                            ? `${room.pricePerMonth} EUR`
                            : "-"}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Size (m²)</Text>
                        <Text>{room.sizeM2 ?? "-"}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Pet Friendly</Text>
                        <Text>{room.isPetFriendly ? "Yes" : "No"}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Available From</Text>
                        <Text>{room.availableFrom || "-"}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Available To</Text>
                        <Text>{room.availableTo || "-"}</Text>
                      </HStack>
                    </VStack>
                  </VStack>
                </Card.Body>
              </Card.Root>
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
