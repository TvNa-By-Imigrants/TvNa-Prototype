import { Link } from "@tanstack/react-router"
import {
  ClockIcon,
  CompassIcon,
  HouseIcon,
  MapPinIcon,
  NavigationIcon,
  TagIcon,
} from "lucide-react"

import { PermissionIndicator } from "@/components/atom/common"
import { GuestPlanBanner } from "@/components/molecules"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/i18n"
import type { PlanStopItem } from "@/lib/plan-context"

function directionsUrl(stops: PlanStopItem[]): string | null {
  const located = stops.filter((stop) => stop.lat != null && stop.lng != null)
  if (located.length === 0) return null

  const destination = `${located[0]!.lat},${located[0]!.lng}`
  const waypoints = located
    .slice(1)
    .map((stop) => `${stop.lat},${stop.lng}`)
    .join("|")

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}${waypoints ? `&waypoints=${encodeURIComponent(waypoints)}` : ""}&travelmode=driving`
}

export type SharedPlanViewProps = {
  stops: PlanStopItem[] | null
  token?: string
}

export function SharedPlanView({ stops, token }: SharedPlanViewProps) {
  const { language, t } = useLanguage()

  if (!stops) {
    return (
      <Card className="mx-auto w-full max-w-lg pt-0">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary-tint text-primary">
            <CompassIcon className="size-8" aria-hidden="true" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-lg font-semibold text-foreground">
              {t("guest.invalidTitle")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("guest.invalidHint")}
            </p>
          </div>
          <Link to="/">
            <button className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground">
              <HouseIcon className="size-4" aria-hidden="true" />
              {t("guest.backHome")}
            </button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  const directions = directionsUrl(stops)
  const stopTitle = (stop: PlanStopItem) =>
    language === "km" && stop.nameKm ? stop.nameKm : stop.name

  return (
    <div data-slot="shared-plan-view" className="flex flex-col gap-4 sm:gap-6">
      <GuestPlanBanner />

      <section className="relative overflow-hidden rounded-2xl border border-primary-border bg-primary-tint p-4 sm:p-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-16 size-52 rounded-full bg-primary/10 blur-2xl"
        />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl space-y-1.5">
            <PermissionIndicator label={t("guest.viewOnly")} />
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {t("guest.title")}
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              {t("guest.subtitle")}
            </p>
          </div>
          <span className="inline-flex items-center rounded-full border border-primary-border bg-card/70 px-3 py-1 text-xs font-semibold text-primary-strong">
            {t("planPage.stopCount").replace("{count}", String(stops.length))}
          </span>
        </div>
        {token ? (
          <p className="relative mt-3 text-xs text-muted-foreground">#{token}</p>
        ) : null}
      </section>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <ol className="relative flex flex-col gap-3 sm:gap-4">
          <div
            aria-hidden="true"
            className="absolute bottom-6 left-[1rem] top-6 w-px bg-primary-border sm:left-[1.125rem]"
          />
          {stops.map((stop, index) => (
            <li
              key={stop.placeId}
              data-slot="shared-stop"
              className="relative flex gap-2.5 sm:gap-4"
            >
              <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-primary-border bg-primary-tint text-sm font-semibold text-primary-strong shadow-xs sm:size-9">
                {index + 1}
              </span>
              <Card className="min-w-0 flex-1 pt-0">
                <CardContent className="flex flex-col gap-2 p-3 sm:p-4">
                  <div className="flex items-center gap-2.5 sm:gap-4">
                    <img
                      src={stop.image}
                      alt=""
                      className="size-14 shrink-0 rounded-xl object-cover sm:size-20"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground sm:text-base">
                        {stopTitle(stop)}
                      </p>
                      {stop.area ? (
                        <Badge variant="secondary" className="mt-1.5 gap-1 font-medium">
                          <MapPinIcon className="size-3" aria-hidden="true" />
                          {stop.area}
                        </Badge>
                      ) : null}
                    </div>
                  </div>

                  {(stop.startTime || stop.endTime) && (
                    <div className="flex flex-wrap items-center gap-2.5 border-t border-border/60 pt-2.5 text-xs text-muted-foreground">
                      <ClockIcon className="size-3.5 text-primary" aria-hidden="true" />
                      {stop.startTime ? (
                        <span>
                          {t("planPage.startTime")}: {stop.startTime}
                        </span>
                      ) : null}
                      {stop.endTime ? (
                        <span>
                          {t("planPage.endTime")}: {stop.endTime}
                        </span>
                      ) : null}
                    </div>
                  )}

                  {stop.tags && stop.tags.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-1.5 border-t border-border/40 pt-2.5 text-xs">
                      <span className="flex items-center gap-1 font-medium text-muted-foreground">
                        <TagIcon className="size-3" aria-hidden="true" />
                        {t("planPage.tags")}:
                      </span>
                      {stop.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="font-medium">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Card className="pt-0">
            <CardContent className="flex flex-col gap-4 p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <NavigationIcon className="size-5 text-primary" aria-hidden="true" />
                <h2 className="text-base font-semibold text-foreground">
                  {t("planPage.summaryTitle")}
                </h2>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-primary-strong">
                  {stops.length}
                </span>
                <span className="text-sm text-muted-foreground">
                  {t("planPage.title")}
                </span>
              </div>
              {directions ? (
                <a
                  href={directions}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <NavigationIcon className="size-4" aria-hidden="true" />
                  {t("planPage.goNow")}
                </a>
              ) : null}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
