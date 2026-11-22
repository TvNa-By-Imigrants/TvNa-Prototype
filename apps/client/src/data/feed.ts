export type FeedAuthor = {
  name: string
  handle?: string
  avatar?: string
  verified?: boolean
}

export type FeedStats = {
  likes: number
  comments: number
  views: number
}

export type FeedPost = {
  id: string
  image: string
  title: string
  description: string
  location?: string
  timestamp?: string
  tags?: string[]
  author: FeedAuthor
  stats: FeedStats
}

export const feedPosts: FeedPost[] = [
  {
    id: "feed-1",
    image: "/assets/cadtLerkEyVan.webp",
    title: "1000 bags of smile",
    description: "Tv cadt help ke klas tv kom dek teas ot pyouch pek all nop — come volunteer this weekend with our community!",
    location: "CADT, Chroy Changvar",
    timestamp: "2h ago",
    tags: ["#Community", "#Volunteer", "#PhnomPenh"],
    author: {
      name: "Chayy",
      handle: "@chayy",
      avatar: "/assets/chay.webp",
      verified: true,
    },
    stats: { likes: 210, comments: 18, views: 2400 },
  },
  {
    id: "feed-2",
    image: "/assets/klengofvintage.webp",
    title: "klengofvitage - Russian Market Thrift",
    description: "Come and thrift for some clothes on the weekend — a lot of heat in the racks!",
    location: "Russian Market (TTP)",
    timestamp: "4h ago",
    tags: ["#Vintage", "#Thrift", "#TTP"],
    author: {
      name: "Dara",
      handle: "@dara",
      avatar: "/assets/dara.webp",
      verified: true,
    },
    stats: { likes: 154, comments: 9, views: 1180 },
  },
  {
    id: "feed-3",
    image: "/assets/goons.webp",
    title: "WalkStreet Riverside",
    description: "Tv walk street pherk cocktail jis tuk pel weekend — riverside night vibes hit different.",
    location: "Sisowath Quay",
    timestamp: "6h ago",
    tags: ["#Riverside", "#Cocktails", "#Weekend"],
    author: {
      name: "Sophea",
      handle: "@sophea",
      avatar: "/assets/sophea.webp",
      verified: false,
    },
    stats: { likes: 98, comments: 6, views: 860 },
  },
  {
    id: "feed-4",
    image: "/assets/tsutayabookstore.webp",
    title: "Tatsuya Bookstore Cafe Matcha",
    description: "Pherk matcha open your macbook listen to CAS on wired earphones and read books — performative boss vibes.",
    location: "BKK1, Street 240",
    timestamp: "8h ago",
    tags: ["#Matcha", "#CoffeeShop", "#StudySpot"],
    author: {
      name: "Ashxioo",
      handle: "@ashxioo",
      avatar: "/assets/ashxio.webp",
      verified: true,
    },
    stats: { likes: 132, comments: 11, views: 1530 },
  },
  {
    id: "feed-5",
    image: "/assets/noreaRiverSide.webp",
    title: "Koh Norea Evening Walk",
    description: "Evening stroll after assignments and exams — watching the sun dip behind the bridge with zero stress.",
    location: "Koh Norea Promenade",
    timestamp: "12h ago",
    tags: ["#KohNorea", "#EveningWalk", "#Sunset"],
    author: {
      name: "Vichea",
      handle: "@vichea",
      avatar: "/assets/vichea.webp",
      verified: true,
    },
    stats: { likes: 184, comments: 15, views: 1920 },
  },
  {
    id: "feed-6",
    image: "/assets/kaixin.webp",
    title: "Kaixin Hotpot with the Squad",
    description: "Hotpot zin at Fun Mall. Double-broth setup and endless dipping sauces before a movie night.",
    location: "Fun Mall, Toul Kork",
    timestamp: "1d ago",
    tags: ["#Hotpot", "#Dinner", "#FunMall"],
    author: {
      name: "Dara",
      handle: "@dara",
      avatar: "/assets/dara.webp",
      verified: true,
    },
    stats: { likes: 230, comments: 24, views: 2400 },
  },
  {
    id: "feed-7",
    image: "/assets/coconutpark.webp",
    title: "Coconut Park Cycling Sunday",
    description: "Breezy bike track and morning cold brew by the river. Great place to recharge before Monday.",
    location: "Coconut Park, Koh Pich",
    timestamp: "2d ago",
    tags: ["#Park", "#Cycling", "#KohPich"],
    author: {
      name: "Chayy",
      handle: "@chayy",
      avatar: "/assets/chay.webp",
      verified: true,
    },
    stats: { likes: 175, comments: 12, views: 1680 },
  },
  {
    id: "feed-8",
    image: "/assets/playroom.webp",
    title: "Playroom Toul Kork High Score",
    description: "Rhythm arcade machines and Mario Kart with friends. AC is icy cold on hot afternoons.",
    location: "Playroom, Toul Kork",
    timestamp: "3d ago",
    tags: ["#Arcade", "#Gaming", "#ToulKork"],
    author: {
      name: "Sophea",
      handle: "@sophea",
      avatar: "/assets/sophea.webp",
      verified: false,
    },
    stats: { likes: 142, comments: 8, views: 1350 },
  },
]
