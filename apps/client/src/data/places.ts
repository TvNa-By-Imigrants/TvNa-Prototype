export type PlaceCategoryId = "visit" | "eat" | "cafe" | "stay"

export type PlaceItem = {
  id: string
  name: string
  nameKm?: string
  area: string
  province?: string
  category: string
  categoryId: PlaceCategoryId
  /** Local Google Maps photo path (e.g. /assets/tsutayabookstore.webp) */
  image: string
  /** Star rating out of 5.0 (e.g. 4.8). */
  rating?: number
  /** Total user reviews count on Google Maps. */
  reviewsCount?: number
  /** Relative price indicator ($ = budget, $$$$ = luxury). */
  priceLevel?: "$" | "$$" | "$$$" | "$$$$"
  /** Operating hours string (e.g. "8:00 AM - 9:00 PM"). */
  hours?: string
  /** Whether open 24 hours. */
  is24Hours?: boolean
  /** Whether place is an official partner promoted on Home. */
  isPartnered?: boolean
  /** Street address or landmark from Google Maps. */
  address?: string
  /** Short summary / highlights from local visitors. */
  description?: string
  /** Coordinates for maps. */
  lat?: number
  lng?: number
  /** Search and filtering tags. */
  tags?: string[]
}

export const places: PlaceItem[] = [
  // ==========================================
  // PARTNERS (Promoted on Home & Filter)
  // ==========================================
  {
    id: "tsutaya-bkk1",
    name: "Tatsuya Bookstore Cafe",
    nameKm: "ហាងសៀវភៅ និងកាហ្វេ តាតស៊ូយ៉ា",
    area: "BKK1",
    province: "Phnom Penh",
    category: "Bookstore Cafe",
    categoryId: "cafe",
    image: "/assets/tsutayabookstore.webp",
    rating: 4.8,
    reviewsCount: 342,
    priceLevel: "$$",
    hours: "8:00 AM - 9:00 PM",
    isPartnered: true,
    address: "Street 240, BKK1, Phnom Penh",
    description: "Pherk matcha, open your MacBook, listen to music on wired earphones and read books. Cozy atmosphere for work and studying.",
    lat: 11.5564,
    lng: 104.9282,
    tags: ["books", "coffee", "matcha", "bkk1", "partner"],
  },
  {
    id: "kaixin-hotpot",
    name: "Kaixin Hotpot",
    nameKm: "ខាយស៊ីន ស៊ុបក្ដៅ",
    area: "Toul Kork",
    province: "Phnom Penh",
    category: "Restaurant",
    categoryId: "eat",
    image: "/assets/kaixin.webp",
    rating: 4.7,
    reviewsCount: 520,
    priceLevel: "$$",
    hours: "11:00 AM - 10:00 PM",
    isPartnered: true,
    address: "Funmall, Toul Kork, Phnom Penh",
    description: "Hotpot zin, must try. Very popular with fresh soup base, quality meat, and dipping bar right in Fun Mall.",
    lat: 11.56,
    lng: 104.91,
    tags: ["hotpot", "soup", "toul kork", "partner", "dinner"],
  },
  {
    id: "coconut-park-cafe",
    name: "Coconut Park Cafe",
    nameKm: "កាហ្វេ សួនដូង កោះពេជ្រ",
    area: "Chamkar Mon",
    province: "Phnom Penh",
    category: "Park & Cafe",
    categoryId: "visit",
    image: "/assets/coconutpark.webp",
    rating: 4.8,
    reviewsCount: 460,
    priceLevel: "$",
    hours: "5:00 AM - 9:00 PM",
    isPartnered: true,
    address: "Coconut Park, Koh Pich, Chamkar Mon, Phnom Penh",
    description: "Outdoor park cafe with shaded trees, roller rink, bike tracks, and relaxing weekend breeze by the water.",
    lat: 11.553,
    lng: 104.92,
    tags: ["park", "cafe", "koh pich", "partner", "outdoor"],
  },
  {
    id: "funnifun-arcade",
    name: "Funnifun Arcade",
    nameKm: "ហ្វាន់នីហ្វាន់ កម្សាន្ត",
    area: "BKK1",
    province: "Phnom Penh",
    category: "Arcade & Games",
    categoryId: "visit",
    image: "/assets/funnifun.webp",
    rating: 4.6,
    reviewsCount: 290,
    priceLevel: "$$",
    hours: "10:00 AM - 11:00 PM",
    isPartnered: true,
    address: "St 282, BKK1, Phnom Penh",
    description: "Gaming arcade with high-win claw machines, plush toys, and fun date activities with friends.",
    lat: 11.558,
    lng: 104.929,
    tags: ["arcade", "games", "claw machine", "bkk1", "partner"],
  },

  // ==========================================
  // VISIT & HANGOUT SPOTS
  // ==========================================
  {
    id: "kohnorea-riverside",
    name: "Koh Norea Waterfront Walk",
    nameKm: "ផ្លូវមាត់ទឹកកោះនរា",
    area: "Chamkar Mon",
    province: "Phnom Penh",
    category: "Park & Promenade",
    categoryId: "visit",
    image: "/assets/noreaRiverSide.webp",
    rating: 4.8,
    reviewsCount: 1120,
    priceLevel: "$",
    hours: "5:00 AM - 10:00 PM",
    address: "Koh Norea Satellite City, Phnom Penh",
    description: "Night and evening walks after school or work. Beautiful sunset views of the Mekong and cable suspension bridge.",
    lat: 11.545,
    lng: 104.945,
    tags: ["riverside", "walk", "sunset", "koh norea", "bridge"],
  },
  {
    id: "sisowath-riverside",
    name: "Sisowath Quay Riverside",
    nameKm: "តំបន់មាត់ទន្លេស៊ីសុវត្ថិ",
    area: "Doun Penh",
    province: "Phnom Penh",
    category: "Park & Promenade",
    categoryId: "visit",
    image: "/assets/visitPhnomPenh.webp",
    rating: 4.9,
    reviewsCount: 2450,
    priceLevel: "$",
    hours: "24 Hours",
    is24Hours: true,
    address: "Sisowath Quay, Doun Penh, Phnom Penh",
    description: "Walk, people-watch, cheap street snacks. Free entertainment with breezy river views where Tonle Sap meets the Mekong.",
    lat: 11.553,
    lng: 104.927,
    tags: ["riverside", "street food", "doun penh", "24hours"],
  },
  {
    id: "national-museum",
    name: "National Museum of Cambodia",
    nameKm: "សារមន្ទីរជាតិកម្ពុជា",
    area: "Doun Penh",
    province: "Phnom Penh",
    category: "Museum",
    categoryId: "visit",
    image: "/assets/museum.webp",
    rating: 4.8,
    reviewsCount: 1890,
    priceLevel: "$$",
    hours: "8:00 AM - 5:00 PM",
    address: "Preah Ang Eng St (13), Phnom Penh",
    description: "Terracotta museum building holding the world's finest collection of pre-Angkorian and Angkorian stone carvings and bronzes.",
    lat: 11.566,
    lng: 104.929,
    tags: ["museum", "culture", "heritage", "doun penh"],
  },
  {
    id: "playroom-arcade",
    name: "Playroom Arcade & VR",
    nameKm: "ផ្លេយរ៉ូម កម្សាន្ត",
    area: "Toul Kork",
    province: "Phnom Penh",
    category: "Arcade & Games",
    categoryId: "visit",
    image: "/assets/playroom.webp",
    rating: 4.7,
    reviewsCount: 380,
    priceLevel: "$$",
    hours: "11:00 AM - 10:00 PM",
    address: "St 315, Toul Kork, Phnom Penh",
    description: "Multiplayer gaming lounge, rhythm arcade machines, racing simulators, and gaming stations with great air conditioning.",
    lat: 11.572,
    lng: 104.901,
    tags: ["arcade", "gaming", "toul kork", "vr"],
  },
  {
    id: "fun-mall-tk",
    name: "Fun Mall Toul Kork",
    nameKm: "ហ្វាន់ ម៉ល ទួលគោក",
    area: "Toul Kork",
    province: "Phnom Penh",
    category: "Shopping & Dining",
    categoryId: "visit",
    image: "/assets/funmall.webp",
    rating: 4.6,
    reviewsCount: 740,
    priceLevel: "$$",
    hours: "9:00 AM - 10:00 PM",
    address: "Street 315, Toul Kork, Phnom Penh",
    description: "Open-concept community mall with popular food chains, milk tea, outdoor dining gardens, and convenient parking.",
    lat: 11.57,
    lng: 104.905,
    tags: ["mall", "toul kork", "dining", "hangout"],
  },

  // ==========================================
  // EAT & FOOD SPOTS
  // ==========================================
  {
    id: "sovanna-bbq",
    name: "Sovanna BBQ (Saj Ko Ang)",
    nameKm: "សុវណ្ណា សាច់គោអាំង",
    area: "Chamkar Mon",
    province: "Phnom Penh",
    category: "Street BBQ",
    categoryId: "eat",
    image: "/assets/sajkoang.webp",
    rating: 4.6,
    reviewsCount: 940,
    priceLevel: "$$",
    hours: "4:00 PM - 11:00 PM",
    address: "St 21, Chamkar Mon, Phnom Penh",
    description: "Smoky charcoal grilled beef skewers, prahok dipping sauce, grilled squid, and lively outdoor night gathering spot.",
    lat: 11.549,
    lng: 104.928,
    tags: ["bbq", "beef", "beer", "nightfood"],
  },
  {
    id: "little-ceaser-pizza",
    name: "Little Caesars Pizza",
    nameKm: "លីថល ស៊ីសា ភីហ្សា",
    area: "Toul Kork",
    province: "Phnom Penh",
    category: "Fast Food",
    categoryId: "eat",
    image: "/assets/littleceaser.webp",
    rating: 4.5,
    reviewsCount: 410,
    priceLevel: "$",
    hours: "10:00 AM - 11:00 PM",
    address: "St 289, Toul Kork, Phnom Penh",
    description: "Hot-N-Ready pepperoni pizza and crazy bread. The default quick bite and celebration spot after exams.",
    lat: 11.568,
    lng: 104.902,
    tags: ["pizza", "fast food", "toul kork"],
  },
  {
    id: "mi-mtes-spicy",
    name: "Mi Mtes Spicy Noodle Bowl",
    nameKm: "មីម្ទេស ហិរពិសេស",
    area: "Toul Kork",
    province: "Phnom Penh",
    category: "Noodle Shop",
    categoryId: "eat",
    image: "/assets/miMtes.webp",
    rating: 4.6,
    reviewsCount: 310,
    priceLevel: "$",
    hours: "9:00 AM - 9:00 PM",
    address: "St 598, Toul Kork, Phnom Penh",
    description: "Fiery customizable spice-level noodles topped with minced pork, boiled egg, meatballs, and crunchy fried wontons.",
    lat: 11.575,
    lng: 104.898,
    tags: ["noodles", "spicy", "toul kork", "lunch"],
  },
  {
    id: "mi-teanh-beef",
    name: "Mi Teanh Hand-Pulled Noodles",
    nameKm: "មីទាញ សាច់គោប្រពៃណី",
    area: "BKK1",
    province: "Phnom Penh",
    category: "Noodle Shop",
    categoryId: "eat",
    image: "/assets/miteanh.webp",
    rating: 4.7,
    reviewsCount: 480,
    priceLevel: "$$",
    hours: "10:00 AM - 9:00 PM",
    address: "St 310, BKK1, Phnom Penh",
    description: "Freshly pulled noodles made to order with clear aromatic beef broth, braised beef brisket, and fresh chili oil.",
    lat: 11.551,
    lng: 104.925,
    tags: ["noodles", "hand pulled", "beef", "bkk1"],
  },

  // ==========================================
  // CAFE SPOTS
  // ==========================================
  {
    id: "brown-coffee-bkk1",
    name: "Brown Coffee BKK1",
    nameKm: "ប្រោន កាហ្វេ បឹងកេងកង១",
    area: "BKK1",
    province: "Phnom Penh",
    category: "Cafe",
    categoryId: "cafe",
    image: "/assets/tsutayabookstore.webp",
    rating: 4.8,
    reviewsCount: 1540,
    priceLevel: "$$",
    hours: "6:30 AM - 9:00 PM",
    address: "St 57, BKK1, Phnom Penh",
    description: "The default Phnom Penh meetup spot. Fast Wi-Fi, cold AC, Iced Brown Coffee with sweet condensed milk, and fresh pastries.",
    lat: 11.554,
    lng: 104.924,
    tags: ["coffee", "iced latte", "bkk1", "wifi"],
  },
]

/**
 * Official business partner places promoted on Home and throughout the app.
 */
export const partneredPlaces = places.filter((p) => p.isPartnered === true)
