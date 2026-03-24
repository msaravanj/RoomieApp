const geoapifyApiKey = import.meta.env.VITE_GEOAPIFY_API_KEY?.trim();

export const getCoords = async (address) => {
  if (!geoapifyApiKey) {
    console.warn("Missing geoapify API key");
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

const toRadians = (value) => (value * Math.PI) / 180;
export const calculateDistanceKm = (from, to) => {
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(to[0] - from[0]);
  const deltaLng = toRadians(to[1] - from[1]);
  const lat1 = toRadians(from[0]);
  const lat2 = toRadians(to[0]);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
