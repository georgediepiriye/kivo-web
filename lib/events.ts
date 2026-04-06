export interface Event {
  id: number;
  lat: number;
  lng: number;
  emoji: string;
  title: string;
  image: string;
  status: "upcoming" | "ongoing" | "past";
}

export const DEFAULT_EVENTS: Event[] = [
  {
    id: 1,
    lat: 6.5244,
    lng: 3.3792,
    emoji: "🎤",
    title: "Live Music Night",
    image: "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2",
    status: "upcoming",
  },
  {
    id: 2,
    lat: 6.52,
    lng: 3.37,
    emoji: "🏃",
    title: "Morning Fitness",
    image: "https://images.unsplash.com/photo-1558611848-73f7eb4001a1",
    status: "ongoing",
  },
  {
    id: 3,
    lat: 6.53,
    lng: 3.36,
    emoji: "🍻",
    title: "Chill & Drinks",
    image: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf",
    status: "past",
  },
];
