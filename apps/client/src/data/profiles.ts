import { feedPosts } from "./feed"

/** The prototype's signed-in account. There is no profile API yet. */
export const OWNER_HANDLE = "dara"

export type Profile = {
  handle: string
  /** Feed posts keep their original author handle after a rename. */
  sourceHandle: string
  owner?: boolean
  name: string
  avatar?: string
  verified?: boolean
  bio: string
  bioKm: string
  location: string
  locationKm: string
  joined: string
  followers: number
  following: number
}

export type SavedPlan = {
  id: string
  name: string
  stops: number
  updatedAt: string
}

export function normalizeHandle(handle: string): string {
  return handle.trim().replace(/^@/, "")
}

const avatarOf = (handle: string) =>
  feedPosts.find((post) => post.author.handle === `@${handle}`)?.author.avatar

/** Mock profiles ported from the original prototype; posts stay derived. */
export const profiles: Profile[] = [
  {
    handle: OWNER_HANDLE,
    sourceHandle: OWNER_HANDLE,
    owner: true,
    name: "Dara",
    verified: true,
    avatar: avatarOf(OWNER_HANDLE),
    bio: "Thrift hunter | Vintage lover",
    bioKm: "អ្នករកឥវ៉ាន់ចាស់ | ស្រឡាញ់របស់បុរាណ",
    location: "Phnom Penh, Cambodia",
    locationKm: "ភ្នំពេញ កម្ពុជា",
    joined: "March 2025",
    followers: 256,
    following: 180,
  },
  {
    handle: "chayy",
    sourceHandle: "chayy",
    name: "Chayy",
    verified: true,
    avatar: avatarOf("chayy"),
    bio: "Community helper | Love exploring PP",
    bioKm: "ជំនួយការសហគមន៍ | ចូលចិត្តរុករកភ្នំពេញ",
    location: "Phnom Penh, Cambodia",
    locationKm: "ភ្នំពេញ កម្ពុជា",
    joined: "January 2025",
    followers: 128,
    following: 95,
  },
  {
    handle: "sophea",
    sourceHandle: "sophea",
    name: "Sophea",
    avatar: avatarOf("sophea"),
    bio: "Nightlife explorer | Cocktail enthusiast",
    bioKm: "អ្នករុករកពេលយប់ | អ្នកចូលចិត្តគ្រឿងស្រវឹង",
    location: "Phnom Penh, Cambodia",
    locationKm: "ភ្នំពេញ កម្ពុជា",
    joined: "February 2025",
    followers: 342,
    following: 210,
  },
  {
    handle: "ashxioo",
    sourceHandle: "ashxioo",
    name: "Ashxioo",
    verified: true,
    avatar: avatarOf("ashxioo"),
    bio: "Bookworm | Matcha addict | Performative boss",
    bioKm: "អ្នកចូលចិត្តសៀវភៅ | អ្នកជាប់ម៉ាត់ឆា | ចៅហ្វាយសម្តែង",
    location: "Phnom Penh, Cambodia",
    locationKm: "ភ្នំពេញ កម្ពុជា",
    joined: "December 2024",
    followers: 89,
    following: 120,
  },
  {
    handle: "vichea",
    sourceHandle: "vichea",
    name: "Vichea",
    verified: true,
    avatar: avatarOf("vichea"),
    bio: "Evening walks | Sunset chaser",
    bioKm: "ដើរលេងពេលល្ងាច | ចូលចិត្តថ្ងៃលិច",
    location: "Phnom Penh, Cambodia",
    locationKm: "ភ្នំពេញ កម្ពុជា",
    joined: "April 2025",
    followers: 64,
    following: 102,
  },
]

export const savedPlans: SavedPlan[] = [
  { id: "plan-1", name: "Weekend in Phnom Penh", stops: 4, updatedAt: "Mar 24" },
  { id: "plan-2", name: "Russian Market thrift run", stops: 2, updatedAt: "Mar 18" },
]

export function postsByHandle(handle: string) {
  return feedPosts.filter((post) => post.author.handle === `@${normalizeHandle(handle)}`)
}
