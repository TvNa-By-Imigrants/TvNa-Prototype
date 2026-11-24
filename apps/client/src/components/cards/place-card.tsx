import { useNavigate } from "@tanstack/react-router"
import { CalendarPlusIcon, NavigationIcon, StarIcon } from "lucide-react"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { Place } from "@repo/contracts"
import { useLanguage } from "@/i18n"
import { cn } from "@/lib/utils"

export type PlaceCardProps = {
  place: Place
  className?: string
  onClick?: (place: Place) => void
  onViewOnMap?: (place: Place) => void
  onAddToPlan?: (place: Place) => void
}

/**
 * Compact place card built strictly with shadcn primitives:
 * Card (size "sm") + AspectRatio (16:9) + Badge + Button.
 * Complies with Design.md tokens and layout rules.
 */
export function PlaceCard({
  place,
  className,
  onClick,
  onViewOnMap,
  onAddToPlan,
}: PlaceCardProps) {
  const { language, t } = useLanguage()
  const navigate = useNavigate()
  const show24Hours =
    place.is24Hours === true || place.hours?.toLowerCase() === "24 hours"

  const handleCardClick = () => {
    if (onClick) {
      onClick(place)
    }
  }

  const handleGoNow = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onViewOnMap) {
      onViewOnMap(place)
    } else {
      navigate({ to: "/map", search: { place: place.id } })
    }
  }

  const handleAddToPlan = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onAddToPlan) {
      onAddToPlan(place)
    } else {
      navigate({ to: "/plan" })
    }
  }

  return (
    <Card
      size="sm"
      onClick={handleCardClick}
      className={cn(
        "group/card h-full pt-0 transition-shadow",
        onClick && "cursor-pointer hover:shadow-md hover:border-primary/40",
        className
      )}
    >
      <AspectRatio ratio={16 / 9} className="relative overflow-hidden rounded-t-xl bg-muted">
        <img
          src={place.image}
          alt={place.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-300 group-hover/card:scale-105"
        />
        {place.isPartnered ? (
          <Badge
            variant="outline"
            className="absolute top-2 right-2 z-10 border-primary/40 bg-card/90 text-primary backdrop-blur-xs font-semibold shadow-xs"
          >
            {t("card.partnered")}
          </Badge>
        ) : null}
      </AspectRatio>

      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "font-medium text-muted-foreground",
              language === "km" ? "text-sm" : "text-xs"
            )}
          >
            {place.area}
          </span>

          {place.rating != null ? (
            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-foreground">
              <StarIcon
                aria-hidden="true"
                className="size-3.5 fill-rating text-rating"
              />
              {place.rating.toFixed(1)}
            </span>
          ) : null}
        </div>

        <CardTitle className="line-clamp-2">{place.name}</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-wrap items-center gap-1.5">
        <Badge variant="secondary">{place.category}</Badge>
        {show24Hours ? (
          <Badge
            variant="outline"
            className="border-success/30 bg-success/15 text-success font-medium"
          >
            {t("card.open24Hours")}
          </Badge>
        ) : null}
      </CardContent>

      <CardFooter className="mt-auto flex flex-row gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={handleGoNow}
          aria-label={t("card.goNow")}
          title={t("card.goNow")}
        >
          <NavigationIcon />
          <span className="hidden sm:inline">{t("card.goNow")}</span>
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={handleAddToPlan}
          aria-label={t("card.addToPlan")}
          title={t("card.addToPlan")}
        >
          <CalendarPlusIcon />
          <span className="hidden sm:inline">{t("card.addToPlan")}</span>
        </Button>
      </CardFooter>
    </Card>
  )
}
