export async function getIPLocation() {
  try {
    // ipapi.co is free for development.
    // In production, consider ipinfo.io or similar.
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();
    return {
      lat: data.latitude,
      lng: data.longitude,
      city: data.city || "Port Harcourt",
      accuracy: "city",
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // Ultimate fallback if the internet itself is acting up
    return {
      lat: 4.8156,
      lng: 7.0498,
      city: "Port Harcourt",
      accuracy: "default",
    };
  }
}
