import { useMemo, useEffect, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { FcHome } from "react-icons/fc";
import { Box, Dialog, Portal } from "@chakra-ui/react";
import { calculateDistanceKm } from "../util/locationService";

const RecenterMap = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (position[0] !== 0 || position[1] !== 0) {
      map.setView(position, map.getZoom());
    }
  }, [map, position]);

  return null;
};

const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (event) => {
      onMapClick?.([event.latlng.lat, event.latlng.lng]);
    },
  });

  return null;
};

const Map = (props) => {
  const [position, setPosition] = useState([0, 0]);
  const handleMarkerClick = (room) => {
    props.onOpenChange?.({ open: false });
    setTimeout(() => {
      props.onRoomMarkerClick?.(room);
    }, 0);
  };

  const createLocationIcon = (size, border, iconSize) =>
    L.divIcon({
      className: "",
      html: renderToStaticMarkup(
        <div
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: "9999px",
            background: "#0c0335",
            border,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 6px 16px rgba(0, 0, 0, 0.45)",
          }}
        >
          <FcHome size={iconSize} aria-hidden="true" />
        </div>,
      ),
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
    });

  const mainLocationIcon = useMemo(
    () => createLocationIcon(50, "3px solid #63B3ED", 28),
    [],
  );

  const nearbyLocationIcon = useMemo(
    () => createLocationIcon(34, "2px solid #3182CE", 18),
    [],
  );

  useEffect(() => {
    if (props.selectLocationMode) {
      const selectedLatitude = Number(props.selectedLocation?.[0]);
      const selectedLongitude = Number(props.selectedLocation?.[1]);

      if (
        Number.isFinite(selectedLatitude) &&
        Number.isFinite(selectedLongitude)
      ) {
        setPosition([selectedLatitude, selectedLongitude]);
        return;
      }
    }

    const latitude = Number(props.room?.latitude);
    const longitude = Number(props.room?.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return;
    }
    setPosition([latitude, longitude]);
  }, [props.room, props.selectLocationMode, props.selectedLocation]);

  const nearbyRooms = useMemo(() => {
    const [baseLat, baseLng] = position;
    const hasValidBasePosition =
      Number.isFinite(baseLat) &&
      Number.isFinite(baseLng) &&
      (baseLat !== 0 || baseLng !== 0);

    if (!hasValidBasePosition || !Array.isArray(props.rooms)) {
      return [];
    }

    return props.rooms.filter((room) => {
      const latitude = Number(room?.latitude);
      const longitude = Number(room?.longitude);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return false;
      }

      const sameAsMainPosition = latitude === baseLat && longitude === baseLng;
      if (sameAsMainPosition) {
        return false;
      }

      const distanceKm = calculateDistanceKm(position, [latitude, longitude]);
      return distanceKm < 30;
    });
  }, [position, props.rooms]);

  return (
    <Dialog.Root
      size="xxl"
      placement="center"
      open={props.open}
      onOpenChange={props.onOpenChange}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            width="min(96vw, 960px)"
            bg="gray.900"
            border="1px solid"
            borderColor="whiteAlpha.300"
            borderRadius="2xl"
            overflow="hidden"
            boxShadow="2xl"
          >
            <Dialog.Body p={4}>
              <Box
                borderRadius="xl"
                overflow="hidden"
                border="1px solid"
                borderColor="whiteAlpha.200"
                height="min(70vh, 560px)"
                width="100%"
              >
                <MapContainer
                  center={position}
                  zoom={13}
                  scrollWheelZoom={false}
                  style={{ height: "100%", width: "100%" }}
                >
                  <RecenterMap position={position} />
                  {props.selectLocationMode && (
                    <MapClickHandler
                      onMapClick={(coords) => {
                        setPosition(coords);
                        props.onLocationSelect?.(coords);
                        props.onOpenChange?.({ open: false });
                      }}
                    />
                  )}
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  />
                  {props.selectLocationMode ? (
                    <Marker
                      position={position}
                      icon={mainLocationIcon}
                    ></Marker>
                  ) : (
                    <>
                      {nearbyRooms.map((room) => (
                        <Marker
                          key={room.id}
                          position={[
                            Number(room.latitude),
                            Number(room.longitude),
                          ]}
                          icon={nearbyLocationIcon}
                          eventHandlers={{
                            click: () => handleMarkerClick(room),
                          }}
                        ></Marker>
                      ))}
                      {props.room?.latitude && props.room?.longitude && (
                        <Marker
                          position={position}
                          icon={mainLocationIcon}
                          eventHandlers={{
                            click: () => handleMarkerClick(props.room),
                          }}
                        ></Marker>
                      )}
                    </>
                  )}
                </MapContainer>
              </Box>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default Map;
