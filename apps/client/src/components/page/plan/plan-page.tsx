import {
  DndContext,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Link } from "@tanstack/react-router"
import {
  CompassIcon,
  GripVerticalIcon,
  MapPinIcon,
  NavigationIcon,
  SparklesIcon,
  Trash2Icon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/i18n"
import { usePlan, type PlanStopItem } from "@/lib/plan-context"

function directionsUrl(stops: PlanStopItem[]): string | null {
  const located = stops.filter(
    (stop) => stop.lat != null && stop.lng != null,
  )
  if (located.length === 0) return null

  const destination = `${located[0]!.lat},${located[0]!.lng}`
  const waypoints = located
    .slice(1)
    .map((stop) => `${stop.lat},${stop.lng}`)
    .join("|")

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}${waypoints ? `&waypoints=${encodeURIComponent(waypoints)}` : ""}&travelmode=driving`
}

function SortableStop({
  stop,
  index,
}: {
  stop: PlanStopItem
  index: number
}) {
  const { language, t } = useLanguage()
  const { removeStop } = usePlan()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: stop.placeId })

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`relative flex gap-2.5 sm:gap-4 ${isDragging ? "z-20 opacity-80" : ""}`}
    >
      <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-primary-border bg-primary-tint text-sm font-semibold text-primary-strong shadow-xs sm:size-9">
        {index + 1}
      </span>
      <Card
        {...attributes}
        {...listeners}
        aria-label={t("planPage.dragToReorder")}
        className="relative min-w-0 flex-1 cursor-grab touch-none select-none pt-0 transition-all hover:border-primary/40 hover:shadow-md active:cursor-grabbing"
      >
        <CardContent className="flex items-center gap-2.5 p-3 pr-[4.5rem] sm:gap-4 sm:p-4 sm:pr-24">
          <img
            src={stop.image}
            alt=""
            draggable={false}
            className="size-14 shrink-0 rounded-xl object-cover sm:size-20"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground sm:text-base">
              {language === "km" && stop.nameKm ? stop.nameKm : stop.name}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              {stop.area ? (
                <Badge variant="secondary" className="gap-1 font-medium">
                  <MapPinIcon className="size-3" aria-hidden="true" />
                  {stop.area}
                </Badge>
              ) : null}
            </div>
          </div>
          <div className="absolute right-2 top-2 flex items-center gap-1 sm:right-3 sm:top-3">
            <GripVerticalIcon
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon-sm"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => removeStop(stop.placeId)}
              aria-label={t("planPage.remove")}
            >
              <Trash2Icon className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </li>
  )
}

export function PlanPage() {
  const { t } = useLanguage()
  const { stops, reorderStops } = usePlan()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    reorderStops(String(active.id), String(over.id))
  }

  const directions = directionsUrl(stops)
  const hasUnlocatedStops = stops.some(
    (stop) => stop.lat == null || stop.lng == null,
  )

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Hero header */}
      <section className="relative overflow-hidden rounded-2xl border border-primary-border bg-primary-tint p-4 sm:p-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-16 size-52 rounded-full bg-primary/10 blur-2xl"
        />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl space-y-1.5">
            <Badge
              variant="secondary"
              className="w-fit gap-1.5 border-primary-border bg-card/70 font-medium text-primary-strong"
            >
              <SparklesIcon className="size-3.5" aria-hidden="true" />
              {t("planPage.badge")}
            </Badge>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {t("planPage.title")}
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              {t("planPage.subtitle")}
            </p>
          </div>
          <span className="inline-flex items-center rounded-full border border-primary-border bg-card/70 px-3 py-1 text-xs font-semibold text-primary-strong">
            {t("planPage.stopCount").replace("{count}", String(stops.length))}
          </span>
        </div>
      </section>

      {stops.length === 0 ? (
        <Card className="mx-auto w-full max-w-xl pt-0">
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:p-10">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary-tint text-primary">
              <CompassIcon className="size-8" aria-hidden="true" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-semibold text-foreground">
                {t("planPage.emptyTitle")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("planPage.emptyHint")}
              </p>
            </div>
            <Link to="/place">
              <Button size="lg" className="gap-2">
                <CompassIcon className="size-4" aria-hidden="true" />
                {t("planPage.explorePlaces")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* Timeline of stops */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={stops.map((stop) => stop.placeId)}
              strategy={verticalListSortingStrategy}
            >
              <ol className="relative flex flex-col gap-3 sm:gap-4">
                <div
                  aria-hidden="true"
                  className="absolute bottom-6 left-[1rem] top-6 w-px bg-primary-border sm:left-[1.125rem]"
                />
                {stops.map((stop, index) => (
                  <SortableStop key={stop.placeId} stop={stop} index={index} />
                ))}
              </ol>
            </SortableContext>
          </DndContext>

          {/* Sticky trip summary */}
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
                <p className="text-sm text-muted-foreground">
                  {t("planPage.summaryHint")}
                </p>
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
                {hasUnlocatedStops ? (
                  <p className="text-xs text-muted-foreground">
                    {t("planPage.missingCoordinates")}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </aside>
        </div>
      )}
    </div>
  )
}
