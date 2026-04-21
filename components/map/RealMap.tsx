/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import mapboxgl, {
  Map as MapboxMap,
  Marker,
  GeolocateControl,
} from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Event } from "@/lib/events";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

// Helper to get category-specific markers
const getHotspotMarkerHTML = (category: string, title: string) => {
  const icons: Record<string, string> = {
    nightlife: "🎵",
    lounge: "🍻",
    dining: "🍴",
    cafe: "☕",
    workspace: "💻",
    arts: "🎨",
    wellness: "🧘",
    retail: "🛍️",
  };

  const icon = icons[category] || "📍";

  return `
    <div class="group relative cursor-pointer transition-transform active:scale-90 flex items-center justify-center">
      <div class="absolute inset-0 bg-orange-400/30 rounded-full blur-lg group-hover:bg-orange-400/50 transition-all"></div>
      
      <div class="relative w-9 h-9 bg-white border-2 border-orange-500 rounded-full shadow-xl flex items-center justify-center text-lg hover:border-black transition-colors">
        ${icon}
      </div>

      <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[9px] font-black rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap uppercase tracking-tighter shadow-2xl pointer-events-none z-50">
        ${title}
      </div>
      
      <div class="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-1.5 bg-orange-500"></div>
    </div>
  `;
};

const statusColors: Record<string, string> = {
  upcoming: "#EAB308", // Yellow
  ongoing: "#059669", // Green
  default: "#715800",
};

export interface MapRef {
  flyToUser: () => void;
  flyTo: (coords: { lat: number; lng: number }) => void;
}

interface RealMapProps {
  onSelect: (event: Event) => void;
  onSelectHotspot: (hotspot: any) => void;
  filteredEvents: Event[];
  showHotspots: boolean;
  hotspotCategory: string;
}

const RealMap = forwardRef<MapRef, RealMapProps>(
  (
    {
      onSelect,
      onSelectHotspot,
      filteredEvents,
      showHotspots,
      hotspotCategory,
    },
    ref,
  ) => {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<MapboxMap | null>(null);
    const geolocateControlRef = useRef<GeolocateControl | null>(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const markersRef = useRef<{
      [key: string]: { marker: Marker; status: string };
    }>({});
    const hotspotMarkersRef = useRef<Marker[]>([]);

    const handleFlyToUser = () => {
      if (geolocateControlRef.current) geolocateControlRef.current.trigger();
    };

    useImperativeHandle(ref, () => ({
      flyToUser: handleFlyToUser,
      flyTo: (coords: { lat: number; lng: number }) => {
        mapRef.current?.flyTo({
          center: [coords.lng, coords.lat],
          zoom: 15.5,
          speed: 1.2,
        });
      },
    }));

    // --- INITIALIZATION ---
    useEffect(() => {
      if (!mapContainer.current || mapRef.current) return;
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [7.035, 4.815],
        zoom: 11.5,
      });

      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
        showUserLocation: true,
      });

      map.addControl(geolocate);
      geolocateControlRef.current = geolocate;

      map.on("load", () => {
        map.addSource("events", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
          cluster: true,
          clusterMaxZoom: 15,
          clusterRadius: 50,
        });

        map.addLayer({
          id: "clusters",
          type: "circle",
          source: "events",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": "#1E293B",
            "circle-radius": [
              "step",
              ["get", "point_count"],
              20,
              10,
              30,
              30,
              40,
            ],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#fff",
          },
        });

        map.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "events",
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count}",
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12,
          },
          paint: { "text-color": "#ffffff" },
        });

        map.addLayer({
          id: "unclustered-point",
          type: "circle",
          source: "events",
          filter: ["!", ["has", "point_count"]],
          paint: { "circle-radius": 0 },
        });

        mapRef.current = map;
        setIsMapReady(true);
        geolocate.trigger();
      });

      return () => map.remove();
    }, []);

    // --- HOTSPOT MANAGEMENT (Updated with Icon Logic) ---
    useEffect(() => {
      if (!isMapReady || !mapRef.current) return;

      hotspotMarkersRef.current.forEach((m) => m.remove());
      hotspotMarkersRef.current = [];

      if (!showHotspots) return;

      const fetchHotspots = async () => {
        try {
          const categoryQuery =
            hotspotCategory !== "all" ? `?category=${hotspotCategory}` : "";
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/hotspots${categoryQuery}`,
          );
          const result = await res.json();

          if (result.status === "success") {
            result.data.hotspots.forEach((spot: any) => {
              const el = document.createElement("div");

              // Apply the new category-based HTML
              el.innerHTML = getHotspotMarkerHTML(
                spot.category,
                spot.title || spot.name || "Kivo Hotspot",
              );

              el.addEventListener("click", (e) => {
                e.stopPropagation();
                onSelectHotspot(spot);
                mapRef.current?.flyTo({
                  center: [
                    spot.location.coordinates[0],
                    spot.location.coordinates[1],
                  ],
                  zoom: 14,
                  speed: 0.8,
                });
              });

              const marker = new mapboxgl.Marker({
                element: el,
                anchor: "bottom", // Anchor at the bottom of the "stem"
              })
                .setLngLat([
                  spot.location.coordinates[0],
                  spot.location.coordinates[1],
                ])
                .addTo(mapRef.current!);

              hotspotMarkersRef.current.push(marker);
            });
          }
        } catch (err) {
          console.error("Hotspot fetch failed", err);
        }
      };

      fetchHotspots();
    }, [isMapReady, showHotspots, hotspotCategory, onSelectHotspot]);

    // --- EVENT MARKER MANAGEMENT ---
    useEffect(() => {
      if (!isMapReady || !mapRef.current) return;
      const map = mapRef.current;

      const features = filteredEvents.map((e: any) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [e.lng, e.lat] },
        properties: { id: e._id, ...e },
      }));

      (map.getSource("events") as mapboxgl.GeoJSONSource).setData({
        type: "FeatureCollection",
        features: features as any,
      });

      const updateMarkers = () => {
        const activeIds = new Set();
        const unclusteredFeatures = map.queryRenderedFeatures({
          layers: ["unclustered-point"],
        });

        unclusteredFeatures.forEach((feature) => {
          const props = feature.properties as any;
          const id = props.id;
          const coords = (feature.geometry as any).coordinates;
          activeIds.add(id);

          const now = new Date().getTime();
          const start = new Date(props.startDate).getTime();
          const end = new Date(props.endDate).getTime();
          const isLive = now >= start && now <= end;
          const currentStatus = isLive ? "live" : "upcoming";

          if (
            markersRef.current[id] &&
            markersRef.current[id].status === currentStatus
          )
            return;
          if (markersRef.current[id]) markersRef.current[id].marker.remove();

          const el = document.createElement("div");
          el.className = `relative flex flex-col items-center cursor-pointer transition-all duration-300 hover:scale-125`;

          let labelHtml = "";
          let dotColor = statusColors.upcoming;
          let dotPulse = "";

          if (isLive) {
            labelHtml = `<span class="absolute -top-7 bg-green-500 text-[8px] font-black px-2 py-0.5 rounded-full border border-white text-white tracking-tighter animate-bounce">LIVE</span>`;
            dotColor = statusColors.ongoing;
            dotPulse = "animate-pulse";
          }

          el.innerHTML = `${labelHtml}<div class="w-4 h-4 rounded-full border-2 border-white shadow-md ${dotPulse}" style="background-color: ${dotColor}"></div>`;
          el.addEventListener("click", () => onSelect(props));

          const marker = new mapboxgl.Marker({ element: el })
            .setLngLat(coords)
            .addTo(map);
          markersRef.current[id] = { marker, status: currentStatus };
        });

        Object.keys(markersRef.current).forEach((id) => {
          if (!activeIds.has(id)) {
            markersRef.current[id].marker.remove();
            delete markersRef.current[id];
          }
        });
      };

      map.on("render", updateMarkers);
      return () => {
        map.off("render", updateMarkers);
      };
    }, [isMapReady, filteredEvents, onSelect]);

    return <div ref={mapContainer} className="w-full h-full" />;
  },
);

RealMap.displayName = "RealMap";
export default RealMap;
