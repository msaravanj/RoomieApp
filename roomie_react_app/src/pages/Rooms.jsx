import React, { Suspense, useEffect, useState } from "react";
import { Box, Flex, createOverlay } from "@chakra-ui/react";
import RoomCard from "../components/RoomCard";
import OverlayCard from "../components/OverlayCard";
import styles from "./Rooms.module.css";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [photos, setPhotos] = useState([]);

  const dialog = createOverlay((overlay) => {
    return (
      <OverlayCard
        room={overlay}
        photos={photos.filter((photo) => photo.housingId === overlay.id)}
        open={overlay.open}
        onOpenChange={overlay.onOpenChange}
      />
    );
  });

  const openDialog = (room) => {
    dialog.open("a", room);
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
      setRooms(data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchPhotos();
  }, []);

  return (
    <Box className={styles.box}>
      <Flex
        direction="row"
        gap="6"
        mt="4"
        flexWrap="wrap"
        justifyContent="center"
      >
        {rooms.map((room) => (
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
              openDialog={() => openDialog(room)}
            />
          </Suspense>
        ))}
      </Flex>
      <dialog.Viewport />
    </Box>
  );
};

export default Rooms;
