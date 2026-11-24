import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useInfiniteQuery } from "@tanstack/react-query"
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  RotateCcwIcon,
  SearchIcon,
  SearchXIcon,
  XIcon,
} from "lucide-react"

import { PlaceCard } from "@/components/cards"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Skeleton } from "@/components/ui/skeleton"
import { placeCategories } from "@/data"
import { useLanguage } from "@/i18n"
import { usePlan } from "@/lib/plan-context"
import { fetchPlaces } from "@/lib/places-api"
import { cn } from "@/lib/utils"
import type { Place } from "@repo/contracts"
import { PlaceDetailPage } from "@/components/page/place-detail"

const PAGE_SIZE = 8

/**
 * Skeleton placeholder for PlaceCard during initial and infinite scroll load.
 */
export function PlaceCardSkeleton() {
  return (
    <div
      data-slot="place-card-skeleton"
      className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card p-3 shadow-xs"
    >
      <Skeleton className="aspect-16/9 w-full rounded-lg" />
      <div className="flex items-center justify-between pt-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-10" />
      </div>
      <Skeleton className="mt-2 h-5 w-4/5" />
      <div className="mt-3 flex items-center gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="mt-auto flex gap-2 pt-4">
        <Skeleton className="h-8 flex-1 rounded-md" />
        <Skeleton className="h-8 flex-1 rounded-md" />
      </div>
    </div>
  )
}

export function PlacePage() {
  const { language, t } = useLanguage()
  const navigate = useNavigate()
  const { addStop } = usePlan()
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const viewOnMap = (place: Place) => {
    navigate({ to: "/map", search: { place: place.id } })
  }

  // Debounce search query changes to avoid excessive network requests
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim())
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Live data fetching from GET /api/v1/places with pagination and filters
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: [
      "places",
      {
        q: debouncedSearchQuery || undefined,
        category_id: selectedCategory === "all" ? undefined : selectedCategory,
      },
    ],
    queryFn: ({ pageParam = 1 }) =>
      fetchPlaces({
        q: debouncedSearchQuery || undefined,
        category_id: selectedCategory === "all" ? undefined : selectedCategory,
        page: pageParam,
        limit: PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  })

  // Flatten places across pages
  const allPlaces = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) ?? []
  }, [data])

  const totalCount = data?.pages[0]?.total ?? 0

  // Category and search handlers
  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setDebouncedSearchQuery("")
    }
  }

  const handleResetFilters = () => {
    setSelectedCategory("all")
    setSearchQuery("")
    setDebouncedSearchQuery("")
  }

  // IntersectionObserver for infinite scroll sentinel
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasNextPage || isFetchingNextPage) return

    if (typeof IntersectionObserver === "undefined") return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchNextPage()
        }
      },
      { rootMargin: "200px", threshold: 0.1 }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // If a place is selected, render the full DE-designed PlaceDetailPage view
  if (selectedPlace) {
    return (
      <PlaceDetailPage
        place={selectedPlace}
        photos={selectedPlace.photos}
        onViewOnMap={viewOnMap}
        onAddToPlan={addStop}
        onBack={() => setSelectedPlace(null)}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      {/* Page Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t("placePage.title")}
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          {t("placePage.subtitle")}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3.5">
        {/* Search input using shadcn InputGroup */}
        <div className="max-w-md">
          <InputGroup className="h-10">
            <InputGroupAddon align="inline-start">
              <SearchIcon className="size-4 text-muted-foreground" aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={t("placePage.searchPlaceholder")}
              aria-label={t("placePage.searchPlaceholder")}
            />
            {searchQuery ? (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-xs"
                  onClick={() => handleSearchChange("")}
                  aria-label={t("header.clearSearch")}
                  title={t("header.clearSearch")}
                >
                  <XIcon className="size-3.5" />
                </InputGroupButton>
              </InputGroupAddon>
            ) : null}
          </InputGroup>
        </div>

        {/* Category Filter Chips built with shadcn Button */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar sm:flex-wrap">
          {placeCategories.map((cat) => {
            const isSelected = selectedCategory === cat.id
            const IconComponent = cat.icon

            return (
              <Button
                key={cat.id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryChange(cat.id)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 font-medium transition-colors shrink-0",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted/70",
                  language === "km" ? "text-sm" : "text-xs sm:text-sm"
                )}
              >
                <IconComponent className="size-4 shrink-0" aria-hidden="true" />
                <span>{t(cat.labelKey)}</span>
              </Button>
            )
          })}
        </div>

        {/* Results Count & Reset Filter */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
          <span>
            {isLoading
              ? t("placePage.showingCount").replace("{count}", "…")
              : t("placePage.showingCount").replace("{count}", String(totalCount))}
          </span>
          {selectedCategory !== "all" || searchQuery ? (
            <Button
              variant="link"
              size="sm"
              onClick={handleResetFilters}
              className="h-auto p-0 font-medium text-primary hover:underline"
            >
              {t("placePage.resetFilters")}
            </Button>
          ) : null}
        </div>
      </div>

      {/* Network Error State */}
      {isError && allPlaces.length === 0 ? (
        <div
          data-slot="places-error-state"
          className="flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 py-14 px-4 text-center"
        >
          <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircleIcon className="size-7" aria-hidden="true" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-foreground">
            {t("placePage.errorTitle")}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {t("placePage.errorMessage")}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="mt-4 gap-2"
          >
            <RotateCcwIcon className="size-3.5" aria-hidden="true" />
            {t("placePage.retry")}
          </Button>
        </div>
      ) : isLoading ? (
        /* Initial Loading Skeleton Grid */
        <section aria-label={t("placePage.title")} className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: PAGE_SIZE }).map((_, idx) => (
              <PlaceCardSkeleton key={idx} />
            ))}
          </div>
        </section>
      ) : allPlaces.length === 0 ? (
        /* Empty State */
        <div
          data-slot="places-empty-state"
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center"
        >
          <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <SearchXIcon className="size-7" aria-hidden="true" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-foreground">
            {t("placePage.noResults")}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {t("placePage.subtitle")}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
            className="mt-4"
          >
            {t("placePage.resetFilters")}
          </Button>
        </div>
      ) : (
        /* Places Grid with Infinite Scroll */
        <section aria-label={t("placePage.title")} className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {allPlaces.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                onClick={(p) => setSelectedPlace(p)}
                onViewOnMap={viewOnMap}
                onAddToPlan={addStop}
              />
            ))}
            {isFetchingNextPage && (
              <>
                <PlaceCardSkeleton />
                <PlaceCardSkeleton />
                <PlaceCardSkeleton />
                <PlaceCardSkeleton />
              </>
            )}
          </div>

          {/* Infinite Scroll Sentinel / Load Trigger */}
          <div ref={sentinelRef} className="h-6 w-full" aria-hidden="true" />

          {/* Bottom Pagination Status */}
          <div className="flex items-center justify-center py-4">
            {isFetchingNextPage ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span>{t("placePage.loadingMore")}</span>
              </div>
            ) : !hasNextPage && allPlaces.length > 0 ? (
              <Badge
                variant="outline"
                className="gap-1.5 px-3 py-1 text-xs sm:text-sm text-muted-foreground border-border/80"
              >
                <CheckCircle2Icon className="size-4 text-success" aria-hidden="true" />
                <span>{t("placePage.reachedEnd")}</span>
              </Badge>
            ) : null}
          </div>
        </section>
      )}
    </div>
  )
}
