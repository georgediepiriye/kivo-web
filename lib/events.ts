export interface Event {
  id: number;
  lat: number;
  lng: number;
  emoji: string;
  title: string;
  image: string;
  status: "upcoming" | "ongoing" | "past";
  description: string;
}

export const DEFAULT_EVENTS: Event[] = [
  {
    id: 1,
    lat: 4.819,
    lng: 7.038,
    emoji: "🎤",
    title: "Afrobeat Concert GRA",
    image:
      "https://images.unsplash.com/photo-1731662784037-9b2f21819caa?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    status: "upcoming",
    description:
      "Join us for a night of electrifying Afrobeat music at GRA Port Harcourt! Dance, sing along, and enjoy local snacks.",
  },
  {
    id: 2,
    lat: 4.8205,
    lng: 7.0355,
    emoji: "⚽",
    title: "5-a-side Football GRA",
    image: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d",
    status: "ongoing",
    description:
      "Grab your friends for a competitive 5-a-side football match in GRA Port Harcourt. Fun and exercise guaranteed!",
  },
  {
    id: 3,
    lat: 4.818,
    lng: 7.04,
    emoji: "🍻",
    title: "Neighborhood Drinks Night",
    image: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf",
    status: "past",
    description:
      "Relax with neighbors over local drinks. Music, laughter, and good vibes in a cozy environment.",
  },
  {
    id: 4,
    lat: 4.8175,
    lng: 7.036,
    emoji: "🏠",
    title: "House Party Vibes",
    image: "https://images.unsplash.com/photo-1590080870058-b7d3c8c1ff70",
    status: "upcoming",
    description:
      "A chill house party with music, snacks, and great company. Bring your friends and dance the night away!",
  },
  {
    id: 5,
    lat: 4.821,
    lng: 7.039,
    emoji: "🎮",
    title: "Gaming Meetup GRA",
    image: "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7",
    status: "ongoing",
    description:
      "Gamers unite! Compete in FIFA, Call of Duty, or just hang out and meet fellow gamers in the GRA area.",
  },
  {
    id: 6,
    lat: 4.876,
    lng: 7.058,
    emoji: "🏀",
    title: "Community Basketball Game Ada George",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b",
    status: "upcoming",
    description:
      "Join local teams for a friendly basketball match in Ada George. Bring your sneakers and energy!",
  },
  {
    id: 7,
    lat: 4.878,
    lng: 7.055,
    emoji: "🎶",
    title: "Live Band Night Ada George",
    image: "https://images.unsplash.com/photo-1524230572916-58a7b80b4f37",
    status: "ongoing",
    description:
      "Experience live music from talented local bands. Food and drinks available for all attendees.",
  },
  {
    id: 8,
    lat: 4.875,
    lng: 7.06,
    emoji: "🏐",
    title: "Beach Volleyball Meetup",
    image: "https://images.unsplash.com/photo-1505842465776-3e3e8d7b8e0f",
    status: "upcoming",
    description:
      "Sun, sand, and volleyball! Play or cheer for teams at this fun outdoor meetup in Bonny area.",
  },
  {
    id: 9,
    lat: 4.874,
    lng: 7.057,
    emoji: "🕺",
    title: "TikTok Dance Challenge",
    image: "https://images.unsplash.com/photo-1607746882042-944635dfe10e",
    status: "upcoming",
    description:
      "Show off your best moves in this TikTok Dance Challenge. Record, upload, and challenge friends to match!",
  },
  {
    id: 10,
    lat: 4.84,
    lng: 7.055,
    emoji: "🎨",
    title: "Street Art Walk Odili Road",
    image: "https://images.unsplash.com/photo-1506015391300-4802dc78b78e",
    status: "upcoming",
    description:
      "Explore Odili Road's vibrant street art. Discover local artists and snap Instagram-worthy photos.",
  },
  {
    id: 11,
    lat: 4.845,
    lng: 7.045,
    emoji: "🎶",
    title: "Jazz Night Bonny",
    image: "https://images.unsplash.com/photo-1518972559570-7cc1309ea09b",
    status: "past",
    description:
      "An intimate evening of live jazz music in Bonny. Enjoy cocktails and smooth tunes.",
  },
  {
    id: 12,
    lat: 4.86,
    lng: 7.05,
    emoji: "🎤",
    title: "Open Mic Night Riverside",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4",
    status: "upcoming",
    description:
      "Showcase your talent in music, poetry, or comedy. Everyone is welcome to perform or cheer.",
  },
  {
    id: 13,
    lat: 4.855,
    lng: 7.04,
    emoji: "🏃",
    title: "Sunrise Fun Run",
    image: "https://images.unsplash.com/photo-1558611848-73f7eb4001a1",
    status: "ongoing",
    description:
      "Start your day with a refreshing community run along scenic river paths.",
  },
  {
    id: 14,
    lat: 4.85,
    lng: 7.035,
    emoji: "🍺",
    title: "Local Brewery Tasting",
    image: "https://images.unsplash.com/photo-1510936111840-dc87aebf7b6c",
    status: "past",
    description:
      "Taste authentic local brews and learn about Rivers State brewing culture.",
  },
  {
    id: 15,
    lat: 4.848,
    lng: 7.042,
    emoji: "🎸",
    title: "Indie Band Showcase",
    image: "https://images.unsplash.com/photo-1524230572916-58a7b80b4f37",
    status: "upcoming",
    description:
      "Discover the best indie bands performing live. Great vibes and community energy.",
  },
  {
    id: 16,
    lat: 4.845,
    lng: 7.038,
    emoji: "🛍️",
    title: "Weekend Market Fair",
    image: "https://images.unsplash.com/photo-1505842465776-3e3e8d7b8e0f",
    status: "upcoming",
    description:
      "Shop local! Handmade crafts, food, and music for a lively weekend in Port Harcourt.",
  },
  {
    id: 17,
    lat: 4.84,
    lng: 7.03,
    emoji: "🎨",
    title: "Art & Crafts Expo",
    image: "https://images.unsplash.com/photo-1495435229349-e86db7bfa013",
    status: "ongoing",
    description:
      "See and buy unique arts and crafts from talented Rivers State creators.",
  },
  {
    id: 18,
    lat: 4.835,
    lng: 7.025,
    emoji: "🎶",
    title: "Acoustic Night GRA",
    image: "https://images.unsplash.com/photo-1518972559570-7cc1309ea09b",
    status: "past",
    description:
      "Enjoy live acoustic performances in a cozy, intimate setting in GRA Port Harcourt.",
  },
  {
    id: 19,
    lat: 4.83,
    lng: 7.02,
    emoji: "🎤",
    title: "Comedy Night Riverside",
    image: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70",
    status: "upcoming",
    description:
      "Laugh out loud at this comedy night featuring local and national comedians.",
  },
  {
    id: 20,
    lat: 4.825,
    lng: 7.015,
    emoji: "🍲",
    title: "Street Food Crawl",
    image: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d",
    status: "ongoing",
    description:
      "Taste the best local street food while walking around Port Harcourt’s bustling streets.",
  },
  {
    id: 21,
    lat: 4.82,
    lng: 7.01,
    emoji: "🏀",
    title: "Local Soccer Match",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b",
    status: "past",
    description:
      "Cheer for local amateur soccer teams competing in an exciting match.",
  },
  {
    id: 22,
    lat: 4.815,
    lng: 7.005,
    emoji: "🎤",
    title: "Karaoke Night",
    image: "https://images.unsplash.com/photo-1520085179755-2baf046c4a6b",
    status: "upcoming",
    description:
      "Sing your heart out with friends and show off your vocal skills in this fun karaoke night.",
  },
  {
    id: 23,
    lat: 4.81,
    lng: 7.0,
    emoji: "🏃",
    title: "Charity Fun Run",
    image: "https://images.unsplash.com/photo-1526404188837-52aa8314b7cf",
    status: "upcoming",
    description:
      "Run for a cause! Participate in a charity fun run supporting local community projects.",
  },
  {
    id: 24,
    lat: 4.805,
    lng: 6.995,
    emoji: "🎨",
    title: "Gallery Opening PH",
    image: "https://images.unsplash.com/photo-1491333078588-55b6733c7de6",
    status: "ongoing",
    description:
      "Be the first to explore a new art gallery featuring contemporary Nigerian artists.",
  },
  {
    id: 25,
    lat: 4.8,
    lng: 6.99,
    emoji: "🎬",
    title: "Film Screening PH",
    image: "https://images.unsplash.com/photo-1496116218416-1d5c15d1d66c",
    status: "past",
    description:
      "Watch independent films by Nigerian filmmakers and discuss them with creators.",
  },
  {
    id: 26,
    lat: 4.795,
    lng: 6.985,
    emoji: "🎶",
    title: "Afropop Dance Party",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4",
    status: "upcoming",
    description:
      "Dance to the hottest Afropop tracks with fellow music lovers in a lively party environment.",
  },
  {
    id: 27,
    lat: 4.79,
    lng: 6.98,
    emoji: "🍹",
    title: "Cocktail Night PH",
    image: "https://images.unsplash.com/photo-1526040652367-28f1e35f83a1",
    status: "ongoing",
    description:
      "Sip on creative cocktails while socializing and enjoying live music in Port Harcourt.",
  },
  {
    id: 28,
    lat: 4.785,
    lng: 6.975,
    emoji: "🎤",
    title: "Poetry Slam",
    image: "https://images.unsplash.com/photo-1493149738420-3e4e74d3d19b",
    status: "past",
    description:
      "Listen to powerful spoken word performances by Rivers State poets.",
  },
  {
    id: 29,
    lat: 4.78,
    lng: 6.97,
    emoji: "🎨",
    title: "Street Art Walk",
    image: "https://images.unsplash.com/photo-1506015391300-4802dc78b78e",
    status: "upcoming",
    description:
      "Take a guided walk exploring amazing street art and murals across Port Harcourt.",
  },
  {
    id: 30,
    lat: 4.775,
    lng: 6.965,
    emoji: "🏃",
    title: "Sunset Yoga Session",
    image: "https://images.unsplash.com/photo-1526404188837-52aa8314b7cf",
    status: "ongoing",
    description:
      "Relax and rejuvenate with a calming sunset yoga session along the river.",
  },
];
