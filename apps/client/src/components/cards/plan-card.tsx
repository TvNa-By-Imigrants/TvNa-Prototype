import { MapIcon } from "lucide-react"

import { Card } from "@/components/ui/card"
import type { SavedPlan } from "@/data/profiles"
import { useLanguage } from "@/i18n"

/** Compact read-only summary of a saved itinerary on the profile page. */
export function PlanCard({ plan }: { plan: SavedPlan }) {
  const { t } = useLanguage()

  return (
    <Card className="gap-2 rounded-xl p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-foreground">{plan.name}</h3>
        <MapIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">
        {plan.stops} {t("profile.stops")} · {t("profile.updated")} {plan.updatedAt}
      </p>
    </Card>
  )
}
