import { useMemo, useEffect, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { FcHome } from "react-icons/fc";
import { Box, Dialog, Portal } from "@chakra-ui/react";

const RecenterMap = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (position[0] !== 0 || position[1] !== 0) {
      map.setView(position, map.getZoom());
    }
  }, [map, position]);

  return null;
};

const Map = (props) => {
  const [position, setPosition] = useState([0, 0]);
  const geoapifyApiKey = import.meta.env.VITE_GEOAPIFY_API_KEY?.trim();
  const locationIcon = useMemo(
    () =>
      L.divIcon({
        className: "",
        html: renderToStaticMarkup(
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "9999px",
              background: "#0c0335",
              border: "2px solid #3182CE",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 16px rgba(0, 0, 0, 0.45)",
            }}
          >
            <FcHome size={22} aria-hidden="true" />
          </div>,
        ),
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      }),
    [],
  );

  const getCoords = async (address) => {
    if (!geoapifyApiKey) {
      console.warn("Missing VITE_GEOAPIFY_API_KEY in project root .env");
      return null;
    }

    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&apiKey=${geoapifyApiKey}`,
        { method: "GET" },
      );

      if (!response.ok) {
        console.warn(
          "Geoapify request failed:",
          response.status,
          response.statusText,
        );
        return null;
      }

      const result = await response.json();
      const coords = result?.features?.[0]?.geometry?.coordinates;

      if (!coords || coords.length < 2) {
        console.warn("No coordinates found for address:", address);
        return null;
      }
      console.log("Fetched coordinates:", coords);
      return [coords[1], coords[0]];
    } catch (error) {
      console.log("error", error);
      return null;
    }
  };

  useEffect(() => {
    const address = props.room?.address;
    const city = props.room?.city;

    if (!address || !city) {
      return;
    }

    getCoords(`${address} ${city}`).then((coords) => {
      if (coords) {
        setPosition(coords);
      }
      console.log("Updated position:", coords);
    });
  }, [props.room?.address, props.room?.city, geoapifyApiKey]);

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
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  />
                  <Marker position={position} icon={locationIcon}></Marker>
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
