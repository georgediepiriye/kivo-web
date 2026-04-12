import { EVENT_CATEGORIES } from "./categories";

export type EventCategory = keyof typeof EVENT_CATEGORIES;

export interface Event {
  _id: string;
  id: string;
  title: string;
  description: string;
  type: "activity" | "showcase";
  status: "casual" | "verified" | "featured"; // Status from backend
  category: EventCategory;
  isPublic: boolean;
  allowAnonymous: boolean;
  startDate: string;
  endDate: string;
  image: string;
  isFree: boolean;
  price: number;
  attendees: number;
  capacity: number | null;
  isCancelled: boolean;
  participantImages: string[];

  // Nested structure from API
  location: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
    address: string;
    neighborhood: string;
  };

  organizer: {
    _id: string;
    name: string;
    location: {
      city: string;
      neighborhood: string;
    };
  };
  organizerType: "individual" | "business";
  createdAt: string;
  updatedAt: string;
}

export const EVENT_TYPES = {
  activity: {
    label: "Activity",
    slug: "activity",
    description: "Casual community hangouts and meetups.",
    defaultStatus: "casual",
  },
  showcase: {
    label: "Showcase",
    slug: "showcase",
    description: "Professional events, performances, and curated experiences.",
    defaultStatus: "verified",
  },
} as const;
