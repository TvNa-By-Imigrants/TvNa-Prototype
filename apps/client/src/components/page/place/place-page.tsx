import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  CheckCircle2Icon,
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
import { placeCategories, places, type PlaceCategoryId, type PlaceItem } from "@/data"
import { useLanguage } from "@/i18n"
import { cn } from "@/lib/utils"

const INITIAL_BATCH_SIZE = 8
const LOAD_MORE_BATCH_SIZE = 4

/**
 * Skeleton placeholder for PlaceCard during infinite scroll load.
 */
function PlaceCardSkeleton() {
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
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH_SIZE)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // Filter places based on selected category and search query
  const filteredPlaces = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return places.filter((place: PlaceItem) => {
      const matchesCategory =
        selectedCategory === "all" || place.categoryId === (selectedCategory as PlaceCategoryId)

      const matchesSearch =
        query === "" ||
        place.name.toLowerCase().includes(query) ||
        place.area.toLowerCase().includes(query) ||
        place.category.toLowerCase().includes(query)

      return matchesCategory && matchesSearch
    })
  }, [selectedCategory, searchQuery])

  // Reset pagination when filters change
  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId)
    setVisibleCount(INITIAL_BATCH_SIZE)
    setIsLoadingMore(false)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setVisibleCount(INITIAL_BATCH_SIZE)
    setIsLoadingMore(false)
  }

  const handleResetFilters = () => {
    setSelectedCategory("all")
    setSearchQuery("")
    setVisibleCount(INITIAL_BATCH_SIZE)
    setIsLoadingMore(false)
  }

  const visiblePlaces = useMemo(() => {
    return filteredPlaces.slice(0, visibleCount)
  }, [filteredPlaces, visibleCount])

  const hasMore = visiblePlaces.length < filteredPlaces.length

  const handleLoadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return

    setIsLoadingMore(true)
    const timer = setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + LOAD_MORE_BATCH_SIZE, filteredPlaces.length))
      setIsLoadingMore(false)
    }, 450)

    return () => clearTimeout(timer)
  }, [isLoadingMore, hasMore, filteredPlaces.length])

  // IntersectionObserver for bottom infinite scroll sentinel
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore || isLoadingMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          handleLoadMore()
        }
      },
      { rootMargin: "200px", threshold: 0.1 }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, isLoadingMore, handleLoadMore])

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
            {t("placePage.showingCount").replace("{count}", String(filteredPlaces.length))}
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

      {/* Places Grid */}
      {filteredPlaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
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
        <section aria-label={t("placePage.title")} className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {visiblePlaces.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
            {isLoadingMore && (
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
            {isLoadingMore ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span>{t("placePage.loadingMore")}</span>
              </div>
            ) : !hasMore && filteredPlaces.length > 0 ? (
              <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs sm:text-sm text-muted-foreground border-border/80">
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
