import { useQuery } from "@tanstack/react-query"
import { AlertCircleIcon, MapPinIcon, NavigationIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/i18n"
import { fetchPlaceById } from "@/lib/places-api"

const DEFAULT_CENTER = "11.5564,104.9282"

export type MapPageProps = {
  placeId?: string
}

export function MapPage({ placeId }: MapPageProps) {
  const { t } = useLanguage()

  const { data: place, isPending, isError } = useQuery({
    queryKey: ["place", placeId],
    queryFn: () => fetchPlaceById(placeId as string),
    enabled: Boolean(placeId),
  })

  const coordinates =
    place?.lat != null && place?.lng != null
      ? `${place.lat},${place.lng}`
      : null
  const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(coordinates ?? DEFAULT_CENTER)}&output=embed`
  const directionsUrl = coordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(coordinates)}`
    : null

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {t("mapPage.title")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("mapPage.subtitle")}</p>
      </div>

      {placeId && isPending ? (
        <p className="text-sm text-muted-foreground">{t("mapPage.loading")}</p>
      ) : null}
      {placeId && isError ? (
        <p className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircleIcon className="size-4" aria-hidden="true" />
          {t("mapPage.error")}
        </p>
      ) : null}

      {!placeId ? (
        <p className="text-sm text-muted-foreground">{t("mapPage.selectHint")}</p>
      ) : null}

      <Card className="overflow-hidden pt-0">
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="flex flex-wrap items-center gap-2">
            {place ? (
              <>
                <MapPinIcon className="size-5 text-primary" aria-hidden="true" />
                {place.name}
                {place.area ? (
                  <Badge variant="secondary" className="font-medium">
                    {place.area}
                  </Badge>
                ) : null}
              </>
            ) : (
              t("mapPage.title")
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 px-0 pb-0">
          <iframe
            title={t("nav.map")}
            src={embedUrl}
            loading="lazy"
            className="h-[50vh] min-h-64 w-full border-0 sm:h-[55vh]"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="flex flex-col gap-2 px-(--card-spacing) pb-(--card-spacing) sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
            {coordinates ? (
              <span className="text-xs text-muted-foreground">
                {t("mapPage.coordinates")}: {coordinates}
              </span>
            ) : null}
            {directionsUrl ? (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
              >
                <NavigationIcon className="size-4" aria-hidden="true" />
                {t("mapPage.directions")}
              </a>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
