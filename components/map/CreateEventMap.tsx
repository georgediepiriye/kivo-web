"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import mapboxgl, { Map as MapboxMap, Marker } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

export interface MapRef {
  flyToUser: () => void;
}

interface CreateEventMapProps {
  selectedCoords: { lat: number; lng: number } | null;
  onSelect: (coords: { lat: number; lng: number }) => void;
}

const CreateEventMap = forwardRef<MapRef, CreateEventMapProps>(
  ({ selectedCoords, onSelect }, ref) => {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<MapboxMap | null>(null);
    const markerRef = useRef<Marker | null>(null);

    useImperativeHandle(ref, () => ({
      flyToUser: () => {
        if (mapRef.current && markerRef.current) {
          const lngLat = markerRef.current.getLngLat();
          mapRef.current.flyTo({ center: [lngLat.lng, lngLat.lat], zoom: 13 });
        }
      },
    }));

    // Function to create or update the custom marker
    const updateMarker = (
      map: MapboxMap,
      coords: { lat: number; lng: number },
    ) => {
      if (markerRef.current) {
        markerRef.current.setLngLat([coords.lng, coords.lat]);
      } else {
        const el = document.createElement("div");
        el.style.width = "24px";
        el.style.height = "24px";
        el.style.backgroundColor = "#715800"; // Updated to Kivo brand color
        el.style.borderRadius = "50%";
        el.style.border = "3px solid white";
        el.style.boxShadow = "0 4px 10px rgba(0,0,0,0.3)";

        markerRef.current = new mapboxgl.Marker(el)
          .setLngLat([coords.lng, coords.lat])
          .addTo(map);
      }
    };

    useEffect(() => {
      if (!mapContainer.current || mapRef.current) return;

      // Determine initial center: Use pinned location if available, else Port Harcourt
      const initialCenter: [number, number] = selectedCoords
        ? [selectedCoords.lng, selectedCoords.lat]
        : [7.0354, 4.8156];

      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: initialCenter,
        zoom: selectedCoords ? 15 : 12, // Zoom in closer if location is already pinned
      });

      mapRef.current = map;

      map.on("load", () => {
        // Hide POIs for a cleaner look
        map.getStyle().layers?.forEach((layer) => {
          if (layer.type === "symbol" && layer.id.includes("poi")) {
            map.setLayoutProperty(layer.id, "visibility", "none");
          }
        });

        // If coordinates were already passed, place the marker immediately on load
        if (selectedCoords) {
          updateMarker(map, selectedCoords);
        }
      });

      // REMOVED: The navigator.geolocation flyTo logic that was overriding the view

      // Click to select location
      map.on("click", (e) => {
        const coords = { lat: e.lngLat.lat, lng: e.lngLat.lng };
        onSelect(coords);
        updateMarker(map, coords);
      });

      return () => {
        map.remove();
        mapRef.current = null;
        markerRef.current = null;
      };
    }, []); // Only run once on mount

    // Handle updates to selectedCoords from the outside (e.g. from GPS button)
    useEffect(() => {
      if (!selectedCoords || !mapRef.current) return;

      updateMarker(mapRef.current, selectedCoords);

      mapRef.current.flyTo({
        center: [selectedCoords.lng, selectedCoords.lat],
        zoom: 15,
        speed: 1.5,
        essential: true,
      });
    }, [selectedCoords]);

    return (
      <div
        ref={mapContainer}
        className="w-full h-full min-h-[500px]" // Use full height to fill the overlay
      />
    );
  },
);

CreateEventMap.displayName = "CreateEventMap";
export default CreateEventMap;
