"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import mapboxgl, { Map as MapboxMap, Marker } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Event } from "@/lib/events";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

const statusColors: Record<Event["status"], string> = {
  upcoming: "#10b981",
  ongoing: "#facc15",
  past: "#9ca3af",
};

export interface MapRef {
  flyToUser: () => void;
  flyTo: (coords: { lat: number; lng: number }) => void;
}

interface RealMapProps {
  onSelect: (event: Event) => void;
  filteredEvents: Event[];
}

const RealMap = forwardRef<MapRef, RealMapProps>(
  ({ onSelect, filteredEvents }, ref) => {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<MapboxMap | null>(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const userMarkerRef = useRef<Marker | null>(null);
    const eventMarkersRef = useRef<Marker[]>([]);

    useImperativeHandle(ref, () => ({
      flyToUser: () => {
        if (mapRef.current && userMarkerRef.current) {
          const lngLat = userMarkerRef.current.getLngLat();
          mapRef.current.flyTo({ center: [lngLat.lng, lngLat.lat], zoom: 14 });
        }
      },
      flyTo: (coords: { lat: number; lng: number }) => {
        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [coords.lng, coords.lat],
            zoom: 15,
            speed: 1.5,
          });
        }
      },
    }));

    // Initialize map
    useEffect(() => {
      if (!mapContainer.current || mapRef.current) return;

      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [7.0354, 4.8156],
        zoom: 12,
      });

      map.on("load", () => {
        mapRef.current = map;
        setIsMapReady(true);

        // Check for geolocation after map is loaded
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              // Safety check: ensure map wasn't removed while waiting for GPS
              if (!mapRef.current) return;

              const { latitude, longitude } = position.coords;
              const userEl = document.createElement("div");
              userEl.className =
                "w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg";

              // This was where your error was:
              // We now use mapRef.current specifically to be safe
              userMarkerRef.current = new mapboxgl.Marker(userEl)
                .setLngLat([longitude, latitude])
                .addTo(mapRef.current);
            },
            () => {
              console.log("User denied location access");
            },
          );
        }
      });

      return () => {
        map.remove();
        mapRef.current = null;
      };
    }, []);

    // Handle Event Markers
    useEffect(() => {
      if (!isMapReady || !mapRef.current) return;

      eventMarkersRef.current.forEach((m) => m.remove());
      eventMarkersRef.current = [];

      filteredEvents.forEach((event) => {
        const el = document.createElement("div");
        el.className = "cursor-pointer transition-transform hover:scale-110";
        el.innerHTML = `
          <div style="background: ${statusColors[event.status]}; 
               border-radius: 50%; width: 40px; height: 40px; 
               display: flex; align-items: center; justify-content: center; 
               box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-size: 24px;">
            ${event.emoji}
          </div>
        `;

        el.addEventListener("click", (e) => {
          e.stopPropagation();
          onSelect(event);
        });

        const marker = new Marker(el)
          .setLngLat([event.lng, event.lat])
          .addTo(mapRef.current!);

        eventMarkersRef.current.push(marker);
      });
    }, [filteredEvents, onSelect, isMapReady]);

    return <div ref={mapContainer} className="w-full h-full" />;
  },
);

RealMap.displayName = "RealMap";

export default RealMap;
