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

const statusColors: Record<string, string> = {
  upcoming: "#facc15",
  ongoing: "#10b981",
  past: "#9ca3af",
  default: "#715800",
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
    const geolocateControlRef = useRef<GeolocateControl | null>(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const markersRef = useRef<{ [key: string]: Marker }>({});

    const handleFlyToUser = () => {
      if (geolocateControlRef.current) {
        geolocateControlRef.current.trigger();
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          mapRef.current?.flyTo({
            center: [pos.coords.longitude, pos.coords.latitude],
            zoom: 13,
            essential: true,
          });
        },
        undefined,
        { enableHighAccuracy: true },
      );
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
        geolocate.trigger();

        map.addSource("events", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
          cluster: true,
          clusterMaxZoom: 15,
          clusterRadius: 40,
        });

        map.addLayer({
          id: "clusters",
          type: "circle",
          source: "events",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": "rgba(30, 41, 59, 0.9)",
            "circle-radius": [
              "step",
              ["get", "point_count"],
              18,
              5,
              22,
              15,
              30,
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
            "text-size": 11,
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
      });

      return () => map.remove();
    }, []);

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
        const newMarkers: { [key: string]: Marker } = {};
        const unclusteredFeatures = map.queryRenderedFeatures({
          layers: ["unclustered-point"],
        });

        unclusteredFeatures.forEach((feature) => {
          const props = feature.properties as any;
          const id = props.id;
          const coords = (feature.geometry as any).coordinates;

          if (!markersRef.current[id]) {
            const el = document.createElement("div");
            const status = props.timeStatus || "upcoming";
            el.className = `relative flex flex-col items-center cursor-pointer transition-all duration-300 hover:scale-125`;
            const labelHtml =
              status === "ongoing"
                ? `<span class="absolute -top-7 whitespace-nowrap bg-green-400 text-[8px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-white uppercase animate-bounce">LIVE</span>`
                : "";
            el.innerHTML = `${labelHtml}<div class="w-4 h-4 rounded-full border-2 border-white shadow-md ${status === "ongoing" ? "animate-pulse" : ""}" style="background: ${statusColors[status] || statusColors.default}"></div>`;
            el.onclick = (e) => {
              e.stopPropagation();
              onSelect(props);
            };
            newMarkers[id] = new mapboxgl.Marker(el)
              .setLngLat(coords)
              .addTo(map);
          } else {
            newMarkers[id] = markersRef.current[id];
          }
        });

        Object.keys(markersRef.current).forEach((id) => {
          if (!newMarkers[id]) markersRef.current[id].remove();
        });
        markersRef.current = newMarkers;
      };

      map.on("render", updateMarkers);
      return () => {
        map.off("render", updateMarkers);
      };
    }, [filteredEvents, isMapReady]);

    return (
      <div className="relative w-full h-full">
        {/* DUPLICATE BUTTON REMOVED FROM HERE */}
        <div ref={mapContainer} className="w-full h-full absolute inset-0" />
      </div>
    );
  },
);

RealMap.displayName = "RealMap";
export default RealMap;
