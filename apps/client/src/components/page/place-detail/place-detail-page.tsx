import { useState, useMemo } from "react"
import { useNavigate } from "@tanstack/react-router"
import {
  ArrowLeftIcon,
  CalendarPlusIcon,
  CheckCircle2Icon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  CompassIcon,
  MapPinIcon,
  NavigationIcon,
  Share2Icon,
  SparklesIcon,
  StarIcon,
} from "lucide-react"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { Place } from "@repo/contracts"
import { useLanguage } from "@/i18n"
import { cn } from "@/lib/utils"

export type PlaceDetailPageProps = {
  place: Place
  onBack: () => void
  photos?: string[]
  onViewOnMap?: (place: Place) => void
  onAddToPlan?: (place: Place) => void
  className?: string
}

/**
 * Full Place Detail View (replaces pop-in modal with 2-column desktop layout & sticky mobile CTAs).
 * Complies with the DE Design System and specifications.
 */
export function PlaceDetailPage({
  place,
  onBack,
  photos: customPhotos,
  onViewOnMap,
  onAddToPlan,
  className,
}: PlaceDetailPageProps) {
  const { language, t } = useLanguage()
  const navigate = useNavigate()

  const [activePhotoIndex, setActivePhotoIndex] = useState(0)
  const [isAddedToPlan, setIsAddedToPlan] = useState(false)
  const [userRating, setUserRating] = useState<number | null>(null)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [isCopied, setIsCopied] = useState(false)

  // Use place image plus custom photos if provided
  const photos = useMemo(() => {
    if (customPhotos && customPhotos.length > 0) return customPhotos
    return [place.image]
  }, [place.image, customPhotos])

  const hasMultiplePhotos = photos.length > 1

  const handlePrevPhoto = () => {
    setActivePhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
  }

  const handleNextPhoto = () => {
    setActivePhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
  }

  const handleShare = async () => {
    try {
      if (typeof window !== "undefined" && navigator?.clipboard) {
        await navigator.clipboard.writeText(window.location.href)
      }
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch {
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  const handleViewOnMap = () => {
    if (onViewOnMap) {
      onViewOnMap(place)
    } else {
      navigate({ to: "/map", search: { place: place.id } })
    }
  }

  const handleAddToPlan = () => {
    setIsAddedToPlan(true)
    if (onAddToPlan) {
      onAddToPlan(place)
    }
  }

  const show24Hours =
    place.is24Hours === true || place.hours?.toLowerCase() === "24 hours"

  const priceLevelDescriptions: Record<string, string> = {
    $: "Budget friendly ($)",
    $$: "Moderate ($$)",
    $$$: "Upscale ($$$)",
    $$$$: "Luxury ($$$$)",
  }

  return (
    <div
      data-slot="place-detail-page"
      className={cn("flex flex-col gap-6 lg:gap-8 pb-20 lg:pb-8", className)}
    >
      {/* 1. Top Navigation Bar */}
      <nav
        aria-label="Place navigation"
        className="flex items-center justify-between gap-3 border-b border-border/80 pb-4"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-2 font-medium text-muted-foreground hover:text-foreground"
          aria-label={t("placeDetail.back")}
        >
          <ArrowLeftIcon className="size-4" aria-hidden="true" />
          <span>{t("placeDetail.back")}</span>
        </Button>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-medium">
            {place.category}
          </Badge>

          {place.isPartnered && (
            <Badge
              variant="outline"
              className="border-primary/40 bg-card/90 text-primary font-semibold shadow-xs"
            >
              <SparklesIcon className="size-3 mr-1" aria-hidden="true" />
              {t("card.partnered")}
            </Badge>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="gap-1.5 rounded-full"
            aria-label={t("placeDetail.share")}
          >
            {isCopied ? (
              <>
                <CheckIcon className="size-3.5 text-success" aria-hidden="true" />
                <span className="text-xs text-success">{t("placeDetail.copied")}</span>
              </>
            ) : (
              <>
                <Share2Icon className="size-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">{t("placeDetail.share")}</span>
              </>
            )}
          </Button>
        </div>
      </nav>

      {/* 2. Desktop 2-Column Layout (7 cols content / 5 cols sticky action card) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
        {/* Left Column: 7 cols */}
        <div className="flex flex-col gap-8 lg:col-span-7">
          {/* Interactive Multi-Photo Gallery */}
          <section
            aria-label={t("placeDetail.photos")}
            className="flex flex-col gap-3"
          >
            {/* 16:9 Hero Preview */}
            <div className="group relative overflow-hidden rounded-2xl border border-border bg-muted shadow-xs select-none">
              <AspectRatio ratio={16 / 9} className="overflow-hidden">
                <img
                  src={photos[activePhotoIndex]}
                  alt={`${place.name} - photo ${activePhotoIndex + 1}`}
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </AspectRatio>

              {/* Hover Chevrons Navigation */}
              {hasMultiplePhotos && (
                <>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handlePrevPhoto}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 text-foreground shadow-md backdrop-blur-xs hover:bg-background"
                    aria-label={t("placeDetail.prevPhoto")}
                  >
                    <ChevronLeftIcon className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleNextPhoto}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 text-foreground shadow-md backdrop-blur-xs hover:bg-background"
                    aria-label={t("placeDetail.nextPhoto")}
                  >
                    <ChevronRightIcon className="size-4" />
                  </Button>

                  {/* Photo Counter Badge */}
                  <div
                    data-slot="photo-counter"
                    className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-xs"
                  >
                    {t("placeDetail.photoCount")
                      .replace("{current}", String(activePhotoIndex + 1))
                      .replace("{total}", String(photos.length))}
                  </div>
                </>
              )}
            </div>

            {/* Clickable Thumbnail Strip */}
            {hasMultiplePhotos && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                {photos.map((photo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePhotoIndex(idx)}
                    aria-label={`Select photo ${idx + 1}`}
                    className={cn(
                      "relative aspect-16/9 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                      idx === activePhotoIndex
                        ? "border-primary ring-2 ring-primary/20 scale-105"
                        : "border-border/80 opacity-70 hover:opacity-100"
                    )}
                  >
                    <img
                      src={photo}
                      alt={`Thumbnail ${idx + 1}`}
                      className="size-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Place Header: Title & Meta */}
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              {place.name}
            </h1>

            {place.nameKm && (
              <p
                className={cn(
                  "font-medium text-muted-foreground",
                  language === "km" ? "text-lg sm:text-xl" : "text-base sm:text-lg"
                )}
              >
                {place.nameKm}
              </p>
            )}

            {/* Rating and Reviews Counter */}
            {place.rating != null && (
              <div className="flex items-center gap-2 pt-1 text-sm text-foreground">
                <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                  <StarIcon
                    aria-hidden="true"
                    className="size-4 fill-rating text-rating"
                  />
                  {place.rating.toFixed(1)}
                </span>
                {place.reviewsCount != null && (
                  <span className="text-muted-foreground">
                    ({place.reviewsCount.toLocaleString()} {t("card.comments")})
                  </span>
                )}
                <span className="text-muted-foreground">·</span>
                <span className="font-medium text-muted-foreground">{place.area}</span>
              </div>
            )}
          </div>

          {/* Description Section */}
          {place.description && (
            <section className="flex flex-col gap-2 rounded-2xl border border-border/80 bg-card p-5 sm:p-6">
              <h2 className="text-base font-semibold text-foreground">
                {t("placeDetail.about")}
              </h2>
              <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
                {place.description}
              </p>
            </section>
          )}

          {/* Interactive Rating Widget (5-star mockup with instant feedback) */}
          <section className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-5 sm:p-6">
            <h3 className="text-sm font-semibold text-foreground">
              {t("placeDetail.rateThisPlace")}
            </h3>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled =
                    (hoverRating !== null && star <= hoverRating) ||
                    (hoverRating === null && userRating !== null && star <= userRating)

                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      aria-label={`Rate ${star} stars`}
                      className="p-1 rounded-md transition-transform hover:scale-110 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <StarIcon
                        className={cn(
                          "size-6 transition-colors",
                          isFilled
                            ? "fill-rating text-rating"
                            : "text-muted-foreground/40 hover:text-rating/60"
                        )}
                        aria-hidden="true"
                      />
                    </button>
                  )
                })}
              </div>

              {userRating && (
                <span className="text-xs sm:text-sm font-medium text-success ml-2">
                  {t("placeDetail.thankYouForRating")} ({userRating}/5)
                </span>
              )}
            </div>
          </section>

          {/* Venue Details: Operating Hours, Price, Tags */}
          <section className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card p-5 sm:p-6">
            <h3 className="text-base font-semibold text-foreground">
              {t("placeDetail.hours")} &amp; {t("placeDetail.priceLevel")}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {/* Operating Hours */}
              <div className="flex items-start gap-3">
                <ClockIcon className="size-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-foreground">{t("placeDetail.hours")}</span>
                  {show24Hours ? (
                    <Badge variant="outline" className="w-fit border-success/30 bg-success/15 text-success font-medium">
                      {t("card.open24Hours")}
                    </Badge>
                  ) : place.hours ? (
                    <span className="text-muted-foreground">{place.hours}</span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </div>
              </div>

              {/* Price Level */}
              {place.priceLevel && (
                <div className="flex items-start gap-3">
                  <span className="flex size-5 items-center justify-center font-bold text-primary shrink-0 mt-0.5">$</span>
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-foreground">{t("placeDetail.priceLevel")}</span>
                    <span className="font-medium text-foreground">
                      {priceLevelDescriptions[place.priceLevel] ?? place.priceLevel}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Tags */}
            {place.tags && place.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/70">
                {place.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Location & Map Preview Card */}
          <section className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">
                {t("placeDetail.location")}
              </h3>
              <Badge variant="outline" className="gap-1 border-primary/30 text-primary text-xs">
                <CompassIcon className="size-3" />
                <span>{t("placeDetail.verifiedVenue")}</span>
              </Badge>
            </div>

            <div className="flex items-start gap-3 pt-1">
              <MapPinIcon className="size-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex flex-col gap-1 text-sm">
                <span className="font-semibold text-foreground">
                  {place.area}, {place.province}
                </span>
                {place.address && (
                  <span className="text-muted-foreground">{place.address}</span>
                )}
                {place.lat != null && place.lng != null && (
                  <span className="text-xs text-muted-foreground/80 pt-0.5">
                    {t("placeDetail.coordinates")}: {place.lat.toFixed(4)}, {place.lng.toFixed(4)}
                  </span>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: 5 cols (Desktop Sticky Action Card) */}
        <aside className="hidden lg:block lg:col-span-5">
          <Card className="sticky top-24 flex flex-col gap-5 p-6 shadow-sm">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                {place.category}
              </span>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                {place.name}
              </h2>
              {place.nameKm && (
                <p className="text-sm font-medium text-muted-foreground">{place.nameKm}</p>
              )}
            </div>

            <div className="flex items-center justify-between border-y border-border/80 py-3 text-sm">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <StarIcon className="size-4 fill-rating text-rating" aria-hidden="true" />
                <span>{place.rating != null ? place.rating.toFixed(1) : "-"}</span>
              </div>
              {place.priceLevel && (
                <span className="font-bold text-primary">{place.priceLevel}</span>
              )}
              <span className="text-muted-foreground">{place.area}</span>
            </div>

            {/* Desktop Action Buttons */}
            <div className="flex flex-col gap-3 pt-2">
              <Button
                size="lg"
                variant={isAddedToPlan ? "secondary" : "default"}
                onClick={handleAddToPlan}
                className="w-full gap-2 font-semibold"
                aria-label={t("placeDetail.addToPlan")}
              >
                {isAddedToPlan ? (
                  <>
                    <CheckCircle2Icon className="size-4 text-success" aria-hidden="true" />
                    <span>{t("placeDetail.addedToPlan")}</span>
                  </>
                ) : (
                  <>
                    <CalendarPlusIcon className="size-4" aria-hidden="true" />
                    <span>{t("placeDetail.addToPlan")}</span>
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={handleViewOnMap}
                className="w-full gap-2 font-semibold"
                aria-label={t("placeDetail.viewOnMap")}
              >
                <NavigationIcon className="size-4 text-primary" aria-hidden="true" />
                <span>{t("placeDetail.viewOnMap")}</span>
              </Button>
            </div>
          </Card>
        </aside>
      </div>

      {/* 3. Mobile Elevated Sticky Bottom CTA Bar */}
      <div
        data-slot="mobile-cta-bar"
        className="fixed inset-x-0 bottom-0 z-50 flex items-center gap-3 border-t border-border bg-card/95 p-4 backdrop-blur-md lg:hidden pb-[max(1rem,env(safe-area-inset-bottom))] shadow-xl"
      >
        <Button
          variant="outline"
          size="default"
          onClick={handleViewOnMap}
          className="flex-1 gap-2 font-medium"
          aria-label={t("placeDetail.viewOnMap")}
        >
          <NavigationIcon className="size-4 text-primary" aria-hidden="true" />
          <span>{t("placeDetail.viewOnMap")}</span>
        </Button>

        <Button
          size="default"
          variant={isAddedToPlan ? "secondary" : "default"}
          onClick={handleAddToPlan}
          className="flex-1 gap-2 font-medium"
          aria-label={t("placeDetail.addToPlan")}
        >
          {isAddedToPlan ? (
            <>
              <CheckCircle2Icon className="size-4 text-success" aria-hidden="true" />
              <span>{t("placeDetail.addedToPlan")}</span>
            </>
          ) : (
            <>
              <CalendarPlusIcon className="size-4" aria-hidden="true" />
              <span>{t("placeDetail.addToPlan")}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
