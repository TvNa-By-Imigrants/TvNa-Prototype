import {
  BedDoubleIcon,
  CoffeeIcon,
  FootprintsIcon,
  SparklesIcon,
  UtensilsCrossedIcon,
  type LucideIcon,
} from "lucide-react"

import type { TranslationKey } from "@/i18n"

export type CategoryItem = {
  id: string
  labelKey: TranslationKey
  icon: LucideIcon
}

/** Hero quick-filter entry points: Visit / Stay / Eat. */
export const categories: CategoryItem[] = [
  { id: "visit", labelKey: "category.visit", icon: FootprintsIcon },
  { id: "stay", labelKey: "category.stay", icon: BedDoubleIcon },
  { id: "eat", labelKey: "category.eat", icon: UtensilsCrossedIcon },
]

/** Full filter categories for the Place page: All / Visit / Eat / Cafe / Stay. */
export const placeCategories: CategoryItem[] = [
  { id: "all", labelKey: "category.all", icon: SparklesIcon },
  { id: "visit", labelKey: "category.visit", icon: FootprintsIcon },
  { id: "eat", labelKey: "category.eat", icon: UtensilsCrossedIcon },
  { id: "cafe", labelKey: "category.cafe", icon: CoffeeIcon },
  { id: "stay", labelKey: "category.stay", icon: BedDoubleIcon },
]

export type AreaItem = {
  id: string
  name: string
  nameKm: string
  province: string
}

export const popularAreas: AreaItem[] = [
  { id: "bkk1", name: "BKK1", nameKm: "បឹងកេងកង១", province: "Phnom Penh" },
  { id: "doun-penh", name: "Doun Penh", nameKm: "ដូនពេញ", province: "Phnom Penh" },
  { id: "tuol-tompoung", name: "Tuol Tompoung", nameKm: "ទួលទំពូង", province: "Phnom Penh" },
  { id: "toul-kork", name: "Toul Kork", nameKm: "ទួលគោក", province: "Phnom Penh" },
  { id: "chamkar-mon", name: "Chamkar Mon", nameKm: "ចំការមន", province: "Phnom Penh" },
  { id: "chroy-changvar", name: "Chroy Changvar", nameKm: "ជ្រោយចង្វារ", province: "Phnom Penh" },
  { id: "siem-reap-angkor", name: "Angkor Area", nameKm: "តំបន់អង្គរ", province: "Siem Reap" },
  { id: "kampot-river", name: "Kampot River", nameKm: "មាត់ព្រែកកំពត", province: "Kampot" },
  { id: "kep-crab", name: "Kep Waterfront", nameKm: "មាត់សមុទ្រកែប", province: "Kep" },
]
