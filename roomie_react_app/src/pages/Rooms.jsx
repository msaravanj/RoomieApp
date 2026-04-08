import React, { Suspense, useEffect, useState, useMemo } from "react";
import {
  Box,
  Flex,
  createOverlay,
  createListCollection,
  Input,
  Select,
} from "@chakra-ui/react";
import RoomCard from "../components/RoomCard";
import OverlayCard from "../components/OverlayCard";
import Map from "../components/Map";
import styles from "./Rooms.module.css";
import { calculateDistanceKm } from "../util/locationService";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [maxPrice, setMaxPrice] = useState(500);
  const [maxDistance, setMaxDistance] = useState(20);
  const [userLocation, setUserLocation] = useState(null);
  const [smokingFilter, setSmokingFilter] = useState("");
  const [lifestyleProfiles, setLifestyleProfiles] = useState({});
  const [matchings, setMatchings] = useState([]);
  const [sortBy, setSortBy] = useState("none");

  const sortOptions = useMemo(
    () =>
      createListCollection({
        items: [
          { label: "-", value: "none" },
          { label: "Price (low to high)", value: "priceAsc" },
          { label: "Roomie match (high to low)", value: "matchingDesc" },
        ],
      }),
    [],
  );

  const matchingScoreByUserId = useMemo(() => {
    const scoreMap = {};

    for (const matching of matchings) {
      const numericScore = Number(matching?.score);

      if (
        matching?.userId !== undefined &&
        matching?.userId !== null &&
        Number.isFinite(numericScore)
      ) {
        scoreMap[String(matching.userId)] = numericScore;
      }
    }

    return scoreMap;
  }, [matchings]);

  const roomDialog = createOverlay((overlay) => {
    return (
      <OverlayCard
        room={overlay}
        photos={photos.filter((photo) => photo.housingId === overlay.id)}
        matching={matchings.find((m) => m.userId == overlay.userId)}
        open={overlay.open}
        onOpenChange={overlay.onOpenChange}
        openMapDialog={() => openMapDialog(overlay)}
      />
    );
  });

  const mapDialog = createOverlay((overlay) => {
    return (
      <Map
        room={overlay}
        onOpenChange={overlay.onOpenChange}
        open={overlay.open}
        rooms={rooms}
        onRoomMarkerClick={openRoomDialog}
      />
    );
  });

  const locationPickerDialog = createOverlay((overlay) => {
    return (
      <Map
        room={overlay}
        onOpenChange={overlay.onOpenChange}
        open={overlay.open}
        rooms={rooms}
        selectLocationMode
        selectedLocation={userLocation}
        onLocationSelect={(coords) => {
          setUserLocation(coords);
        }}
      />
    );
  });

  const openRoomDialog = (room) => {
    roomDialog.open("room", room);
  };

  const openMapDialog = (room) => {
    mapDialog.open("map", room);
  };

  const openLocationPicker = () => {
    const fallbackRoomWithCoords = rooms.find(
      (room) =>
        Number.isFinite(Number(room?.latitude)) &&
        Number.isFinite(Number(room?.longitude)),
    );

    if (userLocation) {
      locationPickerDialog.open("locationPicker", {
        latitude: userLocation[0],
        longitude: userLocation[1],
      });
      return;
    }

    if (fallbackRoomWithCoords) {
      locationPickerDialog.open("locationPicker", {
        latitude: Number(fallbackRoomWithCoords.latitude),
        longitude: Number(fallbackRoomWithCoords.longitude),
      });
      return;
    }

    locationPickerDialog.open("locationPicker", {
      latitude: 44.7866,
      longitude: 20.4489,
    });
  };

  const fetchMatchings = async () => {
    try {
      const user = await fetchUser(localStorage.getItem("userId"));
      const response = await fetch(
        `http://localhost:8080/api/matchings/${user.lifestyleProfileId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      const data = await response.json();
      console.log("Fetched matchings:", data);
      setMatchings(data);
    } catch (error) {
      console.error("Error fetching matchings:", error);
    }
  };

  const fetchPhotos = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/photos", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setPhotos(data);
    } catch (error) {
      console.error("Error fetching photos:", error);
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
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching lifestyle profile for ${id}:`, error);
      return null;
    }
  };

  const fetchUser = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/users/${userId}`,
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
      console.error(`Error fetching user for ${userId}:`, error);
      return null;
    }
  };

  // dohvaćanje lifestyle profile-a za sve korisnike kada se rooms učitaju
  useEffect(() => {
    const fetchAllLifestyleProfiles = async () => {
      const profiles = {};
      for (const room of rooms) {
        if (room.userId && !profiles[room.userId]) {
          const user = await fetchUser(room.userId);
          if (user && user.lifestyleProfileId) {
            const lifestyleProfile = await fetchLifestyleProfile(
              user.lifestyleProfileId,
            );
            profiles[room.userId] = lifestyleProfile;
          }
        }
      }
      setLifestyleProfiles(profiles);
    };

    if (rooms.length > 0) {
      fetchAllLifestyleProfiles();
    }
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    const result = rooms.filter((room) => {
      // Search filter - tekst pretraga po imenu i opisu
      const searchLower = searchText.toLowerCase();
      const matchesSearch =
        !searchText ||
        room.name.toLowerCase().includes(searchLower) ||
        room.description?.toLowerCase().includes(searchLower) ||
        room.address?.toLowerCase().includes(searchLower) ||
        room.city?.toLowerCase().includes(searchLower);

      // Price filter
      const matchesPrice =
        !room.pricePerMonth || room.pricePerMonth <= maxPrice;

      // Smoking filter - proveri lifestyle profile
      let matchesSmoking = true;
      if (smokingFilter !== "") {
        const profile = lifestyleProfiles[room.userId];
        if (profile) {
          const isSmoker = profile.isSmoker;
          if (smokingFilter === "no") {
            matchesSmoking = !isSmoker; // traži non-smokere
          } else if (smokingFilter === "yes") {
            matchesSmoking = isSmoker; // traži smokere
          }
        } else {
          // ako nema lifestyle profile podataka - preskoči
          matchesSmoking = false;
        }
      }

      // Location filter - distanca do maxDistance km
      let matchesDistance = true;
      if (
        userLocation &&
        room.latitude !== undefined &&
        room.longitude !== undefined
      ) {
        const distance = calculateDistanceKm(userLocation, [
          Number(room.latitude),
          Number(room.longitude),
        ]);
        matchesDistance = distance <= maxDistance;
      }

      return matchesSearch && matchesPrice && matchesSmoking && matchesDistance;
    });

    if (sortBy === "priceAsc") {
      return [...result].sort((a, b) => {
        const priceA = Number(a.pricePerMonth);
        const priceB = Number(b.pricePerMonth);
        const normalizedPriceA = Number.isFinite(priceA)
          ? priceA
          : Number.POSITIVE_INFINITY;
        const normalizedPriceB = Number.isFinite(priceB)
          ? priceB
          : Number.POSITIVE_INFINITY;

        return normalizedPriceA - normalizedPriceB;
      });
    }

    if (sortBy === "matchingDesc") {
      return [...result].sort((a, b) => {
        const scoreA = matchingScoreByUserId[String(a.userId)] ?? -1;
        const scoreB = matchingScoreByUserId[String(b.userId)] ?? -1;

        return scoreB - scoreA;
      });
    }

    return result;
  }, [
    rooms,
    searchText,
    maxPrice,
    maxDistance,
    userLocation,
    smokingFilter,
    lifestyleProfiles,
    sortBy,
    matchingScoreByUserId,
  ]);

  const fetchRooms = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/housings", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      const currentUserId = localStorage.getItem("userId");
      const filteredRooms = Array.isArray(data)
        ? data.filter(
            (room) => !currentUserId || String(room.userId) !== currentUserId,
          )
        : [];
      setRooms(filteredRooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchPhotos();
    fetchMatchings();
  }, []);

  return (
    <Box className={styles.box}>
      <Box className={styles.filterPanel}>
        <h2 className={styles.filterTitle}>Filters</h2>
        <div className={styles.filtersStack}>
          <Box className={styles.filterSection}>
            <p className={styles.filterLabel}>Search</p>
            <Input
              className={styles.searchInput}
              placeholder="Search by name, location, or description..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Box>

          <Box className={styles.filterSection}>
            <div className={styles.filterRow}>
              <p className={styles.filterLabel}>Max Price</p>
              <p className={styles.valueText}>up to {maxPrice}€</p>
            </div>
            <input
              className={styles.rangeInput}
              type="range"
              min={50}
              max={1500}
              step={50}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
          </Box>

          <Box className={styles.filterSection}>
            <div className={styles.filterRow}>
              <p className={styles.filterLabel}>Max Distance</p>
              <p className={styles.valueText}>{maxDistance} km</p>
            </div>
            <input
              className={styles.rangeInput}
              type="range"
              min={1}
              max={30}
              step={1}
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
            />
            {userLocation && (
              <p className={styles.locationText}>
                Using location: {userLocation[0].toFixed(3)},{" "}
                {userLocation[1].toFixed(3)}
              </p>
            )}
          </Box>

          <Box className={styles.filterSection}>
            <p className={styles.filterLabel}>Smoking Preference</p>
            <div className={styles.smokingButtons}>
              <button
                type="button"
                className={`${styles.smokingButton} ${smokingFilter === "" ? styles.smokingButtonActive : ""}`}
                onClick={() => setSmokingFilter("")}
              >
                Any
              </button>
              <button
                type="button"
                className={`${styles.smokingButton} ${smokingFilter === "no" ? styles.smokingButtonActive : ""}`}
                onClick={() => setSmokingFilter("no")}
              >
                Non-smoker only
              </button>
              <button
                type="button"
                className={`${styles.smokingButton} ${smokingFilter === "yes" ? styles.smokingButtonActive : ""}`}
                onClick={() => setSmokingFilter("yes")}
              >
                Smoker
              </button>
            </div>
          </Box>

          <Box className={styles.filterSection}>
            <p className={styles.filterLabel}>Sort by:</p>
            <Select.Root
              collection={sortOptions}
              value={[sortBy]}
              onValueChange={(details) =>
                setSortBy(details.value?.[0] ?? "none")
              }
              width="full"
            >
              <Select.HiddenSelect />
              <Select.Control>
                <Select.Trigger className={styles.searchInput}>
                  <Select.ValueText placeholder="-" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Select.Positioner>
                <Select.Content>
                  {sortOptions.items.map((option) => (
                    <Select.Item item={option} key={option.value}>
                      {option.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Select.Root>
          </Box>

          <button
            type="button"
            className={styles.locationButton}
            onClick={openLocationPicker}
          >
            Select preferred location on map
          </button>
        </div>
      </Box>

      <p className={styles.resultsInfo}>
        Showing {filteredRooms.length} of {rooms.length} rooms
      </p>

      <Flex className={styles.roomsGrid}>
        {filteredRooms.length > 0 ? (
          filteredRooms.map((room) => (
            <Suspense key={room.id} fallback={<div>Loading...</div>}>
              <RoomCard
                room={room}
                key={room.id}
                title={room.name}
                address={room.address}
                city={room.city}
                price={room.pricePerMonth}
                capacity={room.capacity}
                photos={photos.filter((photo) => photo.housingId === room.id)}
                openRoomDialog={() => openRoomDialog(room)}
                openMapDialog={() => openMapDialog(room)}
                rooms={rooms}
                matching={matchings.find((m) => m.userId == room.userId)}
              />
            </Suspense>
          ))
        ) : (
          <Box className={styles.emptyState}>
            <p className={styles.emptyText}>No rooms match your filters.</p>
          </Box>
        )}
      </Flex>
      <roomDialog.Viewport />
      <mapDialog.Viewport />
      <locationPickerDialog.Viewport />
    </Box>
  );
};

export default Rooms;
