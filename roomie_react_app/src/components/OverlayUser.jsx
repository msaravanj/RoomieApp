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
  LuBriefcaseBusiness,
  LuCalendar,
  LuCigarette,
  LuPencil,
  LuSave,
  LuTrash,
  LuUsers,
  LuX,
  LuMail,
  LuMapPin,
  LuUser,
  LuUserRound,
} from "react-icons/lu";
import { GiCardRandom } from "react-icons/gi";
import {
  MdCleaningServices,
  MdOutlinePets,
  MdOutlineRestaurant,
} from "react-icons/md";
import { toaster } from "@/components/ui/toaster";
import {
  getAuthToken,
  normalizeUserRole,
  ROLE_ADMIN,
  ROLE_USER,
} from "@/util/auth";

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
    return value ? "Da" : "Ne";
  }

  return String(value);
};

const getAge = (yob) => {
  if (!yob) return "-";

  const year = Number(yob);

  if (!Number.isFinite(year)) return "-";

  return new Date().getFullYear() - year;
};

const buildProfileData = (user) => ({
  id: user?.id ?? null,
  name: user?.name || "",
  lastName: user?.lastName || "",
  email: user?.email || "",
  role: normalizeUserRole(user?.role) || ROLE_USER,
  gender: user?.gender || "",
  city: user?.city || "",
  yob: user?.yob || "",
  hasAccomodation: Boolean(user?.hasAccomodation),
  profilePictureUrl: user?.profilePictureUrl || "",
  lifestyleProfileId: user?.lifestyleProfileId || null,
  description: user?.description || "",
});

const buildLifestyleData = (profile, userId) => ({
  id: profile?.id ?? 0,
  isSmoker: Boolean(profile?.isSmoker),
  hasPets: Boolean(profile?.hasPets),
  hobbies: profile?.hobbies || "",
  hobbiesEmbeddingJson: profile?.hobbiesEmbeddingJson || "",
  bedTime: profile?.bedTime || "",
  wakeUpTime: profile?.wakeUpTime || "",
  cleanliness:
    profile?.cleanliness !== undefined && profile?.cleanliness !== null
      ? Number(profile.cleanliness)
      : 3,
  sociality:
    profile?.sociality !== undefined && profile?.sociality !== null
      ? Number(profile.sociality)
      : 3,
  workSchedule: profile?.workSchedule || "",
  nutrition: profile?.nutrition || "",
  nutritionEmbeddingJson: profile?.nutritionEmbeddingJson || "",
  userId: userId ? Number(userId) : 0,
});

export const OverlayUser = ({
  user,
  open,
  onOpenChange,
  onDeleted,
  onUpdated,
}) => {
  const [currentUser, setCurrentUser] = useState(user || null);
  const [profileData, setProfileData] = useState(() => buildProfileData(user));
  const [lifestyleProfile, setLifestyleProfile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLifestyleSaving, setIsLifestyleSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLifestyleEditMode, setIsLifestyleEditMode] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [lifestyleData, setLifestyleData] = useState(() =>
    buildLifestyleData(null, user?.id),
  );

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCancelEdit = () => {
    setProfileData(buildProfileData(currentUser));
    setIsEditMode(false);
  };

  const handleLifestyleInputChange = (field, value) => {
    setLifestyleData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCancelLifestyleEdit = () => {
    setLifestyleData(buildLifestyleData(lifestyleProfile, currentUser?.id));
    setIsLifestyleEditMode(false);
  };

  const handleSaveLifestyleProfile = async () => {
    if (!currentUser?.id || !lifestyleData?.id || isLifestyleSaving) {
      return;
    }

    setIsLifestyleSaving(true);

    try {
      const payload = {
        ...lifestyleData,
        cleanliness: Number(lifestyleData.cleanliness),
        sociality: Number(lifestyleData.sociality),
        userId: Number(currentUser.id),
      };

      const response = await fetch(
        "http://localhost:8080/api/lifestyle-profiles",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to update lifestyle profile");
      }

      setLifestyleProfile(payload);
      setLifestyleData(buildLifestyleData(payload, currentUser.id));
      setIsLifestyleEditMode(false);

      toaster.create({
        description: "Lifestyle profile updated successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error updating lifestyle profile:", error);
      toaster.create({
        description:
          error?.message && error.message !== "[object Object]"
            ? error.message
            : "Failed to update lifestyle profile",
        type: "error",
      });
    } finally {
      setIsLifestyleSaving(false);
    }
  };

  const uploadAvatarImage = async (file) => {
    if (!file) {
      return;
    }

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

  const handleRemoveAvatarImage = () => {
    handleInputChange("profilePictureUrl", "");
    setSelectedImage(null);
  };

  const handleSaveUser = async () => {
    if (!profileData?.id || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        id: profileData.id,
        name: profileData.name,
        lastName: profileData.lastName,
        gender: profileData.gender,
        role: normalizeUserRole(profileData.role) || ROLE_USER,
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
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to update user");
      }

      const updatedUser = {
        ...(currentUser || {}),
        ...payload,
      };

      setCurrentUser(updatedUser);
      setProfileData(buildProfileData(updatedUser));
      setIsEditMode(false);

      if (typeof onUpdated === "function") {
        onUpdated(updatedUser);
      }

      toaster.create({
        description: "User updated successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error updating user:", error);
      toaster.create({
        description:
          error?.message && error.message !== "[object Object]"
            ? error.message
            : "Failed to update user",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (!currentUser?.id || isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(
        `http://localhost:8080/api/users/${currentUser.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to delete user");
      }

      toaster.create({
        description: "User deleted successfully",
        type: "success",
      });

      if (typeof onDeleted === "function") {
        onDeleted(currentUser.id);
      }

      setIsConfirmOpen(false);
      onOpenChange?.({ open: false });
    } catch (error) {
      console.error("Error deleting user:", error);
      toaster.create({
        description:
          error?.message && error.message !== "[object Object]"
            ? error.message
            : "Failed to delete user",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    setCurrentUser(user || null);
    setProfileData(buildProfileData(user));
    setIsEditMode(false);
    setIsLifestyleEditMode(false);
  }, [open, user]);

  useEffect(() => {
    if (!open || !currentUser?.lifestyleProfileId) {
      setLifestyleProfile(null);
      return undefined;
    }

    let isActive = true;

    const fetchLifestyleProfile = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/lifestyle-profiles/${currentUser.lifestyleProfileId}`,
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
          setLifestyleProfile(data);
          setLifestyleData(buildLifestyleData(data, currentUser?.id));
        }
      } catch (error) {
        console.error("Error fetching lifestyle profile:", error);

        if (isActive) {
          setLifestyleProfile(null);
        }
      }
    };

    fetchLifestyleProfile();

    return () => {
      isActive = false;
    };
  }, [open, currentUser?.lifestyleProfileId]);

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
                  Detalji korisnika
                </Dialog.Title>

                <Flex direction="column" gap="5" marginTop="6">
                  <Box {...infoCardStyles}>
                    <Flex
                      direction={{ base: "column", md: "row" }}
                      gap="5"
                      align={{ md: "center" }}
                    >
                      <VStack align="start" gap="3">
                        <Avatar.Root
                          size="2xl"
                          cursor={
                            profileData?.profilePictureUrl
                              ? "pointer"
                              : "default"
                          }
                          onClick={() =>
                            profileData?.profilePictureUrl &&
                            setSelectedImage(profileData.profilePictureUrl)
                          }
                        >
                          <Avatar.Fallback
                            name={`${profileData?.name || ""} ${profileData?.lastName || ""}`}
                          />
                          <Avatar.Image src={profileData?.profilePictureUrl} />
                        </Avatar.Root>

                        {isEditMode && (
                          <VStack align="stretch" gap="2" w="220px">
                            <Input
                              type="file"
                              accept="image/*"
                              p="1"
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                uploadAvatarImage(file);
                                event.target.value = "";
                              }}
                            />
                            <Button
                              variant="outline"
                              colorPalette="red"
                              onClick={handleRemoveAvatarImage}
                              disabled={!profileData?.profilePictureUrl}
                            >
                              Ukloni fotografiju
                            </Button>
                            {avatarUploading && (
                              <Text fontSize="sm" color="fg.muted">
                                Učitavanje profilne slike...
                              </Text>
                            )}
                          </VStack>
                        )}
                      </VStack>

                      <Box>
                        {!isEditMode ? (
                          <>
                            <Heading size="lg">
                              {formatValue(currentUser?.name)}{" "}
                              {formatValue(currentUser?.lastName)}
                            </Heading>
                            <Text color="fg.muted" mt="1">
                              {formatValue(currentUser?.email)}
                            </Text>
                          </>
                        ) : (
                          <VStack align="stretch" gap="3" mt="1">
                            <Input
                              value={profileData.name}
                              onChange={(event) =>
                                handleInputChange("name", event.target.value)
                              }
                              placeholder="Ime"
                            />
                            <Input
                              value={profileData.lastName}
                              onChange={(event) =>
                                handleInputChange(
                                  "lastName",
                                  event.target.value,
                                )
                              }
                              placeholder="Prezime"
                            />
                          </VStack>
                        )}
                        <HStack gap="2" mt="3" wrap="wrap">
                          <Badge colorPalette="cyan" variant="subtle">
                            ID: {formatValue(currentUser?.id)}
                          </Badge>
                          <Badge colorPalette="green" variant="subtle">
                            Age: {getAge(profileData?.yob)}
                          </Badge>
                          <Badge colorPalette="orange" variant="subtle">
                            {formatValue(profileData?.gender)}
                          </Badge>
                        </HStack>
                      </Box>
                    </Flex>
                  </Box>

                  <Box {...infoCardStyles}>
                    <Heading size="md" mb="4">
                      Osnovne informacije
                    </Heading>
                    <VStack align="stretch" gap="3">
                      {!isEditMode ? (
                        <>
                          <HStack gap="2">
                            <LuMail />
                            <Text>
                              Email: {formatValue(currentUser?.email)}
                            </Text>
                          </HStack>
                          <HStack gap="2">
                            <LuMapPin />
                            <Text>Grad: {formatValue(currentUser?.city)}</Text>
                          </HStack>
                          <HStack gap="2">
                            <LuUserRound />
                            <Text>
                              Spol: {formatValue(currentUser?.gender)}
                            </Text>
                          </HStack>
                          <HStack gap="2">
                            <LuUser />
                            <Text>
                              Uloga:{" "}
                              {formatValue(
                                normalizeUserRole(currentUser?.role),
                              )}
                            </Text>
                          </HStack>
                          <HStack gap="2">
                            <LuUser />
                            <Text>
                              Godina rođenja: {formatValue(currentUser?.yob)}
                            </Text>
                          </HStack>
                          {currentUser?.description && (
                            <Box>
                              <Text fontWeight="medium" mb="1">
                                Opis
                              </Text>
                              <Text color="fg.muted" lineHeight="tall">
                                {currentUser?.description}
                              </Text>
                            </Box>
                          )}
                        </>
                      ) : (
                        <>
                          <Box>
                            <Text fontSize="sm" color="fg.muted" mb="1">
                              Email
                            </Text>
                            <Input
                              value={profileData.email}
                              onChange={(event) =>
                                handleInputChange("email", event.target.value)
                              }
                              placeholder="Email"
                            />
                          </Box>
                          <Box>
                            <Text fontSize="sm" color="fg.muted" mb="1">
                              Grad
                            </Text>
                            <Input
                              value={profileData.city}
                              onChange={(event) =>
                                handleInputChange("city", event.target.value)
                              }
                              placeholder="Grad"
                            />
                          </Box>
                          <Box>
                            <Text fontSize="sm" color="fg.muted" mb="1">
                              Spol
                            </Text>
                            <NativeSelect.Root>
                              <NativeSelect.Field
                                value={profileData.gender}
                                onChange={(event) =>
                                  handleInputChange(
                                    "gender",
                                    event.target.value,
                                  )
                                }
                              >
                                <option value="">Odaberi spol</option>
                                <option value="Muško">Muško</option>
                                <option value="Žensko">Žensko</option>
                              </NativeSelect.Field>
                            </NativeSelect.Root>
                          </Box>
                          <Box>
                            <Text fontSize="sm" color="fg.muted" mb="1">
                              Uloga
                            </Text>
                            <NativeSelect.Root>
                              <NativeSelect.Field
                                value={profileData.role || ROLE_USER}
                                onChange={(event) =>
                                  handleInputChange(
                                    "role",
                                    normalizeUserRole(event.target.value),
                                  )
                                }
                              >
                                <option value={ROLE_USER}>{ROLE_USER}</option>
                                <option value={ROLE_ADMIN}>{ROLE_ADMIN}</option>
                              </NativeSelect.Field>
                            </NativeSelect.Root>
                          </Box>
                          <Box>
                            <Text fontSize="sm" color="fg.muted" mb="1">
                              Godina rođenja
                            </Text>
                            <Input
                              type="number"
                              value={profileData.yob}
                              onChange={(event) =>
                                handleInputChange("yob", event.target.value)
                              }
                              placeholder="YYYY"
                            />
                          </Box>
                          <Box>
                            <Text fontSize="sm" color="fg.muted" mb="1">
                              Opis
                            </Text>
                            <Textarea
                              value={profileData.description}
                              onChange={(event) =>
                                handleInputChange(
                                  "description",
                                  event.target.value,
                                )
                              }
                              placeholder="Opis korisnika"
                              minH="120px"
                            />
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
                          <LuPencil /> Uredi
                        </Button>
                      ) : (
                        <HStack gap="3">
                          <Button
                            colorPalette="green"
                            onClick={handleSaveUser}
                            loading={isSaving}
                          >
                            <LuSave /> Spremi
                          </Button>
                          <Button variant="outline" onClick={handleCancelEdit}>
                            <LuX /> Otkaži
                          </Button>
                        </HStack>
                      )}
                    </Flex>
                  </Box>

                  <Box {...infoCardStyles}>
                    <Heading size="md" mb="4">
                      Profil životnog stila
                    </Heading>
                    {lifestyleProfile ? (
                      <VStack align="stretch" gap="3">
                        {!isLifestyleEditMode ? (
                          <>
                            <HStack gap="2">
                              <LuCigarette />
                              <Text>
                                Pušenje:{" "}
                                {lifestyleProfile.isSmoker
                                  ? "Pušač"
                                  : "Nepušač"}
                              </Text>
                            </HStack>
                            <HStack gap="2">
                              <GiCardRandom />
                              <Text>
                                Hobiji: {formatValue(lifestyleProfile.hobbies)}
                              </Text>
                            </HStack>
                            <HStack gap="2">
                              <MdOutlinePets />
                              <Text>
                                Ima ljubimce:{" "}
                                {formatValue(lifestyleProfile.hasPets)}
                              </Text>
                            </HStack>
                            <HStack gap="2">
                              <LuCalendar />
                              <Text>
                                Vrijeme spavanja:{" "}
                                {formatValue(lifestyleProfile.bedTime)}
                              </Text>
                            </HStack>
                            <HStack gap="2">
                              <LuCalendar />
                              <Text>
                                Vrijeme buđenja:{" "}
                                {formatValue(lifestyleProfile.wakeUpTime)}
                              </Text>
                            </HStack>
                            <HStack gap="2">
                              <MdCleaningServices />
                              <Text>
                                Čistoća:{" "}
                                {formatValue(lifestyleProfile.cleanliness)}
                              </Text>
                            </HStack>
                            <HStack gap="2">
                              <LuUsers />
                              <Text>
                                Društvenost:{" "}
                                {formatValue(lifestyleProfile.sociality)}
                              </Text>
                            </HStack>
                            <HStack gap="2">
                              <LuBriefcaseBusiness />
                              <Text>
                                Radni raspored:{" "}
                                {formatValue(lifestyleProfile.workSchedule)}
                              </Text>
                            </HStack>
                            <HStack gap="2">
                              <MdOutlineRestaurant />
                              <Text>
                                Prehrana:{" "}
                                {formatValue(lifestyleProfile.nutrition)}
                              </Text>
                            </HStack>
                            <HStack gap="2">
                              <Text fontWeight="medium">
                                ID profila životnog stila:
                              </Text>
                              <Text>
                                {formatValue(currentUser?.lifestyleProfileId)}
                              </Text>
                            </HStack>
                          </>
                        ) : (
                          <>
                            <Box>
                              <HStack
                                fontSize="sm"
                                color="fg.muted"
                                mb="1"
                                gap="1"
                              >
                                <LuCigarette />
                                <Text>Pušenje</Text>
                              </HStack>
                              <NativeSelect.Root>
                                <NativeSelect.Field
                                  value={lifestyleData.isSmoker ? "yes" : "no"}
                                  onChange={(event) =>
                                    handleLifestyleInputChange(
                                      "isSmoker",
                                      event.target.value === "yes",
                                    )
                                  }
                                >
                                  <option value="no">Nepušač</option>
                                  <option value="yes">Pušač</option>
                                </NativeSelect.Field>
                              </NativeSelect.Root>
                            </Box>
                            <Box>
                              <HStack
                                fontSize="sm"
                                color="fg.muted"
                                mb="1"
                                gap="1"
                              >
                                <MdOutlinePets />
                                <Text>Ima ljubimce</Text>
                              </HStack>
                              <NativeSelect.Root>
                                <NativeSelect.Field
                                  value={lifestyleData.hasPets ? "yes" : "no"}
                                  onChange={(event) =>
                                    handleLifestyleInputChange(
                                      "hasPets",
                                      event.target.value === "yes",
                                    )
                                  }
                                >
                                  <option value="no">Ne</option>
                                  <option value="yes">Da</option>
                                </NativeSelect.Field>
                              </NativeSelect.Root>
                            </Box>
                            <Box>
                              <HStack
                                fontSize="sm"
                                color="fg.muted"
                                mb="1"
                                gap="1"
                              >
                                <GiCardRandom />
                                <Text>Hobiji</Text>
                              </HStack>
                              <Textarea
                                value={lifestyleData.hobbies}
                                onChange={(event) =>
                                  handleLifestyleInputChange(
                                    "hobbies",
                                    event.target.value,
                                  )
                                }
                                minH="90px"
                              />
                            </Box>
                            <Box>
                              <HStack
                                fontSize="sm"
                                color="fg.muted"
                                mb="1"
                                gap="1"
                              >
                                <LuCalendar />
                                <Text>Vrijeme spavanja</Text>
                              </HStack>
                              <Input
                                type="time"
                                value={lifestyleData.bedTime || ""}
                                onChange={(event) =>
                                  handleLifestyleInputChange(
                                    "bedTime",
                                    event.target.value,
                                  )
                                }
                              />
                            </Box>
                            <Box>
                              <HStack
                                fontSize="sm"
                                color="fg.muted"
                                mb="1"
                                gap="1"
                              >
                                <LuCalendar />
                                <Text>Vrijeme buđenja</Text>
                              </HStack>
                              <Input
                                type="time"
                                value={lifestyleData.wakeUpTime || ""}
                                onChange={(event) =>
                                  handleLifestyleInputChange(
                                    "wakeUpTime",
                                    event.target.value,
                                  )
                                }
                              />
                            </Box>
                            <Box>
                              <HStack
                                fontSize="sm"
                                color="fg.muted"
                                mb="1"
                                gap="1"
                              >
                                <MdCleaningServices />
                                <Text>Čistoća (1-5)</Text>
                              </HStack>
                              <Input
                                type="number"
                                min={1}
                                max={5}
                                value={lifestyleData.cleanliness}
                                onChange={(event) =>
                                  handleLifestyleInputChange(
                                    "cleanliness",
                                    event.target.value,
                                  )
                                }
                              />
                            </Box>
                            <Box>
                              <HStack
                                fontSize="sm"
                                color="fg.muted"
                                mb="1"
                                gap="1"
                              >
                                <LuUsers />
                                <Text>Društvenost (1-5)</Text>
                              </HStack>
                              <Input
                                type="number"
                                min={1}
                                max={5}
                                value={lifestyleData.sociality}
                                onChange={(event) =>
                                  handleLifestyleInputChange(
                                    "sociality",
                                    event.target.value,
                                  )
                                }
                              />
                            </Box>
                            <Box>
                              <HStack
                                fontSize="sm"
                                color="fg.muted"
                                mb="1"
                                gap="1"
                              >
                                <LuBriefcaseBusiness />
                                <Text>Radni raspored</Text>
                              </HStack>
                              <Input
                                value={lifestyleData.workSchedule}
                                onChange={(event) =>
                                  handleLifestyleInputChange(
                                    "workSchedule",
                                    event.target.value,
                                  )
                                }
                              />
                            </Box>
                            <Box>
                              <HStack
                                fontSize="sm"
                                color="fg.muted"
                                mb="1"
                                gap="1"
                              >
                                <MdOutlineRestaurant />
                                <Text>Prehrana</Text>
                              </HStack>
                              <Input
                                value={lifestyleData.nutrition}
                                onChange={(event) =>
                                  handleLifestyleInputChange(
                                    "nutrition",
                                    event.target.value,
                                  )
                                }
                              />
                            </Box>
                          </>
                        )}
                      </VStack>
                    ) : (
                      <Text color="fg.muted">
                        Nema dostupnog profila životnog stila.
                      </Text>
                    )}

                    {lifestyleProfile && (
                      <Flex mt="5" justify="flex-end">
                        {!isLifestyleEditMode ? (
                          <Button
                            variant="outline"
                            onClick={() => setIsLifestyleEditMode(true)}
                          >
                            <LuPencil /> Uredi
                          </Button>
                        ) : (
                          <HStack gap="3">
                            <Button
                              colorPalette="green"
                              onClick={handleSaveLifestyleProfile}
                              loading={isLifestyleSaving}
                            >
                              <LuSave /> Spremi
                            </Button>
                            <Button
                              variant="outline"
                              onClick={handleCancelLifestyleEdit}
                            >
                              <LuX /> Otkaži
                            </Button>
                          </HStack>
                        )}
                      </Flex>
                    )}
                  </Box>
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
                      <LuTrash /> Obriši korisnika
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
                <Dialog.Title>Obriši korisnika</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Text>Jesu li sigurni da želite obrisati ovog korisnika?</Text>
              </Dialog.Body>
              <Dialog.Footer gap="3">
                <Button
                  variant="outline"
                  onClick={() => setIsConfirmOpen(false)}
                  disabled={isDeleting}
                >
                  Otkaži
                </Button>
                <Button
                  colorPalette="red"
                  onClick={confirmDeleteUser}
                  loading={isDeleting}
                >
                  Obriši
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
};

export default OverlayUser;
