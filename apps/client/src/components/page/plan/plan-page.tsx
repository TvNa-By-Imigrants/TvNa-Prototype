import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
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
  AlertCircleIcon,
  AlertTriangleIcon,
  CheckIcon,
  ClockIcon,
  CompassIcon,
  GripVerticalIcon,
  MapPinIcon,
  NavigationIcon,
  SparklesIcon,
  TagIcon,
  Trash2Icon,
  FolderOpenIcon,
  SaveIcon,
  FilePlus2Icon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SharePlanModal } from "@/components/molecules"
import { useLanguage } from "@/i18n"
import { usePlan, type PlanStopItem } from "@/lib/plan-context"
import { ApiRequestError } from "@/lib/api"
import {
  createPlan,
  deletePlan,
  fetchPlanById,
  fetchPlans,
  updatePlan,
} from "@/lib/plans-api"
import { usePermissions } from "@/lib/permissions"
import type { Plan, PlanInput } from "@repo/contracts"
import {
  DEFAULT_PLAN_TAGS,
  validatePlanStops,
  type StopValidationResult,
  type ValidationMessages,
} from "@/lib/plan-validation"
import { cn } from "cn"

const TAG_I18N_MAP = {
  visit: "category.visit",
  eat: "category.eat",
  cafe: "category.cafe",
  stay: "category.stay",
  culture: "category.culture",
  nature: "category.nature",
} as const

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
  validation,
}: {
  stop: PlanStopItem
  index: number
  validation?: StopValidationResult
}) {
  const { language, t } = useLanguage()
  const { removeStop, updateStop } = usePlan()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: stop.placeId })

  const stopTitle = language === "km" && stop.nameKm ? stop.nameKm : stop.name

  const startHasError = validation?.issues.some(
    (issue) =>
      issue.type === "error" &&
      (issue.code === "OUT_OF_SEQUENCE" || issue.code === "END_BEFORE_START"),
  )
  const endHasError = validation?.issues.some(
    (issue) => issue.type === "error" && issue.code === "END_BEFORE_START",
  )

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
        className={cn(
          "relative min-w-0 flex-1 cursor-grab touch-none select-none pt-0 transition-all hover:border-primary/40 hover:shadow-md active:cursor-grabbing",
          validation?.hasError
            ? "border-destructive/60 bg-destructive/[0.02]"
            : validation?.hasWarning
              ? "border-amber-500/50 bg-amber-500/[0.02]"
              : "",
        )}
      >
        <CardContent className="flex flex-col p-3 pr-[4.5rem] sm:p-4 sm:pr-24">
          <div className="flex items-center gap-2.5 sm:gap-4">
            <img
              src={stop.image}
              alt=""
              draggable={false}
              className="size-14 shrink-0 rounded-xl object-cover sm:size-20"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground sm:text-base">
                {stopTitle}
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
          </div>

          {/* Time Picker Inputs */}
          <div
            className="mt-3 flex flex-wrap items-center gap-2.5 border-t border-border/60 pt-3 sm:gap-4"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ClockIcon className="size-3.5 text-primary" aria-hidden="true" />
              <label
                htmlFor={`start-time-${stop.placeId}`}
                className="font-medium text-foreground"
              >
                {t("planPage.startTime")}:
              </label>
              <Input
                id={`start-time-${stop.placeId}`}
                type="time"
                aria-label={`${stopTitle} ${t("planPage.startTime")}`}
                value={stop.startTime ?? ""}
                onChange={(e) =>
                  updateStop(stop.placeId, { startTime: e.target.value })
                }
                className="h-8 w-28 text-xs"
                aria-invalid={startHasError}
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <label
                htmlFor={`end-time-${stop.placeId}`}
                className="font-medium text-foreground"
              >
                {t("planPage.endTime")}:
              </label>
              <Input
                id={`end-time-${stop.placeId}`}
                type="time"
                aria-label={`${stopTitle} ${t("planPage.endTime")}`}
                value={stop.endTime ?? ""}
                onChange={(e) =>
                  updateStop(stop.placeId, { endTime: e.target.value })
                }
                className="h-8 w-28 text-xs"
                aria-invalid={endHasError}
              />
            </div>
          </div>

          {/* Category Tag Selection */}
          <div
            className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-border/40 pt-2.5 text-xs"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <span className="flex items-center gap-1 font-medium text-muted-foreground">
              <TagIcon className="size-3" aria-hidden="true" />
              {t("planPage.tags")}:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {DEFAULT_PLAN_TAGS.map((tag) => {
                const isSelected = (stop.tags ?? []).includes(tag)
                const tagKey = TAG_I18N_MAP[tag]
                const tagLabel = tagKey ? t(tagKey) : tag

                return (
                  <Button
                    key={tag}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="xs"
                    aria-pressed={isSelected}
                    aria-label={`${tagLabel} tag`}
                    onClick={() => {
                      const current = stop.tags ?? []
                      const next = isSelected
                        ? current.filter((tagItem) => tagItem !== tag)
                        : [...current, tag]
                      updateStop(stop.placeId, { tags: next })
                    }}
                    className="h-6 gap-1 rounded-full px-2 text-[11px]"
                  >
                    {isSelected ? (
                      <CheckIcon className="size-3" aria-hidden="true" />
                    ) : null}
                    {tagLabel}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Inline Validation Warnings / Errors */}
          {validation && validation.issues.length > 0 ? (
            <div
              role="alert"
              className={cn(
                "mt-3 flex flex-col gap-1.5 rounded-lg border p-2.5 text-xs",
                validation.hasError
                  ? "border-destructive/40 bg-destructive/10 text-destructive"
                  : "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
              )}
            >
              {validation.issues.map((issue, idx) => (
                <div
                  key={`${issue.code}-${issue.prevStopName ?? idx}`}
                  className="flex items-center gap-1.5 font-medium"
                >
                  {issue.type === "error" ? (
                    <AlertCircleIcon
                      className="size-3.5 shrink-0 text-destructive"
                      aria-hidden="true"
                    />
                  ) : (
                    <AlertTriangleIcon
                      className="size-3.5 shrink-0 text-amber-500"
                      aria-hidden="true"
                    />
                  )}
                  <span>{issue.message}</span>
                </div>
              ))}
            </div>
          ) : null}

          {/* Top-right action buttons */}
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
  const { stops, reorderStops, replaceStops } = usePlan()
  const { user, isLoading: isAuthLoading } = usePermissions()
  const queryClient = useQueryClient()
  const [title, setTitle] = useState("")
  const [savedPlanId, setSavedPlanId] = useState("")
  const [selectedPlanId, setSelectedPlanId] = useState("")
  const [saveError, setSaveError] = useState("")
  const [saveSuccess, setSaveSuccess] = useState(false)

  const plansQuery = useQuery({
    queryKey: ["plans"],
    queryFn: fetchPlans,
    enabled: Boolean(user) && !isAuthLoading,
  })

  const saveMutation = useMutation({
    mutationFn: ({ id, input }: { id: string | null; input: PlanInput }) =>
      id ? updatePlan(id, input) : createPlan(input),
    onSuccess: async (plan) => {
      setSavedPlanId(plan.id)
      setSelectedPlanId(plan.id)
      setTitle(plan.title)
      replaceStops(stopsFromPlan(plan))
      setSaveError("")
      setSaveSuccess(true)
      await queryClient.invalidateQueries({ queryKey: ["plans"] })
    },
    onError: (error: unknown) => {
      const fieldErrors =
        error instanceof ApiRequestError
          ? error.errors?.map((issue) => issue.message)
          : undefined
      setSaveError(
        fieldErrors?.length
          ? [...new Set(fieldErrors)].join(" ")
          : error instanceof Error
            ? error.message
            : t("planPage.saveError"),
      )
      setSaveSuccess(false)
    },
  })

  const openMutation = useMutation({
    mutationFn: fetchPlanById,
    onSuccess: (plan) => {
      setSavedPlanId(plan.id)
      setSelectedPlanId(plan.id)
      setTitle(plan.title)
      replaceStops(stopsFromPlan(plan))
      setSaveError("")
      setSaveSuccess(false)
    },
    onError: (error: unknown) => {
      setSaveError(
        error instanceof Error ? error.message : t("planPage.loadError"),
      )
      setSaveSuccess(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deletePlan,
    onSuccess: async (_result, deletedId) => {
      if (savedPlanId === deletedId) {
        setSavedPlanId("")
        setTitle("")
        replaceStops([])
      }
      setSelectedPlanId("")
      setSaveError("")
      setSaveSuccess(false)
      await queryClient.invalidateQueries({ queryKey: ["plans"] })
    },
    onError: (error: unknown) => {
      setSaveError(
        error instanceof Error ? error.message : t("planPage.deleteError"),
      )
    },
  })

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

  const validationMessages: ValidationMessages = useMemo(
    () => ({
      endBeforeStart: t("planPage.endBeforeStart"),
      outOfSequence: (prevName) =>
        t("planPage.outOfSequence").replace("{prevName}", prevName),
      timeOverlap: (prevName) =>
        t("planPage.timeOverlap").replace("{prevName}", prevName),
    }),
    [t],
  )

  const validationMap = useMemo(
    () => validatePlanStops(stops, validationMessages),
    [stops, validationMessages],
  )

  const hasConflicts = Object.values(validationMap).some(
    (v) => v.hasError || v.hasWarning,
  )

  const saveCurrentPlan = () => {
    const input: PlanInput = {
      title: title.trim(),
      items: stops.map((stop) => ({
        placeId: stop.placeId,
        startTime: stop.startTime || null,
        endTime: stop.endTime || null,
        tags: stop.tags ?? [],
      })),
    }
    setSaveError("")
    setSaveSuccess(false)
    saveMutation.mutate({ id: savedPlanId || null, input })
  }

  const startNewPlan = () => {
    setSavedPlanId("")
    setSelectedPlanId("")
    setTitle("")
    replaceStops([])
    setSaveError("")
    setSaveSuccess(false)
  }

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
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-primary-border bg-card/70 px-3 py-1 text-xs font-semibold text-primary-strong">
              {t("planPage.stopCount").replace("{count}", String(stops.length))}
            </span>
            <SharePlanModal stops={stops} />
          </div>
        </div>
      </section>

      <Card className="pt-0">
        <CardContent className="flex flex-col gap-3 p-4 sm:p-5">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {t("planPage.savedPlansTitle")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("planPage.savedPlansDescription")}
            </p>
          </div>

          {isAuthLoading ? (
            <p role="status" className="text-sm text-muted-foreground">
              {t("planPage.loadingPlans")}
            </p>
          ) : !user ? (
            <p className="text-sm text-muted-foreground">
              {t("planPage.signInToSave")}{" "}
              <Link to="/sign-in" className="font-medium text-primary underline">
                {t("planPage.signIn")}
              </Link>
            </p>
          ) : (
            <>
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                {t("planPage.planName")}
                <Input
                  aria-label={t("planPage.planName")}
                  value={title}
                  maxLength={200}
                  placeholder={t("planPage.planNamePlaceholder")}
                  onChange={(event) => {
                    setTitle(event.target.value)
                    setSaveSuccess(false)
                  }}
                />
              </label>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  className="gap-2"
                  disabled={!title.trim() || saveMutation.isPending}
                  onClick={saveCurrentPlan}
                >
                  <SaveIcon className="size-4" aria-hidden="true" />
                  {saveMutation.isPending
                    ? t("planPage.savingPlan")
                    : t("planPage.savePlan")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={startNewPlan}
                >
                  <FilePlus2Icon className="size-4" aria-hidden="true" />
                  {t("planPage.newPlan")}
                </Button>
              </div>

              <div className="flex flex-col gap-2 border-t border-border/60 pt-3 sm:flex-row">
                <label className="sr-only" htmlFor="saved-plan-select">
                  {t("planPage.selectSavedPlan")}
                </label>
                <select
                  id="saved-plan-select"
                  className="h-10 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-sm"
                  value={selectedPlanId}
                  onChange={(event) => setSelectedPlanId(event.target.value)}
                  disabled={plansQuery.isLoading || !plansQuery.data?.plans.length}
                >
                  <option value="">{t("planPage.selectSavedPlan")}</option>
                  {plansQuery.data?.plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.title}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  disabled={!selectedPlanId || openMutation.isPending}
                  onClick={() => openMutation.mutate(selectedPlanId)}
                >
                  <FolderOpenIcon className="size-4" aria-hidden="true" />
                  {openMutation.isPending
                    ? t("planPage.loadingPlan")
                    : t("planPage.openPlan")}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="gap-2"
                  disabled={!selectedPlanId || deleteMutation.isPending}
                  onClick={() => {
                    if (window.confirm(t("planPage.confirmDeletePlan"))) {
                      deleteMutation.mutate(selectedPlanId)
                    }
                  }}
                >
                  <Trash2Icon className="size-4" aria-hidden="true" />
                  {t("planPage.deletePlan")}
                </Button>
              </div>

              {plansQuery.isLoading ? (
                <p role="status" className="text-sm text-muted-foreground">
                  {t("planPage.loadingPlans")}
                </p>
              ) : null}
              {plansQuery.isError ? (
                <p role="alert" className="text-sm text-destructive">
                  {plansQuery.error instanceof Error
                    ? plansQuery.error.message
                    : t("planPage.loadError")}
                </p>
              ) : null}
              {!plansQuery.isLoading &&
              !plansQuery.isError &&
              plansQuery.data?.plans.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("planPage.noSavedPlans")}
                </p>
              ) : null}
              {saveError ? (
                <p role="alert" className="text-sm text-destructive">
                  {saveError}
                </p>
              ) : null}
              {saveSuccess ? (
                <p role="status" className="text-sm text-primary">
                  {t("planPage.planSaved")}
                </p>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

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
                  <SortableStop
                    key={stop.placeId}
                    stop={stop}
                    index={index}
                    validation={validationMap[stop.placeId]}
                  />
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
                {hasConflicts ? (
                  <div
                    role="alert"
                    className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs font-medium text-destructive"
                  >
                    <AlertCircleIcon className="size-4 shrink-0" aria-hidden="true" />
                    <span>{t("planPage.scheduleConflict")}</span>
                  </div>
                ) : null}
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

function stopsFromPlan(plan: Plan): PlanStopItem[] {
  return [...plan.items]
    .sort((left, right) => left.order - right.order)
    .map((item) => ({
      placeId: item.placeId,
      name: item.placeName,
      nameKm: item.nameKm,
      area: item.area,
      image: item.image,
      lat: item.lat,
      lng: item.lng,
      startTime: item.startTime ?? undefined,
      endTime: item.endTime ?? undefined,
      tags: item.tags,
    }))
}
