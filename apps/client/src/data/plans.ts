export type PlanStop = {
  order: number
  placeId: string
  placeName: string
  time: string
  notes?: string
}

export type PlanDay = {
  dayNumber: number
  title: string
  stops: PlanStop[]
}

export type TravelPlan = {
  id: string
  title: string
  titleKm: string
  description: string
  durationDays: number
  coverImage: string
  author: string
  likesCount: number
  savedCount: number
  tags: string[]
  days: PlanDay[]
}

export const curatedPlans: TravelPlan[] = [
  {
    id: "plan-pp-weekend",
    title: "Weekend in Phnom Penh: Coffee, Art & Riverside",
    titleKm: "ដំណើរកម្សាន្តចុងសប្តាហ៍ភ្នំពេញ៖ កាហ្វេ សិល្បៈ និងមាត់ទន្លេ",
    description: "The ideal 2-day slow weekend exploring BKK1 specialty cafes, the National Museum, Russian market vintage thrifting, and sunset river drinks.",
    durationDays: 2,
    coverImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
    author: "TvNa Editorial Team",
    likesCount: 540,
    savedCount: 312,
    tags: ["Phnom Penh", "Weekend", "Cafe", "Culture"],
    days: [
      {
        dayNumber: 1,
        title: "Artisan Cafes & Royal Heritage",
        stops: [
          { order: 1, placeId: "brown-roastery-bkk", placeName: "Brown Coffee Roastery", time: "8:30 AM", notes: "Breakfast & cold brew" },
          { order: 2, placeId: "royal-palace-silver-pagoda", placeName: "Royal Palace & Silver Pagoda", time: "10:30 AM", notes: "Architecture & murals" },
          { order: 3, placeId: "malis-restaurant-bkk", placeName: "Malis Living Cambodian Cuisine", time: "1:00 PM", notes: "Royal Khmer lunch" },
          { order: 4, placeId: "sisowath-riverside", placeName: "Sisowath Quay Riverside", time: "5:30 PM", notes: "Sunset walk" },
        ],
      },
      {
        dayNumber: 2,
        title: "Vintage Thrifting & Creative Hangouts",
        stops: [
          { order: 1, placeId: "orpuk-kuy-teav", placeName: "Orpuk Traditional Kuy Teav", time: "8:00 AM", notes: "Traditional breakfast" },
          { order: 2, placeId: "lot-369-cafe", placeName: "LOT 369 Cafe & Bar", time: "10:30 AM", notes: "Smoothie bowls" },
          { order: 3, placeId: "tsutaya-bkk1", placeName: "Tatsuya Bookstore Cafe", time: "3:00 PM", notes: "Reading & matcha" },
          { order: 4, placeId: "rosewood-phnom-penh", placeName: "Rosewood Sora Skybar", time: "6:30 PM", notes: "Night skyline view" },
        ],
      },
    ],
  },
  {
    id: "plan-siem-reap-angkor",
    title: "Siem Reap: Beyond Angkor Wat",
    titleKm: "សៀមរាប៖ ដំណើររុករកប្រាសាទបុរាណ និងវប្បធម៌",
    description: "3 days of ancient wonder, cycling through the jungle temples of Angkor, sunset over Tonle Sap, and vibrant night markets.",
    durationDays: 3,
    coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    author: "Kosal Explorer",
    likesCount: 890,
    savedCount: 520,
    tags: ["Siem Reap", "Angkor", "Temples", "Adventure"],
    days: [
      {
        dayNumber: 1,
        title: "Dawn at Angkor & The Bayon Faces",
        stops: [
          { order: 1, placeId: "angkor-wat-temple", placeName: "Angkor Wat Heritage Park", time: "5:00 AM", notes: "Sunrise reflection pond" },
        ],
      },
    ],
  },
]
