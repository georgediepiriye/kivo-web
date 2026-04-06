"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import mapboxgl, { Map as MapboxMap, Marker } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

// Event type with status
export interface Event {
  id: number;
  lat: number;
  lng: number;
  emoji: string;
  title: string;
  image: string;
  status: "upcoming" | "ongoing" | "past";
}

// Color map for statuses
const statusColors: Record<Event["status"], string> = {
  upcoming: "#10b981", // green
  ongoing: "#facc15", // yellow
  past: "#9ca3af", // gray
};

export interface MapRef {
  flyToUser: () => void;
}

interface RealMapProps {
  onSelect: (event: Event) => void;
  filteredEvents: Event[];
}

const RealMap = forwardRef<MapRef, RealMapProps>(
  ({ onSelect, filteredEvents }, ref) => {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<MapboxMap | null>(null);
    const userMarkerRef = useRef<Marker | null>(null);
    const eventMarkersRef = useRef<Marker[]>([]);

    useImperativeHandle(ref, () => ({
      flyToUser: () => {
        if (mapRef.current && userMarkerRef.current) {
          const lngLat = userMarkerRef.current.getLngLat();
          mapRef.current.flyTo({ center: [lngLat.lng, lngLat.lat], zoom: 13 });
        }
      },
    }));

    // Initialize map
    useEffect(() => {
      if (!mapContainer.current) return;
      if (mapRef.current) return;

      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11", // clean, minimal style
        center: [3.3792, 6.5244],
        zoom: 12,
      });

      mapRef.current = map;

      // Force proper render after navigation
      setTimeout(() => map.resize(), 500);
      requestAnimationFrame(() => map.resize());

      // Hide default POIs
      map.on("load", () => {
        const layers = map.getStyle().layers;
        if (!layers) return;
        layers.forEach((layer) => {
          if (layer.type === "symbol" && layer.id.includes("poi")) {
            map.setLayoutProperty(layer.id, "visibility", "none");
          }
        });
      });

      // User location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.flyTo({ center: [longitude, latitude], zoom: 13 });

          const userEl = document.createElement("div");
          userEl.style.width = "16px";
          userEl.style.height = "16px";
          userEl.style.backgroundColor = "#3b82f6";
          userEl.style.borderRadius = "50%";
          userEl.style.border = "2px solid white";

          userMarkerRef.current = new mapboxgl.Marker(userEl)
            .setLngLat([longitude, latitude])
            .addTo(map);
        },
        () => {},
      );
    }, []);

    // Update event markers whenever filteredEvents changes
    useEffect(() => {
      if (!mapRef.current) return;

      // Remove old markers
      eventMarkersRef.current.forEach((m) => m.remove());
      eventMarkersRef.current = [];

      // Add new markers
      filteredEvents.forEach((event) => {
        const el = document.createElement("div");
        el.innerText = event.emoji;
        el.style.fontSize = "32px";
        el.style.textAlign = "center";
        el.style.width = "40px";
        el.style.height = "40px";
        el.style.lineHeight = "40px";
        el.style.background = statusColors[event.status];
        el.style.borderRadius = "50%";
        el.style.boxShadow = "0 0 4px rgba(0,0,0,0.4)";
        el.style.cursor = "pointer";

        el.addEventListener("click", () => {
          mapRef.current?.flyTo({
            center: [event.lng, event.lat],
            zoom: 14,
            speed: 1.2,
          });
          onSelect(event);
        });

        const marker = new Marker(el)
          .setLngLat([event.lng, event.lat])
          .addTo(mapRef.current!);

        eventMarkersRef.current.push(marker);
      });
    }, [filteredEvents, onSelect]);

    return <div ref={mapContainer} className="w-full h-[100dvh]" />;
  },
);

RealMap.displayName = "RealMap";

export default RealMap;
