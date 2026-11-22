import { useNavigate } from "@tanstack/react-router"
import { FlameIcon, SparklesIcon } from "lucide-react"

import { FeedCard, PlaceCard } from "@/components/cards"
import { feedPosts, partneredPlaces } from "@/data"
import { useLanguage } from "@/i18n"

import { HeroBanner } from "./hero-banner"
import { SectionHeader } from "./section-header"

/**
 * Home discovery page.
 * - Hero banner: Auto-slides looped promo for brand + partner places.
 * - Feed section: Exactly 4 fresh picks, "View All" navigates to /feed.
 * - Places section: Partnered places only for promotion, "View All" navigates to /place.
 */
export function HomeView() {
  const { t } = useLanguage()
  const navigate = useNavigate()

  // Only show the first 4 feed posts on Home
  const homeFeedPosts = feedPosts.slice(0, 4)

  // Only show partnered places on Home (max 4)
  const homePartneredPlaces = partneredPlaces.slice(0, 4)

  return (
    <div className="flex flex-col gap-8 lg:gap-10">
      {/* Auto-sliding looped Hero Banner */}
      <HeroBanner />

      {/* Fresh Picks Community Feed Section (4 items max) */}
      <section className="flex flex-col gap-4">
        <SectionHeader
          icon={<FlameIcon aria-hidden="true" className="size-5 text-rating" />}
          title={t("discovery.feedTitle")}
          subtitle={t("discovery.feedSubtitle")}
          viewAll={t("discovery.viewAll")}
          onViewAll={() => navigate({ to: "/feed" })}
        />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {homeFeedPosts.map((post) => (
            <FeedCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      {/* Partnered Places to Hang Out Section (Partnered only) */}
      <section className="flex flex-col gap-4">
        <SectionHeader
          icon={<SparklesIcon aria-hidden="true" className="size-5 text-primary" />}
          title={t("discovery.placesTitle")}
          subtitle={t("discovery.placesSubtitle")}
          viewAll={t("discovery.viewAll")}
          onViewAll={() => navigate({ to: "/place" })}
        />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {homePartneredPlaces.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      </section>
    </div>
  )
}
