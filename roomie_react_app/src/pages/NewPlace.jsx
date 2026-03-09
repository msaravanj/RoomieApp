import {
  Box,
  Heading,
  Input,
  Field,
  Button,
  NumberInput,
  NativeSelect,
  FileUpload,
  Text,
  Textarea,
  InputGroup,
  CloseButton,
} from "@chakra-ui/react";
import { LuFileImage, LuFileUp } from "react-icons/lu";
import FileUploadList from "@/util/FileUploadList";
import { NavLink, useNavigate } from "react-router-dom";
import styles from "./FormStyles.module.css";
import { Toaster, toaster } from "@/components/ui/toaster";
import { useState } from "react";

const NewPlace = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [pricePerMonth, setPricePerMonth] = useState(0);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [numberOfRooms, setNumberOfRooms] = useState(2);
  const [capacity, setCapacity] = useState(2);
  const [availableFrom, setAvailableFrom] = useState(null);
  const [availableTo, setAvailableTo] = useState(null);
  const [sizeM2, setSizeM2] = useState(0);
  const [isPetFriendly, setIsPetFriendly] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [uploadedPhotoUrls, setUploadedPhotoUrls] = useState([]);
  const [buttonLoading, setButtonLoading] = useState(false);

  const navigate = useNavigate();

  const urlUploadPhoto = "http://localhost:8080/api/photos/upload";
  const optionsUploadPhoto = (photo) => {
    const formData = new FormData();
    formData.append("file", photo);
    return {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    };
  };

  const urlCreatePlace = "http://localhost:8080/api/housings";
  const optionsCreatePlace = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({
      name: name,
      description: description,
      address: address,
      city: city,
      pricePerMonth: pricePerMonth,
      latitude: latitude,
      longitude: longitude,
      numberOfRooms: numberOfRooms,
      capacity: capacity,
      availableFrom: availableFrom,
      availableTo: availableTo,
      userId: localStorage.getItem("userId"),
      sizeM2: sizeM2,
      isPetFriendly: isPetFriendly,
      photos: uploadedPhotoUrls,
    }),
  };

  const urlSavePhoto = "http://localhost:8080/api/photos";
  const optionsSavePhoto = (url, housingId) => {
    return {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: url,
        housingId: housingId,
      }),
    };
  };

  const savePhotoRecord = async (url, housingId) => {
    setButtonLoading(true);
    const response = await fetch(
      urlSavePhoto,
      optionsSavePhoto(url, housingId),
    );
    if (response.status === 401) {
      setButtonLoading(false);
      toaster.create({
        description: "Unauthorized. Please log in.",
        type: "error",
      });
    } else if (response.status === 500) {
      setButtonLoading(false);
      toaster.create({
        description: "Server error occurred during saving photo record.",
        type: "error",
      });
    } else if (response.ok) {
      setButtonLoading(false);
      console.log("Saved photo record data");
    } else {
      setButtonLoading(false);
      toaster.create({
        description: "Failed to save photo record.",
        type: "error",
      });
    }
  };

  const uploadPhoto = async (photo) => {
    setButtonLoading(true);
    const response = await fetch(urlUploadPhoto, optionsUploadPhoto(photo));
    if (response.status === 401) {
      setButtonLoading(false);
      toaster.create({
        description: "Unauthorized. Please log in.",
        type: "error",
      });
    } else if (response.status === 500) {
      setButtonLoading(false);
      toaster.create({
        description: "Server error occurred.",
        type: "error",
      });
    } else if (response.ok) {
      setButtonLoading(false);
      const data = await response.text();
      console.log("Uploaded photo data:", data);
      setUploadedPhotoUrls((prevUrls) => [...prevUrls, data]);
      return data;
    } else {
      setButtonLoading(false);
      toaster.create({
        description: "Failed to save a photo.",
        type: "error",
      });
    }
  };

  const addPlace = async () => {
    setButtonLoading(true);
    const response = await fetch(urlCreatePlace, optionsCreatePlace);
    if (response.status === 401) {
      setButtonLoading(false);
      toaster.create({
        description: "Unauthorized. Please log in.",
        type: "error",
      });
    } else if (response.status === 500) {
      setButtonLoading(false);
      toaster.create({
        description: "Server error occurred during creating place.",
        type: "error",
      });
    } else if (response.ok) {
      setButtonLoading(false);
      const data = await response.json();
      console.log("Created place data:", data);
      return data;
    } else {
      setButtonLoading(false);
      toaster.create({
        description: "Failed to add place.",
        type: "error",
      });
    }
  };

  return (
    <Box>
      <Box bg="gray.800" className={styles.loginBox}>
        <Heading as="h2" fontSize="2xl" mb={2} className={styles.heading}>
          Give information about your place
        </Heading>
        <Field.Root>
          <Field.Label>Title</Field.Label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>City</Field.Label>
          <Input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>Address</Field.Label>
          <Input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>Description</Field.Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>Number of rooms</Field.Label>
          <NumberInput.Root
            value={numberOfRooms}
            width="10rem"
            mb={4}
            onValueChange={(e) => setNumberOfRooms(e.valueAsNumber)}
            min={0}
          >
            <NumberInput.Control />
            <NumberInput.Input />
          </NumberInput.Root>
        </Field.Root>
        <Field.Root>
          <Field.Label>Capacity</Field.Label>
          <NumberInput.Root
            value={capacity}
            width="10rem"
            mb={4}
            onValueChange={(e) => setCapacity(e.valueAsNumber)}
            min={0}
          >
            <NumberInput.Control />
            <NumberInput.Input />
          </NumberInput.Root>
        </Field.Root>
        <Field.Root>
          <Field.Label>Size (m²)</Field.Label>
          <NumberInput.Root
            value={sizeM2}
            width="10rem"
            mb={4}
            onValueChange={(e) => setSizeM2(e.valueAsNumber)}
            min={0}
          >
            <NumberInput.Control />
            <NumberInput.Input />
          </NumberInput.Root>
        </Field.Root>
        <Field.Root>
          <Field.Label>Price per month (€) - by person</Field.Label>
          <NumberInput.Root
            value={pricePerMonth}
            width="10rem"
            mb={4}
            onValueChange={(e) => setPricePerMonth(e.valueAsNumber)}
            min={0}
          >
            <NumberInput.Control />
            <NumberInput.Input />
          </NumberInput.Root>
        </Field.Root>
        <Field.Root>
          <Field.Label>Available from</Field.Label>
          <Input
            type="date"
            value={availableFrom}
            onChange={(e) => setAvailableFrom(e.target.value)}
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>Available to</Field.Label>
          <Input
            type="date"
            value={availableTo}
            onChange={(e) => setAvailableTo(e.target.value)}
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>Pet friendly?</Field.Label>
          <NativeSelect.Root size="sm" width="full">
            <NativeSelect.Field
              value={isPetFriendly}
              onChange={(e) =>
                setIsPetFriendly(
                  e.currentTarget.value === "true" ? true : false,
                )
              }
            >
              <option value="true">Yes</option>
              <option value="false">Pets are not allowed</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>
        <FileUpload.Root
          accept="image/*"
          maxFiles={10}
          onFileAccept={(e) => setPhotos(e.files)}
        >
          <FileUpload.HiddenInput />
          <FileUpload.Label>Upload images</FileUpload.Label>
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
        </FileUpload.Root>
        <Button
          variant="surface"
          colorScheme="teal"
          size="md"
          width="full"
          _hover={{ backgroundColor: "teal.600" }}
          loading={buttonLoading}
          onClick={async () => {
            const data = await addPlace();
            console.log("New place - ID:", data.id);
            const urls = [];
            for (const photo of photos) {
              const url = await uploadPhoto(photo);
              urls.push(url);
            }
            for (const url of urls) {
              await savePhotoRecord(url, data.id);
            }
            toaster.create({
              description: "Saved successfully!",
              type: "success",
            });

            setTimeout(() => {
              navigate("/");
            }, 1000);
          }}
        >
          Save
        </Button>
      </Box>
      <Toaster />
    </Box>
  );
};

export default NewPlace;
