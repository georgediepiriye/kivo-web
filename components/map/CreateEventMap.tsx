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

    useEffect(() => {
      if (!mapContainer.current || mapRef.current) return;

      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [7.0354, 4.8156], // Port Harcourt as default
        zoom: 12,
      });

      mapRef.current = map;

      // Hide POIs
      map.on("load", () => {
        map.getStyle().layers?.forEach((layer) => {
          if (layer.type === "symbol" && layer.id.includes("poi")) {
            map.setLayoutProperty(layer.id, "visibility", "none");
          }
        });
      });

      // User location
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          map.flyTo({ center: [longitude, latitude], zoom: 13 });
        },
        () => {},
      );

      // Click to select location
      map.on("click", (e) => {
        const coords = { lat: e.lngLat.lat, lng: e.lngLat.lng };
        onSelect(coords);

        if (markerRef.current) {
          markerRef.current.setLngLat([coords.lng, coords.lat]);
        } else {
          const el = document.createElement("div");
          el.style.width = "24px";
          el.style.height = "24px";
          el.style.backgroundColor = "#f59e0b";
          el.style.borderRadius = "50%";
          el.style.border = "2px solid white";

          markerRef.current = new mapboxgl.Marker(el)
            .setLngLat([coords.lng, coords.lat])
            .addTo(map);
        }
      });

      // ✅ Proper cleanup
      return () => {
        map.remove(); // remove map instance
        mapRef.current = null;
        markerRef.current = null;
      };
    }, [onSelect]);

    useEffect(() => {
      if (!selectedCoords || !mapRef.current) return;

      if (markerRef.current) {
        markerRef.current.setLngLat([selectedCoords.lng, selectedCoords.lat]);
      } else {
        const el = document.createElement("div");
        el.style.width = "24px";
        el.style.height = "24px";
        el.style.backgroundColor = "#f59e0b";
        el.style.borderRadius = "50%";
        el.style.border = "2px solid white";

        markerRef.current = new mapboxgl.Marker(el)
          .setLngLat([selectedCoords.lng, selectedCoords.lat])
          .addTo(mapRef.current);
      }

      mapRef.current.flyTo({
        center: [selectedCoords.lng, selectedCoords.lat],
        zoom: 14,
        speed: 1.2,
      });
    }, [selectedCoords]);

    return (
      <div
        ref={mapContainer}
        className="w-full h-[60vh] rounded-xl shadow-md"
      />
    );
  },
);

CreateEventMap.displayName = "CreateEventMap";
export default CreateEventMap;
